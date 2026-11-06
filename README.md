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


## Beta 19.5 UI Revision — Resource Indicators and Pastorella Lineup Selection
- Added a red chord-availability indicator to the resource legend and song lists, including Psalm Tones.
- Enabled Misa Pastorella Set 1 songs in matching Mass Lineup Creator slots.
- Added a one-version-per-lineup rule for Set 1 (Simplified or Restored), with automatic matching of the selected version and validation against mixed variants.
- Set 2 lineup selection support is prepared through the same category mapping, but no Set 2 song records are present in this source catalogue yet.
- Updated the service-worker cache to v34.


## Beta 19.5 Advent content update
- Replaced GLORYA I chord display with the corrected three-page arrangement from `Chords for App Advent and Glorya I.pdf`.
- Added chord-sheet image resources for AN HADI SAN LANGIT MAABOT, KADI O GINOO, ABREHAN KAG LINISAN, PANUGANG KALIGTASAN, ALELUYA XIII (ADBIENTO), and KADI SA AMON.
- Corrected AN HADI SAN LANGIT MAABOT lyric to “Abrehan an mga pwertahan”.
- Added five Advent tonal-guide recordings and included the new chord images/audio in the offline service-worker cache.
- IBARETA SA KALIBUTAN has a tonal guide but no chord sheet in the supplied PDF.


## Beta 19.5 — O Salutaris Hostia SATB addition
- Added one combined SATB tonal guide recording for O SALUTARIS HOSTIA.
- Added the complete two-page SATB PDF as the Full Score resource.
- Retained the existing individual Soprano, Alto, Tenor, and Bass PDFs.
- The song now has both the blue tonal-guide indicator and green PDF-notation indicator.
- Added both assets to the offline app-shell cache (service worker cache v37).


## Beta 19.6 additions
- MusiKanta Player with Favorites and locally saved/downloaded lineup playlists.
- Browse full tonal guides by song language.
- Traditional player navigation: All Tracks (default), Playlists, and Language; tabs support swipe navigation.
- Track entries show song titles only, without language subtitles.
- Persistent bottom mini-player with song title, previous, play/pause, and next; tapping the title area opens Now Playing.
- Now Playing controls: previous, next, play/pause, repeat, shuffle, lyrics, song details, speed, queue, and pitch shift in semitone steps.
- Pitch shifting uses an offline-cached AudioWorklet processor and is independent of the playback-speed control where supported by the browser.
- Original/current key labels use song key metadata when provided; otherwise the app displays that the key is not specified rather than guessing.
- Animated violet/gold loading screen with rotating Catholic liturgy and sacred music trivia.
- Full tonal guide filter excludes audio resources explicitly classified as individual voice parts.


## Beta 19.7 — MusiKanta Player and MusiKalendaryo
- Removed pitch-shifting controls and the pitch-shifter audio worklet.
- Added local custom playlists, current-track playlist adding, queue Play Next/reorder/remove/clear controls, playback session restoration, Media Session controls where supported, and sleep timer options.
- Added MusiKalendaryo date browsing for 2026–2028, with daily Ordo summary, liturgical season/rank/color, movable celebrations, Marian Saturdays, and the requested parish color/fiesta practices.
- Added the daily celebration banner beneath the home subtitle.
- Offline cache version advanced for this build.

Calendar note: this beta includes a bundled rule-based Ordo dataset for common Roman-calendar celebrations and the specified parish observances. It should be reviewed against the official Philippine Ordo and the Diocese of Masbate calendar before being treated as an authoritative liturgical Ordo; local transfers and precedence may require corrections.

## Beta 19.9 development preview

This build introduces the MusiKanam module framework and the Catholic Music Doctrines document library. The eight supplied PDF documents are stored under `doctrines/` and included in the service-worker app shell for offline availability after installation/cache completion.

MusiKanam currently contains the game-selection/detail screens, a local score/statistics framework, initial quiz content, and a OneChant beta placeholder pending chant recordings. The current question sets are starter content and are not yet the complete 600/500-question banks in the release specification. LiriKaupod and the full three-life/20-question rules also require completion before this can be considered the final Beta 19.9 release.

The mini-player dismissal and reappearance animations from Beta 19.7 are retained. The main and mini-player transport controls use inline SVG icons. The existing production v19 build is not modified.


## Beta 2.0 — Update Detection Update

- Added automatic service-worker update checks on app launch, when the app returns to the foreground, and when connectivity returns.
- Added an Update Available notification that reads the available version from `version.json` and offers an Update Now action.
- New service workers fully precache the app shell before becoming available for activation.
- Existing installations wait for user confirmation before activating an update; first installation activates automatically.
- Update activation is deferred while audio/video playback is active, then the app reloads after the new worker takes control.
- Updated the visible version label and service-worker cache namespace to Beta 2.0.
- Temporarily disabled the MusiKanam home tile and changed its subtitle to “Bug Fixes and improvements are ongoing”.


## Beta 2.0 — Song Audio Update

- Added 23 Minasbate song tonal-guide audio files in M4A format.
- Linked each audio file to its existing song record in `songs.js`.
- Replaced four existing recordings: Ibareta sa Kalibutan, An Hadi san Langit Maabot, Aleluya XIII (Adbiento), and Abrehan kag Linisan.
- Added the new audio assets to the service-worker app-shell cache for offline playback.
- Updated the service-worker cache namespace so deployed users receive the refreshed audio assets.
- Moved the main-menu song search launcher into a floating button above the mini-player; category search remains in its existing location.


## Beta 2.0 — Search UI correction

- Restored the main-menu search bar to its inline position directly below the liturgical calendar and song resource indicators.
- Tapping the search bar opens the existing centered floating search dialog.
- The dialog darkens and blurs the entire app behind it; its search panel is placed above the mini-player and other app controls so background controls cannot be used while search is open.
- Search can be dismissed with Close, Escape, or tapping the dimmed backdrop.
- Bumped the service-worker cache namespace to ensure deployed clients receive the corrected interface.

\n## Beta 2.0 — Search modal refinement\n- Search opens in a centered, cookie-consent-style popup while dimming the main menu.\n- Added a Search by lyrics toggle; title-only search remains the default.\n- Added title suggestions for queries with up to two character edits.\n- Added floating-up entrance and fade-up exit transitions.\n- Preserved matching result lists and the existing song-opening behavior.\n
- Fixed search popup viewport positioning by moving the modal to the document body; opening search no longer scrolls the app to the modal location.
- Improved dark-mode contrast for “Did you mean” suggestions.


## Update package notes (2026-11-06)
- Added an offline-cached prayer data module and a five-prayer list for each of the seven language shelves.
- Added the supplied Minasbate Ama Namon, Maglipay Ka Maria, and Pag-omaw sa Santisima Trinidad texts verbatim; two Minasbate prayers remain placeholders pending the ministry's wording.
- Added traditional English and Latin forms for the five basic prayers.
- Enabled the MusiKanam menu entry, expanded the starter trivia banks, added a 15-question LiturgiColor bank, and made OneChant playable as an introductory text-based chant quiz.
- Updated the MMC Directory detail Back handler to return directly to its recorded parent view.
- Note: Tagalog, Cebuano, Bikol, and Spanish prayer texts are currently labeled for local text verification; they are not represented as approved Missal translations. The large 600/600/500 question-bank targets are not yet met by this build.
