// Local verification server mimicking Cloudflare Pages behavior:
// - extensionless URLs map to .html files
// - /product/<id> rewrites to /product?id=<id> (like _redirects 200 rule)
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  else if (fs.existsSync(path.join(ROOT, p, 'index.html'))) p = path.posix.join(p, 'index.html');
  else if (!path.extname(p)) p += '.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(ROOT, '404.html')));
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}).listen(8095, () => console.log('verify server: http://127.0.0.1:8095'));
