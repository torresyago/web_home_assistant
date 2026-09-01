import type { Device, DeviceStates, EntityOption, Instance, SecurityEvent, SecurityStats, QuarantineEntry, CertSerial, AuthStatus } from './types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  authStatus: () => request<AuthStatus>('/auth/status'),
  login: (username: string, password: string) =>
    request<{ ok: true }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),

  listInstances: () => request<Instance[]>('/instances'),
  createInstance: (data: Partial<Instance>) =>
    request<Instance>('/instances', { method: 'POST', body: JSON.stringify(data) }),
  updateInstance: (id: string, data: Partial<Instance>) =>
    request<Instance>(`/instances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstance: (id: string) => request<{ ok: true }>(`/instances/${id}`, { method: 'DELETE' }),
  testInstance: (id: string) => request<{ ok: boolean; error?: string }>(`/instances/${id}/test`, { method: 'POST' }),
  listEntities: (id: string) => request<EntityOption[]>(`/instances/${id}/entities`),

  listDevices: () => request<Device[]>('/devices'),
  createDevice: (data: Partial<Device>) =>
    request<Device>('/devices', { method: 'POST', body: JSON.stringify(data) }),
  updateDevice: (id: string, data: Partial<Device>) =>
    request<Device>(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDevice: (id: string) => request<{ ok: true }>(`/devices/${id}`, { method: 'DELETE' }),
  getAllStates: () => request<DeviceStates>('/devices/states/all'),

  runAction: (deviceId: string, action: string, params: Record<string, any> = {}) =>
    request<{ ok: boolean }>(`/actions/${deviceId}`, { method: 'POST', body: JSON.stringify({ action, params }) }),

  securityStats: () => request<SecurityStats>('/security/stats'),
  securityLog: (limit = 200) => request<SecurityEvent[]>(`/security/log?limit=${limit}`),
  securityReset: () => request<{ ok: true }>('/security/reset', { method: 'POST' }),
  quarantineList: () => request<QuarantineEntry[]>('/security/quarantine'),
  quarantineAdd: (ip: string, minutes: number) =>
    request<{ ok: true }>('/security/quarantine', { method: 'POST', body: JSON.stringify({ ip, minutes }) }),
  quarantineRemove: (ip: string) =>
    request<{ ok: true }>(`/security/quarantine/${encodeURIComponent(ip)}`, { method: 'DELETE' }),

  certSerialsList: () => request<CertSerial[]>('/security/cert-serials'),
  certSerialsAdd: (serial: string, label: string) =>
    request<CertSerial>('/security/cert-serials', { method: 'POST', body: JSON.stringify({ serial, label }) }),
  certSerialsSetLabel: (serial: string, label: string) =>
    request<{ ok: true }>(`/security/cert-serials/${encodeURIComponent(serial)}`, {
      method: 'PUT',
      body: JSON.stringify({ label }),
    }),
  certSerialsSetEnabled: (serial: string, enabled: boolean) =>
    request<{ ok: true }>(`/security/cert-serials/${encodeURIComponent(serial)}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),
  certSerialsRemove: (serial: string) =>
    request<{ ok: true }>(`/security/cert-serials/${encodeURIComponent(serial)}`, { method: 'DELETE' }),
};
