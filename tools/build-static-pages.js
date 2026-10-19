// Build-time prerendering for product and category pages.
// Why: the old /product?id=... template rendered everything client-side, so Googlebot
// saw an empty <main>. These generated pages carry title, meta description, canonical,
// Product schema, BreadcrumbList and visible internal links directly in the HTML.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://yzrsweaters.com';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));

const CAT = {};
data.categories.forEach(c => { CAT[c.id] = c; });

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NAV = `<header>
  <div class="wrap nav">
    <a href="/" class="brand" aria-label="YZR Sweaters home">
      <img src="/images/logo.png" alt="YZR Sweaters logo">
      <span class="name">YZR Sweaters</span>
    </a>
    <button class="menu-toggle" aria-label="Toggle menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">&#9776;</button>
    <nav class="nav-links">
      <a href="/">Home</a>
      <div class="nav-drop"><a href="/products">Products <span class="caret">&#9662;</span></a><div class="nav-drop-menu">
        ${data.categories.map(c => `<a href="/collections/${c.slug}">${esc(c.name)}</a>`).join('\n        ')}
      </div></div>
      <a href="/capabilities">Capabilities</a>
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
      <a href="/contact" class="btn btn-primary">Get a Quote</a>
    </nav>
  </div>
</header>`;

const FOOTER = `<footer>
  <div class="wrap foot">
    <div class="foot-info">
      <div class="brand">
        <img src="/images/logo.png" alt="YZR Sweaters">
        <span class="name">YZR Sweaters</span>
      </div>
      <p class="foot-tag">Custom knitwear &amp; OEM/ODM sweaters, made in Dongguan, China — for fashion brands, wholesalers and online retailers.</p>
    </div>
    <nav class="foot-links">
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/capabilities">Capabilities</a>
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
      <a href="/contact">Contact</a>
    </nav>
    <div class="copyright">© 2026 Dongguan Yu Zhengrong Garment Trading Co., Ltd. All rights reserved.</div>
  </div>
</footer>`;

const STYLE = `<style>
  .pd{display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:start;padding:40px 0 8px}
  .pd-img{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .pd-img img{width:100%;height:520px;object-fit:contain;padding:20px}
  .pd-info .tag{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--wool-dark);font-weight:600;margin-bottom:10px;display:inline-block}
  .pd-info h1{font-family:var(--serif);font-size:36px;line-height:1.2;margin-bottom:14px}
  .pd-info .desc{color:var(--ink-soft);font-size:17px;margin-bottom:22px}
  .pd-spec{width:100%;border-collapse:collapse;margin:6px 0 22px}
  .pd-spec th,.pd-spec td{padding:11px 0;border-bottom:1px solid var(--line);font-size:14.5px;text-align:left}
  .pd-spec th{color:var(--ink-soft);font-weight:600;width:38%}
  .pd-cta{background:var(--cream-2);border:1px solid var(--line);border-radius:10px;padding:26px}
  .pd-cta h2{font-family:var(--serif);font-size:20px;margin-bottom:8px}
  .pd-cta p{color:var(--ink-soft);font-size:15px;margin-bottom:16px}
  .pd-trust{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px}
  .pd-trust .trust-item{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:14px}
  .pd-trust .trust-item strong{display:block;font-family:var(--serif);font-size:14px;color:var(--ink);margin-bottom:4px}
  .pd-trust .trust-item span{font-size:12.5px;color:var(--ink-soft)}
  .related{margin-top:36px}
  .related h2{font-family:var(--serif);font-size:24px;margin-bottom:18px}
  .rel-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .rel-item{background:var(--white);border:1px solid var(--line);border-radius:8px;overflow:hidden;transition:.2s}
  .rel-item:hover{transform:translateY(-3px);box-shadow:0 10px 22px rgba(90,70,50,.1)}
  .rel-item img{width:100%;height:180px;object-fit:contain;padding:10px;background:#fff}
  .rel-item .rn{padding:10px 12px;font-size:14px;color:var(--ink);font-family:var(--serif)}
  .read-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .read-item{display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--white);border:1px solid var(--line);border-radius:8px;padding:16px 18px;transition:.2s}
  .read-item:hover{border-color:var(--wool);transform:translateY(-2px)}
  .read-item span{font-family:var(--serif);font-size:15px;color:var(--ink);line-height:1.35}
  .read-item em{font-style:normal;font-size:13px;font-weight:600;color:var(--wool-dark);white-space:nowrap}
  .cat-hero{background:var(--cream-2);border-bottom:1px solid var(--line);padding:56px 0}
  .cat-hero h1{font-family:var(--serif);font-size:38px;line-height:1.2;margin-bottom:12px}
  .cat-hero p{color:var(--ink-soft);font-size:17px;max-width:660px}
  .cat-intro{max-width:760px}
  .cat-intro p{color:var(--ink-soft);font-size:17px;margin-bottom:16px}
  .prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .prod-card{background:var(--white);border:1px solid var(--line);border-radius:8px;overflow:hidden;transition:transform .2s,box-shadow .2s}
  .prod-card:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(90,70,50,.12)}
  .prod-card img{width:100%;height:300px;object-fit:contain;background:#fff;padding:12px}
  .prod-info{padding:16px 18px 20px}
  .prod-info h2{font-family:var(--serif);font-size:18px;line-height:1.3;margin-bottom:6px}
  .prod-info p{color:var(--ink-soft);font-size:14px}
  @media(max-width:900px){.pd{grid-template-columns:1fr}.pd-img img{height:380px}.rel-grid{grid-template-columns:repeat(2,1fr)}.prod-grid{grid-template-columns:1fr 1fr}.read-grid{grid-template-columns:1fr}}
  @media(max-width:600px){.prod-grid{grid-template-columns:1fr}.pd-trust{grid-template-columns:1fr}}
</style>`;

const READING = {
  sweaters: [
    ['/blog/how-to-choose-a-knitwear-manufacturer', 'How to choose a knitwear manufacturer'],
    ['/blog/sweater-yarn-guide', 'Sweater yarns: wool, cotton, acrylic & blends'],
    ['/blog/sweater-bulk-wholesale-guide', 'Planning a bulk sweater order'],
    ['/blog/knitwear-bill-of-materials', 'The BOM that prevents substitution']
  ],
  cardigans: [
    ['/blog/cardigan-styles-buying-guide', 'Cardigan styles: a buying guide'],
    ['/blog/cardigan-closures-buttons-zips', 'Choosing buttons, zips and closures'],
    ['/blog/knitwear-tech-pack-guide', 'Writing a tech pack a factory can quote'],
    ['/blog/knitwear-trims-labels-hangtags', 'Trims, labels and hangtags']
  ],
  dresses: [
    ['/blog/knitted-dress-buying-guide', 'Knitted dresses: a buying guide'],
    ['/blog/spring-summer-knitwear-sourcing', 'Sourcing spring/summer knitwear'],
    ['/blog/sweater-measurement-guide', 'Points of measure and tolerances'],
    ['/blog/knitwear-sizing-grading-guide', 'Knitwear sizing and grading']
  ],
  polos: [
    ['/blog/knitted-polo-wholesale-guide', 'Knitted polos: a wholesale guide'],
    ['/blog/sweater-color-trends-pantone', 'Working to Pantone with your factory'],
    ['/blog/lab-dip-color-approval-knitwear', 'Lab dips and colour approval'],
    ['/blog/knitwear-colour-consistency', 'Colour consistency across an order']
  ],
  scarves: [
    ['/blog/knit-accessories-scarves-beanies', 'Knit accessories that sell'],
    ['/blog/knit-accessories-profit-guide', 'Accessories as a margin add-on'],
    ['/blog/knitwear-patterns-explained', 'Cable, jacquard and intarsia'],
    ['/blog/knit-gauge-explained', 'What gauge means for your product']
  ],
  beanies: [
    ['/blog/knit-accessories-scarves-beanies', 'Knit accessories that sell'],
    ['/blog/knit-accessories-profit-guide', 'Accessories as a margin add-on'],
    ['/blog/sweater-yarn-guide', 'Choosing the right yarn'],
    ['/blog/low-moq-knitwear-manufacturing', 'Low MOQ routes for small brands']
  ],
  gloves: [
    ['/blog/knit-accessories-scarves-beanies', 'Knit accessories that sell'],
    ['/blog/sweater-yarn-guide', 'Choosing the right yarn'],
    ['/blog/knitwear-quality-defects-inspection', 'Common defects and inspection'],
    ['/blog/sweater-packaging-shipping-guide', 'Packaging and shipping']
  ],
  legwear: [
    ['/blog/knit-accessories-scarves-beanies', 'Knit accessories that sell'],
    ['/blog/knit-accessories-profit-guide', 'Accessories as a margin add-on'],
    ['/blog/knitwear-sizing-grading-guide', 'Sizing and grading basics'],
    ['/blog/sweater-pilling-prevention-guide', 'Preventing pilling']
  ]
};

// Short, category-specific intro copy — each category page says something different
// about what the factory actually needs to know, so the pages are not boilerplate.
const CAT_INTRO = {
  sweaters: ['Sweaters and pullovers are the backbone of most knitwear programmes, and they are also where specification sloppiness shows up first. A crew neck at 12GG in lambswool and the same shape at 7GG in an acrylic blend are two different products at two different prices — the silhouette looks similar in a photo and nothing else matches.', 'We knit both, and we will tell you which one suits your season and price point before you commit. Send a reference photo or tech pack, and we match yarn, gauge and fit in sampling until the sample is something you would put your own label in.'],
  cardigans: ['Cardigans and knit jackets look simple on a hanger and are the most trim-dependent category we make. Buttons, zips, plackets and pocket placement all have to be specified, and every one of them is a separate line on the bill of materials — which is why cardigans are the category where "it looked cheaper than the sample" complaints usually start.', 'We specify closures, placket construction and rib trims line by line before bulk, and we approve them physically on a trim card. Bring us a button reference or a Pantone and we will source to it, or tell you honestly what the alternative costs.'],
  dresses: ['Knitted dresses are the fastest-growing category in our order book, and the one with the most ways to get it wrong: opacity, weight, drape and how the garment behaves after a wash all change with yarn and rib density. A dress that photographs beautifully and turns semi-transparent in daylight is a returns problem, not a styling success.', 'We sample dresses at the actual production rib density rather than a lighter stand-in, and we wash-test the sample before bulk approval. Our current wave-stripe halter styles are typical of what we run for spring and resort capsules.'],
  polos: ['Knitted polos carry menswear and unisex ranges year-round because they sit between a shirt and a sweater — fine enough for spring, warm enough for autumn. The details that decide quality are the collar construction, the placket stability and whether the rib at the cuff recovers after wearing.', 'We knit polos at 12GG to 14GG in cotton, viscose and wool blends, with collars built to hold their shape. Custom colours are matched to Pantone and approved by lab dip before bulk.'],
  scarves: ['Scarves and wraps are the easiest category to add to an existing knitwear order and the most forgiving on minimums — one size, simple construction, and the yarn does the selling. They are also how most of our buyers test a new colour story before committing to garments.', 'We knit chunky ribs, brushed finishes and fringed wraps, and we can coordinate a scarf colourway to match the sweaters in the same programme, dyed from the same lot reference.'],
  beanies: ['Beanies and knit hats are small, cheap to ship and the highest-margin accessory in most winter ranges. Because they are one size, they are also the lowest-risk product for a first order with a new supplier — a genuinely useful way to test quality and communication before placing a garment order.', 'We knit rib beanies, cuffed styles and pom hats in acrylic, wool and cotton, with custom Pantone colours and woven labels or patches applied to your spec.'],
  gloves: ['Gloves and mittens are the accessory buyers forget to plan until the sweater order is already booked, and then they arrive late. Production itself is quick — the constraint is always trim lead time, especially for touchscreen yarn and fleece linings.', 'We knit standard, touchscreen-compatible and fleece-lined gloves, and we coordinate them to the same colour references as the rest of your winter range so the gift sets match on shelf.'],
  legwear: ['Legwarmers and socks are a small, fast category that works well as an add-on to a winter capsule or a dance and studio line. They knit quickly, ship light and carry unusually good margin for the shelf price.', 'We knit rib legwarmers in short and long lengths plus winter and everyday sock weights, with custom colours at low minimums — one size fits most, so there is no size ratio to plan.']
};

function page({ title, description, url, image, body, schema, breadcrumb }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${BASE}${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${url.startsWith('/product/') ? 'product' : 'website'}">
<meta property="og:url" content="${BASE}${url}">
<meta property="og:image" content="${BASE}${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}${image}">
<link rel="icon" href="/images/logo.png">
<link rel="stylesheet" href="/css/blog.css">
<link rel="stylesheet" href="/css/page.css">
${STYLE}
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
</head>
<body>
${NAV}
<main class="wrap">
${body}
</main>
${FOOTER}
<script data-goatcounter="https://yzrsweaters.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: BASE + it.url }))
  };
}

// ---------- product pages ----------
let count = 0;
data.products.forEach(p => {
  const cat = CAT[p.category];
  const url = `/product/${p.id}`;
  const catUrl = `/collections/${cat.slug}`;
  const specRows = [];
  if (p.material) specRows.push(['Material', p.material]);
  if (p.colors) specRows.push(['Colors', p.colors]);
  if (p.sizing) specRows.push(['Sizing', p.sizing]);
  if (p.moq) specRows.push(['MOQ', p.moq]);
  if (p.leadtime) specRows.push(['Lead Time', p.leadtime]);
  if (p.craft) specRows.push(['Craft', p.craft]);

  const related = data.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  const reads = READING[p.category] || READING.sweaters;

  const title = `${p.name} | Custom Knitwear Supplier`;
  const description = (p.desc || '').slice(0, 155);

  const body = `
  <nav class="breadcrumb" style="font-size:13px;color:var(--ink-soft);padding:28px 0 18px"><a href="/">Home</a> / <a href="/products">Products</a> / <a href="${catUrl}">${esc(cat.name)}</a> / ${esc(p.name)}</nav>
  <div class="pd">
    <div class="pd-img"><img src="${p.image}" alt="${esc(p.name)}" width="800" height="1000" fetchpriority="high"></div>
    <div class="pd-info">
      <span class="tag">${esc(cat.name)}</span>
      <h1>${esc(p.name)}</h1>
      <p class="desc">${esc(p.desc)}</p>
      <table class="pd-spec">
        ${specRows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('\n        ')}
        <tr><th>Production</th><td>OEM / ODM, private label &amp; custom packaging</td></tr>
        <tr><th>Factory compliance</th><td>BSCI / SEDEX / Oeko-Tex certified partners, audits welcome</td></tr>
      </table>
      <div class="pd-cta">
        <h2>Interested in this style?</h2>
        <p>Tell us your target quantity, yarn preference and any branding requirements. We reply within one business day with a quote and a sampling timeline.</p>
        <a class="btn btn-primary" href="/contact">Get a Quote</a>
        <a class="btn btn-ghost" style="border:1px solid var(--wool-dark);color:var(--wool-dark)" href="mailto:daniel@yzrsweaters.com">Email Us</a>
      </div>
      <div class="pd-trust">
        <div class="trust-item"><strong>BSCI / SEDEX / Oeko-Tex</strong><span>Certified factories, audits welcome</span></div>
        <div class="trust-item"><strong>Full &amp; third-party inspection</strong><span>Checked before shipping</span></div>
        <div class="trust-item"><strong>Realistic lead times</strong><span>Clear sampling &amp; bulk schedule</span></div>
      </div>
    </div>
  </div>
  ${related.length ? `<div class="related"><h2>More ${esc(cat.name)}</h2><div class="rel-grid">
    ${related.map(r => `<a class="rel-item" href="/product/${r.id}"><img src="${r.image}" alt="${esc(r.name)}" loading="lazy" width="400" height="400"><div class="rn">${esc(r.name)}</div></a>`).join('\n    ')}
  </div></div>` : ''}
  <div class="related"><h2>From our blog</h2><div class="read-grid">
    ${reads.map(r => `<a class="read-item" href="${r[0]}"><span>${esc(r[1])}</span><em>Read &rarr;</em></a>`).join('\n    ')}
  </div></div>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.desc,
    image: BASE + p.image,
    category: cat.name,
    material: p.material || undefined,
    brand: { '@type': 'Brand', 'name': 'YZR Sweaters' },
    manufacturer: {
      '@type': 'Organization',
      name: 'Dongguan Yu Zhengrong Garment Trading Co., Ltd.',
      url: BASE + '/'
    },
    url: BASE + url
  };

  const html = page({
    title, description, url, image: p.image, body,
    schema,
    breadcrumb: breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: cat.name, url: catUrl },
      { name: p.name, url }
    ])
  });

  const dir = path.join(ROOT, 'product', p.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  count++;
});

// ---------- category pages ----------
let catCount = 0;
data.categories.forEach(c => {
  const items = data.products.filter(p => p.category === c.id);
  if (!items.length) return;
  const url = `/collections/${c.slug}`;
  const intro = CAT_INTRO[c.id] || ['', ''];
  const title = `${c.name} — Custom Knitwear Manufacturing | YZR Sweaters`;
  const description = `Custom ${c.name.toLowerCase()} produced in Dongguan: OEM/ODM, flexible MOQ, your yarn, colour and private label. ${items.length} styles available to develop from.`;

  const body = `
  <section class="cat-hero" style="margin:0 -24px;padding-left:24px;padding-right:24px">
    <p class="eyebrow" style="font-size:13px;letter-spacing:.24em;text-transform:uppercase;color:var(--wool-dark);margin-bottom:14px;font-weight:600">${esc(c.name)}</p>
    <h1>${esc(c.name)} — made to your spec in Dongguan</h1>
    <p>${esc(description)}</p>
  </section>
  <div class="cat-intro" style="padding:32px 0 8px">
    <p>${esc(intro[0])}</p>
    <p>${esc(intro[1])}</p>
  </div>
  <div class="related">
    <h2>${esc(c.name)} we can develop</h2>
    <div class="prod-grid">
      ${items.map(p => `<a class="prod-card" href="/product/${p.id}" style="text-decoration:none;color:inherit"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="400" height="400"><div class="prod-info"><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p></div></a>`).join('\n      ')}
    </div>
  </div>
  <div class="related">
    <h2>Planning this category</h2>
    <div class="read-grid">
      <a class="read-item" href="/blog/sweater-bulk-wholesale-guide"><span>Planning a bulk knitwear order</span><em>Read &rarr;</em></a>
      <a class="read-item" href="/blog/low-moq-knitwear-manufacturing"><span>Low MOQ routes for small brands</span><em>Read &rarr;</em></a>
      <a class="read-item" href="/blog/knitwear-sampling-costs-explained"><span>What a sample really costs</span><em>Read &rarr;</em></a>
      <a class="read-item" href="/blog/custom-sweater-oem-odm-process"><span>The OEM/ODM process, step by step</span><em>Read &rarr;</em></a>
    </div>
  </div>
  <div class="pd-cta" style="margin:36px 0 20px">
    <h2>Want this category in your range?</h2>
    <p>Send us a reference photo, tech pack or just a description with your target quantity. We'll come back with yarn options, a sample cost and a realistic production schedule.</p>
    <a class="btn btn-primary" href="/contact">Get a Quote</a>
    <a class="btn btn-ghost" style="border:1px solid var(--wool-dark);color:var(--wool-dark)" href="/products">All Products</a>
  </div>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${c.name} — YZR Sweaters`,
    url: BASE + url,
    description: description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: BASE + '/product/' + p.id }))
    }
  };

  const html = page({
    title, description, url, image: items[0].image, body, schema,
    breadcrumb: breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: c.name, url }
    ])
  });

  const dir = path.join(ROOT, 'collections', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  catCount++;
});

console.log(`generated ${count} product pages, ${catCount} category pages`);
