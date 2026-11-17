# sheeets.xyz rescan — November 17, 2026

Rescanned the exact [Art Basel Miami 2026 tab](https://docs.google.com/spreadsheets/d/1xWmIHyEyOmPHfkYuZkucPRlLGWbb9CF6Oqvfl8FUV6k/htmlview#gid=1607985947), preserving cell hyperlinks and comparing all schedule entries against the published catalog and current organizer sources.

The schedule grew from 59 to 66 discovery rows since the November 16 snapshot: seven additions, no changed or missing records. All 66 rows are now reconciled: 58 have newly reviewed catalog listings and eight were already represented. BitBasel's umbrella row is represented by its five existing session listings. All seven newly discovered rows were imported, together with 51 previously unimported leads.

The catalog now contains **209 listings**, including **59 explicitly Free listings**, across 22 named areas. Existing 151 catalog records and all 172 archived 2025 records are preserved. The new IDs are `2026152`–`2026209`.

| New category | Additions |
| --- | ---: |
| Art Show | 19 |
| Conference | 17 |
| Networking | 4 |
| Party | 14 |
| Wellness | 4 |
| **Total** | **58** |

The [review ledger](../src/data/catalog-review-sheeets-2026-11-17.json) records the source row, original event URL, primary evidence, decision and permanent event ID for every primary-table lead. Dates and public access were checked on the actual 2026 Art Basel event pages, host-authored Luma/DICE listings, promoter-authored Resident Advisor/Shotgun pages, and organizer-issued programs. Search results and public page data were used where a site's rendered HTML omitted event details. No promotional descriptions or imagery were copied.

## Admission and schedule corrections

- Art Basel's seventeen explicitly free Conversations sessions are separate from paid fair admission. The dedicated Julia Weist screening does not state free admission, so its price remains unconfirmed.
- Art Kids is for ages 5–11 and requires an eligible parent ticket/card plus preregistration. ArtNexus tours require both a tour booking and separate fair admission. Their public browsing windows are December 4–6; December 2–3 preview access is explained separately.
- Margulies Coffee at the Warehouse runs December 1–5, 9–11 AM, and requires purchased admission. The sheet's Free label is not copied.
- ArtNexus's exhibition is scoped to its published Art Week viewing hours, December 2–6, 10 AM–5 PM. Its full exhibition run through July 31, 2027 remains in the notes.
- Ruinart's December 3–6 installation is retained, with its ambiguous final-midnight close disclosed. Zero-filled timed fields are not interpreted as confirmed 24-hour access.
- Approval-based free Luma events remain labeled `Free (approval required)` and are excluded from the unconditional Free filter. Hidden addresses and coordinates are not imported; publicly named neighborhoods can use the existing approximate map fallback.
- The Ethereal's Friday runway and Saturday Pilates programs are distinct from WOW BASEL programs at the same Flow Wynwood venue. Their ticket prices and host approval requirements are retained.
- The Fourth Space's complimentary exhibition tier shows sold out. Its exhibition, evening performance and paid table tiers have different access; Citizen's Lounge is a separate $99 after-party listing. A free RSVP does not imply concert access.
- The Wellness Oasis is December 3–4, 8:30 AM–6 PM, at InScope. Advertised admission is $125/day; current organizer links show sold out. Archived 2025 material on the same registration page is excluded.
- Where Are My Keys is a four-day program, not just the spreadsheet's opening-night window. Overnight operations, the Saturday–Monday continuous session, and Sunday entry conditions are stated in the notes.
- elrow links to a paid Factory Basel Sunday Pass, from $84.99, covering all Sunday stages. DICE currently gives a 6 AM Monday finish; the sheet's Free label and 7 AM finish are not copied. This is separate from the existing five-night pass.

## Supplementary areas and monitoring

Native Sheets reads confirmed the exact tab and metadata. The contribution/header area through row 160, additional columns through BC around the schedule, and event-title/link columns through metadata row 2618 were checked. There were no further event titles or URLs below row 160. The lone April 4 tokenization-event link in row 100 is outside this Art Week scope and is not imported. Template counters, advertisements and other workbook tabs are not event evidence.

The manual source monitor saved the seven-row delta before advancing its baseline. Monitoring remains manual and never publishes directly. The supplied spreadsheet was read only.

The new records use 50 venue coordinates from reviewed public organizer/ticket pages. Other points retain the application's labeled neighborhood fallback where available. Events with an undisclosed neighborhood or no reviewed coordinate remain absent from the map rather than receiving an invented location; they are available in the list/calendar with their published location information.

## Validation

Validated the 209-row draft with the catalog auditor before import. The CSV and JSON agree; permanent IDs and the original 151 records are preserved. The review ledger covers all 58 additions and all 66 discovery rows. Fifteen catalog regressions, eight source-monitor tests, TypeScript and the production build passed against the isolated release snapshot.

Desktop/mobile browser checks passed for all 209 listing IDs, search, the 59-item Free filter, approval/paid-admission exclusions, the December 4 filter, December 2 calendar talks, public-day Art Kids placement, the new elrow detail route, and mobile width without horizontal overflow. The map shows 207 events with reviewed or explicitly approximate locations; the unlocated house event and The Pickle program remain listed without invented map points. No browser runtime errors were observed in these flows.
