import React from 'react';

export default function PreviewTable({ matched }) {
  if (!matched || matched.length === 0) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Matched Leads Preview</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Name', 'Email', 'Campaign', 'Connection', 'Msgs Sent', 'Replied', 'Profile Views'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matched.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{row.name}</td>
                <td style={styles.td}>{row.email}</td>
                <td style={styles.td}>{row.campaignName}</td>
                <td style={styles.td}>{row.connectionStatus}</td>
                <td style={styles.td}>{row.messagesSent}</td>
                <td style={styles.td}>{row.replied}</td>
                <td style={styles.td}>{row.profileViews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  heading: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#333' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    background: '#f8fafc',
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: { padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', color: '#4b5563' },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#f8fafc' },
};
