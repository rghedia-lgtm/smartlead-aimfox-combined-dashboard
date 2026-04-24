import { useState } from 'react';
import { fetchSmartleadAnalytics } from '../api/smartlead';

export function useSmartlead() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState(null);

  async function runFetch(apiKey) {
    setStatus('loading');
    setSummary([]);
    setError(null);
    try {
      const result = await fetchSmartleadAnalytics(apiKey);
      setSummary(result.summary || []);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unknown error');
      setStatus('error');
    }
  }

  return { status, summary, error, runFetch };
}
