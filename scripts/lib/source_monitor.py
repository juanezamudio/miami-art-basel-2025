"""Read public discovery sources without executing their scripts or publishing events."""
import base64
import hashlib
import json
import re
import time
from datetime import date
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse, parse_qsl
from urllib.request import Request, urlopen


class PublicTable(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = []
        self.row_numbers = []
        self.row = None
        self.cell = None
        self.row_number = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'tr':
            self.row = []
            self.row_number = None
        elif tag == 'th' and self.row is not None:
            match = re.search(r'R(\d+)$', attrs.get('id', ''))
            if match:
                self.row_number = int(match[1]) + 1
        elif tag == 'td' and self.row is not None:
            self.cell = {'text': '', 'links': []}
        elif self.cell is not None:
            if tag == 'br':
                self.cell['text'] += '\n'
            if tag == 'a' and attrs.get('href'):
                self.cell['links'].append(attrs['href'])

    def handle_data(self, text):
        if self.cell is not None:
            self.cell['text'] += text

    def handle_endtag(self, tag):
        if tag == 'td' and self.cell is not None:
            self.row.append(self.cell)
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if self.row:
                self.rows.append(self.row)
                self.row_numbers.append(self.row_number)
            self.row = None


def normalized(text):
    return ' '.join(str(text or '').split())


def public_url(value):
    parsed = urlparse(value or '')
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
        return None
    # Google/Instagram link wrappers occur in the sheets. Unwrap only known
    # public redirect formats, never fetch arbitrary cell links in this script.
    query = parse_qs(parsed.query)
    if parsed.hostname in ('www.google.com', 'google.com') and parsed.path == '/url':
        value = (query.get('q') or query.get('url') or [value])[0]
    elif parsed.hostname == 'l.instagram.com':
        value = (query.get('u') or [value])[0]
    parsed = urlparse(value)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
        return None
    return value


def canonical_url(value):
    value = public_url(value)
    if not value:
        return ''
    parsed = urlparse(value)
    query = [(key, val) for key, val in parse_qsl(parsed.query) if not key.lower().startswith('utm_') and key.lower() not in ('fbclid', 'gclid')]
    return urlunparse(parsed._replace(netloc=parsed.netloc.lower(), query=urlencode(sorted(query)), fragment=''))


def candidate_date(text, year):
    """A candidate day is never a verified event date. Reject weekday conflicts."""
    match = re.search(r'\b(November|December|Nov\.?|Dec\.?)\s+(\d{1,2})(?:st|nd|rd|th)?\b', text, re.I)
    if not match:
        return None, ['date_missing']
    try:
        day = date(year, 11 if match[1].lower().startswith('nov') else 12, int(match[2]))
    except ValueError:
        return None, ['date_invalid']
    weekday = re.search(r'\b(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)\b', text, re.I)
    if weekday and weekday[1][:3].lower() != day.strftime('%a').lower():
        return None, ['weekday_year_conflict']
    explicit_years = re.findall(r'\b20\d{2}\b', text)
    if explicit_years and any(int(value) != year for value in explicit_years):
        return None, ['historical_year']
    return day.isoformat(), []


def parse_sheet(html, source, year):
    parser = PublicTable()
    parser.feed(html)
    expected = ['EVENT NAME', 'RSVP', 'EVENT TYPE', 'LOCATION', 'START TIME', 'END TIME', 'DETAILS'] if source['format'] == 'khami' else ['Date', 'Start Time', 'End Time', 'Organizer', 'Event Name', 'Address', 'Cost', 'Tags', 'Link']
    header_index = next((index for index, row in enumerate(parser.rows) if [normalized(cell['text']) for cell in row[:len(expected)]] == expected), None)
    if header_index is None:
        raise ValueError('Expected event headers not found; source layout may have changed')
    records = []
    section_date = ''
    for index, row in enumerate(parser.rows[header_index + 1:], header_index + 2):
        cells = row + [{'text': '', 'links': []}] * max(0, 12 - len(row))
        values = [normalized(cell['text']) for cell in cells]
        if source['format'] == 'khami':
            if re.match(r'^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*\|', values[0], re.I):
                section_date = values[0]
                continue
            if not values[0] or values[0] == 'EVENT NAME' or not any(values[1:7]):
                continue
            title, cost, category, venue, start, end = values[:6]
            date_text = section_date
            urls = cells[1]['links']
            organizer = ''
        else:
            # Contributions below the primary table are not assumed to be part
            # of the main schedule; they can contain unrelated years/locations.
            if values[0].startswith(('Other Sheets', 'Date Copied', 'Add Events Here')):
                break
            if not values[4] or not values[0] or values[0] == 'Date':
                continue
            date_text, start, end, organizer, title, venue, cost, category = values[:8]
            urls = [values[8], *cells[8]['links']]
        day, flags = candidate_date(date_text, year)
        if re.search(r'\bcancell?ed\b', title, re.I):
            flags.append('canceled_at_source')
        if re.search(r'\b202[0-5]\b', title):
            flags.append('historical_title')
        records.append({
            'title': title, 'dateText': date_text, 'candidateStartDate': day,
            'startTimeText': start, 'endTimeText': end, 'organizer': organizer,
            'venue': venue, 'categoryText': category, 'costText': cost,
            'eventUrls': sorted({url for value in urls if (url := public_url(value))}),
            'reviewFlags': ['organizer_verification_required', *flags],
            'sourceRow': parser.row_numbers[index - 1] or index,
        })
    return records


def read_url(url, headers=None):
    request = Request(url, headers={'User-Agent': 'Basel.ai public event discovery', **(headers or {})})
    with urlopen(request, timeout=25) as response:
        body = response.read(5_000_001)
        if len(body) > 5_000_000:
            raise ValueError('Source exceeded the 5 MB response limit')
        return body.decode('utf-8-sig')


def approved_feed_records(rows):
    if not isinstance(rows, list) or len(rows) >= 200:
        raise ValueError('Unexpected or potentially truncated event response; retain the previous snapshot')
    records = []
    for row in rows:
        if not isinstance(row, dict) or not row.get('id') or not isinstance(row.get('title'), str) or not re.fullmatch(r'2026-\d{2}-\d{2}', row.get('date') or ''):
            raise ValueError('Unexpected public event schema; retain the previous snapshot')
        date.fromisoformat(row['date'])
        records.append({
            'upstreamId': row['id'], 'title': row['title'], 'candidateStartDate': row['date'],
            'startTimeText': row.get('time'), 'venue': row.get('venue'),
            'location': row.get('location'), 'neighborhood': row.get('neighborhood'),
            'categoryText': row.get('category'), 'accessText': row.get('access_type'),
            'eventUrls': [url] if (url := public_url(row.get('luma_link'))) else [],
            'reviewFlags': ['organizer_verification_required'],
        })
    return records


def sumwhere_records(rows, year):
    """Retain public factual leads; upstream approval is not editorial approval."""
    records = []
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id'] or not isinstance(row.get('name'), str) or not row['name'].strip():
            raise ValueError('Unexpected Sumwhere event schema; retain the previous snapshot')
        if row['id'] in seen:
            raise ValueError('Duplicate Sumwhere event identity; pagination needs review')
        seen.add(row['id'])
        flags = ['organizer_verification_required']
        day = row.get('date')
        if day is not None:
            if not isinstance(day, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day):
                raise ValueError('Unexpected Sumwhere event date')
            parsed = date.fromisoformat(day)
            if parsed.year != year:
                flags.append('historical_year' if parsed.year < year else 'different_year')
                day = None
        else:
            flags.append('date_missing')
        if row.get('invitationOnly'):
            flags.append('invitation_required_at_source')
        if row.get('needsLocation'):
            flags.append('location_unconfirmed_at_source')
        if re.search(r'\bcancell?ed\b', str(row.get('status', '')), re.I):
            flags.append('canceled_at_source')
        provenance = row.get('provenance') or {}
        if not isinstance(provenance, dict):
            raise ValueError('Unexpected Sumwhere provenance')
        urls = [row.get('rsvpUrl'), provenance.get('sourceUrl')]
        records.append({
            'upstreamId': row['id'], 'title': row['name'],
            'candidateStartDate': day, 'endDateText': row.get('endDate'),
            'startTimeText': row.get('startTime'), 'endTimeText': row.get('endTime'),
            'organizer': row.get('host'), 'venue': row.get('venue'),
            'addressText': row.get('address'), 'timeZoneText': row.get('timezone'),
            'categoryText': ', '.join(item.get('label', '') for item in row.get('types', []) if isinstance(item, dict)),
            'upstreamFreeLabel': row.get('isFree'),
            'registrationRequired': row.get('registrationRequired'),
            'invitationOnly': row.get('invitationOnly'), 'statusText': row.get('status'),
            'eventUrls': sorted({url for value in urls if (url := public_url(value))}),
            'reviewFlags': flags,
        })
    return records


def fetch_sumwhere(source, year):
    """Use the same unauthenticated, cursor-paginated query as Explore."""
    records = []
    seen_cursors = set()
    cursor = None
    total = None
    for _ in range(30):
        query = {'sort': 'time', 'limit': '40'}
        if cursor:
            query['cursor'] = cursor
        page = json.loads(read_url(source['publicApiUrl'] + '?' + urlencode(query)))
        if not isinstance(page, dict) or type(page.get('total')) is not int or not 0 <= page['total'] <= 1000:
            raise ValueError('Unexpected or oversized Sumwhere response')
        if total is None:
            total = page['total']
        if page['total'] != total:
            raise ValueError('Sumwhere changed during pagination; retry a fresh snapshot')
        items = page.get('items')
        if not isinstance(items, list) or len(items) > 40 or (not items and len(records) < total):
            raise ValueError('Unexpected or empty Sumwhere page')
        records.extend(items)
        if len(records) > total:
            raise ValueError('Sumwhere returned more records than advertised')
        cursor = page.get('nextCursor')
        if cursor is None:
            if len(records) != total:
                raise ValueError('Incomplete Sumwhere pagination; retain the previous snapshot')
            return sumwhere_records(records, year)
        if not isinstance(cursor, str) or not cursor or len(cursor) > 512 or cursor in seen_cursors or len(records) >= total:
            raise ValueError('Unexpected or repeated Sumwhere cursor')
        seen_cursors.add(cursor)
        time.sleep(0.3)
    raise ValueError('Sumwhere pagination exceeded the page limit')


def fetch_source(source, year):
    if source['kind'] == 'google-sheet':
        url = f"https://docs.google.com/spreadsheets/d/{source['spreadsheetId']}/htmlview/sheet?headers=true&gid={source['sheetId']}"
        return parse_sheet(read_url(url), source, year)
    if source['kind'] == 'public-event-api':
        return fetch_sumwhere(source, year)
    if source['kind'] != 'public-event-feed' or year != 2026:
        raise ValueError('Unsupported discovery adapter')
    # Follow the same module script and read-only approved/2026 query used by
    # the public page. Never execute the bundle or access admin APIs.
    html = read_url(source['url'])
    scripts = re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']', html, re.I)
    asset = next((urljoin(source['url'], value) for value in scripts if re.match(r'^/assets/index-[\w-]+\.js$', value)), None)
    if not asset:
        raise ValueError('Public application asset changed; adapter needs review')
    bundle = read_url(asset)
    project_ref = urlparse(source['publicApiOrigin']).hostname.split('.')[0]
    anon = None
    for token in set(re.findall(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', bundle)):
        try:
            claims = json.loads(base64.urlsafe_b64decode(token.split('.')[1] + '==='))
            if claims.get('role') == 'anon' and claims.get('ref') == project_ref:
                anon = token
                break
        except (ValueError, TypeError):
            continue
    if not anon:
        raise ValueError('Public anonymous client configuration changed; stop without probing other access')
    query = urlencode({
        'select': 'id,title,date,time,venue,location,neighborhood,category,access_type,luma_link',
        'status': 'eq.approved', 'season': 'eq.2026', 'order': 'date.asc', 'limit': '200',
    })
    rows = json.loads(read_url(source['publicApiOrigin'] + '/rest/v1/events?' + query, {'apikey': anon, 'Authorization': 'Bearer ' + anon}))
    return approved_feed_records(rows)


def keyed_records(records):
    keyed = {}
    for record in records:
        if record.get('upstreamId'):
            identity = 'id:' + str(record['upstreamId'])
        else:
            urls = [canonical_url(url) for url in record.get('eventUrls', [])]
            identity = '|'.join([normalized(record['title']).casefold(), normalized(record.get('venue')).casefold(), *urls])
        key = hashlib.sha256(identity.encode()).hexdigest()[:24]
        if key in keyed:
            raise ValueError('Ambiguous duplicate identity; adapter needs review instead of dropping a row')
        keyed[key] = record
    return keyed


def compare_records(previous, current):
    before, after = keyed_records(previous), keyed_records(current)
    changes = {kind: [] for kind in ('added', 'changed', 'missing')}
    for key, record in after.items():
        if key not in before:
            changes['added'].append({'key': key, 'current': record})
        elif comparable_record(record) != comparable_record(before[key]):
            changes['changed'].append({'key': key, 'previous': before[key], 'current': record})
    for key in before.keys() - after.keys():
        changes['missing'].append({'key': key, 'previous': before[key]})
    return changes


def comparable_record(record):
    fields = {key: value for key, value in record.items() if key != 'sourceRow'}
    if 'eventUrls' in fields:
        fields['eventUrls'] = sorted({canonical_url(value) for value in fields['eventUrls']})
    return fields
