# Sumwhere scan — November 20, 2026

Scanned [Sumwhere Explore](https://go.sumwhere.app/explore) using the public Miami Art Week 2026 feed observed in its browser network requests. All 13 pages were captured: 512 unique records, matching the advertised total. Daily repeats, umbrella programs and alternate ticket platforms are discovery records, not automatically distinct events.

The [review ledger](../src/data/catalog-review-sumwhere-2026-11-20.json) reconciles every upstream ID: **245 new listings, 143 already represented, and 124 held**. The catalog grows from 209 to **454 listings**, with **120 explicitly Free listings**, across 31 areas. New permanent IDs are `2026210`–`2026454`. The existing 209 records and the 172-event 2025 archive are preserved.

| Added category | Listings |
| --- | ---: |
| Art Show | 80 |
| Party | 108 |
| Conference | 23 |
| Networking | 17 |
| Pop Up | 13 |
| Wellness | 4 |
| **Total** | **245** |

Each addition retains an organizer/host ticket page or a dated official program. Sources include host-authored Eventbrite, Luma, DICE and Posh pages; museum and gallery programs; INK, Aqua, PRIZM, KEY and BitBasel; and the official visitor bureau's current event programs. Only factual listing information is published. Promotional descriptions and images were not copied.

## Dates, tickets and access

- Art Basel week remains November 30–December 6. The existing November 29 lead-in remains available. Club Space's explicitly announced closing marathon extends through December 8; its full range is disclosed rather than cut off or described as ordinary daily opening hours.
- The Bass's two new December 3 programs visibly run at noon. Their structured calendar data incorrectly uses a Pacific offset; visible local hours take precedence. ICA's reception and Carroll Dunham brunch also use the visible event hours, membership eligibility and actual venue rather than malformed calendar metadata and generic museum details.
- Museum of Graffiti's six new artist sessions use the individually named dates/start times in the host's program. A generic campus-pass interval does not substitute for each signing's schedule. Museum admission remains explicit.
- INK's opening brunch and Pulp Party use its own special-event schedule. Aqua's sixteen performances/activations have individual organizer-published hours; December 2 performances require qualifying VIP/press access. Later sessions require fair admission. These are not extra free public fair days.
- PRIZM's individual panel starts and patron/press First View come from its 2026 program. An inconsistent Friday heading is disclosed for Mek Room; the individually dated December 4 session is used. Undated or ambiguous patron/dinner claims remain held.
- Point Comfort's five entries follow its detailed 2026 program. Red Rooster reception/talk locations are distinguished from the Ward exhibition gallery. The Saturday fundraising concert may require separate admission. Detailed current copy takes precedence over generic midnight metadata and older summary agenda wording.
- Historic Hampton House's public December 1–6 exhibition window excludes its invitation-only November 30 opening. The longer exhibition run through February 2027 is context in the notes, not a seven-month Art Week listing.
- Approval-based free tickets, RSVP tiers, member-only access, sold-out inventory and paid fair passes do not become unconditional `Free` listings. Artnet recordings require an Untitled Art pass. Paid PROOF Miami admission is distinct from free applications to its proposed, unconfirmed Build Lab.
- The FOIS dinner now has December 4 calendar/body details while its title still says December 2; that conflict is disclosed. Solomun replaces the upstream Saturday TBD title using the current promoter listing. Unknown hours and prices remain explicit.
- Early-morning ends for overnight parties stay attached to the opening night. Multi-evening fashion/exhibition programs do not gain an additional full day from an early-morning closing timestamp.

## Locations and held leads

The additions include 118 venue coordinates from publicly displayed organizer information or an existing reviewed point for the same street address. Registration-gated coordinates are excluded. The mansion's placeholder address and a rave's convention-center placeholder are removed. Some listings intentionally lack a map point; public neighborhoods may use the application's labeled approximate fallback.

All 124 held leads retain their upstream identities, public URLs and reasons. These include specific Untitled program links returning 404, social-only or insufficiently confirmed announcements, generic fair links without evidence for a named session, undated program teasers, a recurring non-Art-Week coffee, and Club Galore's conflicting venue details. Held records are not silently assigned a 2026 date or published from Sumwhere alone.

## Future rescans

Run `npm run sources:check -- --source=sumwhere-2026`. The adapter follows every public cursor, validates the advertised total and unique IDs, strips descriptions/images/coordinates, and saves local added/changed/missing reports. Incomplete or inconsistent pagination retains the previous baseline. The first 512-record snapshot is a baseline, not evidence that all 512 were newly announced. Monitoring is manual and does not publish or schedule updates.

## Validation

Catalog audit, CSV/JSON agreement, review-ledger coverage and preservation of the prior 209 records/172-record archive passed. All 15 catalog regressions and 11 source-monitor tests passed, together with TypeScript and the production build in an isolated release snapshot.

Desktop/mobile browser checks passed for every one of the 454 event IDs, all 120 strict Free results, date filters, corrected noon Bass programs, December 7–8 marathon dates, new detail/ticket links, and all 393 available venue/approximate map points. Conditional admission and the held venue-conflict lead are excluded from the corresponding results. The 390-pixel mobile list and calendar have no horizontal overflow. The dedicated hero sharing image remains configured. No runtime browser errors were observed. Deployment verification is recorded locally after publication.
