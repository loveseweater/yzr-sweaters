// YZR Sweaters — technical SEO normalization (idempotent)
// - Removes self-referencing hreflang (wrong for a monolingual site)
// - Guarantees canonical, Open Graph, Twitter cards and BreadcrumbList on every page
// - Fixes relative og:image URLs to absolute
// - Removes the "Comments are loading" placeholder and the fake "Views" counter
// - Regenerates sitemap.xml with lastmod for every indexable URL
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://yzrsweaters.com';

function relUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === 'blog.html') return '/blog';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  if (rel === 'product.html') return '/product';
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length);
  return '/' + rel;
}

function titleOf(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : 'YZR Sweaters';
}
function descOf(html) {
  const m = html.match(/<meta name="description" content="([^"]*)"/i);
  return m ? m[1].trim() : '';
}
function imageOf(html) {
  const m = html.match(/<img[^>]+class="post-img"[^>]+src="([^"]+)"/i) || html.match(/<img[^>]+src="(\/images\/[^"]+)"/i);
  return m ? m[1] : '/images/hero.jpg';
}

function processFile(file, url) {
  let html = fs.readFileSync(file, 'utf8');
  const name = path.basename(file);
  const abs = BASE + url;
  const is404 = name === '404.html';
  const isLegacyProduct = name === 'product.html' && file.endsWith('product.html') && path.dirname(file) === ROOT;

  // 1) strip hreflang links (monolingual site — self-referencing hreflang is noise)
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]*">/g, '');

  // 2) canonical
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `<link rel="canonical" href="${abs}">\n</head>`);
  }

  // 3) OG / Twitter for pages that lack it
  if (!is404 && !isLegacyProduct && !html.includes('property="og:title"')) {
    const t = titleOf(html), d = descOf(html), img = imageOf(html);
    const block = [
      `<meta property="og:title" content="${t}">`,
      `<meta property="og:description" content="${d}">`,
      `<meta property="og:type" content="${url.startsWith('/blog/') ? 'article' : 'website'}">`,
      `<meta property="og:url" content="${abs}">`,
      `<meta property="og:image" content="${img.startsWith('http') ? img : BASE + img}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${t}">`,
      `<meta name="twitter:description" content="${d}">`,
      `<meta name="twitter:image" content="${img.startsWith('http') ? img : BASE + img}">`
    ].join('\n');
    html = html.replace('</head>', block + '\n</head>');
  }

  // 4) absolute og:image where a relative one slipped in
  html = html.replace(/content="(\/images\/[^"]+)"([^>]*property="og:image")/g, `content="${BASE}$1"$2`);
  html = html.replace(/(<meta property="og:image" content=")(\/images\/[^"]+)"/g, `$1${BASE}$2"`);

  // 5) BreadcrumbList schema for blog articles that lack one
  if (!is404 && url.startsWith('/blog/') && !html.includes('"BreadcrumbList"')) {
    const crumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: BASE + '/blog' },
        { '@type': 'ListItem', position: 3, name: titleOf(html).split('|')[0].trim(), item: abs }
      ]
    };
    html = html.replace('</body>', `<script type="application/ld+json">${JSON.stringify(crumb)}</script>\n</body>`);
  }

  // 6) remove the dead comment placeholder and fake view counter (thin/suspicious content)
  html = html.replace(/(?:<!--\s*Comments\s*-->\s*)?<section class="comments-wrap">[\s\S]*?<\/section>/g, '');
  html = html.replace(/<span class="article-viewcount">[\s\S]*?<\/span>/, '');
  html = html.replace(/<script>\s*\(function\(\)\{\s*try\{\s*var key='yzr_view_[\s\S]*?\}\)\(\);\s*<\/script>/, '');

  fs.writeFileSync(file, html);
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['admin', '文档', 'tools'].includes(entry.name)) continue;
      walk(p);
    } else if (entry.name.endsWith('.html')) {
      files.push(p);
    }
  }
}
walk(ROOT);

const seen = new Set();
const urls = [];
for (const f of files) {
  const url = relUrl(f);
  const name = path.basename(f);
  const isLegacyProduct = name === 'product.html' && path.dirname(f) === ROOT;
  processFile(f, url);
  if (url === '/404' || isLegacyProduct) continue; // not indexable
  if (seen.has(url)) continue;
  seen.add(url);
  urls.push({ url, file: f });
}

function priority(url) {
  if (url === '/') return '1.0';
  if (['/products', '/capabilities', '/about', '/contact', '/blog'].includes(url)) return '0.8';
  if (url.startsWith('/collections/')) return '0.8';
  if (url.startsWith('/product/')) return '0.8';
  return '0.7';
}
function changefreq(url) {
  if (url === '/' || url === '/blog' || url === '/products') return 'weekly';
  return 'monthly';
}

const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const { url, file } of urls) {
  const lastmod = fs.statSync(file).mtime.toISOString().slice(0, 10);
  xml.push('  <url>');
  xml.push(`    <loc>${BASE}${url}</loc>`);
  xml.push(`    <lastmod>${lastmod}</lastmod>`);
  xml.push(`    <changefreq>${changefreq(url)}</changefreq>`);
  xml.push(`    <priority>${priority(url)}</priority>`);
  xml.push('  </url>');
}
xml.push('</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml.join('\n') + '\n');

console.log('normalized ' + urls.length + ' indexable pages, wrote sitemap.xml');
