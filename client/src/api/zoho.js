import axios from 'axios';

const API = '/api';

export async function triggerSync(creds) {
  const { data } = await axios.post(`${API}/sync`, creds);
  return data;
}
