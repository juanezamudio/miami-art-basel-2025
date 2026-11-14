# Event source review

Inspected November 14, 2026. These sources supply discovery leads. Organizer verification and editorial approval are required before publication. The monitor is manual; no recurring automation has been enabled.

## Source inventory

| Source | Exact scope | Initial manual-refresh result | Important handling |
| --- | --- | --- | --- |
| [Khami's guide](https://docs.google.com/spreadsheets/d/1hAQIMd8sW3oOcS8D9INO4aq_0T8aFMbIKZSpgUJjRIE/htmlview#gid=1004567442) | `2026 EVENT GUIDE`, gid `1004567442`; separate `2025 EVENT ARCHIVE`, gid `0` | 27 public-table candidates; all 27 have weekday/year conflicts | Preserve RSVP hyperlink targets. Never assign 2026 from the tab title alone. The archive is for organizer research. |
| [sheeets.xyz](https://docs.google.com/spreadsheets/d/1xWmIHyEyOmPHfkYuZkucPRlLGWbb9CF6Oqvfl8FUV6k/htmlview#gid=1607985947) | `Art Basel Miami 2026`, gid `1607985947`; main header at row 14 | 2 primary-table candidates, including one canceled entry | Ignore ads and stale template labels above the real header. Contribution and unrelated-event sections below the main table are not imported. |
| [MiamiBasel](https://miamibasel.com/2026) | Public page's events feed, `status=approved`, `season=2026` | 121 factual records; 1 outside the advertised core week and 1 without a registration/organizer URL | Their approval is not our verification. Keep event links and facts; do not copy images or descriptive/editorial text. |

There are 150 source records in this baseline, not 150 unique or confirmed events. Some overlap with each other and with the published catalog. Native connector reads and the public sheet table did not expose identical row sets during inspection; the manual monitor's scope is the public primary table, not every hidden row or workbook tab.

## Concrete conflicts to resolve

- Khami's first banner still says 2025 while also showing 2026 dates. Section labels such as “MONDAY | DECEMBER 1” fit 2025, not 2026. The parser retains that text, flags the conflict, and leaves the candidate date unset.
- A Fountainhead RSVP link in the connector read resolves to an organizer page for [November 28, 2025](https://www.fountainheadarts.org/upcoming/session8). That exact event is historical. Search Fountainhead's current calendar for a separately confirmed 2026 offering.
- The sheeets.xyz main BitBasel row says “Free,” but [BitBasel's organizer](https://bitbasel.miami/) describes paid passes with different access by day. Do not publish the spreadsheet's cost without checking the exact ticket.
- A second sheeets.xyz row is titled “Event Canceled.” Keep its upstream Luma identity and cancellation signal; do not infer that the entire BitBasel program is canceled. The organizer lists a separate MOOON.PARTY Sessions program, so these identities need reconciliation.
- Khami's Factory Basel title says Dec 2–7 while its own description and [Factory Town's organizer page](https://www.factorytown.com/factory-basel-2026/) specify five nights starting Dec 2–6. An overnight finish on Dec 7 is not an extra festival opening night. Pass price labels also differ across the sheet and organizer.
- Two Khami rows use the same Soulection title while one description names different performers. Check each ticket URL; do not merge on title/venue alone or copy a conflicting title forward.

## First organizer verification batch

| Lead | Organizer evidence found | Remaining editorial work |
| --- | --- | --- |
| [BitBasel 2026](https://bitbasel.miami/) | Dec 2–5 at The Sagamore; paid passes and different access by day | Model individual occurrences/pass eligibility; reconcile the canceled sheet URL before adding related sessions. |
| [Factory Basel 2026](https://www.factorytown.com/factory-basel-2026/) | Five nights Dec 2–6; overnight closing times vary | Separate pass from nightly tickets; record next-day endings and recheck live ticket tiers. |
| [Oolite Arts brunch/open studios](https://oolitearts.org/event/art-week-brunch-2026/) | Thursday Dec 3, 10:30 AM–noon; 924 Lincoln Road; free public event with RSVP link | Create a source-backed record and verify its RSVP target. The organizer supplies the correct weekday. |
| [AfriKin GRIOT](https://www.afrikin.org/afrikin-artfair) | Public view Nov 30–Dec 6; separate Nov 29 vernissage | Keep opening-night, general admission, workshops, and runway tickets/occurrences distinct. |
| [Fountainhead historical lead](https://www.fountainheadarts.org/upcoming/session8) | Linked event is explicitly in 2025 | Hold the old listing. Find a genuinely announced 2026 event rather than shifting its date. |

## First batch imported November 14

Eight reviewed additions bring the app catalog to 11 listings. Permanent IDs and decisions are in [the editorial ledger](../src/data/editorial-review.json); the editable source remains [the 2026 CSV](../art-basel-2026.csv).

| Local ID | Listing | Editorial treatment |
| --- | --- | --- |
| 2026004 | Seed2Table Investor Night | Dec 2; All Access only; not a free standalone RSVP. |
| 2026005 | Family Office Forum | Dec 3; All Access only. |
| 2026006 | BitBasel Day and .ART Awards | Dec 4; All Access or Weekend pass. |
| 2026007 | 25th Iconic Sagamore Brunch | Dec 5 morning; All Access or Weekend pass; distinct from the 2025 brunch. |
| 2026008 | Jamaica Basel | Dec 5 afternoon/evening; Jamaica-only entry excludes brunch; organizer advertises $65 after Nov 11. |
| 2026009 | Factory Basel five-night GA pass | Opening nights Dec 2–6; next-day finishes are explicit in the schedule and notes. Final closing is Dec 7, not another opening night. |
| 2026010 | Oolite Arts brunch/open studios | Dec 3; free admission confirmed on both organizer and RSVP pages. |
| 2026011 | AfriKin GRIOT public exhibition | Nov 30–Dec 6; excludes vernissage and evening runway admission. |

Held: the canceled MOOON.PARTY discovery identity; AfriKin’s Nov 29 vernissage until surrounding-date selectors are supported; duplicate BitBasel umbrella entries; and unreviewed Factory nightly/stage tickets. The linked Fountainhead Session 8 remains historical.

Factory’s organizer-linked ticket redirect returned 403 to the web reader and AfriKin’s Eventbrite destination returned 429. Dates/access were verified with the organizers, but no checkout availability or price was inferred for those two listings. Remaining unverified prices stay blank. Pass and session relationships are currently explained in notes; structured occurrences/admission fields remain pending.

Batch validation passed: CSV preprocessing/import, catalog audit, ten catalog tests, eight source-monitor tests, and a read of the existing development homepage confirming all 11 event IDs and their admission notes render. The 2025 snapshot is unchanged. The catalog changes are local; this batch was not deployed to production.

## Manual monitoring

```sh
npm run sources:check
npm run sources:check -- --source=miamibasel-2026
npm run test:sources
```

Python 3.9+ is required; the implementation uses the standard library only. The source registry is `src/data/event-sources.json`.

Outputs in `.local/event-sources/`:

- `<source-id>.json`: latest successful baseline, source URL, check time, and factual candidate records.
- `<timestamp>-<source-id>-review.json`: saved additions, changes, and missing records with previous/current values.
- `latest-run.json`: counts and failures for the most recent run.

The first successful refresh creates a baseline. Later runs compare against it. Moving a row alone does not count as an event change; actual Google row headers are preserved so hidden rows do not corrupt row references. Tracking-only URL changes are ignored for comparison. RSVP destinations remain in snapshots.

Every candidate carries `organizer_verification_required`. Canceled rows and weekday conflicts get additional flags. No record is published, canceled, or removed from our catalog by this script. The reports are the starting point for a persistent editorial queue, not an approval UI.

On an unexpected layout, ambiguous identity, empty result, feed reaching its 200-record cap, or network error, the adapter stops for that source and retains its previous baseline. Successful sources can still refresh. The command exits nonzero if any source fails. Reports are written before baselines advance so a later run cannot erase earlier change evidence.

MiamiBasel's adapter reads the same approved-2026 query as its public page. It does not execute downloaded JavaScript, request admin endpoints, or store the public client credential in the registry or reports. If their public client configuration or feed layout changes, the adapter needs review.

## Recommended next implementation

Turn the saved discovery reports into a durable review queue, deduplicate against our catalog, and work through the organizer batch above. Add field-level verification evidence and a deliberate publish operation before scheduling refreshes. Missing from a source should request review rather than automatically cancel an event.
