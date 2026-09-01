// Última vez que cada dispositivo respondió con un estado válido (no
// "unavailable" ni error). Solo en memoria: se pierde al reiniciar el
// contenedor, es información de uptime, no un dato que deba persistir.
const lastSeen = new Map();

function markSeen(deviceId) {
  lastSeen.set(deviceId, Date.now());
}

function getLastSeen(deviceId) {
  return lastSeen.get(deviceId) || null;
}

module.exports = { markSeen, getLastSeen };
