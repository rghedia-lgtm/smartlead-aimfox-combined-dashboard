import React, { useState } from 'react';
import CredentialsForm from './components/CredentialsForm';
import SyncLog from './components/SyncLog';
import SmartleadDashboard from './components/SmartleadDashboard';
import LoginPage from './components/LoginPage';
import { useSync } from './hooks/useSync';
import { useAuth } from './hooks/useAuth';

const TABS = [
  { id: 'smartlead', label: 'Smartlead Analytics' },
  { id: 'aimfox', label: 'AimFox → Zoho Sync' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('smartlead');
  const { status, log, summary, error, startSync } = useSync();
  const { authState, onAuthenticated, logout } = useAuth();

  if (authState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <LoginPage onAuthenticated={onAuthenticated} />;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={styles.title}>Campaign Dashboard</h1>
            <p style={styles.subtitle}>Smartlead analytics and AimFox → Zoho CRM sync in one place.</p>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'smartlead' && <SmartleadDashboard />}
        {activeTab === 'aimfox' && (
          <>
            <CredentialsForm onSubmit={startSync} loading={status === 'loading'} />
            <SyncLog log={log} status={status} error={error} summary={summary} />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: { maxWidth: 960, margin: '0 auto 1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { marginTop: 6, fontSize: '0.9rem', color: '#64748b' },
  logoutBtn: {
    padding: '0.4rem 1rem',
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  tabs: {
    maxWidth: 960,
    margin: '0 auto 1.5rem',
    display: 'flex',
    gap: '0.5rem',
    background: '#fff',
    padding: '0.4rem',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    width: 'fit-content',
  },
  tab: {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: 7,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  tabActive: { background: '#2563eb', color: '#fff' },
  tabInactive: { background: 'transparent', color: '#64748b' },
  content: { maxWidth: 960, margin: '0 auto' },
};
