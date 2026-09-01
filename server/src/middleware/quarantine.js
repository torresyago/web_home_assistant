const crypto = require('crypto');
const security = require('../services/security');

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const QUARANTINE_MS = 15 * 60 * 1000;

const attempts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (entry.blockedUntil < now && now - entry.firstAt > WINDOW_MS) {
      attempts.delete(ip);
    }
  }
}, 60 * 1000).unref();

function getClientIp(req) {
  return req.headers['x-real-ip'] || req.ip || req.socket.remoteAddress || 'unknown';
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function isQuarantined(ip) {
  const entry = attempts.get(ip);
  if (entry && entry.blockedUntil > Date.now()) return true;
  return security.isQuarantined(ip);
}

function registerFailure(ip, type, method) {
  const now = Date.now();
  let entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    entry = { count: 0, firstAt: now, blockedUntil: 0 };
  }
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + QUARANTINE_MS;
    security.quarantineIp(ip, QUARANTINE_MS / 60000, `auto: ${MAX_ATTEMPTS} intentos fallidos (${type})`, false);
  }
  attempts.set(ip, entry);
  security.recordAttempt({ ip, type, result: 'failure', method });
}

function registerSuccess(ip, type, method) {
  attempts.delete(ip);
  security.recordAttempt({ ip, type, result: 'success', method });
}

function release(ip) {
  attempts.delete(ip);
  security.releaseIp(ip);
}

function checkQuarantine(req, res, next) {
  const ip = getClientIp(req);
  if (isQuarantined(ip)) {
    return res.status(429).json({ error: 'Demasiados intentos fallidos, IP en cuarentena temporal' });
  }
  next();
}

function requireApiKey(expectedKeyEnv) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    if (isQuarantined(ip)) {
      return res.status(429).json({ error: 'Demasiados intentos fallidos, IP en cuarentena temporal' });
    }
    const expected = process.env[expectedKeyEnv];
    const provided = req.headers['x-api-key'];
    if (!expected || !provided || !timingSafeEqual(provided, expected)) {
      registerFailure(ip, 'webhook');
      return res.status(401).json({ error: 'API key inválida' });
    }
    registerSuccess(ip, 'webhook');
    next();
  };
}

module.exports = {
  requireApiKey,
  checkQuarantine,
  registerFailure,
  registerSuccess,
  release,
  getClientIp,
};
