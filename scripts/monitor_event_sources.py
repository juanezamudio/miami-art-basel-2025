"""Manual discovery refresh. Writes local snapshots/review reports, never the live catalog."""
import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from lib.source_monitor import compare_records, fetch_source

ROOT = Path(__file__).resolve().parents[1]


def write_json(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', help='Refresh only this configured source ID')
    parser.add_argument('--output', type=Path, default=ROOT / '.local/event-sources')
    args = parser.parse_args()
    config = json.loads((ROOT / 'src/data/event-sources.json').read_text())
    sources = [source for source in config['sources'] if not args.source or source['id'] == args.source]
    if not sources:
        parser.error('Unknown source ID')
    args.output.mkdir(parents=True, exist_ok=True)
    checked_at = datetime.now(timezone.utc).isoformat()
    run_id = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    reports = []
    for source in sources:
        snapshot_path = args.output / (source['id'] + '.json')
        try:
            records = fetch_source(source, config['season'])
            if not records:
                raise ValueError('Source returned zero events; retain the last snapshot and review the source')
            previous = json.loads(snapshot_path.read_text())['records'] if snapshot_path.exists() else []
            changes = compare_records(previous, records)
            report = {'sourceId': source['id'], 'sourceUrl': source['url'], 'checkedAt': checked_at,
                      'baselineCreated': not snapshot_path.exists(), 'recordCount': len(records), 'changes': changes}
            # Save each report before advancing its baseline; repeated failures
            # must never erase the evidence for a pending review.
            write_json(args.output / f"{run_id}-{source['id']}-review.json", report)
            write_json(snapshot_path, {'sourceId': source['id'], 'sourceUrl': source['url'], 'checkedAt': checked_at, 'records': records})
            reports.append({key: value for key, value in report.items() if key != 'changes'} | {'counts': {key: len(value) for key, value in changes.items()}})
        except Exception as error:
            # Do not print HTTP request objects or public client credentials.
            message = str(error) if isinstance(error, ValueError) else type(error).__name__
            reports.append({'sourceId': source['id'], 'error': message, 'lastSnapshotRetained': True})
    summary = {'checkedAt': checked_at, 'scheduled': False, 'published': False, 'sources': reports}
    write_json(args.output / 'latest-run.json', summary)
    print(json.dumps(summary, indent=2))
    return int(any('error' in report for report in reports))


if __name__ == '__main__':
    sys.exit(main())
