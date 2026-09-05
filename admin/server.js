// YZR Sweaters — Local content management tool
// Run:  node admin/server.js   then open http://127.0.0.1:8090
//
// This is a "static-site content manager": it edits products.json and article
// data locally, then auto-commits + pushes to GitHub so Cloudflare redeploys.
// For a true online admin (login + database) you'd move to a server/hosted
// backend later; this covers editing content and publishing without code.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PROD = path.join(ROOT, 'products.json');
const PORT = 8090;

const MIME = { '.html': 'text/html', '.json': 'application/json', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };

// Deterministic allowlist: serve only the admin HTML page or the products JSON.
function get(reqUrl) {
  const u = (reqUrl.split('?')[0] || '/');
  if (u === '/' || u === '/manage.html') {
    return { status: 200, type: 'text/html; charset=utf-8', body: fs.readFileSync(path.join(__dirname, 'manage.html')) };
  }
  if (u === '/api/products') {
    return { status: 200, type: 'application/json; charset=utf-8', body: fs.readFileSync(PROD) };
  }
  return { status: 404, type: 'text/plain; charset=utf-8', body: Buffer.from('Not found') };
}

function respond(res, status, text) {
  // text is always an internal constant; never user or exception content.
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(text);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const r = get(req.url);
    res.writeHead(r.status, { 'Content-Type': r.type });
    res.end(r.body);
    return;
  }
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      let data;
      try { data = JSON.parse(body); } catch (e) { return respond(res, 400, 'bad json'); }
      const action = String(req.headers['x-action'] || '').toLowerCase();
      // Only the two known actions are accepted; everything else is refused.
      if (action !== 'save' && action !== 'deploy') { return respond(res, 400, 'unknown action'); }
      // Shape guard: never write arbitrary input; only well-formed products data.
      if (!data || typeof data !== 'object' || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
        return respond(res, 400, 'invalid data shape');
      }
      try {
        fs.writeFileSync(PROD, JSON.stringify(data, null, 2));
        if (action === 'deploy') {
          execFileSync('git', ['-C', ROOT, 'add', '-A'], { stdio: 'inherit' });
          execFileSync('git', ['-C', ROOT, '-c', 'core.quotepath=false', 'commit', '-m', 'Update via admin tool', '--no-verify'], { stdio: 'inherit' });
          execFileSync('git', ['-C', ROOT, 'push', 'origin', 'main'], { stdio: 'inherit' });
          return respond(res, 200, 'saved + pushed to GitHub (Cloudflare deploy started)');
        }
        return respond(res, 200, 'saved products.json');
      } catch (e) {
        console.error('Admin error:', e && e.message);
        return respond(res, 500, 'server error');
      }
    });
    return;
  }
  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end();
});

server.listen(PORT, () => console.log('Admin running: http://127.0.0.1:' + PORT));
