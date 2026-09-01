import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, RotateCcw, Ban, Unlock, ArrowLeft, KeyRound, Trash2, Lock, Pencil, Check, KeySquare } from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n';
import type { SecurityEvent, SecurityStats, QuarantineEntry, CertSerial, AuthMethodSettings } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import LanguageSwitch from '../components/LanguageSwitch';
import ThemeToggle from '../components/ThemeToggle';

function formatTs(ts: number) {
  return new Date(ts).toLocaleString();
}

function CertLabelCell({
  serial,
  label,
  placeholder,
  onSave,
}: {
  serial: string;
  label: string;
  placeholder: string;
  onSave: (serial: string, label: string) => void;
}) {
  const [value, setValue] = useState(label);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(label);
  }, [label]);

  function commit() {
    if (value.trim() !== label) {
      onSave(serial, value.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="group relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/10 bg-base-900/60 px-2.5 py-1.5 pr-7 text-sm text-slate-200 placeholder:text-slate-600 hover:border-white/20 focus:border-accent-500/60 focus:outline-none"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:opacity-0">
        {saved ? <Check size={14} className="text-emerald-400" /> : <Pencil size={13} />}
      </span>
    </div>
  );
}

function MiniSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent-500' : 'bg-base-700'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function StatCard({ title, valid, failed, validLabel, failedLabel }: { title: string; valid: number; failed: number; validLabel: string; failedLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-base-900 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <div className="flex gap-6">
        <div>
          <p className="text-2xl font-bold text-emerald-400">{valid}</p>
          <p className="text-xs text-slate-500">{validLabel}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">{failed}</p>
          <p className="text-xs text-slate-500">{failedLabel}</p>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPanel({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [log, setLog] = useState<SecurityEvent[]>([]);
  const [quarantine, setQuarantine] = useState<QuarantineEntry[]>([]);
  const [certSerials, setCertSerials] = useState<CertSerial[]>([]);
  const [authMethods, setAuthMethods] = useState<AuthMethodSettings | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newMinutes, setNewMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [newSerial, setNewSerial] = useState('');
  const [newSerialLabel, setNewSerialLabel] = useState('');
  const [serialError, setSerialError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, l, q, c, a] = await Promise.all([
      api.securityStats(),
      api.securityLog(200),
      api.quarantineList(),
      api.certSerialsList(),
      api.authSettings(),
    ]);
    setStats(s);
    setLog(l);
    setQuarantine(q);
    setCertSerials(c);
    setAuthMethods(a);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleReset() {
    await api.securityReset();
    setConfirmReset(false);
    load();
  }

  async function handleAddQuarantine(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newIp.trim()) return;
    try {
      await api.quarantineAdd(newIp.trim(), newMinutes);
      setNewIp('');
      setNewMinutes(15);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRelease(ip: string) {
    await api.quarantineRemove(ip);
    load();
  }

  async function handleAddCertSerial(e: React.FormEvent) {
    e.preventDefault();
    setSerialError(null);
    if (!newSerial.trim()) return;
    try {
      await api.certSerialsAdd(newSerial.trim(), newSerialLabel.trim());
      setNewSerial('');
      setNewSerialLabel('');
      load();
    } catch (err: any) {
      setSerialError(err.message);
    }
  }

  async function handleRemoveCertSerial(serial: string) {
    setSerialError(null);
    try {
      await api.certSerialsRemove(serial);
      load();
    } catch (err: any) {
      setSerialError(err.message);
    }
  }

  async function handleSaveCertLabel(serial: string, label: string) {
    setSerialError(null);
    try {
      await api.certSerialsSetLabel(serial, label);
      load();
    } catch (err: any) {
      setSerialError(err.message);
    }
  }

  async function handleToggleCertEnabled(serial: string, enabled: boolean) {
    setSerialError(null);
    setCertSerials((prev) => prev.map((c) => (c.serial === serial ? { ...c, enabled } : c)));
    try {
      await api.certSerialsSetEnabled(serial, enabled);
      load();
    } catch (err: any) {
      setSerialError(err.message);
      load();
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('nav.security')}</h1>
            <p className="text-xs text-slate-500">{t('security.subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageSwitch />
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <RotateCcw size={16} /> <span className="hidden sm:inline">{t('security.resetStats')}</span>
          </button>
        </div>
      </header>

      {stats && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title={t('security.last15m')}
            valid={stats.last15m.valid}
            failed={stats.last15m.failed}
            validLabel={t('security.valid')}
            failedLabel={t('security.failed')}
          />
          <StatCard
            title={t('security.lastHour')}
            valid={stats.lastHour.valid}
            failed={stats.lastHour.failed}
            validLabel={t('security.valid')}
            failedLabel={t('security.failed')}
          />
          <StatCard
            title={t('security.allTime')}
            valid={stats.allTime.valid}
            failed={stats.allTime.failed}
            validLabel={t('security.valid')}
            failedLabel={t('security.failed')}
          />
        </div>
      )}

      {authMethods && (
        <section className="mb-10">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
            <KeySquare size={16} className="text-accent-400" /> {t('security.authMethodsTitle')}
          </h2>
          <p className="mb-3 text-xs text-slate-500">{t('security.authMethodsHint')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-base-900 p-4">
              <span className="text-sm text-slate-300">{t('security.methodPassword')}</span>
              {authMethods.allowPassword ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  {t('security.methodActive')}
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {t('security.methodInactive')}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-base-900 p-4">
              <span className="text-sm text-slate-300">{t('security.methodCert')}</span>
              {authMethods.allowCert ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  {t('security.methodActive')}
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {t('security.methodInactive')}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Ban size={16} className="text-red-400" /> {t('security.quarantineTitle')}
        </h2>
        <form onSubmit={handleAddQuarantine} className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder={t('security.ipPlaceholder')}
            className="rounded-lg border border-white/10 bg-base-900 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
          <input
            type="number"
            min={1}
            value={newMinutes}
            onChange={(e) => setNewMinutes(Number(e.target.value))}
            className="w-24 rounded-lg border border-white/10 bg-base-900 px-3 py-2 text-sm text-white"
          />
          <span className="text-xs text-slate-500">{t('security.minutes')}</span>
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
          >
            {t('security.addQuarantine')}
          </button>
        </form>
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

        {quarantine.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-slate-500">
            {t('security.noQuarantine')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">{t('security.colIp')}</th>
                  <th className="px-4 py-2">{t('security.colReason')}</th>
                  <th className="px-4 py-2">{t('security.colUntil')}</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quarantine.map((q) => (
                  <tr key={q.ip}>
                    <td className="px-4 py-2 font-mono text-slate-200">{q.ip}</td>
                    <td className="px-4 py-2 text-slate-400">{q.reason}</td>
                    <td className="px-4 py-2 text-slate-400">{formatTs(q.until)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleRelease(q.ip)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                      >
                        <Unlock size={14} /> {t('security.release')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
          <KeyRound size={16} className="text-accent-400" /> {t('security.certSerialsTitle')}
        </h2>
        <p className="mb-3 text-xs text-slate-500">{t('security.certSerialsHint')}</p>
        <form onSubmit={handleAddCertSerial} className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={newSerial}
            onChange={(e) => setNewSerial(e.target.value)}
            placeholder={t('security.certSerialPlaceholder')}
            className="min-w-[20rem] flex-1 rounded-lg border border-white/10 bg-base-900 px-3 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-600"
          />
          <input
            value={newSerialLabel}
            onChange={(e) => setNewSerialLabel(e.target.value)}
            placeholder={t('security.certLabelPlaceholder')}
            className="w-48 rounded-lg border border-white/10 bg-base-900 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
          >
            {t('security.addCertSerial')}
          </button>
        </form>
        {serialError && <p className="mb-2 text-xs text-red-400">{serialError}</p>}

        {certSerials.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-slate-500">
            {t('security.noCertSerials')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">{t('security.colActive')}</th>
                  <th className="px-4 py-2">{t('security.colSerial')}</th>
                  <th className="px-4 py-2">{t('security.colLabel')}</th>
                  <th className="px-4 py-2">{t('security.colSource')}</th>
                  <th className="px-4 py-2">{t('security.colAdded')}</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {certSerials.map((c) => (
                  <tr key={c.serial} className={c.enabled ? '' : 'opacity-50'}>
                    <td className="px-4 py-2">
                      <MiniSwitch checked={c.enabled} onChange={(value) => handleToggleCertEnabled(c.serial, value)} />
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-200">{c.serial}</td>
                    <td className="px-2 py-1">
                      <CertLabelCell
                        serial={c.serial}
                        label={c.label}
                        placeholder={t('security.clickToLabel')}
                        onSave={handleSaveCertLabel}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {c.source === 'env' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                          .env
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-xs text-accent-400">
                          {t('security.sourceApp')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-400">{c.addedAt ? formatTs(c.addedAt) : '—'}</td>
                    <td className="px-4 py-2 text-right">
                      {c.source === 'env' ? (
                        <span
                          title={t('security.envSerialHint')}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                        >
                          <Lock size={14} />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemoveCertSerial(c.serial)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                        >
                          <Trash2 size={14} /> {t('security.removeCertSerial')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldAlert size={16} className="text-accent-400" /> {t('security.logTitle')}
        </h2>
        {log.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-slate-500">
            {t('security.noLog')}
          </p>
        ) : (
          <div className="max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-base-950 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">{t('security.colDate')}</th>
                  <th className="px-4 py-2">{t('security.colIp')}</th>
                  <th className="px-4 py-2">{t('security.colMethod')}</th>
                  <th className="px-4 py-2">{t('security.colIdentity')}</th>
                  <th className="px-4 py-2">{t('security.colResult')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {log.map((e, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-slate-400">{formatTs(e.ts)}</td>
                    <td className="px-4 py-2 font-mono text-slate-200">{e.ip}</td>
                    <td className="px-4 py-2 text-slate-400">
                      {e.type === 'webhook'
                        ? t('security.typeWebhook')
                        : e.method === 'cert'
                          ? t('security.methodCertLog')
                          : e.method === 'password'
                            ? t('security.methodPasswordLog')
                            : t('security.typeLogin')}
                    </td>
                    <td className="px-4 py-2 text-slate-400">{e.reason || '—'}</td>
                    <td className="px-4 py-2">
                      {e.result === 'success' ? (
                        <span className="text-emerald-400">{t('security.resultValid')}</span>
                      ) : (
                        <span className="text-red-400">{t('security.resultFailed')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmReset && (
        <ConfirmDialog
          title={t('security.resetTitle')}
          message={t('security.resetMessage')}
          confirmLabel={t('security.resetConfirm')}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
