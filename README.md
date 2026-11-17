# Basel.ai — Miami Art Week 2026

An independent guide to Miami Art Week, November 30–December 6, 2026. Art Basel Miami Beach public fair dates are December 4–6. Basel.ai is not affiliated with Art Basel.

The app uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, Leaflet, and Gemini. It includes searchable listings, a calendar, a map, saved/shared schedules, a 2025 archive, and AI assistance.

## Local development

Use Node.js **22.18+** (22 LTS recommended). Data scripts and tests use Node's built-in TypeScript stripping.

```sh
npm ci
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. Listings, filtering, the calendar, archive, and local saved schedules do not need API credentials.

Optional integrations:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | AI chat and itinerary generation |
| `GEMINI_MODEL` | Gemini model override; defaults to `gemini-2.5-flash` |
| `NEXT_PUBLIC_BASE_URL` | Canonical origin for notifications and wallet metadata |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Existing wallet donation integration |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY` | Push notification integration |
| `CRON_SECRET` | Authenticate reminder requests |
| `CONVERTKIT_API_SECRET`, `CONVERTKIT_FORM_ID` | Email subscriptions |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Event issue reports |

Never commit `.env.local` or credentials. Configure production environment values through the existing hosting setup.

## Project checklist and discovery sources

See [TODO.md](TODO.md) for the prioritized 2026 launch checklist and [the source review](docs/event-source-review.md) for findings from the two public spreadsheets and MiamiBasel. Run `npm run sources:check` to capture local added/changed/missing reports. Monitoring requires Python 3.9+ and network access; it is manual and never publishes events.

## Current data and editorial workflow

`src/data/season.json` controls the current edition, Miami timezone, week dates, and fair dates. `art-basel-2026.csv` is the editable source; `src/data/events.json` is the published catalog. The current catalog has **209 reviewed listings** across 22 areas and all six event categories. Fifty-nine listings explicitly offer free general admission or public viewing. The latest [spreadsheet rescan](src/data/catalog-review-sheeets-2026-11-17.json) adds 58 organizer-checked listings and reconciles all 66 current schedule rows; see the [review notes](docs/sheeets-rescan-2026-11-17.md). The [Miami Guide batch](src/data/catalog-review-miami-guide-2026-11-16.json) previously added 26 listings. The original three fairs were checked November 13, 2026:

- [Art Basel Miami Beach](https://www.artbasel.com/miami-beach?blLocaleCode=en)
- [Art Miami](https://www.artmiami.com/practical-info)
- [Untitled Art, Miami Beach](https://untitledartfairs.com/?switch=miami)

Eight more listings were reviewed and imported on November 14: five BitBasel program sessions, the Factory Basel five-night GA pass, Oolite Arts’ brunch/open studios, and AfriKin’s public exhibition. [Editorial decisions](src/data/editorial-review.json) retain organizer evidence, discovery identities, and held/historical leads. This manual ledger is not yet an enforced publish gate or review UI. The [November 16 review ledger](src/data/catalog-review-2026-11-16.json) records the larger launch batch, 126 discovery dispositions, held leads, and venue-coordinate evidence. See the [catalog release notes](docs/catalog-expansion-2026-11-16.md) for coverage and verification limits.

Week dates come from the [Greater Miami Convention & Visitors Bureau](https://www.miamiandbeaches.com/events/art-basel/miami-art-week-fairs). Coverage remains open to further verified additions. Browsing dates also include the confirmed November 29 vernissage, while the official week remains November 30–December 6. Longer exhibitions use an explicitly described Art Week viewing window; their full run appears in the notes. Blank prices and hours mean **unverified**, never free or open all day. Private previews are not included in public date ranges.

1. Check an organizer's page for this edition. Verify dates, location, access restrictions, and ticket information independently.
2. Add the event to the CSV with a permanent ID, edition, organizer source URL, and the date actually checked. Use ISO `YYYY-MM-DD` dates. Leave unknown prices and schedules blank.
3. Run `npm run preprocess-data` to validate editorial input without changing it. AI no longer estimates ticket prices or addresses.
4. Run `npm run update-data` to validate and import. Invalid data is rejected before the live catalog is written. Multiline values, quoted commas, and escaped quotes are supported. Existing coordinates are retained only if the address and neighborhood are unchanged.
5. Run `npm run audit-data`, `npm test`, and `npm run build` before release.

Required CSV columns:

```text
ID,Event,Event Type,Start Date,End Date,Schedule,Neighborhood,Address,Notes,Ticket Price,Tickets Link,Edition,Source URL,Last Verified At
```

Event types: `Art Show`, `Party`, `Wellness`, `Conference`, `Networking`, `Pop Up`.

IDs are permanent across editions; **never reuse an archived event's ID**. New 2026 entries start at `2026001`. Existing 2025 shared event URLs and saved schedules continue to resolve against the archive.

The audit rejects wrong-year/invalid dates, duplicate or reused IDs, duplicate title/date/venue entries, unsafe URLs, missing provenance, and future verification dates. It warns about source checks older than 14 days, unknown prices, and missing venue coordinates. It validates the recorded evidence fields; an editor must still check that a source supports the listing. The production build runs this audit automatically.

The map uses stable, labeled neighborhood centers when venue coordinates are missing. Events in one neighborhood share that location. Use the event's actual address for navigation. `npm run geocode` calls the public Nominatim service and writes coordinates; review its results before release.

## Archive safety

`src/data/archive/events-2025.json` preserves all 172 historical events. Historical prices and other details have not been reverified. The original 2025 CSV remains available for reference.

```sh
npm run archive -- 2026
```

Archive only after reviewing the final catalog. The command validates edition dates and refuses to overwrite an existing snapshot. Register the resulting file in `src/lib/archive.ts` before advancing the current season.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Audit the catalog and build production output |
| `npm run generate:social-image` | Render the sharing PNG from the running site’s hero |
| `npm start` | Serve the production build |
| `npm run typecheck` | Regenerate route types and check TypeScript |
| `npm test` | Regression tests for dates, timezones, locations, CSV, validation, and archive protection |
| `npm run audit-data` | Check published catalog; exit nonzero on errors |
| `npm run preprocess-data` | Check the editable CSV without changing it |
| `npm run update-data` | Import reviewed current-edition CSV |
| `npm run geocode` | Geocode catalog addresses; requires network access |
| `npm run archive -- 2026` | Create a protected historical snapshot |
| `npm run lint` | Existing ESLint configuration |
| `npm run sources:check` | Refresh public discovery sources into local review reports |
| `npm run test:sources` | Test source parsing and change detection offline |

Inspect an older catalog with `npm run audit-data -- --year=2025 --file=src/data/archive/events-2025.json`.

## Review and remaining launch work

The initial review found scattered 2025 date constants, a homepage hidden behind the expired season cutoff, a manual CSV-only data pipeline, speculative AI price enrichment, random map positions, unsafe HTML interpolation in map popups, an unprotected archive overwrite command, and a retired Gemini model. This pass addresses those paths and updates Next.js/React within their existing major versions.

Pending launch work is tracked in [TODO.md](TODO.md), including verified coverage, editorial review, structured occurrences, API abuse limits, notification delivery, browser QA, and release operations.

Validation for this pass: 10 regression tests, TypeScript checks, CSV validation/import, the production build, eight local page responses (including current and archived event URLs), and three API input/empty-result checks passed. The 2025 snapshot remains unchanged. Browser interaction checks and live external integrations were not exercised.

No production deployment is performed by the review workflow.

## Sharing preview

Link previews use `public/miami-art-week-2026-share-hero.png`, a 1200×630 PNG rendered from the actual website headline: Space Grotesk Bold, the same gradient, capitalization, two lines, and dark background. Open Graph and Twitter metadata reference its absolute URL; on-site advertising is independent.

To regenerate after a hero change, start the dev server, install Chromium once with `npx playwright install chromium`, then run `npm run generate:social-image -- --origin http://localhost:3000`. The generator checks the headline before capturing and uses the desktop hero’s gradient span so its colors stay consistent. Commit the generated PNG with any metadata changes.

After release, check the server-rendered `og:image` and `twitter:image`, fetch the referenced PNG, and verify its dimensions. Messaging apps may cache older previews; a fresh page URL such as `https://artbasel.space/?share=2026-hero` can be used when an existing conversation retains the old card.
