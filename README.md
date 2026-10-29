# MusiKaupod Digital Songbook — PWA

Subtitle: **Musika Para sa Parokya**

## Deploy
Upload the contents of this folder to the root of your GitHub Pages repository. Keep `index.html` at the published root. Use HTTPS for installation and service-worker support.

## Features in this build
- Bundled Version 1 song library plus queued song additions included in this bulk build.
- Home-screen search across titles, lyrics, categories, seasons, and collections.
- Song titles displayed in ALL CAPS.
- Resource indicators: cream = text lyrics; green = PDF notation; blue = MP3 tonal guide.
- Separate SATB score links where supplied; combined score links for Misa Pastorella Set 1 Simplified.
- Built-in MP3 tonal-guide player.
- Light/dark theme toggle.
- Misa Pastorella navigation: Set 1 > Simplified / Restored; Set 2.
- Siete Palabras main-menu collection.
- Fiesta Line-up and Songs for Holy Hour removed from the home menu.
- Service worker precaches the included app, song data, PDFs, and MP3 guides for offline use.

## Notes
- Restored, Set 2, and Siete Palabras currently have empty collection screens until songs are supplied.
- Songs without supplied lyrics or MP3s do not show those resource indicators.
- PDF and MP3 assets are included in the ZIP. The initial service-worker installation may take a while because the audio files are several dozen megabytes.


## Bulk update notes
- All song titles are stored and displayed in ALL CAPS.
- Service song categories use English labels: Entrance, Offertory, Communion, Recessional.
- Liturgy labels use Gospel Acclamation, Sanctus, Memorial Acclamation, Lord's Prayer, Doxology, and Agnus Dei.
- New song entries submitted in chat can be integrated directly into `songs.js`; Excel is no longer required for future submissions.
- Service worker cache bumped to v5.
