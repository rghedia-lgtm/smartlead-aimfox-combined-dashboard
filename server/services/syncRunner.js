const zoho = require('./zoho');
const aimfox = require('./aimfox');

const BATCH_SIZE = 50;
const REQUEST_TIMEOUT_MS = 10000;

async function runSync(creds, options = {}) {
  const batchSize = options.batchSize || BATCH_SIZE;
  const log = [];
  const push = (msg) => { log.push(msg); console.log(msg); };

  push('Fetching Zoho access token...');
  const accessToken = await zoho.getAccessToken(creds);

  push('Fetching AimFox campaigns...');
  const campaigns = await aimfox.getCampaigns(creds.aimfoxApiKey);
  push(`Found ${campaigns.length} AimFox campaigns.`);

  push(`Fetching leads from campaigns (up to ${batchSize})...`);
  const { leads: aimfoxLeads, campaignMap: leadCampaignMap } =
    await aimfox.getLeadsFromCampaigns(creds.aimfoxApiKey, campaigns, batchSize);
  push(`Processing ${aimfoxLeads.length} campaign leads.`);

  // Build campaign metrics map
  push('Fetching campaign metrics...');
  const metricsMap = {};
  for (const campaign of campaigns) {
    const metrics = await aimfox.getCampaignMetrics(creds.aimfoxApiKey, campaign.id);
    metricsMap[campaign.id] = { ...metrics, name: campaign.name };
  }

  let matched = 0;
  let updated = 0;
  let skipped = 0;
  let timedOut = 0;

  for (const aimfoxLead of aimfoxLeads) {
    const linkedinUrl = aimfoxLead.linkedin_url;
    const email = aimfoxLead.email || '';
    const firstName = (aimfoxLead.first_name || '').trim();
    const lastName = (aimfoxLead.last_name || '').trim();

    let zohoLead = null;
    let matchedBy = '';

    try {
      if (linkedinUrl) {
        zohoLead = await Promise.race([
          zoho.findLeadByLinkedIn(accessToken, linkedinUrl),
          timeout(REQUEST_TIMEOUT_MS, 'LinkedIn search timed out'),
        ]);
        if (zohoLead) matchedBy = 'LinkedIn';
      }
      if (!zohoLead && firstName && lastName) {
        zohoLead = await Promise.race([
          zoho.findLeadByName(accessToken, firstName, lastName, email || null),
          timeout(REQUEST_TIMEOUT_MS, 'Name search timed out'),
        ]);
        if (zohoLead) matchedBy = 'Name';
      }
      if (!zohoLead && email) {
        zohoLead = await Promise.race([
          zoho.findLeadByEmail(accessToken, email),
          timeout(REQUEST_TIMEOUT_MS, 'Email search timed out'),
        ]);
        if (zohoLead) matchedBy = 'Email';
      }
    } catch (err) {
      push(`Timeout/error for ${linkedinUrl || firstName}: ${err.message}`);
      timedOut++;
      continue;
    }

    if (!zohoLead) {
      skipped++;
      continue;
    }

    matched++;

    const campaign = leadCampaignMap[aimfoxLead.id];
    const metrics = campaign ? metricsMap[campaign.id] || {} : {};

    const leadStats = await aimfox.getLeadMessageStats(creds.aimfoxApiKey, aimfoxLead.id);

    const fields = {
      Aimfox_Connection_Status: aimfoxLead.origins?.[0]?.name || '',
      AimFox_Messages_Sent: leadStats.messagesSent,
      AimFox_Replied: leadStats.replied,
      AimFox_Profile_Views: metrics.views ?? 0,
      AimFox_Campaign: campaign?.name || '',
      Aimfox_Initiated_Date: aimfoxLead.first_scraped_date || null,
      Aimfox_Sent_Date: aimfoxLead.last_scraped_date || null,
    };

    try {
      await Promise.race([
        zoho.updateLead(accessToken, zohoLead.id, fields),
        timeout(REQUEST_TIMEOUT_MS, 'Update timed out'),
      ]);
      updated++;
      push(`Updated: ${zohoLead.First_Name} ${zohoLead.Last_Name} | Campaign: ${campaign?.name || 'unknown'} | Msgs: ${fields.AimFox_Messages_Sent} | Replies: ${fields.AimFox_Replied} [by ${matchedBy}]`);
    } catch (err) {
      push(`Failed to update ${zohoLead.id}: ${err.message}`);
      timedOut++;
    }
  }

  push(`Sync complete — Campaigns: ${campaigns.length} | Leads: ${aimfoxLeads.length} | Matched: ${matched} | Updated: ${updated} | Not in Zoho: ${skipped} | Timed out: ${timedOut}`);
  return { log, matched, updated, skipped, timedOut, total: aimfoxLeads.length };
}

function timeout(ms, message) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
}

module.exports = { runSync };
