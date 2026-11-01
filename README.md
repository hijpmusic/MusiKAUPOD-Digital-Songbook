# MusiKaupod Digital Songbook

## Version 18 — General Lineups Integration and Guided Lineup Creator

### Added
- Three-step Mass Lineup Creator: lineup details, song selection, and final review.
- Clear All control for selected songs, with confirmation; it does not delete saved lineups.
- Final review uses a two-column liturgical-part/song-title table; tapping a song opens its catalogue entry.
- Local and uploaded lineup viewers use the same two-column layout and clickable song titles, opening the available lyrics, scores, and tonal guides.
- Save choice on the final review page: save locally or upload to MMC Cloud. A local copy is retained after confirmed cloud upload.
- If offline or the cloud upload cannot be confirmed, the completed lineup is saved locally and the user is informed.
- Improved dark-mode contrast for saved lineup titles.
- Version 18 label in the app header.
- Separate Mass Lineup Creator, My Lineups, and General Lineups entry points.
- General Lineups browser connected to the HIJP-MMC Apps Script API.
- Public listing and full lineup retrieval.
- Download online lineups as independent local copies.
- Upload completed local lineups with manually entered uploader name and administrator password. The password is entered at runtime and is not embedded in the public app source.
- Offline and server-connection error messages for online browsing, downloading, and uploading.
- Psalm Tones section placeholder with the agreed subtitle; final sample lyrics and playable recording remain pending ministry-supplied content.
- Favorites refresh/persistence handling strengthened.

### Preserved
- Existing song catalogue, lyrics, scores, tonal guides, shared lineup links, Mass Lineup structure and validation, offline PWA resources, and theme support.

### Event date note
The event date is collected and retained in local lineups and shared-link snapshots. The currently deployed Apps Script database schema does not expose a dedicated event-date field, so cloud event-date persistence requires a separate backend and spreadsheet schema update.

### Backend
The app uses the deployed HIJP-MMC General Lineups API. Public browsing requires internet. Local lineups, favorites, songbook catalogue, and bundled/downloaded resources remain available offline.

### Notes
The app does not embed the upload password. Administrators enter it when uploading. Uploaded lineups are stored in the central database; local copies are independent and do not edit the online original.


## v18 Short-Link and Song Picker Revision
### Added
- Search field in the floating song picker; filters the currently eligible songs by title while preserving category restrictions and lyrics previews.
- Short links for self-contained shared lineup snapshots using the existing Apps Script project and spreadsheet.
- Short-link creation stores only the encoded snapshot payload and a short code; it does not publish the lineup to the MMC General Lineups collection.
- Short-link resolution uses the public API. Recipients need internet to resolve a short link; the original self-contained link remains available as the offline/shortener fallback.
### Fixed
- LAUDATE DOMINUM is categorized as Entrance instead of Offertory.
### Backend setup required
- Replace the existing Apps Script Code.gs with the supplied backend/Code.gs.
- Run initializeDatabase() once to create the ShortLinks sheet while preserving existing database records.
- Deploy a new Web App version using the existing deployment settings (Execute as Me; access Anyone).
- The existing deployment URL is retained in the app.


## v18 Lineup Search and Duplicate Prevention Revision
### Added
- My Lineups search filters saved lineup title, occasion, season, event date, and notes as the user types.
- General Lineups search filters published lineup title, occasion, season, uploader, and description as the user types.
- Clear empty-search results are shown when no lineups match.
### Fixed
- Songs already selected in a multi-selection category are removed from that category's remaining picker choices, preventing duplicate selections.
- Auxiliary Songs also excludes songs already used elsewhere in the current lineup.
- Removing a selected song makes it available in the picker again.
- Offline cache version advanced to v28.


## MusiKaupod v19 Beta – Chord Library
- Added Show Chords / Hide Chords to song entries with supplied chord arrangements.
- Imported 13 arrangements from Barangay Mass Chords Set 1.docx.
- Chord sheets preserve the source document line spacing and chord placement using a horizontally scrollable monospaced display.
- Light and dark theme contrast styles included.
- Psalm Tones sample lyrics/audio and additional tonal guides remain pending.


## v19 Beta chord alignment revision

The Show Chords view for the 13 arrangements now displays high-resolution page images rendered directly from `Barangay Mass Chords Set 1.pdf`. This preserves the source PDF's actual chord-to-syllable positioning, line spacing, and page layout rather than approximating alignment with typed spaces. The 15 reference page images are included in the service-worker precache for offline use. Glorya I and Hesus na Ginoo span multiple pages; Memoryal I and Amen I share page 9 in the source PDF.
