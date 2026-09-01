import { useCallback, useEffect, useState } from 'react';
import { HelpCircle, Home, LogOut, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n';
import type { Device, DeviceStates, Instance } from '../types';
import InstanceSection from '../components/InstanceSection';
import InstanceModal from '../components/InstanceModal';
import DeviceModal from '../components/DeviceModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LanguageSwitch from '../components/LanguageSwitch';
import ThemeToggle from '../components/ThemeToggle';
import HelpModal from '../components/HelpModal';
import SecurityPanel from './SecurityPanel';

export default function Dashboard({ authEnabled, onLogout }: { authEnabled: boolean; onLogout: () => void }) {
  const { t } = useLanguage();
  const [view, setView] = useState<'devices' | 'security'>('devices');
  const [instances, setInstances] = useState<Instance[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [states, setStates] = useState<DeviceStates>({});
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  const [instanceModal, setInstanceModal] = useState<{ open: boolean; instance?: Instance }>({ open: false });
  const [deviceModal, setDeviceModal] = useState<{ open: boolean; device?: Device; instanceId?: string }>({
    open: false,
  });
  const [confirmDelete, setConfirmDelete] = useState<
    | { type: 'instance'; instance: Instance }
    | { type: 'device'; device: Device }
    | null
  >(null);

  const loadAll = useCallback(async () => {
    const [i, d] = await Promise.all([api.listInstances(), api.listDevices()]);
    setInstances(i);
    setDevices(d);
    setLoading(false);
  }, []);

  const pollStates = useCallback(async () => {
    try {
      const s = await api.getAllStates();
      setStates(s);
    } catch {
      // silencioso: se reintentará en el siguiente ciclo
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    pollStates();
    const interval = setInterval(pollStates, 5000);
    return () => clearInterval(interval);
  }, [pollStates, devices.length]);

  async function handleAction(deviceId: string, action: string, params?: Record<string, any>) {
    await api.runAction(deviceId, action, params).catch(() => {});
    setTimeout(pollStates, 400);
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'instance') {
      await api.deleteInstance(confirmDelete.instance.id);
    } else {
      await api.deleteDevice(confirmDelete.device.id);
    }
    setConfirmDelete(null);
    loadAll();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {t('app.loading')}
      </div>
    );
  }

  if (view === 'security') {
    return <SecurityPanel onBack={() => setView('devices')} />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
            <Home size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">HA Things</h1>
            <p className="text-xs text-slate-500">{t('dashboard.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitch />
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => setView('security')}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <ShieldCheck size={16} /> {t('nav.security')}
          </button>
          <button
            onClick={() => setInstanceModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3.5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
          >
            <Plus size={16} /> {t('nav.addInstance')}
          </button>
          {authEnabled && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {instances.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <Home size={32} className="text-slate-600" />
          <p className="text-slate-400">{t('dashboard.emptyState')}</p>
          <button
            onClick={() => setInstanceModal({ open: true })}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
          >
            <Plus size={16} /> {t('dashboard.addInstance')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {instances.map((instance) => (
            <InstanceSection
              key={instance.id}
              instance={instance}
              devices={devices.filter((d) => d.instanceId === instance.id)}
              states={states}
              onAction={handleAction}
              onEditInstance={() => setInstanceModal({ open: true, instance })}
              onDeleteInstance={() => setConfirmDelete({ type: 'instance', instance })}
              onAddDevice={() => setDeviceModal({ open: true, instanceId: instance.id })}
              onEditDevice={(device) => setDeviceModal({ open: true, device })}
              onDeleteDevice={(device) => setConfirmDelete({ type: 'device', device })}
            />
          ))}
        </div>
      )}

      {instanceModal.open && (
        <InstanceModal
          instance={instanceModal.instance}
          onClose={() => setInstanceModal({ open: false })}
          onSaved={loadAll}
        />
      )}

      {deviceModal.open && (
        <DeviceModal
          device={deviceModal.device}
          instances={instances}
          defaultInstanceId={deviceModal.instanceId}
          onClose={() => setDeviceModal({ open: false })}
          onSaved={loadAll}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === 'instance' ? t('dashboard.deleteInstanceTitle') : t('dashboard.deleteDeviceTitle')}
          message={
            confirmDelete.type === 'instance'
              ? t('dashboard.deleteInstanceMessage', { name: confirmDelete.instance.name })
              : t('dashboard.deleteDeviceMessage', { name: confirmDelete.device.name })
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
