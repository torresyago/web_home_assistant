const certSerials = require('../services/certSerials');
const authSettings = require('../services/authSettings');
const security = require('../services/security');
const { getClientIp } = require('./quarantine');

const CERT_SERIAL_HEADER = (process.env.CERT_SERIAL_HEADER || 'x-ssl-client-serial').toLowerCase();
const CERT_VERIFY_HEADER = (process.env.CERT_VERIFY_HEADER || 'x-ssl-client-verify').toLowerCase();

function authEnabled() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}

// Login por contraseña realmente utilizable ahora mismo: hacen falta
// credenciales configuradas Y que el interruptor de la app no lo tenga desactivado.
function passwordLoginAllowed() {
  return authEnabled() && authSettings.get().allowPassword;
}

// nginx ya filtra qué números de serie llegan a la app (mTLS + su propia lista blanca);
// aquí además comprobamos el serial contra la lista permitida (env + gestionada en la app) como segunda capa.
function certAuthenticated(req) {
  if (!authSettings.get().allowCert) return false;
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

// Igual que certAuthenticated, pero además registra en el log de accesos la
// primera vez que esta sesión concreta queda autenticada por certificado
// (evita spamear el log en cada petición mientras dura la sesión).
function certAuthenticatedAndLog(req) {
  const info = certInfo(req);
  if (info && req.session && !req.session.certLogged) {
    req.session.certLogged = true;
    security.recordAttempt({
      ip: getClientIp(req),
      type: 'login',
      result: 'success',
      method: 'cert',
      reason: info.label || info.serial,
    });
  }
  return Boolean(info);
}

function requireAuth(req, res, next) {
  if (certAuthenticatedAndLog(req)) {
    if (req.session) {
      req.session.authenticated = true;
      // Rol asignado a este certificado en el panel de Seguridad (admin por
      // defecto, para no cambiar el comportamiento de los certificados que
      // ya existían antes de poder asignarles rol).
      req.session.role = certSerials.roleOf(req.headers[CERT_SERIAL_HEADER]);
    }
    return next();
  }
  // Sin credenciales configuradas en absoluto (ni ADMIN_USER/PASSWORD): modo
  // legacy sin restricción, igual que siempre.
  if (!authEnabled()) return next();
  if (!passwordLoginAllowed()) return res.status(401).json({ error: 'No autenticado' });
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'No autenticado' });
}

// Restringe a usuarios con rol admin: el admin de arranque (ADMIN_USER/PASSWORD),
// un usuario creado desde la app con role "admin", o una sesión por certificado
// (ver arriba). En modo legacy (sin credenciales configuradas) no se aplica
// ninguna restricción, igual que requireAuth.
function requireAdmin(req, res, next) {
  if (!authEnabled()) return next();
  if (req.session && req.session.role === 'admin') return next();
  return res.status(403).json({ error: 'Requiere permisos de administrador' });
}

// Certificado (si lo hay) que está autenticando la petición actual, con su
// etiqueta si tiene una asignada. Para mostrar en la UI qué certificado está
// en uso en la sesión.
function certInfo(req) {
  if (!certAuthenticated(req)) return null;
  const serial = certSerials.normalize(req.headers[CERT_SERIAL_HEADER]);
  if (!serial) return null;
  const entry = certSerials.list().find((c) => c.serial === serial);
  return { serial, label: entry ? entry.label : '', role: certSerials.roleOf(serial) };
}

module.exports = {
  requireAuth,
  requireAdmin,
  authEnabled,
  passwordLoginAllowed,
  certAuthenticated,
  certAuthenticatedAndLog,
  certInfo,
};
