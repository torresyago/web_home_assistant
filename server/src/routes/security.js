const express = require('express');
const security = require('../services/security');
const { release } = require('../middleware/quarantine');

const MAX_LOG_LIMIT = 2000;

const router = express.Router();

router.get('/stats', (req, res) => {
  res.json(security.getStats());
});

router.get('/log', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, MAX_LOG_LIMIT);
  res.json(security.getLog(limit));
});

router.post('/reset', (req, res) => {
  security.resetStats();
  res.json({ ok: true });
});

router.get('/quarantine', (req, res) => {
  res.json(security.listQuarantine());
});

router.post('/quarantine', (req, res) => {
  const { ip, minutes } = req.body || {};
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ error: 'IP requerida' });
  }
  const mins = Number(minutes) > 0 ? Number(minutes) : 15;
  security.quarantineIp(ip.trim(), mins, 'manual', true);
  res.json({ ok: true });
});

router.delete('/quarantine/:ip', (req, res) => {
  release(req.params.ip);
  res.json({ ok: true });
});

module.exports = router;
