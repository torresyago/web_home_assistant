import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  DoorOpen,
  Link2,
  MoreVertical,
  MousePointerClick,
  Pencil,
  Thermometer,
  ToggleRight,
  Trash2,
  Warehouse,
  Zap,
} from 'lucide-react';
import type { Device, DeviceState, DeviceType } from '../types';
import { DEVICE_TYPE_KEYS } from '../types';
import { useLanguage } from '../i18n';
import SwitchContent from './cards/SwitchContent';
import ThermostatContent from './cards/ThermostatContent';
import BlindContent from './cards/BlindContent';
import GarageDoorContent from './cards/GarageDoorContent';
import SensorContent from './cards/SensorContent';
import PulseContent from './cards/PulseContent';
import ButtonContent from './cards/ButtonContent';
import EndpointModal from './EndpointModal';

const ICONS: Record<DeviceType, any> = {
  switch: ToggleRight,
  thermostat: Thermometer,
  blind: Activity,
  garage_door: Warehouse,
  sensor: Activity,
  pulse: Zap,
  button: MousePointerClick,
};

export default function DeviceCard({
  device,
  state,
  onAction,
  onEdit,
  onDelete,
}: {
  device: Device;
  state?: DeviceState;
  onAction: (action: string, params?: Record<string, any>) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [endpointOpen, setEndpointOpen] = useState(false);
  const Icon = ICONS[device.deviceType] || DoorOpen;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-base-900/60 p-5 shadow-lg backdrop-blur transition hover:border-accent-500/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{device.name}</p>
            <p className="break-words text-xs text-slate-500">
              {t(DEVICE_TYPE_KEYS[device.deviceType])} · {device.entityId}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-base-700 hover:text-slate-200 group-hover:opacity-100"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-10 w-36 overflow-hidden rounded-lg border border-white/10 bg-base-800 shadow-xl"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-base-700"
              >
                <Pencil size={14} /> {t('deviceCard.edit')}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setEndpointOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-base-700"
              >
                <Link2 size={14} /> {t('deviceCard.endpoint')}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-base-700"
              >
                <Trash2 size={14} /> {t('deviceCard.delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {endpointOpen && <EndpointModal device={device} onClose={() => setEndpointOpen(false)} />}

      {device.deviceType === 'switch' && <SwitchContent device={device} state={state} onAction={onAction} />}
      {device.deviceType === 'thermostat' && <ThermostatContent device={device} state={state} onAction={onAction} />}
      {device.deviceType === 'blind' && <BlindContent device={device} state={state} onAction={onAction} />}
      {device.deviceType === 'garage_door' && (
        <GarageDoorContent device={device} state={state} onAction={onAction} />
      )}
      {device.deviceType === 'sensor' && <SensorContent state={state} />}
      {device.deviceType === 'pulse' && <PulseContent device={device} onAction={onAction} />}
      {device.deviceType === 'button' && <ButtonContent onAction={onAction} />}
    </motion.div>
  );
}
