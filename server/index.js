require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const syncRouter = require('./routes/sync');
const smartleadRouter = require('./routes/smartlead');
const aimfoxRouter = require('./routes/aimfox');
const exportRouter = require('./routes/export');
require('./jobs/cronSync');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/api/sync', syncRouter);
app.use('/api/smartlead', smartleadRouter);
app.use('/api/aimfox', aimfoxRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/config', (_req, res) => {
  res.json({
    zohoClientId: process.env.ZOHO_CLIENT_ID || '',
    zohoClientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    zohoRefreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
    aimfoxApiKey: process.env.AIMFOX_API_KEY || '',
    smartleadApiKey: process.env.SMARTLEAD_API_KEY || '',
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
