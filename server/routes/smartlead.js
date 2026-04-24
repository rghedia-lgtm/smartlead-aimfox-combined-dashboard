const express = require('express');
const router = express.Router();
const { fetchAnalytics } = require('../services/smartlead');

router.post('/', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing Smartlead API key' });

  try {
    const summary = await fetchAnalytics(apiKey);
    res.json({ summary });
  } catch (err) {
    console.error('Smartlead error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
