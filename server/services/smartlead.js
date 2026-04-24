const axios = require('axios');

const BASE_URL = 'https://server.smartlead.ai/api/v1';
const KEYWORDS = ['Kendra', 'Nexus', 'FEAAM', 'KM', 'Henig', 'Wastestream', 'Stanford G'];

function matches(name) {
  return KEYWORDS.some((kw) => name.toLowerCase().includes(kw.toLowerCase()));
}

async function getAllCampaigns(apiKey) {
  const { data } = await axios.get(`${BASE_URL}/campaigns?api_key=${apiKey}`, { timeout: 15000 });
  return data || [];
}

async function getCampaignStats(apiKey, campaignId) {
  const limit = 100;
  let offset = 0;
  const all = [];

  while (true) {
    const url = `${BASE_URL}/campaigns/${campaignId}/statistics?api_key=${apiKey}&limit=${limit}&offset=${offset}`;
    const { data } = await axios.get(url, { timeout: 30000 });
    const rows = data.data || [];
    all.push(...rows);
    const total = parseInt(data.total_stats || 0, 10);
    offset += limit;
    if (offset >= total) break;
  }

  return all;
}

async function fetchAnalytics(apiKey) {
  const allCampaigns = await getAllCampaigns(apiKey);

  const parentToSubs = {};
  for (const c of allCampaigns) {
    if (c.parent_campaign_id) {
      if (!parentToSubs[c.parent_campaign_id]) parentToSubs[c.parent_campaign_id] = [];
      parentToSubs[c.parent_campaign_id].push(c);
    }
  }

  const targets = allCampaigns.filter(
    (c) => matches(c.name) && !c.parent_campaign_id && c.status === 'ACTIVE'
  );

  const summary = [];

  for (const campaign of targets) {
    let stats = [];
    try {
      stats = await getCampaignStats(apiKey, campaign.id);
    } catch (err) {
      stats = [];
    }

    const total = stats.length;
    const opened = stats.filter((s) => s.open_time && !s.reply_time && !s.is_unsubscribed && !s.is_bounced).length;
    const replied = stats.filter((s) => s.reply_time).length;
    const bounced = stats.filter((s) => s.is_bounced).length;
    const unsubscribed = stats.filter((s) => s.is_unsubscribed).length;
    const subs = (parentToSubs[campaign.id] || []).filter((s) => s.status === 'ACTIVE');

    summary.push({
      campaign: campaign.name,
      subsequence: subs.map((s) => s.name).join(', ') || 'None',
      total,
      opened,
      openRate: total ? Math.round((opened / total) * 1000) / 10 : 0,
      replied,
      replyRate: total ? Math.round((replied / total) * 1000) / 10 : 0,
      bounced,
      unsubscribed,
    });
  }

  return summary;
}

module.exports = { fetchAnalytics };
