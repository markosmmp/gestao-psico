function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID não configurado nas propriedades do script.');
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('Aba não encontrada: ' + name);
  return sheet;
}

function rowsToObjects_(sheetName) {
  const values = getSheet_(sheetName).getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(row => row.some(Boolean)).map(row => headers.reduce((object, key, index) => {
    object[key] = row[index];
    return object;
  }, {}));
}

function findById_(sheetName, idColumn, id) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const index = values[0].indexOf(idColumn);
  if (index < 0) throw new Error('Coluna de ID ausente: ' + idColumn);
  for (let row = 1; row < values.length; row++) {
    if (String(values[row][index]) === String(id)) return { sheet, row: row + 1, headers: values[0], values: values[row] };
  }
  return null;
}

function createRecord_(sheetName, record) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(header => record[header] !== undefined ? record[header] : ''));
  return record;
}

function updateRecord_(sheetName, idColumn, id, changes) {
  const found = findById_(sheetName, idColumn, id);
  if (!found) throw new Error('Registro não encontrado.');
  const next = found.headers.map((header, index) => changes[header] !== undefined ? changes[header] : found.values[index]);
  found.sheet.getRange(found.row, 1, 1, next.length).setValues([next]);
  return found.headers.reduce((object, header, index) => (object[header] = next[index], object), {});
}

function generateId_(sheetName, idColumn, prefix, digits) {
  const rows = rowsToObjects_(sheetName);
  const max = rows.reduce((highest, row) => {
    const match = String(row[idColumn] || '').match(/(\d+)$/);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  return prefix + '-' + String(max + 1).padStart(digits, '0');
}

function withScriptLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function now_() { return Utilities.formatDate(new Date(), getTimezone_(), "yyyy-MM-dd'T'HH:mm:ssXXX"); }
function getTimezone_() { return getConfig_().timezone || 'America/Sao_Paulo'; }
function asNumber_(value) { const number = Number(String(value).replace(',', '.')); if (!isFinite(number)) throw new Error('Valor numérico inválido.'); return Math.round(number * 100) / 100; }
function assertAllowed_(value, allowed, field) { if (allowed.indexOf(String(value)) < 0) throw new Error('Valor inválido para ' + field + '.'); }
function safeText_(value, max) { return String(value == null ? '' : value).trim().slice(0, max || 500); }
function assertAdministrativeNote_(value) { if (safeText_(value, 2000).length > 1000) throw new Error('Observação administrativa muito longa.'); }

function assertMoney_(value, field, allowZero) {
  const number = asNumber_(value);
  if (number < 0 || (!allowZero && number === 0)) throw new Error((field || 'Valor') + ' deve ser maior que zero.');
  return number;
}

function assertDate_(value, field, optional) {
  const text = safeText_(value, 10);
  if (!text && optional) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) throw new Error((field || 'Data') + ' inválida.');
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) throw new Error((field || 'Data') + ' inválida.');
  return text;
}

function assertTime_(value, field, optional) {
  const text = safeText_(value, 5);
  if (!text && optional) return '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new Error((field || 'Horário') + ' inválido.');
  return text;
}

function cents_(value) { return Math.round(Number(value || 0) * 100); }
function fromCents_(value) { return Math.round(value) / 100; }

function logAction_(action, entity, entityId, details) {
  getSheet_(SHEETS.LOG).appendRow([now_(), action, entity, entityId, JSON.stringify(details || {})]);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) { return json_({ success: true, data: data }); }
function fail_(error) { console.error(error); return json_({ success: false, error: error && error.message ? error.message : 'Erro interno.' }); }

function setupSpreadsheet() {
  const spreadsheet = getSpreadsheet_();
  spreadsheet.setSpreadsheetTimeZone(DEFAULT_CONFIG.timezone);
  Object.keys(COLUMNS).forEach(name => {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    const columns = COLUMNS[name];
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]).setFontWeight('bold').setBackground('#42573d').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  });
  const configSheet = getSheet_(SHEETS.CONFIG);
  if (configSheet.getLastRow() === 1) Object.keys(DEFAULT_CONFIG).forEach(key => configSheet.appendRow([key, DEFAULT_CONFIG[key]]));
  return 'Estrutura criada com sucesso.';
}
