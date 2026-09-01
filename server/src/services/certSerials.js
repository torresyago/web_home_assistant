const db = require('../db');

function ensure(data) {
  if (!data.security) {
    data.security = { events: [], quarantine: {}, totals: { valid: 0, failed: 0 } };
  }
  if (!data.security.certSerials) data.security.certSerials = [];
  return data;
}

function normalize(serial) {
  return String(serial || '').toUpperCase().replace(/[^0-9A-F]/g, '');
}

function list() {
  const data = ensure(db.read());
  return data.security.certSerials;
}

function add(serial, label) {
  const norm = normalize(serial);
  if (!norm) throw new Error('Serial inválido');
  const data = ensure(db.read());
  if (data.security.certSerials.some((c) => c.serial === norm)) {
    throw new Error('Ese serial ya está en la lista');
  }
  const entry = { serial: norm, label: label ? String(label).trim().slice(0, 100) : '', addedAt: Date.now() };
  data.security.certSerials.push(entry);
  db.write(data);
  return entry;
}

function remove(serial) {
  const norm = normalize(serial);
  const data = ensure(db.read());
  data.security.certSerials = data.security.certSerials.filter((c) => c.serial !== norm);
  db.write(data);
}

module.exports = { list, add, remove, normalize };
