import axios from 'axios';

export async function sendEmail({ to, subject, pdfBase64, filename }) {
  const { data } = await axios.post('/api/export/email', { to, subject, pdfBase64, filename });
  return data;
}

export async function downloadDocx(payload) {
  const response = await axios.post('/api/export/docx', payload, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campaign-report.docx';
  a.click();
  window.URL.revokeObjectURL(url);
}
