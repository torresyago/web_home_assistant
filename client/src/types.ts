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
}

export type DeviceStates = Record<string, DeviceState>;

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  switch: 'Interruptor',
  thermostat: 'Termostato',
  blind: 'Persiana',
  garage_door: 'Puerta de garaje',
  sensor: 'Sensor',
  pulse: 'Pulso',
  button: 'Botón',
};
