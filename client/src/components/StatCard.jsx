import React from 'react';

export default function StatCard({ label, value, sub, color = '#2563eb', icon }) {
  return (
    <div style={styles.card}>
      {icon && <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>}
      <div style={{ ...styles.value, color }}>{value ?? '-'}</div>
      <div style={styles.label}>{label}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    minWidth: 120,
    flex: 1,
  },
  value: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 },
  label: { fontSize: '0.78rem', color: '#64748b', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' },
  sub: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },
};
