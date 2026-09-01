import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, X } from 'lucide-react';
import type { Device } from '../types';
import { useLanguage, type TranslationKey } from '../i18n';

function defaultAction(device: Device, t: (key: TranslationKey) => string): { action: string; params?: Record<string, any>; note?: string } {
  const domain = device.entityId.split('.')[0];
  switch (device.deviceType) {
    case 'switch':
      return { action: 'toggle' };
    case 'pulse':
      return { action: 'pulse' };
    case 'button':
      return { action: 'press' };
    case 'garage_door':
      return domain === 'cover' ? { action: 'open_cover', note: t('endpoint.noteCloseCover') } : { action: 'pulse' };
    case 'blind':
      return { action: 'open_cover', note: t('endpoint.noteBlind') };
    case 'thermostat':
      return {
        action: 'set_temperature',
        params: { temperature: 21 },
        note: t('endpoint.noteThermostat'),
      };
    case 'sensor':
      return { action: '', note: t('endpoint.noteSensor') };
    case 'automation':
      return { action: 'trigger_automation', note: t('endpoint.noteAutomation') };
    default:
      return { action: 'toggle' };
  }
}

type Mode = 'session' | 'webhook';

export default function EndpointModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('session');
  const [copied, setCopied] = useState<string | null>(null);
  const [webhookKey, setWebhookKey] = useState<string | null>(null);
  const [webhookBaseUrl, setWebhookBaseUrl] = useState<string | null>(null);
  const [webhookKeyLoaded, setWebhookKeyLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'webhook' || webhookKeyLoaded) return;
    fetch('/api/webhook-key')
      .then((r) => r.json())
      .then((data) => {
        setWebhookKey(data.key || null);
        setWebhookBaseUrl(data.baseUrl || null);
        setWebhookKeyLoaded(true);
      })
      .catch(() => setWebhookKeyLoaded(true));
  }, [mode, webhookKeyLoaded]);

  const { action, params, note } = defaultAction(device, t);
  const body = JSON.stringify(params ? { action, params } : { action });

  const url =
    mode === 'session'
      ? `${window.location.origin}/api/actions/${device.id}`
      : `${webhookBaseUrl || window.location.origin}/api/webhook/${device.id}`;

  const curl =
    mode === 'session'
      ? `curl -X POST '${url}' -H 'Content-Type: application/json' -d '${body}'`
      : `curl -X POST '${url}' -H 'Content-Type: application/json' -H 'X-Api-Key: ${webhookKey || 'TU_API_KEY'}' -d '${body}'`;

  const copy = (text: string, which: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return createPortal(
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-lg rounded-2xl border border-white/10 bg-base-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('endpoint.title')}</h2>
            <p className="text-sm text-slate-500">{device.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-base-700 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-base-800 p-1 text-xs">
          <button
            onClick={() => setMode('session')}
            className={`min-w-0 flex-1 rounded-md px-1 py-1.5 font-medium transition ${
              mode === 'session' ? 'bg-base-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('endpoint.session')}
          </button>
          <button
            onClick={() => setMode('webhook')}
            className={`min-w-0 flex-1 rounded-md px-1 py-1.5 font-medium transition ${
              mode === 'webhook' ? 'bg-base-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('endpoint.webhook')}
          </button>
        </div>

        {!action ? (
          <p className="text-sm text-slate-400">{note}</p>
        ) : (
          <div className="space-y-4">
            {mode === 'webhook' && webhookKeyLoaded && !webhookKey && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400">{t('endpoint.noKey')}</p>
            )}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{t('endpoint.urlLabel')}</p>
              <div className="flex items-center gap-2 rounded-lg bg-base-800 px-3 py-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-accent-400">{url}</code>
                <button onClick={() => copy(url, 'url')} className="shrink-0 text-slate-400 hover:text-slate-200">
                  {copied === 'url' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {mode === 'webhook' && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{t('endpoint.headerLabel')}</p>
                <div className="flex items-center gap-2 rounded-lg bg-base-800 px-3 py-2">
                  <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-slate-200">
                    X-Api-Key: {webhookKey || '••••••••'}
                  </code>
                  {webhookKey && (
                    <button
                      onClick={() => copy(webhookKey, 'key')}
                      className="shrink-0 text-slate-400 hover:text-slate-200"
                    >
                      {copied === 'key' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{t('endpoint.bodyLabel')}</p>
              <div className="flex items-center gap-2 rounded-lg bg-base-800 px-3 py-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-slate-200">{body}</code>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{t('endpoint.curlLabel')}</p>
              <div className="flex items-center gap-2 rounded-lg bg-base-800 px-3 py-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs text-slate-300">{curl}</code>
                <button onClick={() => copy(curl, 'curl')} className="shrink-0 text-slate-400 hover:text-slate-200">
                  {copied === 'curl' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {note && <p className="text-xs text-slate-500">{note}</p>}

            <p className="text-xs text-slate-500">
              {mode === 'session' ? t('endpoint.sessionHelp') : t('endpoint.webhookHelp')}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
