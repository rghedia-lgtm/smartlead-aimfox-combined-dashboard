import React, { useState, useEffect } from 'react';
import { useSmartlead } from '../hooks/useSmartlead';

export default function SmartleadDashboard() {
  const { status, summary, error, runFetch } = useSmartlead();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => { if (d.smartleadApiKey) setApiKey(d.smartleadApiKey); })
      .catch(() => {});
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (apiKey) runFetch(apiKey);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Smartlead API Key</h2>
        <div style={styles.row}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Smartlead API key"
            style={{ ...styles.input, flex: 1 }}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!apiKey || status === 'loading'}
            style={styles.button}
          >
            {status === 'loading' ? 'Fetching...' : 'Fetch Analytics'}
          </button>
        </div>
      </form>

      {error && (
        <div style={styles.error}>Error: {error}</div>
      )}

      {status === 'loading' && (
        <div style={styles.loading}>Fetching campaign data — this may take a minute...</div>
      )}

      {status === 'success' && summary.length === 0 && (
        <div style={styles.empty}>No active campaigns matched the filter keywords.</div>
      )}

      {summary.length > 0 && (
        <div style={styles.tableWrap}>
          <div style={styles.tableHeader}>
            <span style={styles.tableTitle}>Campaign Analytics</span>
            <span style={styles.badge}>{summary.length} campaigns</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Campaign', 'Subsequence', 'Total', 'Opened', 'Open %', 'Replied', 'Reply %', 'Bounced', 'Unsub'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={{ ...styles.td, fontWeight: 500, maxWidth: 220, wordBreak: 'break-word' }}>{row.campaign}</td>
                    <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>{row.subsequence}</td>
                    <td style={styles.tdNum}>{row.total}</td>
                    <td style={styles.tdNum}>{row.opened}</td>
                    <td style={{ ...styles.tdNum, color: rateColor(row.openRate) }}>{row.openRate}%</td>
                    <td style={styles.tdNum}>{row.replied}</td>
                    <td style={{ ...styles.tdNum, color: rateColor(row.replyRate) }}>{row.replyRate}%</td>
                    <td style={{ ...styles.tdNum, color: row.bounced > 0 ? '#dc2626' : '#374151' }}>{row.bounced}</td>
                    <td style={{ ...styles.tdNum, color: row.unsubscribed > 0 ? '#f59e0b' : '#374151' }}>{row.unsubscribed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TotalsBar summary={summary} />
        </div>
      )}
    </div>
  );
}

function TotalsBar({ summary }) {
  const total = summary.reduce((a, r) => a + r.total, 0);
  const opened = summary.reduce((a, r) => a + r.opened, 0);
  const replied = summary.reduce((a, r) => a + r.replied, 0);
  const bounced = summary.reduce((a, r) => a + r.bounced, 0);
  const openRate = total ? Math.round((opened / total) * 1000) / 10 : 0;
  const replyRate = total ? Math.round((replied / total) * 1000) / 10 : 0;

  return (
    <div style={styles.totalsBar}>
      {[
        { label: 'Total Leads', value: total },
        { label: 'Opened', value: `${opened} (${openRate}%)` },
        { label: 'Replied', value: `${replied} (${replyRate}%)` },
        { label: 'Bounced', value: bounced },
      ].map(({ label, value }) => (
        <div key={label} style={styles.totalItem}>
          <span style={styles.totalLabel}>{label}</span>
          <span style={styles.totalValue}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function rateColor(rate) {
  if (rate >= 20) return '#16a34a';
  if (rate >= 10) return '#ca8a04';
  return '#dc2626';
}

const styles = {
  form: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  heading: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#333' },
  row: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '0.9rem',
    outline: 'none',
  },
  button: {
    padding: '0.5rem 1.25rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  loading: {
    color: '#6b7280',
    fontSize: '0.9rem',
    padding: '1rem',
    textAlign: 'center',
  },
  empty: {
    color: '#6b7280',
    fontSize: '0.9rem',
    padding: '1rem',
    textAlign: 'center',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  tableTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b' },
  badge: {
    background: '#eff6ff',
    color: '#2563eb',
    fontSize: '0.78rem',
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: 999,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    padding: '0.6rem 0.75rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#64748b',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  td: { padding: '0.6rem 0.75rem', color: '#374151', borderBottom: '1px solid #f1f5f9' },
  tdNum: { padding: '0.6rem 0.75rem', textAlign: 'right', color: '#374151', borderBottom: '1px solid #f1f5f9' },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#fafafa' },
  totalsBar: {
    display: 'flex',
    gap: '1.5rem',
    padding: '0.75rem 1.25rem',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  totalItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  totalLabel: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase' },
  totalValue: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
};
