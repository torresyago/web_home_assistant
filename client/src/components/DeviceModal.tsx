import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';
import Modal from './Modal';
import { api } from '../api';
import type { Device, DeviceType, EntityOption, Instance } from '../types';
import { DEVICE_TYPE_LABELS } from '../types';

const DEVICE_TYPES: DeviceType[] = ['switch', 'thermostat', 'blind', 'garage_door', 'sensor', 'pulse', 'button'];

export default function DeviceModal({
  device,
  instances,
  defaultInstanceId,
  onClose,
  onSaved,
}: {
  device?: Device;
  instances: Instance[];
  defaultInstanceId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [instanceId, setInstanceId] = useState(device?.instanceId || defaultInstanceId || instances[0]?.id || '');
  const [name, setName] = useState(device?.name || '');
  const [entityId, setEntityId] = useState(device?.entityId || '');
  const [deviceType, setDeviceType] = useState<DeviceType>(device?.deviceType || 'switch');
  const [pulseDuration, setPulseDuration] = useState(device?.pulseDuration || 1000);

  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [search, setSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instanceId) return;
    setLoadingEntities(true);
    api
      .listEntities(instanceId)
      .then((list) => {
        setEntities(list);
        if (entityId && !search) {
          const match = list.find((e) => e.entityId === entityId);
          if (match) setSearch(match.friendlyName);
        }
      })
      .catch(() => setEntities([]))
      .finally(() => setLoadingEntities(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const filtered = useMemo(() => {
    if (!search) return entities;
    const q = search.toLowerCase();
    return entities.filter((e) => e.friendlyName.toLowerCase().includes(q) || e.entityId.toLowerCase().includes(q));
  }, [entities, search]);

  const showPulseDuration = deviceType === 'pulse' || deviceType === 'garage_door';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!instanceId || !entityId || !name) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = { instanceId, name, entityId, deviceType, pulseDuration };
      if (device) {
        await api.updateDevice(device.id, payload);
      } else {
        await api.createDevice(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={device ? 'Editar dispositivo' : 'Añadir dispositivo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Home Assistant">
          <select className="input" value={instanceId} onChange={(e) => setInstanceId(e.target.value)}>
            {instances.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Entidad">
          <div className="relative">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-8"
                placeholder={loadingEntities ? 'Cargando entidades…' : 'Buscar entidad…'}
                value={search || entityId}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setEntityId('');
                }}
                onFocus={() => {
                  setPickerOpen(true);
                  setSearch('');
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setPickerOpen(false);
                    const match = entities.find((e) => e.entityId === entityId);
                    if (match) setSearch(match.friendlyName);
                  }, 150);
                }}
              />
              {loadingEntities && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-500" />
              )}
            </div>
            {pickerOpen && filtered.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-base-800 shadow-xl">
                {filtered.slice(0, 60).map((opt) => (
                  <button
                    type="button"
                    key={opt.entityId}
                    onClick={() => {
                      setEntityId(opt.entityId);
                      setSearch(opt.friendlyName);
                      if (!name) setName(opt.friendlyName);
                      setPickerOpen(false);
                    }}
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-base-700"
                  >
                    <span className="text-slate-100">{opt.friendlyName}</span>
                    <span className="text-xs text-slate-500">{opt.entityId}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Nombre">
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Tipo de dispositivo">
          <select className="input" value={deviceType} onChange={(e) => setDeviceType(e.target.value as DeviceType)}>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {DEVICE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        {showPulseDuration && (
          <Field label="Duración del pulso (ms)">
            <input
              type="number"
              min={200}
              step={100}
              className="input"
              value={pulseDuration}
              onChange={(e) => setPulseDuration(Number(e.target.value))}
            />
          </Field>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Guardando…' : 'Guardar dispositivo'}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
