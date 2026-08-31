import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Modal from './Modal';
import { api } from '../api';
import type { Instance } from '../types';
import { useLanguage } from '../i18n';

export default function InstanceModal({
  instance,
  onClose,
  onSaved,
}: {
  instance?: Instance;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(instance?.name || '');
  const [url, setUrl] = useState(instance?.url || 'http://homeassistant.local:8123');
  const [token, setToken] = useState(instance?.token || '');
  const [insecure, setInsecure] = useState(instance?.insecure || false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setTestResult(null);
    try {
      const payload = { name, url, token, insecure };
      const saved = instance ? await api.updateInstance(instance.id, payload) : await api.createInstance(payload);
      const result = await api.testInstance(saved.id);
      if (result.ok) {
        setTestResult('ok');
        setTestMessage(t('instance.testOk'));
        onSaved();
        setTimeout(onClose, 700);
      } else {
        setTestResult('fail');
        setTestMessage(result.error || t('instance.testFail'));
        onSaved();
      }
    } catch (err: any) {
      setError(err.message || t('instance.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={instance ? t('instance.edit') : t('instance.add')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t('instance.name')}>
          <input
            required
            className="input"
            placeholder={t('instance.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t('instance.url')}>
          <input
            required
            className="input"
            placeholder="http://homeassistant.local:8123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
        <Field label={t('instance.token')}>
          <textarea
            required
            className="input min-h-[80px] resize-none font-mono text-xs"
            placeholder="eyJhbGciOi..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={insecure} onChange={(e) => setInsecure(e.target.checked)} />
          {t('instance.insecure')}
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {testResult && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              testResult === 'ok' ? 'bg-accent-500/10 text-accent-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {testResult === 'ok' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {testMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? t('instance.saving') : t('instance.save')}
        </button>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
