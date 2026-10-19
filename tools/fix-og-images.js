// Differentiate social share images:
// - products.html / blog.html were using logo.png (a logo reads badly as a preview)
// - index / about / capabilities / contact all shared hero.jpg
// Only existing site photos are used; no new assets needed.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://yzrsweaters.com';

const MAP = {
  'index.html': '/images/hero.jpg',
  'products.html': '/images/product-linfair-cardigan-coffee.jpg',
  'blog.html': '/images/blog-fw-cable-knit-flatlay.jpg',
  'about.html': '/images/factory-entrance.jpg',
  'capabilities.html': '/images/factory-knitting1.jpg',
  'contact.html': '/images/blog-fw-blue-layer-scarf.jpg'
};

for (const [file, img] of Object.entries(MAP)) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  const abs = BASE + img;
  let changed = false;

  if (/<meta property="og:image" content="[^"]*"/.test(html)) {
    html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${abs}$2`);
    changed = true;
  } else {
    html = html.replace('</head>', `<meta property="og:image" content="${abs}">\n</head>`);
    changed = true;
  }
  if (/<meta name="twitter:image" content="[^"]*"/.test(html)) {
    html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${abs}$2`);
  } else {
    html = html.replace('</head>', `<meta name="twitter:image" content="${abs}">\n</head>`);
  }
  fs.writeFileSync(p, html);
  console.log(`${file}: og:image -> ${img}${changed ? '' : ' (unchanged)'}`);
}
