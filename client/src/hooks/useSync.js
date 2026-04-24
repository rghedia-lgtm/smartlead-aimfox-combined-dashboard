import { useState } from 'react';
import { triggerSync } from '../api/zoho';

export function useSync() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  async function startSync(creds) {
    setStatus('loading');
    setLog([]);
    setSummary(null);
    setError(null);

    try {
      const result = await triggerSync(creds);
      setLog(result.log || []);
      setSummary({ matched: result.matched, updated: result.updated });
      setStatus('success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setLog([]);
    setSummary(null);
    setError(null);
  }

  return { status, log, summary, error, startSync, reset };
}
