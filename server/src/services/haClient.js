const { Agent } = require('undici');

const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

function normalizeUrl(url) {
  return url.replace(/\/+$/, '');
}

function buildOptions(instance, extra = {}) {
  const headers = {
    Authorization: `Bearer ${instance.token}`,
    'Content-Type': 'application/json',
    ...(extra.headers || {}),
  };
  const options = { ...extra, headers };
  if (instance.insecure) {
    options.dispatcher = insecureAgent;
  }
  return options;
}

async function request(instance, pathname, options = {}) {
  const url = `${normalizeUrl(instance.url)}${pathname}`;
  const res = await fetch(url, buildOptions(instance, options));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HA respondió ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

async function testConnection(instance) {
  return request(instance, '/api/');
}

async function getStates(instance) {
  return request(instance, '/api/states');
}

async function getState(instance, entityId) {
  return request(instance, `/api/states/${encodeURIComponent(entityId)}`);
}

async function callService(instance, domain, service, data = {}) {
  return request(instance, `/api/services/${domain}/${service}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

module.exports = { testConnection, getStates, getState, callService };
