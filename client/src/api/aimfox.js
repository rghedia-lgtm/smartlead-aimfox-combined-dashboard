import axios from 'axios';

export async function fetchAimfoxDashboard(apiKey) {
  const { data } = await axios.post('/api/aimfox/dashboard', { apiKey });
  return data;
}
