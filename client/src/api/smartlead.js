import axios from 'axios';

const API = '/api';

export async function fetchSmartleadAnalytics(apiKey) {
  const { data } = await axios.post(`${API}/smartlead`, { apiKey });
  return data;
}
