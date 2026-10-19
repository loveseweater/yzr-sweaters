// Conservative title rewrite for blog articles.
// Google truncates titles around 60 characters; 159/160 blog titles were over that.
// Rule (applied in order, never inventing new wording):
//   1. shorten the brand suffix "| YZR Sweaters" -> "| YZR"
//   2. if still > 60, drop the subtitle after the first ": " or " — "
//   3. if still > 60, cut at a word boundary and strip dangling connectors/punctuation
// H1 stays untouched, so the on-page heading is unchanged.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIMIT = 60;
const CONNECTORS = new Set(['and', 'the', 'of', 'a', 'an', 'to', 'for', 'in', 'on', 'with', 'or', 'that', 'your', 'from', 'by']);

function tidy(s) {
  return s.replace(/\s+/g, ' ').replace(/[\s:,\-–—|]+$/, '').trim();
}

function shorten(title) {
  if (title.length <= LIMIT) return title;
  let base = title.replace(/\s*\|\s*YZR Sweaters\s*$/i, '');
  const hasBrand = base !== title;
  const suffix = ' | YZR';
  let candidate = base + suffix;

  if (candidate.length <= LIMIT) return candidate;

  // drop subtitle after ": " or " — "
  const parts = base.split(/\s+[—–]\s+|\s*:\s+/);
  if (parts.length > 1) {
    const head = tidy(parts[0]);
    if ((head + suffix).length <= LIMIT && head.length >= 18) return head + suffix;
  }

  // word-boundary truncation
  const room = LIMIT - suffix.length - 1;
  let words = base.split(/\s+/);
  while (words.length) {
    if (words.join(' ').length <= room) break;
    words.pop();
  }
  while (words.length && CONNECTORS.has(words[words.length - 1].toLowerCase())) words.pop();
  candidate = tidy(words.join(' ')) + suffix;
  if (candidate.length > LIMIT) {
    candidate = tidy(words.join(' ')).slice(0, LIMIT - suffix.length).trim() + suffix;
  }
  return candidate;
}

const dir = path.join(ROOT, 'blog');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let changed = 0, over = 0, samples = [];
for (const f of files) {
  const p = path.join(dir, f);
  let html = fs.readFileSync(p, 'utf8');
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) continue;
  const old = m[1].trim();
  const next = shorten(old);
  if (next !== old) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${next}</title>`);
    // keep og:title aligned with the page title
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${next}$2`);
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${next}$2`);
    fs.writeFileSync(p, html);
    changed++;
    if (samples.length < 5) samples.push(`${old}\n   -> ${next}`);
  }
  if (shorten(next).length > LIMIT) over++;
}

// recount
let stillOver = 0, max = 0;
for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8').match(/<title>([\s\S]*?)<\/title>/i);
  if (t) { const l = t[1].trim().length; if (l > LIMIT) stillOver++; if (l > max) max = l; }
}
console.log(`blog titles: ${files.length}, rewritten: ${changed}, still over ${LIMIT}: ${stillOver}, longest: ${max}`);
samples.forEach(s => console.log('  ' + s));
