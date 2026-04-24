import React, { useState } from 'react';
import SectionCard from './SectionCard';
import PaginatedTable from './PaginatedTable';

export default function SubSubDashboard({ campaigns = [], source = 'smartlead' }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Level 1 — parent campaigns
  if (!selectedCampaign) {
    const columns = [
      { key: 'campaign', label: 'Campaign' },
      { key: 'segment', label: 'Segment' },
      source === 'smartlead'
        ? { key: 'total', label: 'Total Leads', align: 'right' }
        : { key: 'targets', label: 'Targets', align: 'right' },
      source === 'smartlead'
        ? { key: 'replyRate', label: 'Reply %', align: 'right', render: (v) => `${v}%` }
        : { key: 'accepted', label: 'Accepted', align: 'right' },
      {
        key: '_drill',
        label: '',
        render: (_, row) =>
          (row.subCampaigns?.length > 0 || row.subSubs?.length > 0) ? (
            <button style={drillBtn} onClick={(e) => { e.stopPropagation(); setSelectedCampaign(row); }}>
              View Sub →
            </button>
          ) : null,
      },
    ];

    return (
      <SectionCard title={`${source === 'smartlead' ? 'Smartlead' : 'AimFox'} Campaign Drill-down`} badge={campaigns.length}>
        <PaginatedTable columns={columns} rows={campaigns} onRowClick={setSelectedCampaign} />
      </SectionCard>
    );
  }

  // Level 2 — sub-campaigns
  const subs = selectedCampaign.subCampaigns || [];
  if (!selectedSub) {
    return (
      <SectionCard
        title={selectedCampaign.campaign || selectedCampaign.name}
        badge={`${subs.length} sub-campaigns`}
        action={
          <button style={backBtn} onClick={() => setSelectedCampaign(null)}>← Back</button>
        }
      >
        {subs.length === 0 ? (
          <div style={{ padding: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>No sub-campaigns found.</div>
        ) : (
          <PaginatedTable
            columns={[
              { key: 'name', label: 'Sub-Campaign' },
              {
                key: '_drill',
                label: '',
                render: (_, row) =>
                  row.subSubs?.length > 0 ? (
                    <button style={drillBtn} onClick={(e) => { e.stopPropagation(); setSelectedSub(row); }}>
                      View Sub-Sub →
                    </button>
                  ) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No sub-subs</span>,
              },
            ]}
            rows={subs}
            onRowClick={setSelectedSub}
          />
        )}
      </SectionCard>
    );
  }

  // Level 3 — sub-sub campaigns
  const subSubs = selectedSub.subSubs || [];
  return (
    <SectionCard
      title={selectedSub.name}
      badge={`${subSubs.length} sub-sub campaigns`}
      action={
        <button style={backBtn} onClick={() => setSelectedSub(null)}>← Back</button>
      }
    >
      {subSubs.length === 0 ? (
        <div style={{ padding: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>No sub-sub campaigns found.</div>
      ) : (
        <PaginatedTable
          columns={[{ key: 'name', label: 'Sub-Sub Campaign' }]}
          rows={subSubs}
        />
      )}
    </SectionCard>
  );
}

const drillBtn = {
  padding: '0.25rem 0.7rem', background: '#eff6ff', color: '#2563eb',
  border: '1px solid #bfdbfe', borderRadius: 5, fontSize: '0.75rem',
  fontWeight: 600, cursor: 'pointer',
};

const backBtn = {
  padding: '0.3rem 0.8rem', background: '#fff', color: '#64748b',
  border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem',
  cursor: 'pointer', fontWeight: 500,
};
