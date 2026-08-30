import { useState } from 'react';
import { MoreVertical, Pencil, Plus, Server, Trash2 } from 'lucide-react';
import type { Device, DeviceStates, Instance } from '../types';
import DeviceCard from './DeviceCard';

export default function InstanceSection({
  instance,
  devices,
  states,
  onAction,
  onEditInstance,
  onDeleteInstance,
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
}: {
  instance: Instance;
  devices: Device[];
  states: DeviceStates;
  onAction: (deviceId: string, action: string, params?: Record<string, any>) => void;
  onEditInstance: () => void;
  onDeleteInstance: () => void;
  onAddDevice: () => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (device: Device) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasError = devices.length > 0 && devices.every((d) => states[d.id]?.error);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300">
            <Server size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{instance.name}</h2>
              <span className={`h-1.5 w-1.5 rounded-full ${hasError ? 'bg-red-500' : 'bg-accent-500'}`} />
            </div>
            <p className="text-xs text-slate-500">{instance.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddDevice}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <Plus size={14} /> Dispositivo
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-white/10 bg-base-800 shadow-xl"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEditInstance();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-base-700"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteInstance();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-base-700"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
          Todavía no has añadido dispositivos para esta instancia.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {devices.map((d) => (
            <DeviceCard
              key={d.id}
              device={d}
              state={states[d.id]}
              onAction={(action, params) => onAction(d.id, action, params)}
              onEdit={() => onEditDevice(d)}
              onDelete={() => onDeleteDevice(d)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
