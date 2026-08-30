const express = require('express');
const { authEnabled, certAuthenticated } = require('../middleware/auth');

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

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authEnabled()) {
    return res.json({ ok: true });
  }
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
