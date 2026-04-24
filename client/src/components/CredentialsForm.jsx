import React, { useState, useEffect } from 'react';

const FIELDS = [
  { key: 'zohoClientId',      label: 'Zoho Client ID',      type: 'text' },
  { key: 'zohoClientSecret',  label: 'Zoho Client Secret',  type: 'password' },
  { key: 'zohoRefreshToken',  label: 'Zoho Refresh Token',  type: 'password' },
  { key: 'aimfoxApiKey',      label: 'AimFox API Key',      type: 'password' },
];

export default function CredentialsForm({ onSubmit, loading }) {
  const [creds, setCreds] = useState({
    zohoClientId: '',
    zohoClientSecret: '',
    zohoRefreshToken: '',
    aimfoxApiKey: '',
  });

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.zohoClientId || data.aimfoxApiKey) {
          setCreds(data);
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setCreds((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(creds);
  }

  const isComplete = Object.values(creds).every(Boolean);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Credentials</h2>
      {FIELDS.map(({ key, label, type }) => (
        <div key={key} style={styles.field}>
          <label style={styles.label}>{label}</label>
          <input
            name={key}
            type={type}
            value={creds[key]}
            onChange={handleChange}
            placeholder={label}
            style={styles.input}
            autoComplete="off"
          />
        </div>
      ))}
      <button type="submit" disabled={!isComplete || loading} style={styles.button}>
        {loading ? 'Syncing...' : 'Run Sync'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  heading: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' },
  field: { marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 4, color: '#555' },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: '0.9rem',
    outline: 'none',
  },
  button: {
    marginTop: '0.75rem',
    width: '100%',
    padding: '0.6rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
