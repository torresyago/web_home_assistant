function parseBool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
}

// Se controla solo a nivel de contenedor (variables de entorno); la app únicamente lo muestra.
const ALLOW_PASSWORD = parseBool(process.env.AUTH_ALLOW_PASSWORD, true);
const ALLOW_CERT = parseBool(process.env.AUTH_ALLOW_CERT, true);

function get() {
  return { allowPassword: ALLOW_PASSWORD, allowCert: ALLOW_CERT };
}

module.exports = { get };
