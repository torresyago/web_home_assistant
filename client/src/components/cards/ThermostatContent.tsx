import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Device, DeviceState } from '../../types';

export default function ThermostatContent({
  state,
  onAction,
}: {
  device: Device;
  state?: DeviceState;
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const attrs = state?.attributes || {};
  const current = attrs.current_temperature;
  const [target, setTarget] = useState<number | undefined>(attrs.temperature);
  const effectiveTarget = target ?? attrs.temperature;

  function adjust(delta: number) {
    const base = effectiveTarget ?? current ?? 20;
    const next = Math.round((base + delta) * 2) / 2;
    setTarget(next);
    onAction('set_temperature', { temperature: next });
  }

  if (state?.error) {
    return <p className="text-sm text-slate-500">Sin datos</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Actual</p>
        <p className="text-2xl font-bold text-white">{current != null ? `${current}°` : '—'}</p>
        <p className="mt-1 text-xs text-slate-500">{attrs.hvac_action || state?.state}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => adjust(-0.5)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-base-700 text-slate-200 hover:bg-base-600"
        >
          <Minus size={16} />
        </button>
        <span className="w-14 text-center text-lg font-semibold text-accent-400">
          {effectiveTarget != null ? `${effectiveTarget}°` : '—'}
        </span>
        <button
          onClick={() => adjust(0.5)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-base-700 text-slate-200 hover:bg-base-600"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
