const db = require('../db');

const MAX_EVENTS = 2000;

function ensureSecurity(data) {
  if (!data.security) {
    data.security = { events: [], quarantine: {}, totals: { valid: 0, failed: 0 } };
  }
  if (!data.security.quarantine) data.security.quarantine = {};
  if (!data.security.totals) data.security.totals = { valid: 0, failed: 0 };
  if (!data.security.events) data.security.events = [];
  return data;
}

function recordAttempt({ ip, type, result, reason, method }) {
  const data = ensureSecurity(db.read());
  const event = { ts: Date.now(), ip, type, result, reason: reason || null, method: method || null };
  data.security.events.push(event);
  if (data.security.events.length > MAX_EVENTS) {
    data.security.events.splice(0, data.security.events.length - MAX_EVENTS);
  }
  if (result === 'success') data.security.totals.valid += 1;
  else data.security.totals.failed += 1;
  db.write(data);
  return event;
}

function windowCounts(events, sinceMs) {
  const cutoff = Date.now() - sinceMs;
  let valid = 0;
  let failed = 0;
  for (const e of events) {
    if (e.ts >= cutoff) {
      if (e.result === 'success') valid += 1;
      else failed += 1;
    }
  }
  return { valid, failed };
}

function getStats() {
  const data = ensureSecurity(db.read());
  const { events, totals } = data.security;
  return {
    last15m: windowCounts(events, 15 * 60 * 1000),
    lastHour: windowCounts(events, 60 * 60 * 1000),
    allTime: { valid: totals.valid, failed: totals.failed },
  };
}

function getLog(limit = 200) {
  const data = ensureSecurity(db.read());
  return data.security.events.slice(-limit).reverse();
}

function resetStats() {
  const data = ensureSecurity(db.read());
  data.security.events = [];
  data.security.totals = { valid: 0, failed: 0 };
  db.write(data);
}

function listQuarantine() {
  const data = ensureSecurity(db.read());
  const now = Date.now();
  return Object.entries(data.security.quarantine)
    .map(([ip, entry]) => ({ ip, ...entry }))
    .filter((entry) => entry.until > now)
    .sort((a, b) => b.until - a.until);
}

function quarantineIp(ip, minutes, reason, manual = false) {
  const data = ensureSecurity(db.read());
  data.security.quarantine[ip] = {
    until: Date.now() + minutes * 60 * 1000,
    reason: reason || 'manual',
    manual,
  };
  db.write(data);
}

function releaseIp(ip) {
  const data = ensureSecurity(db.read());
  delete data.security.quarantine[ip];
  db.write(data);
}

function isQuarantined(ip) {
  const data = ensureSecurity(db.read());
  const entry = data.security.quarantine[ip];
  return Boolean(entry && entry.until > Date.now());
}

module.exports = {
  recordAttempt,
  getStats,
  getLog,
  resetStats,
  listQuarantine,
  quarantineIp,
  releaseIp,
  isQuarantined,
};
