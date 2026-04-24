const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/devices.json');

function load() {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    if (!fs.existsSync(STORE_PATH)) return new Set();
    const { devices } = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    return new Set(devices || []);
  } catch {
    return new Set();
  }
}

function save(set) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify({ devices: [...set] }, null, 2));
  } catch (err) {
    console.error('Failed to save device store:', err.message);
  }
}

const authorizedDevices = load();

function authorize(deviceId) {
  authorizedDevices.add(deviceId);
  save(authorizedDevices);
}

function isAuthorized(deviceId) {
  return authorizedDevices.has(deviceId);
}

function revoke(deviceId) {
  authorizedDevices.delete(deviceId);
  save(authorizedDevices);
}

function revokeAll() {
  authorizedDevices.clear();
  save(authorizedDevices);
}

function list() {
  return [...authorizedDevices];
}

module.exports = { authorize, isAuthorized, revoke, revokeAll, list };
