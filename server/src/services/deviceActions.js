const db = require('../db');
const ha = require('./haClient');

function getDomain(entityId) {
  return entityId.split('.')[0];
}

function getDeviceAndInstance(deviceId) {
  const data = db.read();
  const device = data.devices.find((d) => d.id === deviceId);
  if (!device) return {};
  const instance = data.instances.find((i) => i.id === device.instanceId);
  return { device, instance };
}

async function performAction(device, instance, action, params = {}) {
  const domain = getDomain(device.entityId);
  const entity_id = device.entityId;

  switch (action) {
    case 'turn_on':
      return ha.callService(instance, domain, 'turn_on', { entity_id });
    case 'turn_off':
      return ha.callService(instance, domain, 'turn_off', { entity_id });
    case 'toggle':
      return ha.callService(instance, domain, 'toggle', { entity_id });
    case 'pulse':
      await ha.callService(instance, domain, 'turn_on', { entity_id });
      setTimeout(() => {
        ha.callService(instance, domain, 'turn_off', { entity_id }).catch(() => {});
      }, device.pulseDuration || 1000);
      return;
    case 'open_cover':
      return ha.callService(instance, 'cover', 'open_cover', { entity_id });
    case 'close_cover':
      return ha.callService(instance, 'cover', 'close_cover', { entity_id });
    case 'stop_cover':
      return ha.callService(instance, 'cover', 'stop_cover', { entity_id });
    case 'set_cover_position':
      return ha.callService(instance, 'cover', 'set_cover_position', {
        entity_id,
        position: params.position,
      });
    case 'set_temperature':
      return ha.callService(instance, 'climate', 'set_temperature', {
        entity_id,
        temperature: params.temperature,
      });
    case 'set_hvac_mode':
      return ha.callService(instance, 'climate', 'set_hvac_mode', {
        entity_id,
        hvac_mode: params.hvac_mode,
      });
    case 'press':
      if (domain === 'script') {
        return ha.callService(instance, 'script', 'turn_on', { entity_id });
      }
      if (domain === 'input_button') {
        return ha.callService(instance, 'input_button', 'press', { entity_id });
      }
      return ha.callService(instance, 'button', 'press', { entity_id });
    case 'trigger_automation':
      if (domain === 'script') {
        return ha.callService(instance, 'script', 'turn_on', { entity_id });
      }
      return ha.callService(instance, 'automation', 'trigger', { entity_id, skip_condition: true });
    default: {
      const err = new Error(`Acción desconocida: ${action}`);
      err.status = 400;
      throw err;
    }
  }
}

module.exports = { performAction, getDeviceAndInstance };
