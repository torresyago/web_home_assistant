const certSerials = require('../services/certSerials');

const CERT_SERIAL_HEADER = (process.env.CERT_SERIAL_HEADER || 'x-ssl-client-serial').toLowerCase();
const CERT_VERIFY_HEADER = (process.env.CERT_VERIFY_HEADER || 'x-ssl-client-verify').toLowerCase();

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
  // Si no hay ningún serial registrado (ni en .env ni en la app), no se aplica
  // esta segunda capa (modo legacy: solo se confía en el proxy). En cuanto
  // existe al menos un serial conocido, solo pasan los que estén activos —
  // desactivarlos todos debe bloquear, no abrir la puerta a cualquier cert.
  if (certSerials.known().length === 0) return true;
  const allowed = certSerials.allowed();
  return allowed.includes(certSerials.normalize(serial));
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

// Certificado (si lo hay) que está autenticando la petición actual, con su
// etiqueta si tiene una asignada. Para mostrar en la UI qué certificado está
// en uso en la sesión.
function certInfo(req) {
  if (!certAuthenticated(req)) return null;
  const serial = certSerials.normalize(req.headers[CERT_SERIAL_HEADER]);
  if (!serial) return null;
  const entry = certSerials.list().find((c) => c.serial === serial);
  return { serial, label: entry ? entry.label : '' };
}

module.exports = { requireAuth, authEnabled, certAuthenticated, certInfo };
