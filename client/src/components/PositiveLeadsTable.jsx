import React, { useState } from 'react';
import SectionCard from './SectionCard';
import PaginatedTable from './PaginatedTable';

const STATUS_COLOR = {
  'Interested': '#16a34a',
  'Meeting Request': '#2563eb',
  'Information Request': '#f59e0b',
  'Connection Accepted': '#22c55e',
};

export default function PositiveLeadsTable({ smartleadLeads = [], aimfoxLeads = [] }) {
  const [tab, setTab] = useState('smartlead');

  const slColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'campaign', label: 'Campaign' },
    { key: 'segment', label: 'Segment' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'conversationSummary', label: 'Summary', render: (v) => <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{v}</span> },
    { key: 'replyTime', label: 'Replied On' },
  ];

  const afColumns = [
    { key: 'name', label: 'Name' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'campaign', label: 'Campaign' },
    { key: 'segment', label: 'Segment' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date' },
  ];

  const total = (tab === 'smartlead' ? smartleadLeads : aimfoxLeads).length;

  return (
    <SectionCard title="Positive Leads" badge={total}>
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'smartlead' ? styles.tabActive : {}) }} onClick={() => setTab('smartlead')}>
          Smartlead ({smartleadLeads.length})
        </button>
        <button style={{ ...styles.tab, ...(tab === 'aimfox' ? styles.tabActive : {}) }} onClick={() => setTab('aimfox')}>
          AimFox ({aimfoxLeads.length})
        </button>
      </div>
      <PaginatedTable
        columns={tab === 'smartlead' ? slColumns : afColumns}
        rows={tab === 'smartlead' ? smartleadLeads : aimfoxLeads}
      />
    </SectionCard>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b';
  return (
    <span style={{ background: `${color}18`, color, fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>
      {status}
    </span>
  );
}

const styles = {
  tabs: { display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem 0' },
  tab: { padding: '0.35rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
};
