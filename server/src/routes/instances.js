const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const ha = require('../services/haClient');

const router = express.Router();

router.get('/', (req, res) => {
  const { instances } = db.read();
  res.json(instances);
});

router.post('/', async (req, res) => {
  const { name, url, token, insecure } = req.body || {};
  if (!name || !url || !token) {
    return res.status(400).json({ error: 'name, url y token son obligatorios' });
  }
  const data = db.read();
  const instance = {
    id: uuidv4(),
    name: name.trim(),
    url: url.trim(),
    token: token.trim(),
    insecure: Boolean(insecure),
    createdAt: new Date().toISOString(),
  };
  data.instances.push(instance);
  db.write(data);
  res.status(201).json(instance);
});

router.put('/:id', async (req, res) => {
  const data = db.read();
  const instance = data.instances.find((i) => i.id === req.params.id);
  if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });
  const { name, url, token, insecure } = req.body || {};
  if (name !== undefined) instance.name = name.trim();
  if (url !== undefined) instance.url = url.trim();
  if (token !== undefined) instance.token = token.trim();
  if (insecure !== undefined) instance.insecure = Boolean(insecure);
  db.write(data);
  res.json(instance);
});

router.delete('/:id', (req, res) => {
  const data = db.read();
  const exists = data.instances.some((i) => i.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Instancia no encontrada' });
  data.instances = data.instances.filter((i) => i.id !== req.params.id);
  data.devices = data.devices.filter((d) => d.instanceId !== req.params.id);
  db.write(data);
  res.json({ ok: true });
});

router.post('/:id/test', async (req, res) => {
  const { instances } = db.read();
  const instance = instances.find((i) => i.id === req.params.id);
  if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });
  try {
    const result = await ha.testConnection(instance);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

router.get('/:id/entities', async (req, res) => {
  const { instances } = db.read();
  const instance = instances.find((i) => i.id === req.params.id);
  if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });
  try {
    const states = await ha.getStates(instance);
    const entities = states.map((s) => ({
      entityId: s.entity_id,
      domain: s.entity_id.split('.')[0],
      friendlyName: (s.attributes && s.attributes.friendly_name) || s.entity_id,
      state: s.state,
      unit: s.attributes && s.attributes.unit_of_measurement,
    }));
    entities.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
    res.json(entities);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
