const certSerials = require('../services/certSerials');

const CERT_SERIAL_HEADER = (process.env.CERT_SERIAL_HEADER || 'x-ssl-client-serial').toLowerCase();
const CERT_VERIFY_HEADER = (process.env.CERT_VERIFY_HEADER || 'x-ssl-client-verify').toLowerCase();

function normalizeSerial(serial) {
  return String(serial).toUpperCase().replace(/[^0-9A-F]/g, '');
}

// Lista base opcional vía env (compatibilidad con despliegues existentes); la
// lista gestionable desde la propia app (panel de Seguridad) se añade a esta.
const ENV_ALLOWED_CERT_SERIALS = (process.env.ALLOWED_CERT_SERIALS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(normalizeSerial);

function allowedCertSerials() {
  const fromDb = certSerials.list().map((c) => c.serial);
  return [...new Set([...ENV_ALLOWED_CERT_SERIALS, ...fromDb])];
}

function authEnabled() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}

// nginx ya filtra qué números de serie llegan a la app (mTLS + su propia lista blanca);
// aquí además comprobamos el serial contra la lista permitida (env + gestionada en la app) como segunda capa.
function certAuthenticated(req) {
  const serial = req.headers[CERT_SERIAL_HEADER];
  if (!serial) return false;
  const verify = req.headers[CERT_VERIFY_HEADER];
  if (verify && verify.toUpperCase() !== 'SUCCESS') return false;
  const allowed = allowedCertSerials();
  if (allowed.length > 0 && !allowed.includes(normalizeSerial(serial))) {
    return false;
  }
  return true;
}

function requireAuth(req, res, next) {
  if (certAuthenticated(req)) {
    if (req.session) req.session.authenticated = true;
    return next();
  }
  if (!authEnabled()) return next();
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'No autenticado' });
}

module.exports = { requireAuth, authEnabled, certAuthenticated };
