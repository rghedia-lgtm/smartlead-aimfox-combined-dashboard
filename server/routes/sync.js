const express = require('express');
const router = express.Router();
const { runSync } = require('../services/syncRunner');

router.post('/', async (req, res) => {
  const creds = req.body;

  const required = ['zohoClientId', 'zohoClientSecret', 'zohoRefreshToken', 'aimfoxApiKey'];
  const missing = required.filter((k) => !creds[k]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }

  try {
    const result = await runSync(creds);
    res.json(result);
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
