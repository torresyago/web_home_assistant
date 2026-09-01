import { useEffect, useState } from 'react';
import { api } from './api';
import { useLanguage } from './i18n';
import type { AuthStatus } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    api
      .authStatus()
      .then(setStatus)
      .catch(() =>
        setStatus({
          authEnabled: false,
          passwordLoginAllowed: false,
          authenticated: true,
          cert: null,
          ip: '',
          method: null,
          role: 'admin',
          username: null,
        })
      );
  }, []);

  if (!status) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">{t('app.loading')}</div>;
  }

  if (!status.authenticated) {
    if (status.passwordLoginAllowed) {
      return <Login onSuccess={() => api.authStatus().then(setStatus)} />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-base-900 p-6 text-center">
          <p className="mb-2 text-lg font-semibold text-white">{t('app.accessDeniedTitle')}</p>
          <p className="text-sm text-slate-400">{t('app.accessDeniedBody')}</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      authEnabled={status.authEnabled}
      cert={status.cert}
      ip={status.ip}
      method={status.method}
      role={status.role}
      onLogout={async () => {
        await api.logout();
        setStatus({ ...status, authenticated: false });
      }}
    />
  );
}
