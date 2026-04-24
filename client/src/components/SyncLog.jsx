import React, { useEffect, useRef } from 'react';

export default function SyncLog({ log, status, error, summary }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  if (status === 'idle') return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sync Log</h2>
      <div style={styles.logBox}>
        {log.map((line, i) => (
          <div key={i} style={styles.line}>{line}</div>
        ))}
        {status === 'loading' && (
          <div style={{ ...styles.line, color: '#6b7280' }}>Running...</div>
        )}
        {error && (
          <div style={{ ...styles.line, color: '#dc2626' }}>Error: {error}</div>
        )}
        <div ref={bottomRef} />
      </div>
      {summary && (
        <div style={styles.summary}>
          Matched: <strong>{summary.matched}</strong> &nbsp;|&nbsp; Updated: <strong>{summary.updated}</strong>
        </div>
      )}
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
  logBox: {
    background: '#0f172a',
    borderRadius: 6,
    padding: '0.75rem 1rem',
    maxHeight: 300,
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.82rem',
  },
  line: { color: '#86efac', marginBottom: 2, whiteSpace: 'pre-wrap' },
  summary: {
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    color: '#374151',
    padding: '0.5rem 0.75rem',
    background: '#f0fdf4',
    borderRadius: 6,
    border: '1px solid #bbf7d0',
  },
};
