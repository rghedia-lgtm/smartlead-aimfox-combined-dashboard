import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onAuthenticated }) {
  const [step, setStep] = useState('password'); // password | otp
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { password });
      if (data.token) {
        // Admin — no OTP needed
        localStorage.setItem('auth_token', data.token);
        onAuthenticated();
      } else if (data.requiresOtp) {
        setStep('otp');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { otp });
      localStorage.setItem('auth_token', data.token);
      onAuthenticated();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📊</div>
        <h1 style={styles.title}>Campaign Dashboard</h1>

        {step === 'password' && (
          <>
            <p style={styles.subtitle}>Enter your password to continue</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={styles.input}
                autoFocus
                autoComplete="current-password"
              />
              {error && <div style={styles.error}>{error}</div>}
              <button type="submit" disabled={!password || loading} style={styles.button}>
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <p style={styles.subtitle}>
              A 6-digit code has been sent to the owner's email.
              <br />
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Code expires in 10 minutes.</span>
            </p>
            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ ...styles.input, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' }}
                autoFocus
                maxLength={6}
                inputMode="numeric"
              />
              {error && <div style={styles.error}>{error}</div>}
              <button type="submit" disabled={otp.length !== 6 || loading} style={styles.button}>
                {loading ? 'Verifying...' : 'Authorize Device'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('password'); setOtp(''); setError(''); }}
                style={styles.backButton}
              >
                Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '2.5rem 2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
  },
  logo: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '0.5rem',
  },
  backButton: {
    width: '100%',
    padding: '0.6rem',
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    marginBottom: '0.75rem',
    textAlign: 'left',
  },
};
