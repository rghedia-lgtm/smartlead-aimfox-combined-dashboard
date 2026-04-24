const express = require('express');
const router = express.Router();
const { fetchFullDashboard } = require('../services/aimfoxDashboard');

router.post('/dashboard', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing Aimfox API key' });
  try {
    const data = await fetchFullDashboard(apiKey);
    res.json(data);
  } catch (err) {
    console.error('Aimfox dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
