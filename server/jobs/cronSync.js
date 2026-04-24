const cron = require('node-cron');
const { runSync } = require('../services/syncRunner');

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 6 * * *'; // daily at 6am

const envCreds = {
  zohoClientId: process.env.ZOHO_CLIENT_ID,
  zohoClientSecret: process.env.ZOHO_CLIENT_SECRET,
  zohoRefreshToken: process.env.ZOHO_REFRESH_TOKEN,
  aimfoxApiKey: process.env.AIMFOX_API_KEY,
};

const hasEnvCreds = Object.values(envCreds).every(Boolean);

if (hasEnvCreds) {
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[cron] Starting scheduled sync at ${new Date().toISOString()}`);
    try {
      const result = await runSync(envCreds);
      console.log(`[cron] Sync done. Updated: ${result.updated}`);
    } catch (err) {
      console.error('[cron] Sync failed:', err.message);
    }
  });

  console.log(`[cron] Scheduled sync enabled: ${CRON_SCHEDULE}`);
} else {
  console.log('[cron] No env credentials found — scheduled sync disabled.');
}
