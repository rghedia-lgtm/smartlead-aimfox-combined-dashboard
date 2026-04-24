const express = require('express');
const router = express.Router();
const { sendReportEmail } = require('../services/mailer');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, BorderStyle } = require('docx');

// POST /api/export/email — send PDF (base64) via email
router.post('/email', async (req, res) => {
  const { to, subject, pdfBase64, filename } = req.body;
  if (!to || !pdfBase64) return res.status(400).json({ error: 'Missing to or pdfBase64' });

  try {
    const buffer = Buffer.from(pdfBase64, 'base64');
    await sendReportEmail({
      to,
      subject: subject || 'Campaign Dashboard Report',
      attachments: [{ filename: filename || 'report.pdf', content: buffer, contentType: 'application/pdf' }],
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/export/docx — generate and return DOCX
router.post('/docx', async (req, res) => {
  const { smartlead, aimfox } = req.body;

  try {
    const children = [
      new Paragraph({ text: 'Campaign Dashboard Report', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: `Generated: ${new Date().toLocaleString()}`, style: 'Normal' }),
      new Paragraph({ text: '' }),
    ];

    // Smartlead section
    if (smartlead?.summary?.length) {
      children.push(new Paragraph({ text: 'Smartlead Analytics', heading: HeadingLevel.HEADING_2 }));

      const headerRow = new TableRow({
        children: ['Campaign', 'Total', 'Opened', 'Open%', 'Replied', 'Reply%', 'Bounced'].map(
          (text) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] })
        ),
      });

      const rows = smartlead.summary.map(
        (r) => new TableRow({
          children: [r.campaign, String(r.total), String(r.opened), `${r.openRate}%`, String(r.replied), `${r.replyRate}%`, String(r.bounced)].map(
            (text) => new TableCell({ children: [new Paragraph(text)] })
          ),
        })
      );

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...rows],
      }));
      children.push(new Paragraph({ text: '' }));
    }

    // Aimfox section
    if (aimfox?.campaigns?.length) {
      children.push(new Paragraph({ text: 'AimFox Analytics', heading: HeadingLevel.HEADING_2 }));

      const headerRow = new TableRow({
        children: ['Campaign', 'State', 'Targets', 'Accepted', 'Replies', 'Segment'].map(
          (text) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] })
        ),
      });

      const rows = aimfox.campaigns.map(
        (r) => new TableRow({
          children: [r.name, r.state, String(r.targets), String(r.accepted), String(r.replies), r.segment].map(
            (text) => new TableCell({ children: [new Paragraph(text || '-')] })
          ),
        })
      );

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...rows],
      }));
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="campaign-report.docx"');
    res.send(buffer);
  } catch (err) {
    console.error('DOCX error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
