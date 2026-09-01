export type DeviceType =
  | 'switch'
  | 'thermostat'
  | 'blind'
  | 'garage_door'
  | 'sensor'
  | 'pulse'
  | 'button';

export interface Instance {
  id: string;
  name: string;
  url: string;
  token: string;
  insecure: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  instanceId: string;
  name: string;
  entityId: string;
  deviceType: DeviceType;
  pulseDuration: number;
  createdAt: string;
}

export interface EntityOption {
  entityId: string;
  domain: string;
  friendlyName: string;
  state: string;
  unit?: string;
}

export interface DeviceState {
  state?: string;
  attributes?: Record<string, any>;
  error?: string;
  lastSeenAt?: number | null;
}

export type DeviceStates = Record<string, DeviceState>;

export interface SecurityEvent {
  ts: number;
  ip: string;
  type: 'login' | 'webhook';
  result: 'success' | 'failure';
  reason?: string | null;
}

export interface SecurityWindowCount {
  valid: number;
  failed: number;
}

export interface SecurityStats {
  last15m: SecurityWindowCount;
  lastHour: SecurityWindowCount;
  allTime: SecurityWindowCount;
}

export interface QuarantineEntry {
  ip: string;
  until: number;
  reason: string;
  manual: boolean;
}

export interface CertSerial {
  serial: string;
  label: string;
  addedAt: number | null;
  source: 'env' | 'app';
  enabled: boolean;
}

export interface ActiveCert {
  serial: string;
  label: string;
}

export interface AuthStatus {
  authEnabled: boolean;
  passwordLoginAllowed: boolean;
  authenticated: boolean;
  cert: ActiveCert | null;
}

export interface AuthMethodSettings {
  allowPassword: boolean;
  allowCert: boolean;
}

export const DEVICE_TYPE_KEYS: Record<DeviceType, `deviceType.${DeviceType}`> = {
  switch: 'deviceType.switch',
  thermostat: 'deviceType.thermostat',
  blind: 'deviceType.blind',
  garage_door: 'deviceType.garage_door',
  sensor: 'deviceType.sensor',
  pulse: 'deviceType.pulse',
  button: 'deviceType.button',
};
