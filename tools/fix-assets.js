// Asset fixes:
// 1. Fill the empty ItemList on /products with all product URLs
// 2. Add intrinsic width/height to every <img> (site-wide CLS risk: 493 imgs, 0 dimensions)
// 3. Preload the LCP hero image on the homepage
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// --- JPEG / PNG intrinsic size reader (no dependencies) ---
function imageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xd8) { // JPEG
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (buf.slice(1, 4).toString() === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return null;
}

const sizeCache = new Map();
function sizeFor(src) {
  if (sizeCache.has(src)) return sizeCache.get(src);
  const rel = decodeURIComponent(src.replace(/^\//, ''));
  const file = path.join(ROOT, rel);
  let size = null;
  if (fs.existsSync(file)) { try { size = imageSize(file); } catch (e) { size = null; } }
  sizeCache.set(src, size);
  return size;
}

// --- 1. ItemList on /products ---
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));
const items = data.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: 'https://yzrsweaters.com/product/' + p.id }));
const itemList = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'YZR Sweaters Product Range',
  url: 'https://yzrsweaters.com/products',
  mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items }
});
let productsHtml = fs.readFileSync(path.join(ROOT, 'products.html'), 'utf8');
const itemListRe = /<script type="application\/ld\+json">[\s\S]*?"ItemList"[\s\S]*?<\/script>/;
if (!itemListRe.test(productsHtml)) {
  console.error('WARN: ItemList block not found on products.html');
} else {
  productsHtml = productsHtml.replace(itemListRe, '<script type="application/ld+json">' + itemList + '</script>');
  fs.writeFileSync(path.join(ROOT, 'products.html'), productsHtml);
  console.log('products.html ItemList updated with', items.length, 'items');
}

// --- 2. width/height on every img + 3. hero preload ---
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

let imgCount = 0, dimAdded = 0;
for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = html.replace(/<img\b([^>]*)>/gi, (tag, attrs) => {
    imgCount++;
    if (/\bwidth=/.test(attrs) && /\bheight=/.test(attrs)) return tag;
    const srcM = attrs.match(/src="([^"]+)"/i);
    if (!srcM) return tag;
    const size = sizeFor(srcM[1]);
    if (!size) return tag;
    dimAdded++;
    const cleaned = attrs.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '');
    return '<img' + cleaned + ` width="${size.width}" height="${size.height}">`;
  });
  if (html !== before) fs.writeFileSync(file, html);
}

// hero preload on homepage (also used as a CSS background, so lazy loading never applied)
const indexFile = path.join(ROOT, 'index.html');
let index = fs.readFileSync(indexFile, 'utf8');
if (!index.includes('rel="preload"')) {
  index = index.replace('<link rel="icon" href="/images/logo.png">',
    '<link rel="icon" href="/images/logo.png">\n<link rel="preload" as="image" href="/images/hero.jpg" fetchpriority="high">');
  fs.writeFileSync(indexFile, index);
  console.log('index.html: hero preload added');
}

console.log(`images scanned: ${imgCount}, dimensions added: ${dimAdded}`);
