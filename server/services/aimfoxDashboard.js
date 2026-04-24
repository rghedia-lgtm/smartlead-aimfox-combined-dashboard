const axios = require('axios');

const BASE_URL = 'https://api.aimfox.com/api/v2';
const SEGMENTS = ['Kendra', 'Nexus', 'FEAAM', 'KM', 'Henig', 'Wastestream', 'Stanford G'];

function client(apiKey) {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 15000,
  });
}

function getSegment(name) {
  return SEGMENTS.find((s) => name && name.toLowerCase().includes(s.toLowerCase())) || 'Other';
}

async function fetchAccounts(apiKey) {
  try {
    const { data } = await client(apiKey).get('/accounts');
    return data.accounts || [];
  } catch { return []; }
}

async function fetchCampaigns(apiKey) {
  try {
    const { data } = await client(apiKey).get('/campaigns');
    return data.campaigns || [];
  } catch { return []; }
}

async function fetchRecentLeads(apiKey) {
  try {
    const { data } = await client(apiKey).get('/analytics/recent-leads');
    return data.leads || [];
  } catch { return []; }
}

async function fetchConversations(apiKey) {
  try {
    const { data } = await client(apiKey).get('/conversations');
    return data.conversations || [];
  } catch { return []; }
}

async function fetchConversationMessages(apiKey, accountId, conversationUrn) {
  try {
    const { data } = await client(apiKey).get(
      `/accounts/${accountId}/conversations/${conversationUrn}`
    );
    return data.messages || [];
  } catch { return []; }
}

function buildCampaignStats(campaigns, recentLeads) {
  const accepted = {};
  const replies = {};
  recentLeads.forEach((lead) => {
    const cid = lead.campaign_id;
    if (lead.transition === 'accepted') accepted[cid] = (accepted[cid] || 0) + 1;
    if (lead.transition === 'reply') replies[cid] = (replies[cid] || 0) + 1;
  });

  return campaigns.map((c) => ({
    id: c.id,
    name: c.name || '-',
    state: c.state || '-',
    type: c.type || '-',
    outreach: c.outreach_type || '-',
    targets: c.target_count || 0,
    completionPct: c.completion ? Math.round(c.completion * 100) : 0,
    accepted: accepted[c.id] || 0,
    replies: replies[c.id] || 0,
    created: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : '-',
    owners: (c.owners || []).join(', '),
    segment: getSegment(c.name),
  }));
}

function buildPositiveLeads(recentLeads) {
  return recentLeads
    .filter((l) => l.transition === 'accepted')
    .map((l) => ({
      name: l.target?.full_name || '-',
      occupation: l.target?.occupation || '-',
      campaign: l.campaign_name || '-',
      segment: getSegment(l.campaign_name),
      date: (l.timestamp || '').slice(0, 10),
      linkedinUrn: l.target_urn || '',
      transition: 'Accepted',
      status: 'Connection Accepted',
    }));
}

function buildSegmentStats(campaignStats, recentLeads) {
  const stats = {};
  SEGMENTS.forEach((seg) => { stats[seg] = { segment: seg, campaigns: 0, targets: 0, accepted: 0, replies: 0, activeCampaigns: [] }; });

  campaignStats.forEach((c) => {
    const seg = c.segment;
    if (!stats[seg]) return;
    stats[seg].campaigns++;
    stats[seg].targets += c.targets;
    stats[seg].accepted += c.accepted;
    stats[seg].replies += c.replies;
    if (c.state === 'ACTIVE') stats[seg].activeCampaigns.push(c.name);
  });

  return Object.values(stats);
}

async function fetchFullDashboard(apiKey) {
  const [accounts, campaigns, recentLeads, conversations] = await Promise.all([
    fetchAccounts(apiKey),
    fetchCampaigns(apiKey),
    fetchRecentLeads(apiKey),
    fetchConversations(apiKey),
  ]);

  const campaignStats = buildCampaignStats(campaigns, recentLeads);
  const positiveLeads = buildPositiveLeads(recentLeads);
  const segmentStats = buildSegmentStats(campaignStats, recentLeads);

  const totalAccepted = recentLeads.filter((l) => l.transition === 'accepted').length;
  const totalReplies = recentLeads.filter((l) => l.transition === 'reply').length;

  // Enrich conversations with last message preview
  const enrichedConversations = conversations.slice(0, 20).map((conv) => {
    const participant = (conv.participants || [])[0] || {};
    return {
      id: conv.conversation_urn,
      leadName: participant.full_name || '-',
      occupation: participant.occupation || '-',
      owner: conv.owner,
      conversationUrn: conv.conversation_urn,
      connected: conv.connected || false,
      unread: conv.unread_count || 0,
      msgCount: conv.message_count || 0,
    };
  });

  return {
    overview: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.state === 'ACTIVE').length,
      totalAccepted,
      totalReplies,
      totalConversations: conversations.length,
      accounts: accounts.length,
    },
    accounts,
    campaigns: campaignStats,
    recentLeads,
    positiveLeads,
    segmentStats,
    conversations: enrichedConversations,
  };
}

module.exports = { fetchFullDashboard };
