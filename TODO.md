# Basel.ai 2026 launch checklist

Updated November 14, 2026. Prioritize verified event coverage, repeatable source review, and accurate times/access before further visual work. The app catalog currently has 11 reviewed listings, including the three seed fairs and eight additions from the first organizer batch. Discovery snapshots are not published listings.

## Next work, in order

- [x] **DATA-01A — Review and import the first four organizers.** Imported eight listings from BitBasel, Factory Basel, Oolite Arts, and AfriKin with permanent IDs, organizer evidence, and explicit pass/admission notes. Decisions and held leads are recorded in [editorial-review.json](src/data/editorial-review.json).
- [ ] **DATA-01B — Continue through the discovery backlog.** Review the remaining MiamiBasel and spreadsheet leads against organizers. Reject historical/canceled entries, resolve duplicates, and verify prices/ticket scope before import. The original 121-row MiamiBasel baseline is only partially reviewed. See [source findings](docs/event-source-review.md).
- [ ] **DATA-02 — Build a persistent review queue.** Add states for unreviewed, needs research, approved, rejected, and historical. Show original values, organizer evidence, and field-level changes. A reviewer approves both new events and updates; polling never publishes directly.
- [ ] **DATA-03 — Deduplicate across sources.** Match organizer/ticket URLs, event name, venue, date, and occurrence. Preserve multiple provenance records and upstream IDs under one permanent local event ID. Keep a multi-day pass separate from individual nights; do not merge unrelated events sharing a venue or organizer.
- [ ] **TIME-01 — Store actual occurrences and admission rules.** Add Miami timezone, per-day start/end, overnight end dates, public vs. private previews, age restrictions, RSVP eligibility, ticket scope, and canceled/sold-out/waitlist status. Blank hours and “late” remain unknown. Tests must cover a 10 PM–6 AM event ending the next day.
- [ ] **DATE-01 — Include events outside the core week in browsing.** Keep the advertised Nov 30–Dec 6 week separate from actual event dates. AfriKin’s verified Nov 29 opening is currently held for this task. Calendar/date filters and the planner should support reviewed surrounding dates and after-midnight occurrences without silently shifting them into the core week.
- [ ] **DATA-04 — Promote approved records through the validated import.** Define where editorial approval is stored and who can publish it. Preserve stable IDs, 2025 history, shared URLs, and existing schedules. Failed validation must leave the live catalog unchanged.

## Source monitoring and reliability

- [x] Register the two exact spreadsheet tabs and MiamiBasel 2026 in [event-sources.json](src/data/event-sources.json).
- [x] Implement a manual refresh: `npm run sources:check`. Preserve sheet RSVP hyperlinks; capture only public event facts from MiamiBasel's approved 2026 feed.
- [x] Save local baselines and timestamped added/changed/missing reports. Fail closed on a changed layout, ambiguous duplicate, oversized/truncated result, or source error; preserve the last good snapshot.
- [x] Capture the initial baseline: 27 Khami public-table records, 2 sheeets.xyz main-schedule records, 121 MiamiBasel records. These counts overlap across sources and include candidates requiring rejection or correction.
- [ ] **MON-01 — Add organizer-specific adapters.** Start with the recurring organizers linked in the first review batch. Extract factual event fields and canonical ticket URLs; retain evidence of what changed. Use archived 2025 names as search leads, never as dates to increment automatically.
- [ ] **MON-02 — Support the contribution area and hidden/archive tabs deliberately.** The current sheet adapter reads the public primary schedule only. Review other areas separately, preserving original year and row identity. Investigate public-view vs. connector snapshot differences instead of assuming every workbook cell is current or public in the same view.
- [ ] **MON-03 — Improve reconciliation.** Detect title/venue/link changes without unnecessarily creating new candidates. Persist decisions across refreshes and surface conflicting prices, cancellation signals, and recurring-event matches. Missing from a source is a review signal, not proof of cancellation.
- [ ] **MON-04 — Add scheduling and operational alerts.** Choose the runner, durable snapshot storage, overlap lock, refresh cadence, timeout/retry policy, and failure notifications. Suggested starting cadence: daily now, every 6 hours near Art Week. **No recurring job or notifications are currently configured.**
- [ ] **MON-05 — Add an editor inbox.** Show newly added leads, material updates, conflicts, missing sources, and stale organizer checks. Keep `lastSeenAt` distinct from `lastVerifiedAt`; a successful fetch does not verify an event.

## Before public launch

- [ ] **SEC-01 — Limit public API abuse.** Add distributed rate limits, request bounds, timeouts, and production-appropriate abuse controls to AI, geocoding, subscriptions, and issue reports. Remove cron secrets from URL query parameters; use authenticated headers.
- [ ] **NOTIFY-01 — Make reminders dependable.** Use verified occurrences, durable delivery idempotency, and actual subscriber preferences. Test re-runs and overlapping cron windows before enabling delivery. Free-text schedule parsing is not enough.
- [ ] **MAP-01 — Verify venues and overlapping markers.** Geocode exact addresses, review results, and cluster/list events sharing a venue or approximate neighborhood point. Keep approximate locations visibly labeled.
- [ ] **QA-01 — Exercise mobile flows in a real browser.** Search/filter clear, date selection, saved events, legacy shared links, shared schedules, map selection, dialogs, keyboard navigation, loading/error states, and iOS installation.
- [ ] **QA-02 — Verify live integrations.** Check production Gemini/model access, event submissions, email confirmation/unsubscribe, Telegram issue reports, and push subscriptions. Separate checks that send external messages from read-only QA.
- [ ] **WEB-01 — Finish public event pages.** Show organizer evidence and freshness in the detail modal, clear access/cancellation status, event-specific metadata, and accurate structured Event data when time/venue are known. Check outgoing links.
- [ ] **PERF-01 — Reduce optional wallet work.** Donation controls now avoid server initialization; review remaining globally loaded wallet dependencies and legacy peer warnings. Load optional donation functionality only when useful.
- [ ] **OPS-01 — Prepare release and rollback.** Confirm canonical domain, production environment variables, analytics, uptime/error reporting, a release checklist, and rollback to the previous catalog/deployment. Run audit, both test suites, TypeScript, production build, and browser QA before deploying.

## Already completed in the 2026 readiness pass

- [x] Centralize the 2026 season dates and remove the expired homepage gate.
- [x] Preserve the 172-event 2025 archive and resolve historical event links/saved IDs.
- [x] Add three organizer-sourced seed fairs with source links and verification dates.
- [x] Validate CSV imports, preserve quoted/multiline fields, prevent archive overwrites, and audit the catalog during production builds.
- [x] Fix date-only timezone filtering and use Miami's date for the “Today” ticker.
- [x] Replace invented map offsets with stable, labeled neighborhood centers and render popup event text safely.
- [x] Replace the retired Gemini model setting, constrain planner results to eligible catalog events, and reject malformed requests.
- [x] Update Next.js/React within their existing major versions and isolate browser-only wallet controls from server rendering.
- [x] Pass the initial production build, TypeScript checks, ten catalog regression tests, and local page/API smoke checks. Real-browser and live external integration checks remain above.

## Working commands

```sh
npm run sources:check
npm run sources:check -- --source=khami-2026
npm run test:sources
npm test
```

Source monitoring additionally needs Python 3.9+ and network access. Reports are in `.local/event-sources/`, which is ignored by Git. The first run is a baseline, so its records appear as added; that does not mean they were newly announced. This command never updates `art-basel-2026.csv`, `src/data/events.json`, or the 2025 archive.
