const axios = require('axios');

const BASE_URL = 'https://server.smartlead.ai/api/v1';
const KEYWORDS = ['Kendra', 'Nexus', 'FEAAM', 'KM', 'Henig', 'Wastestream', 'Stanford G'];
const POSITIVE_CATEGORIES = ['information request', 'meeting request', 'interested'];

function matches(name) {
  return KEYWORDS.some((kw) => name.toLowerCase().includes(kw.toLowerCase()));
}

function getSegment(name) {
  return KEYWORDS.find((kw) => name && name.toLowerCase().includes(kw.toLowerCase())) || 'Other';
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
  const positiveLeads = [];

  for (const campaign of targets) {
    let stats = [];
    try { stats = await getCampaignStats(apiKey, campaign.id); } catch { stats = []; }

    const subs = (parentToSubs[campaign.id] || []).filter((s) => s.status === 'ACTIVE');
    const subSubMap = {};
    for (const sub of subs) {
      subSubMap[sub.id] = (parentToSubs[sub.id] || []).filter((s) => s.status === 'ACTIVE');
    }

    const total = stats.length;
    const opened = stats.filter((s) => s.open_time && !s.reply_time && !s.is_unsubscribed && !s.is_bounced).length;
    const replied = stats.filter((s) => s.reply_time).length;
    const bounced = stats.filter((s) => s.is_bounced).length;
    const unsubscribed = stats.filter((s) => s.is_unsubscribed).length;

    summary.push({
      id: campaign.id,
      campaign: campaign.name,
      segment: getSegment(campaign.name),
      subsequence: subs.map((s) => s.name).join(', ') || 'None',
      subCampaigns: subs.map((s) => ({
        id: s.id,
        name: s.name,
        subSubs: subSubMap[s.id]?.map((ss) => ({ id: ss.id, name: ss.name })) || [],
      })),
      total,
      opened,
      openRate: total ? Math.round((opened / total) * 1000) / 10 : 0,
      replied,
      replyRate: total ? Math.round((replied / total) * 1000) / 10 : 0,
      bounced,
      unsubscribed,
    });

    // Positive leads: reply_time + positive category
    const positive = stats.filter(
      (s) =>
        s.reply_time &&
        s.lead_category &&
        POSITIVE_CATEGORIES.includes(s.lead_category.toLowerCase())
    );
    for (const lead of positive) {
      positiveLeads.push({
        name: lead.lead_name || '-',
        email: lead.lead_email || '-',
        campaign: campaign.name,
        segment: getSegment(campaign.name),
        category: lead.lead_category || '-',
        openTime: (lead.open_time || '').slice(0, 10),
        replyTime: (lead.reply_time || '').slice(0, 10),
        status: lead.lead_category || 'Positive',
        conversationSummary: `Replied on ${(lead.reply_time || '').slice(0, 10)}. Category: ${lead.lead_category || 'N/A'}`,
      });
    }
  }

  const overview = {
    totalCampaigns: summary.length,
    totalLeads: summary.reduce((a, c) => a + c.total, 0),
    totalOpened: summary.reduce((a, c) => a + c.opened, 0),
    totalReplied: summary.reduce((a, c) => a + c.replied, 0),
    totalBounced: summary.reduce((a, c) => a + c.bounced, 0),
    avgOpenRate: summary.length ? Math.round(summary.reduce((a, c) => a + c.openRate, 0) / summary.length * 10) / 10 : 0,
    avgReplyRate: summary.length ? Math.round(summary.reduce((a, c) => a + c.replyRate, 0) / summary.length * 10) / 10 : 0,
  };

  return { summary, positiveLeads, overview };
}

module.exports = { fetchAnalytics };
