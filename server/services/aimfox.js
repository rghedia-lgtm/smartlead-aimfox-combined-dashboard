const axios = require('axios');

const BASE_URL = 'https://api.aimfox.com/api/v2';

function client(apiKey) {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 10000,
  });
}

async function getCampaigns(apiKey) {
  const { data } = await client(apiKey).get('/campaigns');
  return data.campaigns || [];
}

async function getCampaignMetrics(apiKey, campaignId) {
  const { data } = await client(apiKey).get(`/campaigns/${campaignId}/metrics`);
  return data.metrics || {};
}

async function getLeadDetails(apiKey, leadId) {
  try {
    const { data } = await client(apiKey).get(`/leads/${leadId}`);
    return data.lead || null;
  } catch {
    return null;
  }
}

async function getLeadMessageStats(apiKey, leadId) {
  try {
    const { data } = await client(apiKey).get('/conversations', {
      params: { lead_id: leadId },
    });
    const conversations = data.conversations || [];
    let messagesSent = 0;
    let replied = 0;
    for (const conv of conversations) {
      if (conv.sender && conv.sender.account_id) {
        messagesSent++;
      }
      if (conv.unread_count > 0) {
        replied++;
      }
    }
    return { messagesSent, replied };
  } catch {
    return { messagesSent: 0, replied: 0 };
  }
}

async function searchLeads(apiKey, start = 0, count = 50, campaignId = null) {
  const body = { search: '' };
  if (campaignId) body.campaign_id = campaignId;

  const { data } = await client(apiKey).post(
    `/leads:search?start=${start}&count=${count}`,
    body,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data.leads || [];
}

function toDateString(isoString) {
  if (!isoString) return null;
  return isoString.split('T')[0];
}

// Fetch leads only from campaigns, deduplicated, up to limit.
// Returns { leads: enrichedLeads[], campaignMap: { leadId -> campaign } }
async function getLeadsFromCampaigns(apiKey, campaigns, limit = 50) {
  const seen = new Map(); // leadId -> { lead, campaign }

  for (const campaign of campaigns) {
    if (seen.size >= limit) break;
    try {
      const leads = await searchLeads(apiKey, 0, limit, campaign.id);
      for (const lead of leads) {
        if (!seen.has(lead.id)) {
          seen.set(lead.id, { lead, campaign });
        }
        if (seen.size >= limit) break;
      }
    } catch {
      // skip campaign on error
    }
  }

  const enriched = [];
  const campaignMap = {};

  for (const [leadId, { lead, campaign }] of seen) {
    const details = await getLeadDetails(apiKey, lead.id);
    enriched.push({
      ...lead,
      linkedin_url: lead.public_identifier
        ? `https://www.linkedin.com/in/${lead.public_identifier}`
        : null,
      first_scraped_date: toDateString(details?.first_scraped_at),
      last_scraped_date: toDateString(details?.last_scraped_at),
    });
    campaignMap[leadId] = campaign;
  }

  return { leads: enriched, campaignMap };
}

module.exports = { getCampaigns, getCampaignMetrics, getLeadsFromCampaigns, getLeadMessageStats };
