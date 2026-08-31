import type { DeviceState } from '../../types';
import { useLanguage } from '../../i18n';

export default function SensorContent({ state }: { state?: DeviceState }) {
  const { t } = useLanguage();
  if (state?.error) {
    return <p className="text-sm text-slate-500">{t('card.noData')}</p>;
  }
  const unit = state?.attributes?.unit_of_measurement;
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-white">{state?.state ?? '—'}</span>
      {unit && <span className="text-sm text-slate-400">{unit}</span>}
    </div>
  );
}
