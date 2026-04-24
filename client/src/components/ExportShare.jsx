import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sendEmail, downloadDocx } from '../api/exportApi';

export default function ExportShare({ smartleadData, aimfoxData, contentRef }) {
  const [emailModal, setEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [exporting, setExporting] = useState(false);

  async function handlePDF() {
    setExporting(true);
    try {
      const el = contentRef?.current || document.getElementById('dashboard-content');
      const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let y = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      while (y < pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight);
        y += pageHeight;
        if (y < pdfHeight) pdf.addPage();
      }
      pdf.save('campaign-report.pdf');
    } catch (e) {
      alert('PDF export failed: ' + e.message);
    }
    setExporting(false);
  }

  async function handleDocx() {
    setExporting(true);
    try {
      await downloadDocx({ smartlead: smartleadData, aimfox: aimfoxData });
    } catch (e) {
      alert('DOCX export failed: ' + e.message);
    }
    setExporting(false);
  }

  async function handleSendEmail() {
    if (!emailTo) return;
    setSending(true);
    setMsg('');
    try {
      const el = contentRef?.current || document.getElementById('dashboard-content');
      const canvas = await html2canvas(el, { scale: 1.2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      await sendEmail({ to: emailTo, subject: 'Campaign Dashboard Report', pdfBase64, filename: 'campaign-report.pdf' });
      setMsg('Email sent successfully!');
      setTimeout(() => { setEmailModal(false); setMsg(''); }, 2000);
    } catch (e) {
      setMsg('Failed: ' + (e.response?.data?.error || e.message));
    }
    setSending(false);
  }

  return (
    <>
      <div style={styles.bar}>
        <span style={styles.label}>Export / Share:</span>
        <button style={styles.btn} onClick={handlePDF} disabled={exporting}>
          {exporting ? '...' : 'Download PDF'}
        </button>
        <button style={styles.btn} onClick={handleDocx} disabled={exporting}>
          {exporting ? '...' : 'Download DOCX'}
        </button>
        <button style={{ ...styles.btn, ...styles.shareBtn }} onClick={() => setEmailModal(true)}>
          Share via Email
        </button>
      </div>

      {emailModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Share Report via Email</h3>
            <p style={styles.modalSub}>A PDF of the current dashboard will be attached.</p>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="Recipient email address"
              style={styles.input}
            />
            {msg && <div style={{ color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{msg}</div>}
            <div style={styles.modalBtns}>
              <button style={styles.btn} onClick={() => { setEmailModal(false); setMsg(''); }}>Cancel</button>
              <button style={{ ...styles.btn, ...styles.shareBtn }} onClick={handleSendEmail} disabled={sending || !emailTo}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bar: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  label: { fontSize: '0.82rem', color: '#64748b', fontWeight: 500 },
  btn: { padding: '0.4rem 1rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#374151', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  shareBtn: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' },
  modalSub: { fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
};
