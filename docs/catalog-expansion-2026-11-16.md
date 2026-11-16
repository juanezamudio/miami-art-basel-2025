# Catalog expansion — November 16, 2026

The catalog grew from 11 to 125 listings, with 114 additions checked against current organizer, venue, producer, host-authored ticketing, and City of Miami Beach programs. All 172 archived 2025 listings and their permanent IDs are preserved.

| Category | Listings |
| --- | ---: |
| Art Show | 67 |
| Party | 37 |
| Conference | 8 |
| Pop Up | 7 |
| Networking | 5 |
| Wellness | 1 |

There are 14 areas, 20 explicitly free listings, and 111 reviewed venue/address coordinate matches. Fourteen remaining points use labeled neighborhood approximations. A minimum ticket price is known for some paid events; 66 prices remain unknown. Free RSVP / paid tiers and approval-dependent admission are deliberately excluded from the unconditional Free filter.

Coverage includes public days for the principal fairs, independent gallery openings, the twelve separate No Vacancy hotel installations, Faena installations, Oolite programs, museum/community events, food and maker markets, workshops, talks and nightlife. Distinct programs inside a fair state the required fair admission. A week pass describes its ticket scope separately from individual ticketed nights.

The source refresh contained 126 MiamiBasel discovery records: 80 are represented by catalog listings and 46 remain held with explicit reasons. A represented source record can correspond to an existing fair or umbrella program; it is not necessarily a new local event. The batch also includes programs discovered directly through organizers and the spreadsheets.

[The review ledger](../src/data/catalog-review-2026-11-16.json) records primary evidence, imported IDs, source identities, held decisions, updated prices, and address-coordinate evidence. It supplements the historical [November 14 ledger](../src/data/editorial-review.json); these remain manual editorial records, not an enforced approval system.

Date and access decisions:

- Official Miami Art Week remains November 30–December 6. The browsing range also includes AfriKin’s confirmed November 29 vernissage.
- Design Miami public admission starts December 2 at 1 PM; Aqua public days start December 3. NADA closes December 5. Spectrum/Red Dot general day tickets cover December 3–6; December 2 requires a different ticket.
- Overnight parties use their opening-night date and state next-day closing in the schedule. No closing time was invented for a listing that only says “late.”
- Exhibition windows are scoped to Art Week and their full runs are disclosed. Nina Johnson and Spinello viewing windows exclude their regular closed days.
- The Friday Worldcenter market is December 4 only, rather than every day in its recurring-series date range.
- The spreadsheet’s Ghana Independence party links to March 2027. Its correct December 6 Basel event was located separately. The GenderChill host-confirmed date is December 4, rather than the sheet’s December 5 placement.
- Sunday PRIZM closing hours and the unKommon Saturday opening time conflict within the primary listings. Both conflicts are disclosed, and no exact planning hours are asserted for those cases.

Unknown prices, unreleased ticketing, eligibility requirements, and limited-capacity registration remain explicit. A checked source establishes the published facts at review time; it does not guarantee future ticket inventory or admission. Source monitoring remains manual (`npm run sources:check`) and never publishes directly.

Location lookup used one machine/thread, cached responses, and at least 1.2 seconds between requests, following the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/). Accepted matches required matching house numbers, municipality checks and a Miami-area bounding box, followed by street/address review. Map coordinates are navigation aids, not a guarantee of the precise event entrance. © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). Promoter-supplied venue points came from current DICE event metadata.

Validation: catalog/CSV audit; 15 catalog regressions; eight source-monitor tests; TypeScript; desktop/mobile browser checks for all 125 cards, search, free/date filters, calendar selection, new event links and historical links. Production build and deployment verification are recorded in the release outcome.
