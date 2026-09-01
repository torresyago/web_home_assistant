const express = require('express');
const { authEnabled, passwordLoginAllowed, certAuthenticatedAndLog, certInfo } = require('../middleware/auth');
const { checkQuarantine, registerFailure, registerSuccess, getClientIp } = require('../middleware/quarantine');
const users = require('../services/users');

const router = express.Router();

router.get('/status', (req, res) => {
  const ip = getClientIp(req);
  if (certAuthenticatedAndLog(req)) {
    if (req.session) {
      req.session.authenticated = true;
      req.session.role = 'admin';
    }
    return res.json({
      authEnabled: authEnabled(),
      passwordLoginAllowed: passwordLoginAllowed(),
      authenticated: true,
      cert: certInfo(req),
      ip,
      method: 'cert',
      role: 'admin',
      username: null,
    });
  }
  const noCredentialsConfigured = !authEnabled();
  const canUsePassword = passwordLoginAllowed();
  const sessionAuthenticated = canUsePassword && Boolean(req.session && req.session.authenticated);
  res.json({
    authEnabled: authEnabled(),
    passwordLoginAllowed: canUsePassword,
    authenticated: noCredentialsConfigured ? true : sessionAuthenticated,
    cert: null,
    ip,
    method: sessionAuthenticated ? 'password' : noCredentialsConfigured ? 'none' : null,
    role: noCredentialsConfigured ? 'admin' : sessionAuthenticated ? req.session.role || 'user' : null,
    username: sessionAuthenticated ? req.session.username || null : null,
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
  const userLabel = username ? String(username).slice(0, 60) : null;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.role = 'admin';
    req.session.username = username;
    registerSuccess(ip, 'login', 'password', userLabel);
    return res.json({ ok: true });
  }

  const user = users.verify(username, password);
  if (user) {
    req.session.authenticated = true;
    req.session.role = user.role;
    req.session.username = user.username;
    registerSuccess(ip, 'login', 'password', userLabel);
    return res.json({ ok: true });
  }

  registerFailure(ip, 'login', 'password', userLabel);
  return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
