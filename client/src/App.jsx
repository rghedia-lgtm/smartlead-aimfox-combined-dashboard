import React, { useState, useEffect, useRef } from 'react';
import StatCard from './components/StatCard';
import SectionCard from './components/SectionCard';
import PaginatedTable from './components/PaginatedTable';
import LinkedInStatCard from './components/LinkedInStatCard';
import PositiveLeadsTable from './components/PositiveLeadsTable';
import SubSubDashboard from './components/SubSubDashboard';
import ExportShare from './components/ExportShare';
import { useSync } from './hooks/useSync';
import { useSmartlead } from './hooks/useSmartlead';
import { useAimfox } from './hooks/useAimfox';
import CredentialsForm from './components/CredentialsForm';
import SyncLog from './components/SyncLog';

const TABS = ['Overview', 'Smartlead', 'AimFox', 'Positive Leads', 'Drill-down', 'Zoho Sync'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [keys, setKeys] = useState({ smartlead: '', aimfox: '' });
  const [loaded, setLoaded] = useState(false);
  const contentRef = useRef(null);
  const { status: syncStatus, log, summary: syncSummary, error: syncError, startSync } = useSync();
  const { status: slStatus, summary: slSummary, positiveLeads: slPositiveLeads, error: slError, runFetch } = useSmartlead();
  const { status: afStatus, data: afData, error: afError, load: loadAimfox } = useAimfox();

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => {
      const k = { smartlead: d.smartleadApiKey || '', aimfox: d.aimfoxApiKey || '' };
      setKeys(k);
      // Auto-load if keys exist in env
      if (k.smartlead || k.aimfox) {
        setLoaded(true);
        if (k.smartlead) runFetch(k.smartlead);
        if (k.aimfox) loadAimfox(k.aimfox);
      }
    }).catch(() => {});
  }, []);

  async function handleLoad() {
    setLoaded(true);
    if (keys.smartlead) runFetch(keys.smartlead);
    if (keys.aimfox) loadAimfox(keys.aimfox);
  }

  const isLoading = slStatus === 'loading' || afStatus === 'loading';

  const slOverview = slSummary?.length ? {
    totalCampaigns: slSummary.length,
    totalLeads: slSummary.reduce((a, c) => a + c.total, 0),
    totalOpened: slSummary.reduce((a, c) => a + c.opened, 0),
    totalReplied: slSummary.reduce((a, c) => a + c.replied, 0),
    avgOpenRate: slSummary.length ? Math.round(slSummary.reduce((a, c) => a + c.openRate, 0) / slSummary.length * 10) / 10 : 0,
  } : null;

  const afOverview = afData?.overview;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Campaign Dashboard</h1>
          <p style={styles.subtitle}>Smartlead + AimFox unified analytics</p>
        </div>
        {!loaded && (
          <div style={styles.keyForm}>
            <input style={styles.keyInput} placeholder="Smartlead API Key" type="password"
              value={keys.smartlead} onChange={e => setKeys(k => ({ ...k, smartlead: e.target.value }))} />
            <input style={styles.keyInput} placeholder="AimFox API Key" type="password"
              value={keys.aimfox} onChange={e => setKeys(k => ({ ...k, aimfox: e.target.value }))} />
            <button style={styles.loadBtn} onClick={handleLoad} disabled={!keys.smartlead && !keys.aimfox}>
              Load Dashboard
            </button>
          </div>
        )}
        {loaded && (
          <button style={styles.reloadBtn} onClick={() => { setLoaded(false); }}>Change Keys</button>
        )}
      </header>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <div id="dashboard-content" ref={contentRef} style={styles.content}>

        {/* Export bar */}
        {loaded && (slSummary?.length || afData) && (
          <ExportShare
            contentRef={contentRef}
            smartleadData={{ summary: slSummary }}
            aimfoxData={afData}
          />
        )}

        {isLoading && (
          <div style={styles.loading}>Loading data — this may take a minute...</div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <>
            {(slOverview || afOverview || slStatus === 'loading') && (
              <>
                <div style={styles.statRow}>
                  {slStatus === 'loading' && (
                    <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', color: '#64748b', fontSize: '0.85rem' }}>
                      ⏳ Loading Smartlead campaigns... (may take 1-2 min)
                    </div>
                  )}
                  {slOverview && <>
                    <StatCard label="SL Campaigns" value={slOverview.totalCampaigns} color="#2563eb" />
                    <StatCard label="SL Total Leads" value={slOverview.totalLeads} color="#0ea5e9" />
                    <StatCard label="SL Opened" value={slOverview.totalOpened} sub={`${slOverview.avgOpenRate}% avg`} color="#22c55e" />
                    <StatCard label="SL Replied" value={slOverview.totalReplied} color="#f59e0b" />
                  </>}
                  {afOverview && <>
                    <StatCard label="AF Campaigns" value={afOverview.totalCampaigns} color="#6366f1" />
                    <StatCard label="AF Accepted" value={afOverview.totalAccepted} color="#22c55e" />
                    <StatCard label="AF Replies" value={afOverview.totalReplies} color="#f59e0b" />
                    <StatCard label="AF Conversations" value={afOverview.totalConversations} color="#8b5cf6" />
                  </>}
                </div>
                {afData?.segmentStats && (
                  <LinkedInStatCard segmentStats={afData.segmentStats} lastSynced={new Date().toLocaleString()} />
                )}
              </>
            )}
            {!loaded && <EmptyState onLoad={handleLoad} keys={keys} setKeys={setKeys} />}
          </>
        )}

        {/* ── SMARTLEAD ── */}
        {activeTab === 'Smartlead' && (
          <>
            {slError && <ErrorBox msg={slError} />}
            {slSummary?.length > 0 && (
              <SectionCard title="Smartlead Campaigns" badge={slSummary.length}>
                <PaginatedTable
                  columns={[
                    { key: 'campaign', label: 'Campaign' },
                    { key: 'segment', label: 'Segment' },
                    { key: 'total', label: 'Total', align: 'right' },
                    { key: 'opened', label: 'Opened', align: 'right' },
                    { key: 'openRate', label: 'Open %', align: 'right', render: v => <RateCell v={v} /> },
                    { key: 'replied', label: 'Replied', align: 'right' },
                    { key: 'replyRate', label: 'Reply %', align: 'right', render: v => <RateCell v={v} /> },
                    { key: 'bounced', label: 'Bounced', align: 'right', render: v => <span style={{ color: v > 0 ? '#dc2626' : '#374151' }}>{v}</span> },
                    { key: 'unsubscribed', label: 'Unsub', align: 'right' },
                  ]}
                  rows={slSummary}
                />
              </SectionCard>
            )}
          </>
        )}

        {/* ── AIMFOX ── */}
        {activeTab === 'AimFox' && (
          <>
            {afError && <ErrorBox msg={afError} />}
            {afData?.campaigns?.length > 0 && (
              <SectionCard title="AimFox Campaigns" badge={afData.campaigns.length}>
                <PaginatedTable
                  columns={[
                    { key: 'name', label: 'Campaign' },
                    { key: 'segment', label: 'Segment' },
                    { key: 'state', label: 'State', render: v => <StateBadge state={v} /> },
                    { key: 'targets', label: 'Targets', align: 'right' },
                    { key: 'completionPct', label: 'Done %', align: 'right', render: v => `${v}%` },
                    { key: 'accepted', label: 'Accepted', align: 'right', render: v => <span style={{ color: '#16a34a', fontWeight: 600 }}>{v}</span> },
                    { key: 'replies', label: 'Replies', align: 'right' },
                    { key: 'created', label: 'Created' },
                  ]}
                  rows={afData.campaigns}
                />
              </SectionCard>
            )}
            {afData?.conversations?.length > 0 && (
              <SectionCard title="Recent Conversations" badge={afData.conversations.length}>
                <PaginatedTable
                  columns={[
                    { key: 'leadName', label: 'Lead' },
                    { key: 'occupation', label: 'Occupation' },
                    { key: 'connected', label: 'Connected', render: v => v ? <span style={{ color: '#16a34a' }}>Yes</span> : <span style={{ color: '#94a3b8' }}>No</span> },
                    { key: 'msgCount', label: 'Messages', align: 'right' },
                    { key: 'unread', label: 'Unread', align: 'right' },
                  ]}
                  rows={afData.conversations}
                />
              </SectionCard>
            )}
          </>
        )}

        {/* ── POSITIVE LEADS ── */}
        {activeTab === 'Positive Leads' && (
          <PositiveLeadsTable
            smartleadLeads={slPositiveLeads || []}
            aimfoxLeads={afData?.positiveLeads || []}
          />
        )}

        {/* ── DRILL-DOWN ── */}
        {activeTab === 'Drill-down' && (
          <div>
            {slSummary?.length > 0 && (
              <SubSubDashboard campaigns={slSummary} source="smartlead" />
            )}
            {afData?.campaigns?.length > 0 && (
              <SubSubDashboard campaigns={afData.campaigns.map(c => ({ ...c, campaign: c.name, subCampaigns: [] }))} source="aimfox" />
            )}
          </div>
        )}

        {/* ── ZOHO SYNC ── */}
        {activeTab === 'Zoho Sync' && (
          <>
            <CredentialsForm onSubmit={startSync} loading={syncStatus === 'loading'} />
            <SyncLog log={log} status={syncStatus} error={syncError} summary={syncSummary} />
          </>
        )}
      </div>
    </div>
  );
}

function RateCell({ v }) {
  const color = v >= 20 ? '#16a34a' : v >= 10 ? '#ca8a04' : '#dc2626';
  return <span style={{ color, fontWeight: 600 }}>{v}%</span>;
}

function StateBadge({ state }) {
  const colors = { ACTIVE: '#16a34a', DONE: '#6366f1', INIT: '#f59e0b' };
  const color = colors[state] || '#94a3b8';
  return <span style={{ color, fontWeight: 600, fontSize: '0.8rem' }}>{state}</span>;
}

function ErrorBox({ msg }) {
  return <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>Error: {msg}</div>;
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
      <div style={{ fontWeight: 600, color: '#64748b' }}>Enter your API keys above to load the dashboard</div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '0.82rem', color: '#64748b', marginTop: 2 },
  keyForm: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  keyInput: { padding: '0.45rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', width: 200 },
  loadBtn: { padding: '0.45rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' },
  reloadBtn: { padding: '0.35rem 0.9rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', cursor: 'pointer' },
  tabBar: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', gap: '0', overflowX: 'auto' },
  tab: { padding: '0.75rem 1.25rem', border: 'none', borderBottom: '2px solid transparent', background: 'none', color: '#64748b', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { color: '#2563eb', borderBottomColor: '#2563eb', fontWeight: 600 },
  content: { maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' },
  statRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  loading: { textAlign: 'center', color: '#64748b', padding: '1.5rem', fontSize: '0.9rem' },
};
