# MusiKaupod Digital Songbook

## Version 18 — General Lineups Integration

### Added
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

### Backend
The app uses the deployed HIJP-MMC General Lineups API. Public browsing requires internet. Local lineups, favorites, songbook catalogue, and bundled/downloaded resources remain available offline.

### Notes
The app does not embed the upload password. Administrators enter it when uploading. Uploaded lineups are stored in the central database; local copies are independent and do not edit the online original.
