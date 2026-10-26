const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { timingSafeEqual } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const databasePath = path.resolve(process.env.DB_PATH || path.join(root, 'data', 'ai-sasa.sqlite'));
const maxBodyBytes = 16 * 1024;
const requestTimes = new Map();
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS demo_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organisation TEXT NOT NULL DEFAULT '',
    interest TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);
const insertRequest = database.prepare(`
  INSERT INTO demo_requests (name, email, organisation, interest, message)
  VALUES (?, ?, ?, ?, ?)
`);
const listRequests = database.prepare(`
  SELECT id, name, email, organisation, interest, message, created_at
  FROM demo_requests ORDER BY id DESC LIMIT ? OFFSET ?
`);
const countRequests = database.prepare('SELECT COUNT(*) AS total FROM demo_requests');

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp'
};
const publicFiles = new Set(['/', '/index.html', '/readiness.js', '/backend-client.js']);

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(data));
}

function rateLimited(request) {
  const forwarded = request.headers['x-forwarded-for'];
  const address = (process.env.TRUST_PROXY === '1' && typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : request.socket.remoteAddress) || 'unknown';
  const now = Date.now();
  const recent = (requestTimes.get(address) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 5) {
    requestTimes.set(address, recent);
    return true;
  }
  recent.push(now);
  requestTimes.set(address, recent);
  if (requestTimes.size > 10000) requestTimes.delete(requestTimes.keys().next().value);
  return false;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBodyBytes) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  }
  try { return JSON.parse(body); }
  catch { throw Object.assign(new Error('Send a valid JSON request.'), { status: 400 }); }
}

function validateRequest(input) {
  const allowedInterests = new Set(['SME pilot', 'Team training', 'Partnership', 'Investment conversation', 'Other']);
  const fields = {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    email: typeof input.email === 'string' ? input.email.trim() : '',
    organisation: typeof input.organisation === 'string' ? input.organisation.trim() : '',
    interest: typeof input.interest === 'string' ? input.interest.trim() : '',
    message: typeof input.message === 'string' ? input.message.trim() : ''
  };
  if (!fields.name || fields.name.length > 120) return 'Enter a name of 1–120 characters.';
  if (fields.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return 'Enter a valid email address.';
  if (fields.organisation.length > 160) return 'Organisation must be 160 characters or fewer.';
  if (!allowedInterests.has(fields.interest)) return 'Choose a valid area of interest.';
  if (fields.message.length > 3000) return 'Message must be 3,000 characters or fewer.';
  return fields;
}

function hasValidAdminToken(request) {
  const expected = process.env.ADMIN_TOKEN;
  const authorization = request.headers.authorization || '';
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return sendJson(response, 200, { status: 'ok' });
  }
  if (url.pathname === '/api/demo-requests' && request.method === 'POST') {
    if (rateLimited(request)) return sendJson(response, 429, { error: 'Too many requests. Please try again later.' });
    if (!request.headers['content-type']?.includes('application/json')) {
      return sendJson(response, 415, { error: 'Send form details as JSON.' });
    }
    try {
      const input = await readJson(request);
      if (typeof input.website === 'string' && input.website.trim()) return sendJson(response, 202, { ok: true });
      const fields = validateRequest(input);
      if (typeof fields === 'string') return sendJson(response, 400, { error: fields });
      const result = insertRequest.run(fields.name, fields.email, fields.organisation, fields.interest, fields.message);
      return sendJson(response, 201, { ok: true, id: Number(result.lastInsertRowid) });
    } catch (error) {
      return sendJson(response, error.status || 400, { error: error.status ? error.message : 'Could not save your request. Please try again.' });
    }
  }
  if (url.pathname === '/api/admin/requests' && request.method === 'GET') {
    if (!hasValidAdminToken(request)) return sendJson(response, 401, { error: 'A valid admin token is required.' });
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50));
    const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
    return sendJson(response, 200, { total: countRequests.get().total, requests: listRequests.all(limit, offset) });
  }
  if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { error: 'API route not found.' });

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }
  if (!publicFiles.has(url.pathname)) {
    response.writeHead(404);
    return response.end('Not found');
  }
  const filePath = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return response.end('Not found');
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`AI Sasa server listening on port ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => {
    database.close();
    process.exit(0);
  }));
}
