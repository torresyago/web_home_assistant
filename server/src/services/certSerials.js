const db = require('../db');

function normalize(serial) {
  return String(serial || '').toUpperCase().replace(/[^0-9A-F]/g, '');
}

function normalizeRole(role) {
  return role === 'user' ? 'user' : 'admin';
}

// Lista base opcional vía env (compatibilidad con despliegues existentes).
// No se puede añadir/quitar desde la app, pero sí etiquetar, activar/desactivar
// y asignarle rol.
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
  // overrides sobre los seriales de .env: { [serial]: { label, enabled, role } }
  if (!data.security.certOverrides) data.security.certOverrides = {};
  return data;
}

function cleanLabel(label) {
  return label ? String(label).trim().slice(0, 100) : '';
}

// Lista combinada (env + app) de seriales activos, para autenticar peticiones.
function allowed() {
  const data = ensure(db.read());
  const envAllowed = ENV_SERIALS.filter((s) => data.security.certOverrides[s]?.enabled !== false);
  const appAllowed = data.security.certSerials.filter((c) => c.enabled !== false).map((c) => c.serial);
  return [...new Set([...envAllowed, ...appAllowed])];
}

// Todos los seriales conocidos (env + app), estén activos o no. Se usa para
// distinguir "no hay ninguna lista configurada" (sin restricción, modo legacy)
// de "hay seriales pero todos desactivados" (debe bloquear, no abrir la puerta).
function known() {
  const data = ensure(db.read());
  return [...new Set([...ENV_SERIALS, ...data.security.certSerials.map((c) => c.serial)])];
}

// Rol efectivo de un serial ya autenticado (admin por defecto, para no
// cambiar el comportamiento de los certificados existentes al añadir esto).
function roleOf(serial) {
  const norm = normalize(serial);
  const data = ensure(db.read());
  const appEntry = data.security.certSerials.find((c) => c.serial === norm);
  if (appEntry) return normalizeRole(appEntry.role);
  const override = data.security.certOverrides[norm];
  if (override) return normalizeRole(override.role);
  return 'admin';
}

// Lista para mostrar en el panel: entradas de .env (source "env", no se pueden
// borrar) + entradas gestionadas desde la app (source "app"). Ambas admiten
// etiqueta, activar/desactivar y rol.
function list() {
  const data = ensure(db.read());
  const appSerials = new Set(data.security.certSerials.map((c) => c.serial));
  const envEntries = ENV_SERIALS.filter((s) => !appSerials.has(s)).map((s) => {
    const override = data.security.certOverrides[s] || {};
    return {
      serial: s,
      label: override.label || '',
      addedAt: null,
      source: 'env',
      enabled: override.enabled !== false,
      role: normalizeRole(override.role),
    };
  });
  const appEntries = data.security.certSerials.map((c) => ({
    ...c,
    source: 'app',
    enabled: c.enabled !== false,
    role: normalizeRole(c.role),
  }));
  return [...envEntries, ...appEntries];
}

function add(serial, label, role) {
  const norm = normalize(serial);
  if (!norm) throw new Error('Serial inválido');
  if (ENV_SERIALS.includes(norm)) {
    throw new Error('Ese serial ya está definido en ALLOWED_CERT_SERIALS (.env)');
  }
  const data = ensure(db.read());
  if (data.security.certSerials.some((c) => c.serial === norm)) {
    throw new Error('Ese serial ya está en la lista');
  }
  const entry = { serial: norm, label: cleanLabel(label), addedAt: Date.now(), enabled: true, role: normalizeRole(role) };
  data.security.certSerials.push(entry);
  db.write(data);
  return { ...entry, source: 'app' };
}

function remove(serial) {
  const norm = normalize(serial);
  if (ENV_SERIALS.includes(norm)) {
    throw new Error('No se puede eliminar desde la app: está definido en ALLOWED_CERT_SERIALS (.env). Puedes desactivarlo en su lugar.');
  }
  const data = ensure(db.read());
  data.security.certSerials = data.security.certSerials.filter((c) => c.serial !== norm);
  db.write(data);
}

// Aplica cambios parciales (label, enabled y/o role) a un serial, sea de .env o de la app.
function update(serial, { label, enabled, role } = {}) {
  const norm = normalize(serial);
  const data = ensure(db.read());
  const appEntry = data.security.certSerials.find((c) => c.serial === norm);
  if (appEntry) {
    if (label !== undefined) appEntry.label = cleanLabel(label);
    if (enabled !== undefined) appEntry.enabled = Boolean(enabled);
    if (role !== undefined) appEntry.role = normalizeRole(role);
  } else if (ENV_SERIALS.includes(norm)) {
    const current = data.security.certOverrides[norm] || {};
    if (label !== undefined) current.label = cleanLabel(label);
    if (enabled !== undefined) current.enabled = Boolean(enabled);
    if (role !== undefined) current.role = normalizeRole(role);
    data.security.certOverrides[norm] = current;
  } else {
    throw new Error('Certificado no encontrado');
  }
  db.write(data);
}

module.exports = { list, allowed, known, roleOf, add, remove, update, normalize };
