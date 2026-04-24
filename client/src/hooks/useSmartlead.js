import { useState } from 'react';
import { fetchSmartleadAnalytics } from '../api/smartlead';

export function useSmartlead() {
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState([]);
  const [positiveLeads, setPositiveLeads] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  async function runFetch(apiKey) {
    setStatus('loading');
    setSummary([]);
    setPositiveLeads([]);
    setOverview(null);
    setError(null);
    try {
      const result = await fetchSmartleadAnalytics(apiKey);
      setSummary(result.summary || []);
      setPositiveLeads(result.positiveLeads || []);
      setOverview(result.overview || null);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unknown error');
      setStatus('error');
    }
  }

  return { status, summary, positiveLeads, overview, error, runFetch };
}
