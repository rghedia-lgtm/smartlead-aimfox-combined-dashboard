const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOtp } = require('../services/mailer');
const deviceStore = require('../services/deviceStore');

// In-memory OTP store: { otp, expiresAt }
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateDeviceId() {
  return crypto.randomBytes(32).toString('hex');
}

// POST /api/auth/login — step 1: validate password
router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  // Admin bypass — direct access, no OTP, no device restriction
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '365d' });
    return res.json({ token, requiresOtp: false });
  }

  // Client password check
  if (password !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Check if max devices reached (default: 3)
  const maxDevices = parseInt(process.env.MAX_DEVICES || '3', 10);
  if (deviceStore.list().length >= maxDevices) {
    return res.status(403).json({
      error: 'Maximum authorized devices reached. Contact the dashboard owner to revoke access.',
    });
  }

  // Generate and email OTP
  const otp = generateOtp();
  otpStore.set('pending', { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  try {
    await sendOtp(otp);
    res.json({ requiresOtp: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Check email configuration.' });
  }
});

// POST /api/auth/verify-otp — step 2: validate OTP, issue device token
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  const stored = otpStore.get('pending');

  if (!stored) return res.status(400).json({ error: 'No pending OTP. Please login again.' });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete('pending');
    return res.status(400).json({ error: 'OTP expired. Please login again.' });
  }
  if (otp !== stored.otp) {
    return res.status(401).json({ error: 'Incorrect OTP' });
  }

  otpStore.delete('pending');

  const deviceId = generateDeviceId();
  deviceStore.authorize(deviceId);

  const token = jwt.sign({ deviceId, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '90d' });
  res.json({ token });
});

// GET /api/auth/verify — validate token + check device is still authorized
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Admin tokens bypass device check
    if (payload.role === 'admin') return res.json({ valid: true, role: 'admin' });

    // Client tokens must have device still authorized
    if (!deviceStore.isAuthorized(payload.deviceId)) {
      return res.status(401).json({ valid: false, error: 'Device no longer authorized' });
    }

    res.json({ valid: true, role: 'client' });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// POST /api/auth/revoke — admin can revoke a device or all devices
router.post('/revoke', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { deviceId, all } = req.body;
  if (all) {
    deviceStore.revokeAll();
    return res.json({ message: 'All devices revoked' });
  }
  if (deviceId) {
    deviceStore.revoke(deviceId);
    return res.json({ message: 'Device revoked' });
  }
  res.status(400).json({ error: 'Provide deviceId or all:true' });
});

// GET /api/auth/devices — admin: list authorized devices
router.get('/devices', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ devices: deviceStore.list(), count: deviceStore.list().length });
});

module.exports = router;
