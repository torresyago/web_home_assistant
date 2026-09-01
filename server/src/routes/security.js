const express = require('express');
const security = require('../services/security');
const certSerials = require('../services/certSerials');
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

router.get('/cert-serials', (req, res) => {
  res.json(certSerials.list());
});

router.post('/cert-serials', (req, res) => {
  const { serial, label } = req.body || {};
  if (!serial || typeof serial !== 'string') {
    return res.status(400).json({ error: 'Serial requerido' });
  }
  try {
    const entry = certSerials.add(serial, label);
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/cert-serials/:serial', (req, res) => {
  const { label } = req.body || {};
  try {
    certSerials.setLabel(req.params.serial, label);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/cert-serials/:serial', (req, res) => {
  try {
    certSerials.remove(req.params.serial);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
