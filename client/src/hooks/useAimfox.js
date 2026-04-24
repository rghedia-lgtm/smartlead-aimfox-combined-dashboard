import { useState } from 'react';
import { fetchAimfoxDashboard } from '../api/aimfox';

export function useAimfox() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function load(apiKey) {
    setStatus('loading');
    setError(null);
    try {
      const result = await fetchAimfoxDashboard(apiKey);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus('error');
    }
  }

  return { status, data, error, load };
}
