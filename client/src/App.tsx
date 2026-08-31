import { useEffect, useState } from 'react';
import { api } from './api';
import { useLanguage } from './i18n';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<{ authEnabled: boolean; authenticated: boolean } | null>(null);

  useEffect(() => {
    api.authStatus().then(setStatus).catch(() => setStatus({ authEnabled: false, authenticated: true }));
  }, []);

  if (!status) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">{t('app.loading')}</div>;
  }

  if (status.authEnabled && !status.authenticated) {
    return <Login onSuccess={() => setStatus({ ...status, authenticated: true })} />;
  }

  return (
    <Dashboard
      authEnabled={status.authEnabled}
      onLogout={async () => {
        await api.logout();
        setStatus({ ...status, authenticated: false });
      }}
    />
  );
}
