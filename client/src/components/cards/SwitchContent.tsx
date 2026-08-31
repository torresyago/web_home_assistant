import type { Device, DeviceState } from '../../types';
import { useLanguage } from '../../i18n';

export default function SwitchContent({
  state,
  onAction,
}: {
  device: Device;
  state?: DeviceState;
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const { t } = useLanguage();
  const isOn = state?.state === 'on';
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium ${isOn ? 'text-accent-400' : 'text-slate-500'}`}>
        {state?.error ? t('card.noData') : isOn ? t('card.on') : t('card.off')}
      </span>
      <button
        role="switch"
        aria-checked={isOn}
        onClick={() => onAction('toggle')}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          isOn ? 'bg-accent-500' : 'bg-base-700'
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isOn ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
