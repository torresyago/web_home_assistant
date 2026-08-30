import { useState } from 'react';
import { Zap } from 'lucide-react';
import type { Device } from '../../types';

export default function PulseContent({
  device,
  onAction,
}: {
  device: Device;
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const [pulsing, setPulsing] = useState(false);
  return (
    <button
      disabled={pulsing}
      onClick={() => {
        setPulsing(true);
        onAction('pulse');
        setTimeout(() => setPulsing(false), device.pulseDuration || 1000);
      }}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500/90 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400 disabled:opacity-60"
    >
      <Zap size={16} />
      {pulsing ? 'Activando…' : 'Activar'}
    </button>
  );
}
