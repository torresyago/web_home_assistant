const db = require('../db');

function normalize(serial) {
  return String(serial || '').toUpperCase().replace(/[^0-9A-F]/g, '');
}

// Lista base opcional vía env (compatibilidad con despliegues existentes).
// No se puede añadir/quitar desde la app, pero sí ponerle una etiqueta.
const ENV_SERIALS = (process.env.ALLOWED_CERT_SERIALS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(normalize);

function ensure(data) {
  if (!data.security) {
    data.security = { events: [], quarantine: {}, totals: { valid: 0, failed: 0 } };
  }
  if (!data.security.certSerials) data.security.certSerials = [];
  if (!data.security.certLabels) data.security.certLabels = {};
  return data;
}

function cleanLabel(label) {
  return label ? String(label).trim().slice(0, 100) : '';
}

// Lista combinada (env + app) para autenticar peticiones.
function allowed() {
  const data = ensure(db.read());
  const appSerials = data.security.certSerials.map((c) => c.serial);
  return [...new Set([...ENV_SERIALS, ...appSerials])];
}

// Lista para mostrar en el panel: entradas de .env (source "env", sin poder
// borrarse) + entradas gestionadas desde la app (source "app").
function list() {
  const data = ensure(db.read());
  const appSerials = new Set(data.security.certSerials.map((c) => c.serial));
  const envEntries = ENV_SERIALS.filter((s) => !appSerials.has(s)).map((s) => ({
    serial: s,
    label: data.security.certLabels[s] || '',
    addedAt: null,
    source: 'env',
  }));
  const appEntries = data.security.certSerials.map((c) => ({ ...c, source: 'app' }));
  return [...envEntries, ...appEntries];
}

function add(serial, label) {
  const norm = normalize(serial);
  if (!norm) throw new Error('Serial inválido');
  if (ENV_SERIALS.includes(norm)) {
    throw new Error('Ese serial ya está definido en ALLOWED_CERT_SERIALS (.env)');
  }
  const data = ensure(db.read());
  if (data.security.certSerials.some((c) => c.serial === norm)) {
    throw new Error('Ese serial ya está en la lista');
  }
  const entry = { serial: norm, label: cleanLabel(label), addedAt: Date.now() };
  data.security.certSerials.push(entry);
  db.write(data);
  return { ...entry, source: 'app' };
}

function remove(serial) {
  const norm = normalize(serial);
  if (ENV_SERIALS.includes(norm)) {
    throw new Error('No se puede eliminar desde la app: está definido en ALLOWED_CERT_SERIALS (.env)');
  }
  const data = ensure(db.read());
  data.security.certSerials = data.security.certSerials.filter((c) => c.serial !== norm);
  db.write(data);
}

function setLabel(serial, label) {
  const norm = normalize(serial);
  const data = ensure(db.read());
  const trimmed = cleanLabel(label);
  const appEntry = data.security.certSerials.find((c) => c.serial === norm);
  if (appEntry) {
    appEntry.label = trimmed;
  } else if (ENV_SERIALS.includes(norm)) {
    data.security.certLabels[norm] = trimmed;
  } else {
    throw new Error('Certificado no encontrado');
  }
  db.write(data);
}

module.exports = { list, allowed, add, remove, setLabel, normalize };
