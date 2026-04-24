import React, { useState } from 'react';

const PAGE_SIZE = 5;

export default function PaginatedTable({ columns, rows, onRowClick }) {
  const [page, setPage] = useState(0);
  const total = rows.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const slice = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ ...styles.th, textAlign: col.align || 'left' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>
            ) : (
              slice.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', cursor: onRowClick ? 'pointer' : 'default' }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ ...styles.td, textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={styles.pageInfo}>{page + 1} / {totalPages} &nbsp;({total} total)</span>
          <button style={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    padding: '0.6rem 0.75rem',
    fontWeight: 600,
    color: '#64748b',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: { padding: '0.65rem 0.75rem', color: '#374151', borderBottom: '1px solid #f1f5f9' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 0.75rem 0.25rem' },
  pageBtn: {
    padding: '0.35rem 0.9rem',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    background: '#fff',
    color: '#374151',
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  pageInfo: { fontSize: '0.82rem', color: '#64748b' },
};
