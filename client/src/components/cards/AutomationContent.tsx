import { useState } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function AutomationContent({
  onAction,
}: {
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const { t } = useLanguage();
  const [running, setRunning] = useState(false);
  return (
    <button
      disabled={running}
      onClick={() => {
        setRunning(true);
        onAction('trigger_automation');
        setTimeout(() => setRunning(false), 1000);
      }}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500/90 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400 disabled:opacity-60"
    >
      <Play size={16} />
      {running ? t('card.running') : t('card.runAutomation')}
    </button>
  );
}
