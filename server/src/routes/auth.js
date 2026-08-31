const express = require('express');
const { authEnabled, certAuthenticated } = require('../middleware/auth');
const { checkQuarantine, registerFailure, registerSuccess, getClientIp } = require('../middleware/quarantine');

const router = express.Router();

router.get('/status', (req, res) => {
  if (certAuthenticated(req)) {
    if (req.session) req.session.authenticated = true;
    return res.json({ authEnabled: authEnabled(), authenticated: true });
  }
  res.json({
    authEnabled: authEnabled(),
    authenticated: authEnabled() ? Boolean(req.session && req.session.authenticated) : true,
  });
});

router.post('/login', checkQuarantine, (req, res) => {
  const { username, password } = req.body || {};
  if (!authEnabled()) {
    return res.json({ ok: true });
  }
  const ip = getClientIp(req);
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    registerSuccess(ip, 'login');
    return res.json({ ok: true });
  }
  registerFailure(ip, 'login');
  return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
