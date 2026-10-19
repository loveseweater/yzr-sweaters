// Site-wide link & schema audit over the static build.
// - every internal href/src must resolve to a real file (broken links = crawl waste + bad UX)
// - every JSON-LD block must parse
// - sitemap URLs must all exist on disk
// - canonicals must point at the page's own URL
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://yzrsweaters.com';

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['admin', '文档', 'tools'].includes(e.name)) continue;
      walk(p);
    } else if (e.name.endsWith('.html')) files.push(p);
  }
}
walk(ROOT);

function relUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.slice(0, -'.html'.length);
}
function existsOnDisk(urlPath) {
  const clean = urlPath.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return true;
  const rel = clean.replace(/^\//, '');
  return fs.existsSync(path.join(ROOT, rel)) ||
         fs.existsSync(path.join(ROOT, rel + '.html')) ||
         fs.existsSync(path.join(ROOT, rel, 'index.html'));
}

let broken = [], badSchema = [], badCanonical = [], count = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const url = relUrl(f);
  count++;

  // links and images
  const linkRe = /(?:href|src)="(\/[^"#]*(?:#[^"]*)?)"/g;
  let m;
  while ((m = linkRe.exec(html))) {
    const link = m[1];
    if (link.startsWith('//')) continue; // protocol-relative external URL
    if (link.includes("'") || link.includes('+')) continue; // JS template string, not a real link
    if (/^\/(d5ec|favicon)/.test(link)) continue;
    if (!existsOnDisk(link)) broken.push(`${url} -> ${link}`);
  }

  // JSON-LD
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  while ((m = ldRe.exec(html))) {
    try { JSON.parse(m[1]); } catch (e) { badSchema.push(`${url}: ${e.message.slice(0, 60)}`); }
  }

  // canonical self-consistency (skip legacy product.html stub)
  if (path.basename(f) === 'product.html' && path.dirname(f) === ROOT) continue;
  const can = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (can && can[1] !== BASE + url) badCanonical.push(`${url} -> ${can[1]}`);
}

// sitemap cross-check
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
const missing = locs.filter(l => !existsOnDisk(l.replace(BASE, '')));

console.log('pages checked:', count);
console.log('sitemap urls:', locs.length);
console.log('broken internal links:', broken.length);
broken.slice(0, 20).forEach(b => console.log('  ', b));
console.log('invalid JSON-LD:', badSchema.length);
badSchema.slice(0, 10).forEach(b => console.log('  ', b));
console.log('bad canonicals:', badCanonical.length);
badCanonical.slice(0, 10).forEach(b => console.log('  ', b));
console.log('sitemap urls missing on disk:', missing.length);
missing.slice(0, 10).forEach(b => console.log('  ', b));
if (broken.length || badSchema.length || badCanonical.length || missing.length) process.exit(1);
console.log('ALL CHECKS PASSED');
