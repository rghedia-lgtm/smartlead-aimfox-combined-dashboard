import React from 'react';

export default function SectionCard({ title, badge, children, action }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.left}>
          <span style={styles.title}>{title}</span>
          {badge !== undefined && <span style={styles.badge}>{badge}</span>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid #f1f5f9' },
  left: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  title: { fontSize: '1rem', fontWeight: 600, color: '#1e293b' },
  badge: { background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 999 },
};
