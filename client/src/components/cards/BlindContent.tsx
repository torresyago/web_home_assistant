import { ArrowDown, ArrowUp, Square } from 'lucide-react';
import type { Device, DeviceState } from '../../types';
import { useLanguage } from '../../i18n';

export default function BlindContent({
  state,
  onAction,
}: {
  device: Device;
  state?: DeviceState;
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const { t } = useLanguage();
  if (state?.error) {
    return <p className="text-sm text-slate-500">{t('card.noData')}</p>;
  }
  const position = state?.attributes?.current_position;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{t('card.position')}</span>
        <span className="font-semibold text-accent-400">{position != null ? `${position}%` : '—'}</span>
      </div>
      {position != null && (
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={position}
          onMouseUp={(e) => onAction('set_cover_position', { position: Number((e.target as HTMLInputElement).value) })}
          onTouchEnd={(e) => onAction('set_cover_position', { position: Number((e.target as HTMLInputElement).value) })}
          className="accent-accent-500"
        />
      )}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onAction('open_cover')}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-700 text-slate-200 hover:bg-base-600"
        >
          <ArrowUp size={16} />
        </button>
        <button
          onClick={() => onAction('stop_cover')}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-700 text-slate-200 hover:bg-base-600"
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => onAction('close_cover')}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-700 text-slate-200 hover:bg-base-600"
        >
          <ArrowDown size={16} />
        </button>
      </div>
    </div>
  );
}
