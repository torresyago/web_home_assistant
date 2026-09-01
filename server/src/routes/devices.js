const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const ha = require('../services/haClient');
const lastSeen = require('../services/deviceLastSeen');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const VALID_TYPES = ['switch', 'thermostat', 'blind', 'garage_door', 'sensor', 'pulse', 'button', 'automation'];

router.get('/', (req, res) => {
  const { devices } = db.read();
  res.json(devices);
});

router.post('/', requireAdmin, (req, res) => {
  const { instanceId, name, entityId, deviceType, pulseDuration } = req.body || {};
  if (!instanceId || !name || !entityId || !deviceType) {
    return res.status(400).json({ error: 'instanceId, name, entityId y deviceType son obligatorios' });
  }
  if (!VALID_TYPES.includes(deviceType)) {
    return res.status(400).json({ error: `deviceType inválido. Debe ser uno de: ${VALID_TYPES.join(', ')}` });
  }
  const data = db.read();
  if (!data.instances.some((i) => i.id === instanceId)) {
    return res.status(404).json({ error: 'Instancia no encontrada' });
  }
  const device = {
    id: uuidv4(),
    instanceId,
    name,
    entityId,
    deviceType,
    pulseDuration: pulseDuration || 1000,
    createdAt: new Date().toISOString(),
  };
  data.devices.push(device);
  db.write(data);
  res.status(201).json(device);
});

router.put('/:id', requireAdmin, (req, res) => {
  const data = db.read();
  const device = data.devices.find((d) => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
  const { name, entityId, deviceType, pulseDuration } = req.body || {};
  if (name !== undefined) device.name = name;
  if (entityId !== undefined) device.entityId = entityId;
  if (deviceType !== undefined) {
    if (!VALID_TYPES.includes(deviceType)) {
      return res.status(400).json({ error: `deviceType inválido. Debe ser uno de: ${VALID_TYPES.join(', ')}` });
    }
    device.deviceType = deviceType;
  }
  if (pulseDuration !== undefined) device.pulseDuration = pulseDuration;
  db.write(data);
  res.json(device);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const data = db.read();
  const exists = data.devices.some((d) => d.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Dispositivo no encontrado' });
  data.devices = data.devices.filter((d) => d.id !== req.params.id);
  db.write(data);
  res.json({ ok: true });
});

router.get('/states/all', async (req, res) => {
  const { devices, instances } = db.read();
  const byInstance = new Map();
  for (const device of devices) {
    if (!byInstance.has(device.instanceId)) byInstance.set(device.instanceId, []);
    byInstance.get(device.instanceId).push(device);
  }

  const result = {};
  await Promise.all(
    Array.from(byInstance.entries()).map(async ([instanceId, instanceDevices]) => {
      const instance = instances.find((i) => i.id === instanceId);
      if (!instance) {
        for (const d of instanceDevices) result[d.id] = { error: 'Instancia no encontrada' };
        return;
      }
      try {
        const states = await ha.getStates(instance);
        const stateMap = new Map(states.map((s) => [s.entity_id, s]));
        for (const d of instanceDevices) {
          const s = stateMap.get(d.entityId);
          if (s && s.state !== 'unavailable') lastSeen.markSeen(d.id);
          result[d.id] = s
            ? { state: s.state, attributes: s.attributes, lastSeenAt: lastSeen.getLastSeen(d.id) }
            : { error: 'Entidad no encontrada', lastSeenAt: lastSeen.getLastSeen(d.id) };
        }
      } catch (err) {
        for (const d of instanceDevices) result[d.id] = { error: err.message, lastSeenAt: lastSeen.getLastSeen(d.id) };
      }
    })
  );

  res.json(result);
});

module.exports = router;
