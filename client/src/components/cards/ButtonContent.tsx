import { useState } from 'react';
import { MousePointerClick } from 'lucide-react';

export default function ButtonContent({
  onAction,
}: {
  onAction: (action: string, params?: Record<string, any>) => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={() => {
        setPressed(true);
        onAction('press');
        setTimeout(() => setPressed(false), 400);
      }}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-base-700 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-base-600 active:scale-[0.98]"
    >
      <MousePointerClick size={16} className={pressed ? 'text-accent-400' : ''} />
      Pulsar
    </button>
  );
}
