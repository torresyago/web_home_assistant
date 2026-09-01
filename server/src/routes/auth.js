const express = require('express');
const { authEnabled, passwordLoginAllowed, certAuthenticated, certInfo } = require('../middleware/auth');
const { checkQuarantine, registerFailure, registerSuccess, getClientIp } = require('../middleware/quarantine');

const router = express.Router();

router.get('/status', (req, res) => {
  if (certAuthenticated(req)) {
    if (req.session) req.session.authenticated = true;
    return res.json({
      authEnabled: authEnabled(),
      passwordLoginAllowed: passwordLoginAllowed(),
      authenticated: true,
      cert: certInfo(req),
    });
  }
  const noCredentialsConfigured = !authEnabled();
  const canUsePassword = passwordLoginAllowed();
  res.json({
    authEnabled: authEnabled(),
    passwordLoginAllowed: canUsePassword,
    authenticated: noCredentialsConfigured ? true : canUsePassword && Boolean(req.session && req.session.authenticated),
    cert: null,
  });
});

router.post('/login', checkQuarantine, (req, res) => {
  const { username, password } = req.body || {};
  if (!authEnabled()) {
    return res.json({ ok: true });
  }
  if (!passwordLoginAllowed()) {
    return res.status(403).json({ error: 'El acceso por contraseña está desactivado' });
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
