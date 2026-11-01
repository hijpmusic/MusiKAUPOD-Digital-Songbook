/**
 * HIJP-MMC GENERAL LINEUPS DATABASE API
 * Single-file Google Apps Script backend for MusiKaupod.
 *
 * PUBLIC GET:
 *   ?action=health
 *   ?action=list
 *   ?action=get&id=MMC-XXXXXXXXXXXX
 *
 * PASSWORD-PROTECTED POST:
 *   {"action":"upload","password":"...","lineup":{...}}
 *
 * REQUIRED SCRIPT PROPERTY:
 *   MMC_LINEUPS_UPLOAD_PASSWORD = your chosen upload password
 *
 * DATABASE SCRIPT PROPERTY (created automatically by initializeDatabase):
 *   MMC_LINEUPS_SPREADSHEET_ID = ID of the database spreadsheet
 *
 * IMPORTANT:
 * - Run initializeDatabase() once from the editor before deployment.
 * - It reuses the configured spreadsheet if accessible; otherwise it creates
 *   a new spreadsheet and saves its ID. It never clears existing records.
 * - The execution log prints the exact spreadsheet URL.
 */

const MMC_CONFIG = Object.freeze({
  DB_ID_PROPERTY: 'MMC_LINEUPS_SPREADSHEET_ID',
  PASSWORD_PROPERTY: 'MMC_LINEUPS_UPLOAD_PASSWORD',
  LINEUPS_TAB: 'Lineups',
  AUDIT_TAB: 'AuditLog',
  SHORT_LINKS_TAB: 'ShortLinks',
  MAX_SHORT_PAYLOAD_LENGTH: 45000,
  MAX_BODY_LENGTH: 180000,
  MAX_LIST_LIMIT: 200
});

const MMC_LINEUP_HEADERS = Object.freeze([
  'LINEUP_ID', 'TITLE', 'OCCASION', 'LITURGICAL_SEASON', 'DESCRIPTION',
  'SONGS_DATA', 'UPLOADER', 'DATE_CREATED', 'DATE_UPDATED', 'STATUS'
]);

const MMC_AUDIT_HEADERS = Object.freeze([
  'LOG_ID', 'ACTION', 'LINEUP_ID', 'USER', 'TIMESTAMP', 'DETAILS'
]);

const MMC_SHORT_LINK_HEADERS = Object.freeze(['CODE', 'PAYLOAD', 'DATE_CREATED', 'STATUS']);

/**
 * INITIAL SETUP: Run this once manually from Apps Script.
 * Creates the database spreadsheet if the configured one is missing/inaccessible.
 * Logs the exact URL so you can open the correct spreadsheet.
 */
function initializeDatabase() {
  const props = PropertiesService.getScriptProperties();
  const existingId = String(props.getProperty(MMC_CONFIG.DB_ID_PROPERTY) || '').trim();
  let ss = null;

  if (existingId) {
    try {
      ss = SpreadsheetApp.openById(existingId);
    } catch (err) {
      console.warn('Configured spreadsheet ID is inaccessible; creating a new database. ' + err.message);
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create('HIJP-MMC General Lineups Database');
    props.setProperty(MMC_CONFIG.DB_ID_PROPERTY, ss.getId());
  }

  const lineupSheet = getOrCreateSheet_(ss, MMC_CONFIG.LINEUPS_TAB);
  const auditSheet = getOrCreateSheet_(ss, MMC_CONFIG.AUDIT_TAB);
  const shortLinkSheet = getOrCreateSheet_(ss, MMC_CONFIG.SHORT_LINKS_TAB);
  ensureHeaders_(lineupSheet, MMC_LINEUP_HEADERS);
  ensureHeaders_(auditSheet, MMC_AUDIT_HEADERS);
  ensureHeaders_(shortLinkSheet, MMC_SHORT_LINK_HEADERS);
  lineupSheet.setFrozenRows(1);
  auditSheet.setFrozenRows(1);
  shortLinkSheet.setFrozenRows(1);
  shortLinkSheet.getRange('A:A').setNumberFormat('@');
  lineupSheet.getRange('A:A').setNumberFormat('@');
  auditSheet.getRange('A:C').setNumberFormat('@');

  Logger.log('DATABASE NAME: ' + ss.getName());
  Logger.log('DATABASE URL: ' + ss.getUrl());
  Logger.log('SPREADSHEET ID: ' + ss.getId());
  Logger.log('LINEUPS LAST ROW: ' + lineupSheet.getLastRow());
  Logger.log('AUDIT LOG LAST ROW: ' + auditSheet.getLastRow());
  Logger.log('Database initialized. Existing data was preserved.');
  return { ok: true, spreadsheetUrl: ss.getUrl(), spreadsheetId: ss.getId() };
}

/** Backward-compatible setup name. */
function setupDatabase() {
  return initializeDatabase();
}

/** Web App GET endpoint. Default action is list. */
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  try {
    const action = String(params.action || 'list').toLowerCase();
    let result;
    if (action === 'health') {
      const ss = getDatabase_();
      const lineupSheet = getRequiredSheet_(ss, MMC_CONFIG.LINEUPS_TAB, MMC_LINEUP_HEADERS);
      const auditSheet = getRequiredSheet_(ss, MMC_CONFIG.AUDIT_TAB, MMC_AUDIT_HEADERS);
      result = {
        ok: true,
        service: 'HIJP-MMC General Lineups API',
        spreadsheet: ss.getName(),
        lineupRows: Math.max(0, lineupSheet.getLastRow() - 1),
        auditRows: Math.max(0, auditSheet.getLastRow() - 1)
      };
    } else if (action === 'list') {
      result = listLineups_(params);
    } else if (action === 'get') {
      result = getLineup_(String(params.id || '').trim());
    } else if (action === 'resolveshort') {
      result = resolveShortLink_(String(params.code || '').trim());
    } else {
      result = { ok: false, error: 'Unsupported action. Use health, list, get, or resolveShort.' };
    }
    return outputJson_(result, params.callback);
  } catch (err) {
    return outputJson_({ ok: false, error: messageOf_(err) }, params.callback);
  }
}

/** Web App POST endpoint. Upload only; requires Script Property password. */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!raw) throw new Error('Request body is empty.');
    if (raw.length > MMC_CONFIG.MAX_BODY_LENGTH) throw new Error('Request is too large.');

    let body;
    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      throw new Error('Request body must be valid JSON.');
    }

    const action = String(body.action || '').toLowerCase();
    if (action === 'createshortlink') {
      const code = createShortLink_(String(body.payload || ''));
      return outputJson_({ ok: true, code: code, message: 'Short link created.' });
    }
    if (action !== 'upload') {
      throw new Error('Unsupported POST action. Use upload or createShortLink.');
    }

    const savedPassword = PropertiesService.getScriptProperties()
      .getProperty(MMC_CONFIG.PASSWORD_PROPERTY);
    if (!savedPassword) throw new Error('Upload password is not configured in Script Properties.');
    if (!constantTimeEquals_(String(body.password || ''), savedPassword)) {
      auditSafely_('UPLOAD_DENIED', '', 'Unknown/unauthorized uploader', 'Invalid upload password');
      throw new Error('Incorrect upload password.');
    }

    const lineup = normalizeLineup_(body.lineup || {});
    const id = saveLineup_(lineup);
    return outputJson_({ ok: true, lineup_id: id, message: 'Lineup uploaded successfully.' });
  } catch (err) {
    return outputJson_({ ok: false, error: messageOf_(err) });
  }
}

/** Create a short code for an existing self-contained lineup payload. */
function createShortLink_(payload) {
  if (!payload || payload.length > MMC_CONFIG.MAX_SHORT_PAYLOAD_LENGTH) {
    throw new Error('The shared lineup payload is empty or too large for a short link.');
  }
  if (!/^[gj][A-Za-z0-9_-]+$/.test(payload)) {
    throw new Error('Invalid self-contained lineup payload.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getRequiredSheet_(getDatabase_(), MMC_CONFIG.SHORT_LINKS_TAB, MMC_SHORT_LINK_HEADERS);
    const existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat()
      : [];
    let code = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      code = Utilities.getUuid().replace(/-/g, '').substring(0, 7).toUpperCase();
      if (existing.indexOf(code) === -1) break;
      code = '';
    }
    if (!code) throw new Error('Could not generate a unique short code. Please try again.');
    sheet.appendRow([code, payload, new Date(), 'ACTIVE']);
    SpreadsheetApp.flush();
    return code;
  } finally {
    lock.releaseLock();
  }
}

/** Resolve a public short code to its original self-contained payload. */
function resolveShortLink_(code) {
  if (!/^[A-Z0-9]{7}$/.test(code)) throw new Error('Invalid short-link code.');
  const sheet = getRequiredSheet_(getDatabase_(), MMC_CONFIG.SHORT_LINKS_TAB, MMC_SHORT_LINK_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Short link not found.');
  const rows = sheet.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
  const row = rows.find(r => r[0] === code && String(r[3]).toUpperCase() === 'ACTIVE');
  if (!row) throw new Error('Short link not found or inactive.');
  return { ok: true, code: code, payload: row[1] };
}

/** Public listing. Returns metadata only; use action=get for songs. */
function listLineups_(params) {
  const sheet = getRequiredSheet_(getDatabase_(), MMC_CONFIG.LINEUPS_TAB, MMC_LINEUP_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, lineups: [] };

  const rows = sheet.getRange(2, 1, lastRow - 1, MMC_LINEUP_HEADERS.length).getValues();
  const items = rows.filter(r => String(r[9]).toUpperCase() === 'ACTIVE').map(r => ({
    id: String(r[0]),
    title: String(r[1]),
    occasion: String(r[2] || ''),
    season: String(r[3] || ''),
    description: String(r[4] || ''),
    uploader: String(r[6] || ''),
    created_at: asIso_(r[7]),
    updated_at: asIso_(r[8])
  }));
  items.sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const parsed = parseInt(params.limit || '100', 10);
  const limit = Math.min(Math.max(isNaN(parsed) ? 100 : parsed, 1), MMC_CONFIG.MAX_LIST_LIMIT);
  return { ok: true, lineups: items.slice(0, limit) };
}

/** Public single-lineup retrieval, including song data. */
function getLineup_(id) {
  if (!/^MMC-[A-F0-9]{12}$/.test(id)) throw new Error('Invalid lineup ID.');
  const sheet = getRequiredSheet_(getDatabase_(), MMC_CONFIG.LINEUPS_TAB, MMC_LINEUP_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Lineup not found.');

  const rows = sheet.getRange(2, 1, lastRow - 1, MMC_LINEUP_HEADERS.length).getValues();
  const row = rows.find(r => String(r[0]) === id && String(r[9]).toUpperCase() === 'ACTIVE');
  if (!row) throw new Error('Lineup not found or inactive.');

  let songs;
  try {
    songs = JSON.parse(String(row[5] || '[]'));
    if (!Array.isArray(songs)) throw new Error('not an array');
  } catch (err) {
    throw new Error('Stored song data for this lineup is invalid.');
  }

  return { ok: true, lineup: {
    id: String(row[0]), title: String(row[1]), occasion: String(row[2] || ''),
    season: String(row[3] || ''), description: String(row[4] || ''), songs: songs,
    uploader: String(row[6] || ''), created_at: asIso_(row[7]), updated_at: asIso_(row[8])
  }};
}

/** Shared server-side upload routine. */
function saveLineup_(lineup) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = getDatabase_();
    const sheet = getRequiredSheet_(ss, MMC_CONFIG.LINEUPS_TAB, MMC_LINEUP_HEADERS);
    const now = new Date();
    const id = newUniqueId_(sheet);
    sheet.appendRow([
      id, lineup.title, lineup.occasion, lineup.season, lineup.description,
      JSON.stringify(lineup.songs), lineup.uploader, now, now, 'ACTIVE'
    ]);
    SpreadsheetApp.flush();
    auditSafely_('UPLOAD_SUCCESS', id, lineup.uploader, 'Lineup uploaded');
    return id;
  } finally {
    lock.releaseLock();
  }
}

function normalizeLineup_(input) {
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Lineup title is required.');
  if (title.length > 120) throw new Error('Lineup title must not exceed 120 characters.');
  if (!Array.isArray(input.songs) || input.songs.length < 1 || input.songs.length > 60) {
    throw new Error('Lineup must contain between 1 and 60 song entries.');
  }
  const songs = input.songs.map((song, index) => {
    if (!song || typeof song !== 'object') throw new Error('Invalid song entry at position ' + (index + 1) + '.');
    return {
      slot: String(song.slot || '').slice(0, 60),
      songId: String(song.songId || song.song_id || song.id || '').slice(0, 100),
      title: String(song.title || '').slice(0, 160),
      category: String(song.category || '').slice(0, 80),
      variant: String(song.variant || '').slice(0, 60)
    };
  });
  return {
    title: title,
    occasion: String(input.occasion || '').slice(0, 100),
    season: String(input.season || input.liturgical_season || '').slice(0, 80),
    description: String(input.description || '').slice(0, 500),
    uploader: String(input.uploader || 'HIJP-MMC member').slice(0, 100),
    songs: songs
  };
}

function getDatabase_() {
  const id = PropertiesService.getScriptProperties().getProperty(MMC_CONFIG.DB_ID_PROPERTY);
  if (!id) throw new Error('Database is not initialized. Run initializeDatabase() in the editor.');
  try {
    return SpreadsheetApp.openById(id);
  } catch (err) {
    throw new Error('Cannot open the configured database spreadsheet. Run initializeDatabase() and use the DATABASE URL in its execution log. Details: ' + err.message);
  }
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function getRequiredSheet_(ss, name, headers) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Required sheet "' + name + '" is missing. Run initializeDatabase().');
  ensureHeaders_(sheet, headers);
  return sheet;
}

/** Writes exact headers only when the sheet is empty; never overwrites row 1. */
function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  const actual = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0]
    .map(v => String(v).trim());
  if (!headers.every((h, i) => actual[i] === h)) {
    throw new Error('Header mismatch in sheet "' + sheet.getName() + '". Expected: ' + headers.join(' | '));
  }
}

function newUniqueId_(sheet) {
  for (let n = 0; n < 10; n++) {
    const id = 'MMC-' + Utilities.getUuid().replace(/-/g, '').substring(0, 12).toUpperCase();
    const last = sheet.getLastRow();
    if (last < 2 || !sheet.getRange(2, 1, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext()) return id;
  }
  throw new Error('Could not generate a unique lineup ID. Please retry.');
}

function auditSafely_(action, lineupId, user, details) {
  try {
    const sheet = getRequiredSheet_(getDatabase_(), MMC_CONFIG.AUDIT_TAB, MMC_AUDIT_HEADERS);
    sheet.appendRow([
      'LOG-' + Utilities.getUuid().replace(/-/g, '').substring(0, 12).toUpperCase(),
      action, lineupId, String(user || '').slice(0, 100), new Date(), String(details || '').slice(0, 500)
    ]);
    SpreadsheetApp.flush();
  } catch (err) {
    console.error('Audit logging failed: ' + messageOf_(err));
  }
}

function outputJson_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][\w.$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function constantTimeEquals_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function asIso_(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? '' : date.toISOString();
}

function messageOf_(err) {
  return String(err && err.message ? err.message : err);
}

/** Diagnostic: logs the exact spreadsheet URL and current record counts. */
function diagnoseDatabase() {
  const ss = getDatabase_();
  const lineup = getRequiredSheet_(ss, MMC_CONFIG.LINEUPS_TAB, MMC_LINEUP_HEADERS);
  const audit = getRequiredSheet_(ss, MMC_CONFIG.AUDIT_TAB, MMC_AUDIT_HEADERS);
  Logger.log('DATABASE NAME: ' + ss.getName());
  Logger.log('DATABASE URL: ' + ss.getUrl());
  Logger.log('SPREADSHEET ID: ' + ss.getId());
  Logger.log('LINEUPS LAST ROW: ' + lineup.getLastRow());
  Logger.log('AUDIT LOG LAST ROW: ' + audit.getLastRow());
  if (lineup.getLastRow() > 1) Logger.log('LAST LINEUP: ' + JSON.stringify(lineup.getRange(lineup.getLastRow(), 1, 1, 10).getDisplayValues()[0]));
  if (audit.getLastRow() > 1) Logger.log('LAST AUDIT: ' + JSON.stringify(audit.getRange(audit.getLastRow(), 1, 1, 6).getDisplayValues()[0]));
}

/** Safe editor-only test: writes one clearly labelled sample record. Run once only. */
function testDatabaseUpload() {
  const password = PropertiesService.getScriptProperties().getProperty(MMC_CONFIG.PASSWORD_PROPERTY);
  if (!password) throw new Error('Set MMC_LINEUPS_UPLOAD_PASSWORD in Script Properties first.');
  const sample = normalizeLineup_({
    title: 'DATABASE TEST LINEUP',
    occasion: 'Sunday Mass',
    season: 'Ordinary Time',
    description: 'Test upload only. Safe to delete after verification.',
    uploader: 'HIJP-MMC Admin',
    songs: [
      { slot: 'Entrance', songId: 'TEST-001', title: 'TEST ENTRANCE SONG', category: 'Service', variant: '' },
      { slot: 'Communion', songId: 'TEST-002', title: 'TEST COMMUNION SONG', category: 'Service', variant: '' }
    ]
  });
  const id = saveLineup_(sample);
  Logger.log(JSON.stringify({ ok: true, lineup_id: id, message: 'Lineup uploaded successfully.' }));
  diagnoseDatabase();
}

/** Editor-only helper: lists public records in the execution log. */
function testPublicListing() {
  Logger.log(JSON.stringify(listLineups_({ limit: '20' })));
}

/** Editor-only helper: retrieves a record by ID in the execution log. */
function testGetLineup() {
  const id = 'REPLACE_WITH_LINEUP_ID';
  if (id.indexOf('REPLACE_') === 0) throw new Error('Replace the placeholder with an actual MMC lineup ID first.');
  Logger.log(JSON.stringify(getLineup_(id)));
}
