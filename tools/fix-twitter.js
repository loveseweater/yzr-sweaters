// Add twitter:card blocks to the 4 core pages that already had OG tags
// (index/about/capabilities/contact pre-date the normalization pass).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const targets = ['index.html', 'about.html', 'capabilities.html', 'contact.html'];
for (const f of targets) {
  const p = path.join(ROOT, f);
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('twitter:card')) { console.log(f, 'already has twitter:card'); continue; }
  const get = (prop) => {
    const m = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`));
    return m ? m[1] : '';
  };
  const title = get('og:title'), desc = get('og:description');
  let img = get('og:image');
  if (img && !img.startsWith('http')) img = 'https://yzrsweaters.com' + img;
  const block = [
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${desc}">`,
    `<meta name="twitter:image" content="${img}">`
  ].join('\n');
  html = html.replace('</head>', block + '\n</head>');
  fs.writeFileSync(p, html);
  console.log(f, 'twitter tags added');
}
