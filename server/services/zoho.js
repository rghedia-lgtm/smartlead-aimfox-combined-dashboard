const axios = require('axios');

const TOKEN_URL = 'https://accounts.zoho.eu/oauth/v2/token';
const CRM_BASE = 'https://www.zohoapis.eu/crm/v2';
const TIMEOUT = 10000;

async function getAccessToken({ zohoClientId, zohoClientSecret, zohoRefreshToken }) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: zohoClientId,
    client_secret: zohoClientSecret,
    refresh_token: zohoRefreshToken,
  });

  const { data } = await axios.post(TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!data.access_token) {
    throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

// Extracts the slug from any LinkedIn URL
// https://www.linkedin.com/in/john-doe/ -> john-doe
// https://www.linkedin.com/sales/lead/ACw... -> null (sales nav, skip)
function extractLinkedInSlug(url) {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?#,]+)/i);
  return match ? match[1].toLowerCase() : null;
}

async function findLeadByLinkedIn(accessToken, linkedinUrl) {
  const slug = extractLinkedInSlug(linkedinUrl);
  if (!slug) return null;

  // Try exact URL match first, then with trailing slash
  for (const url of [linkedinUrl, linkedinUrl.replace(/\/?$/, '/'), linkedinUrl.replace(/\/$/, '')]) {
    try {
      const { data } = await axios.get(`${CRM_BASE}/Leads/search`, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        timeout: TIMEOUT,
        params: {
          criteria: `(LinkedIn_Text:equals:${url})`,
          fields: 'id,First_Name,Last_Name,Email,LinkedIn_Text',
        },
      });
      if (data.data?.[0]) return data.data[0];
    } catch {
      // try next variant
    }
  }

  return null;
}

async function findLeadByName(accessToken, firstName, lastName, email = null) {
  if (!firstName || !lastName) return null;
  try {
    const { data } = await axios.get(`${CRM_BASE}/Leads/search`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      timeout: TIMEOUT,
      params: {
        criteria: `(First_Name:equals:${firstName.trim()})AND(Last_Name:equals:${lastName.trim()})`,
        fields: 'id,First_Name,Last_Name,Email,LinkedIn_Text',
      },
    });
    const results = data.data || [];

    // Multiple matches — too risky without email confirmation
    if (results.length > 1) {
      if (!email) return null; // skip ambiguous
      const byEmail = results.find(
        (r) => (r.Email || '').toLowerCase() === email.toLowerCase()
      );
      return byEmail || null;
    }

    return results[0] || null;
  } catch {
    return null;
  }
}

async function findLeadByEmail(accessToken, email) {
  if (!email) return null;
  try {
    const { data } = await axios.get(`${CRM_BASE}/Leads/search`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      timeout: TIMEOUT,
      params: {
        criteria: `(Email:equals:${email})`,
        fields: 'id,First_Name,Last_Name,Email,LinkedIn_Text',
      },
    });
    return data.data?.[0] || null;
  } catch {
    return null;
  }
}

async function updateLead(accessToken, leadId, fields) {
  const { data } = await axios.put(
    `${CRM_BASE}/Leads`,
    { data: [{ id: leadId, ...fields }] },
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }, timeout: TIMEOUT }
  );
  return data;
}

module.exports = { getAccessToken, findLeadByLinkedIn, findLeadByName, findLeadByEmail, updateLead, extractLinkedInSlug };
