const express = require('express');
const { performAction, getDeviceAndInstance } = require('../services/deviceActions');
const { requireApiKey } = require('../middleware/quarantine');

const router = express.Router();

router.post('/:deviceId', requireApiKey('WEBHOOK_API_KEY'), async (req, res) => {
  const { device, instance } = getDeviceAndInstance(req.params.deviceId);
  if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
  if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });

  const { action, params = {} } = req.body || {};

  try {
    await performAction(device, instance, action, params);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status === 400 ? 400 : 502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
