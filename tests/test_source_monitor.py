import importlib.util
import unittest
import json
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit
from pathlib import Path

spec = importlib.util.spec_from_file_location('source_monitor', Path(__file__).resolve().parents[1] / 'scripts/lib/source_monitor.py')
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)


def row(*values):
    return '<tr><th>row</th>' + ''.join('<td>' + value + '</td>' for value in values) + '</tr>'


class SourceMonitorTests(unittest.TestCase):
    def test_rich_links_and_mixed_year_weekday_headers(self):
        html = '<table>' + row('Guide 2026') + row('EVENT NAME', 'RSVP', 'EVENT TYPE', 'LOCATION', 'START TIME', 'END TIME', 'DETAILS')
        html += row('MONDAY | DECEMBER 1')
        html += row('Opening &amp; Party', '<a href="https://example.com/event?x=1&amp;y=2">FREE / RSVP</a>', 'PARTY', 'Venue<br>Miami Beach', '7PM', '2AM', 'Do not copy this description')
        html += '</table>'
        records = monitor.parse_sheet(html, {'format': 'khami'}, 2026)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['eventUrls'], ['https://example.com/event?x=1&y=2'])
        self.assertIsNone(records[0]['candidateStartDate'])
        self.assertIn('weekday_year_conflict', records[0]['reviewFlags'])
        self.assertNotIn('description', records[0])
        self.assertEqual(records[0]['title'], 'Opening & Party')

    def test_canceled_rows_and_template_sections(self):
        html = '<table>' + row('NFT NYC 2026')
        html += row('Date', 'Start Time', 'End Time', 'Organizer', 'Event Name', 'Address', 'Cost', 'Tags', 'Link')
        html += row('Fri, December 4', '6PM', '12AM', 'Host', 'Event Canceled', 'Miami', 'Free', 'Party', 'https://example.com/canceled')
        html += row('Other Sheets, search terms')
        html += row('December 5', '9PM', '', 'Other', 'Unreviewed contribution', 'Other city', '', '', 'https://example.com/unrelated')
        html += '</table>'
        records = monitor.parse_sheet(html, {'format': 'sheeets'}, 2026)
        self.assertEqual(len(records), 1)
        self.assertIn('canceled_at_source', records[0]['reviewFlags'])
        self.assertEqual(records[0]['candidateStartDate'], '2026-12-04')

    def test_fail_closed_on_changed_layout_or_bad_feed(self):
        with self.assertRaises(ValueError):
            monitor.parse_sheet('<html>login required</html>', {'format': 'khami'}, 2026)
        for value in [{}, [{'title': 'Missing ID'}], [{'id': 'a', 'title': 'Past year', 'date': '2025-12-04'}], [{}] * 200]:
            with self.assertRaises(ValueError):
                monitor.approved_feed_records(value)

    def test_added_changed_missing_and_row_reordering(self):
        previous = [{'upstreamId': 'a', 'title': 'A', 'venue': 'Miami', 'sourceRow': 15}]
        same = [{'upstreamId': 'a', 'title': 'A', 'venue': 'Miami', 'sourceRow': 18}]
        self.assertEqual(monitor.compare_records(previous, same), {'added': [], 'changed': [], 'missing': []})
        changed = [{'upstreamId': 'a', 'title': 'New title', 'venue': 'Miami'}, {'upstreamId': 'b', 'title': 'B'}]
        delta = monitor.compare_records(previous, changed)
        self.assertEqual(len(delta['changed']), 1)
        self.assertEqual(len(delta['added']), 1)
        self.assertEqual(len(monitor.compare_records(previous, [])['missing']), 1)

    def test_ambiguous_duplicates_are_not_silently_dropped(self):
        with self.assertRaises(ValueError):
            monitor.keyed_records([{'title': 'Same'}, {'title': 'Same'}])

    def test_tracking_parameters_and_unsafe_urls(self):
        self.assertEqual(monitor.canonical_url('https://example.com/event?id=7&utm_source=test&fbclid=abc'), 'https://example.com/event?id=7')
        self.assertIsNone(monitor.public_url('javascript:alert(1)'))
        self.assertIsNone(monitor.public_url('https://user:password@example.com'))
        self.assertEqual(monitor.public_url('https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fevent'), 'https://example.com/event')
        previous = [{'title': 'Event', 'eventUrls': ['https://example.com/event?utm_source=a']}]
        current = [{'title': 'Event', 'eventUrls': ['https://example.com/event?utm_source=b']}]
        self.assertEqual(monitor.compare_records(previous, current), {'added': [], 'changed': [], 'missing': []})

    def test_source_row_uses_sheet_row_header_when_rows_are_hidden(self):
        html = '<table>' + row('EVENT NAME', 'RSVP', 'EVENT TYPE', 'LOCATION', 'START TIME', 'END TIME', 'DETAILS')
        html += '<tr><th id="1004567442R41">42</th><td>Opening</td><td>Free</td><td>Art</td><td>Miami</td></tr></table>'
        records = monitor.parse_sheet(html, {'format': 'khami'}, 2026)
        self.assertEqual(records[0]['sourceRow'], 42)

    def test_candidate_date_rejects_impossible_dates_and_old_years(self):
        self.assertEqual(monitor.candidate_date('Wed, December 2', 2026), ('2026-12-02', []))
        self.assertIsNone(monitor.candidate_date('December 32', 2026)[0])
        self.assertIn('historical_year', monitor.candidate_date('December 4, 2025', 2026)[1])

    def test_sumwhere_reads_every_public_page_and_keeps_discovery_separate(self):
        source = {'kind': 'public-event-api', 'publicApiUrl': 'https://example.com/public/events'}
        first = {'id': 'one', 'name': 'Opening', 'date': '2026-12-04', 'rsvpUrl': 'https://example.org/rsvp',
                 'description': 'Do not republish editorial copy', 'logoUrl': 'https://example.com/image',
                 'location': {'lat': 25.8, 'lng': -80.1}, 'isFree': True, 'invitationOnly': True,
                 'status': 'approved', 'provenance': {'sourceUrl': 'https://organizer.example/program'}}
        second = {'id': 'two', 'name': 'Date pending', 'date': None, 'status': 'canceled', 'needsLocation': True}
        pages = [{'items': [first], 'total': 2, 'nextCursor': 'opaque-page-2'}, {'items': [second], 'total': 2, 'nextCursor': None}]
        with patch.object(monitor, 'read_url', side_effect=[json.dumps(p) for p in pages]) as read, patch.object(monitor.time, 'sleep'):
            records = monitor.fetch_source(source, 2026)
        self.assertEqual([r['upstreamId'] for r in records], ['one', 'two'])
        self.assertEqual(parse_qs(urlsplit(read.call_args_list[1].args[0]).query)['cursor'], ['opaque-page-2'])
        self.assertEqual(records[0]['eventUrls'], ['https://example.org/rsvp', 'https://organizer.example/program'])
        self.assertIn('organizer_verification_required', records[0]['reviewFlags'])
        self.assertIn('invitation_required_at_source', records[0]['reviewFlags'])
        self.assertIn('date_missing', records[1]['reviewFlags'])
        self.assertIn('canceled_at_source', records[1]['reviewFlags'])
        for key in ['description', 'logoUrl', 'location', 'lastVerifiedAt']:
            self.assertNotIn(key, records[0])

    def test_sumwhere_rejects_truncated_changed_and_repeated_pages(self):
        source = {'publicApiUrl': 'https://example.com/public/events'}
        event = {'id': 'one', 'name': 'Opening', 'date': '2026-12-04'}
        first = {'items': [event], 'total': 3, 'nextCursor': 'cursor'}
        cases = [
            [{'items': [event], 'total': 2, 'nextCursor': None}],
            [first, {'items': [event], 'total': 4, 'nextCursor': None}],
            [first, {'items': [event], 'total': 3, 'nextCursor': 'cursor'}],
            [{'items': [], 'total': 1001, 'nextCursor': None}],
            [first, {'items': [], 'total': 3, 'nextCursor': None}],
        ]
        for pages in cases:
            with self.subTest(pages=pages), patch.object(monitor, 'read_url', side_effect=[json.dumps(p) for p in pages]), patch.object(monitor.time, 'sleep'):
                with self.assertRaises(ValueError):
                    monitor.fetch_sumwhere(source, 2026)

    def test_sumwhere_rejects_duplicate_ids_and_invalid_dates_without_guessing_years(self):
        event = {'id': 'same', 'name': 'Opening', 'date': '2026-12-04'}
        for rows in [[event, event], [{**event, 'date': '2026-02-30'}], [{**event, 'date': 'not a date'}]]:
            with self.subTest(rows=rows), self.assertRaises(ValueError):
                monitor.sumwhere_records(rows, 2026)
        old = monitor.sumwhere_records([{**event, 'date': '2025-12-04'}], 2026)[0]
        self.assertIsNone(old['candidateStartDate'])
        self.assertIn('historical_year', old['reviewFlags'])


if __name__ == '__main__':
    unittest.main()
