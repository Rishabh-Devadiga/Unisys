const https = require('https');

const turnHealth = {
  status: 'unknown',
  detail: 'Not checked yet',
  checked_at: null,
  source: null
};

function getEnv(name) {
  return String(process.env[name] || '').trim();
}

function parseUrls(raw) {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function postJson(url, headers, body, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body || {});
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers
        },
        timeout: timeoutMs
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            body: data
          });
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

async function fetchCloudflareIceServers(ttlSeconds) {
  const turnKeyId = getEnv('CF_TURN_KEY_ID');
  const turnApiToken = getEnv('CF_TURN_API_TOKEN');
  if (!turnKeyId || !turnApiToken) return null;
  const url = `https://rtc.live.cloudflare.com/v1/turn/keys/${turnKeyId}/credentials/generate-ice-servers`;
  try {
    const response = await postJson(
      url,
      { Authorization: `Bearer ${turnApiToken}` },
      { ttl: ttlSeconds }
    );
    if (response.status === 200 || response.status === 201) {
      try {
        return JSON.parse(response.body || '{}');
      } catch (error) {
        return null;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

async function updateTurnHealth() {
  const staticTurnUrls = getEnv('TURN_URLS');
  const staticTurnUser = getEnv('TURN_USERNAME');
  const staticTurnCredential = getEnv('TURN_CREDENTIAL');
  const turnKeyId = getEnv('CF_TURN_KEY_ID');
  const turnApiToken = getEnv('CF_TURN_API_TOKEN');

  if (staticTurnUrls && staticTurnUser && staticTurnCredential) {
    turnHealth.status = 'ok';
    turnHealth.detail = 'Static TURN configured (not live-tested)';
    turnHealth.checked_at = new Date().toISOString();
    turnHealth.source = 'static';
    return turnHealth;
  }

  if (!turnKeyId || !turnApiToken) {
    turnHealth.status = 'missing';
    turnHealth.detail = 'TURN credentials not configured';
    turnHealth.checked_at = new Date().toISOString();
    turnHealth.source = 'none';
    return turnHealth;
  }

  const response = await fetchCloudflareIceServers(300);
  if (response && Array.isArray(response.iceServers)) {
    turnHealth.status = 'ok';
    turnHealth.detail = 'Cloudflare TURN credentials validated';
    turnHealth.checked_at = new Date().toISOString();
    turnHealth.source = 'cloudflare';
    return turnHealth;
  }

  turnHealth.status = 'error';
  turnHealth.detail = 'Cloudflare TURN check failed';
  turnHealth.checked_at = new Date().toISOString();
  turnHealth.source = 'cloudflare';
  return turnHealth;
}

async function getIceServers() {
  const staticTurnUrls = getEnv('TURN_URLS');
  const staticTurnUser = getEnv('TURN_USERNAME');
  const staticTurnCredential = getEnv('TURN_CREDENTIAL');
  const turnKeyId = getEnv('CF_TURN_KEY_ID');
  const turnApiToken = getEnv('CF_TURN_API_TOKEN');

  const stunOnly = [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun.cloudflare.com:3478'] }
  ];

  const iceServers = [];
  if (staticTurnUrls && staticTurnUser && staticTurnCredential) {
    const urls = parseUrls(staticTurnUrls);
    if (urls.length) {
      iceServers.push({
        urls,
        username: staticTurnUser,
        credential: staticTurnCredential,
        credentialType: 'password'
      });
    }
  }

  if (turnKeyId && turnApiToken) {
    const response = await fetchCloudflareIceServers(86400);
    if (response && Array.isArray(response.iceServers)) {
      iceServers.push(...response.iceServers);
    }
  }

  if (!iceServers.length) {
    return { iceServers: stunOnly };
  }

  return { iceServers: [...iceServers, ...stunOnly] };
}

module.exports = {
  getIceServers,
  updateTurnHealth,
  getTurnHealth: () => ({ ...turnHealth })
};
