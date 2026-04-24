import React from 'react';
import SectionCard from './SectionCard';

const SEG_COLORS = {
  Kendra: '#6366f1', Nexus: '#0ea5e9', FEAAM: '#22c55e',
  KM: '#f59e0b', Henig: '#ec4899', Wastestream: '#14b8a6', 'Stanford G': '#8b5cf6',
};

export default function LinkedInStatCard({ segmentStats = [], lastSynced }) {
  return (
    <SectionCard
      title="LinkedIn Segment Stats"
      badge={`${segmentStats.length} segments`}
      action={lastSynced && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last synced: {lastSynced}</span>}
    >
      <div style={styles.grid}>
        {segmentStats.map((seg) => (
          <div key={seg.segment} style={styles.segCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ ...styles.dot, background: SEG_COLORS[seg.segment] || '#64748b' }} />
              <span style={styles.segName}>{seg.segment}</span>
              {seg.activeCampaigns?.length > 0 && (
                <span style={styles.activeBadge}>{seg.activeCampaigns.length} active</span>
              )}
            </div>
            <div style={styles.metrics}>
              <div style={styles.metric}>
                <span style={styles.metricVal}>{seg.targets ?? 0}</span>
                <span style={styles.metricLbl}>Targeted</span>
              </div>
              <div style={styles.metric}>
                <span style={{ ...styles.metricVal, color: '#22c55e' }}>{seg.accepted ?? 0}</span>
                <span style={styles.metricLbl}>Accepted</span>
              </div>
              <div style={styles.metric}>
                <span style={{ ...styles.metricVal, color: '#f59e0b' }}>{seg.replies ?? 0}</span>
                <span style={styles.metricLbl}>Replies</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricVal}>{seg.campaigns ?? 0}</span>
                <span style={styles.metricLbl}>Campaigns</span>
              </div>
            </div>
            {seg.activeCampaigns?.length > 0 && (
              <div style={styles.subList}>
                {seg.activeCampaigns.slice(0, 3).map((name, i) => (
                  <div key={i} style={styles.subItem}>• {name}</div>
                ))}
                {seg.activeCampaigns.length > 3 && (
                  <div style={{ ...styles.subItem, color: '#94a3b8' }}>+{seg.activeCampaigns.length - 3} more</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', padding: '1rem' },
  segCard: { background: '#f8fafc', borderRadius: 8, padding: '0.875rem', border: '1px solid #e2e8f0' },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  segName: { fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' },
  activeBadge: { background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 600, padding: '1px 7px', borderRadius: 999, marginLeft: 'auto' },
  metrics: { display: 'flex', gap: '0.5rem', justifyContent: 'space-between' },
  metric: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  metricVal: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' },
  metricLbl: { fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: 1 },
  subList: { marginTop: 8, borderTop: '1px solid #e2e8f0', paddingTop: 6 },
  subItem: { fontSize: '0.72rem', color: '#64748b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
