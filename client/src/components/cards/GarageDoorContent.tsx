import { useState } from 'react';
import type { Device, DeviceState } from '../../types';

export default function GarageDoorContent({
  device,
  state,
  onAction,
}: {
  device: Device;
  state?: DeviceState;
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const [pulsing, setPulsing] = useState(false);
  const domain = device.entityId.split('.')[0];
  const isCover = domain === 'cover';

  if (state?.error) {
    return <p className="text-sm text-slate-500">Sin datos</p>;
  }

  if (isCover) {
    const isOpen = state?.state === 'open';
    return (
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isOpen ? 'text-accent-400' : 'text-slate-500'}`}>
          {isOpen ? 'Abierta' : 'Cerrada'}
        </span>
        <button
          onClick={() => onAction(isOpen ? 'close_cover' : 'open_cover')}
          className="rounded-lg bg-base-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-base-600"
        >
          {isOpen ? 'Cerrar' : 'Abrir'}
        </button>
      </div>
    );
  }

  return (
    <button
      disabled={pulsing}
      onClick={() => {
        setPulsing(true);
        onAction('pulse');
        setTimeout(() => setPulsing(false), device.pulseDuration || 1000);
      }}
      className="w-full rounded-lg bg-accent-500/90 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400 disabled:opacity-60"
    >
      {pulsing ? 'Activando…' : 'Abrir / Cerrar'}
    </button>
  );
}
