// Verify the dynamic product page logic without a browser:
// extracts inline scripts from product.html and runs them against a minimal DOM stub.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'product.html'), 'utf8');

// extract inline scripts (skip ld+json and external src)
const scripts = [];
const re = /<script(?![^>]*src)([^>]*)>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(html))) {
  if (m[1].includes('application/ld+json')) continue;
  scripts.push(m[2]);
}
console.log('inline scripts found:', scripts.length);

const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8')).products;

async function testProduct(id, url) {
  const els = {};
  const head = { appendChild(el) { (this.children = this.children || []).push(el); } };
  const documentStub = {
    querySelector(sel) {
      if (sel === 'link[rel="canonical"]') return { attrs: { href: 'https://yzrsweaters.com/product' }, setAttribute(k, v) { this.attrs[k] = v; } };
      if (sel === 'meta[name="description"]') return { attrs: { content: '' }, setAttribute(k, v) { this.attrs[k] = v; } };
      return null;
    },
    querySelectorAll(sel) {
      if (sel === 'link[rel="alternate"]') return [1, 2, 3, 4, 5, 6].map(() => ({ attrs: { href: '' }, setAttribute(k, v) { this.attrs[k] = v; } }));
      if (sel === '[data-views]') return [];
      return [];
    },
    getElementById(id2) { return els[id2] || (els[id2] = { innerHTML: '', textContent: '' }); },
    createElement() { return { type: '', textContent: '' }; },
    head: head,
    title: ''
  };
  const locationStub = new URL(url);
  const sandbox = {
    document: documentStub,
    location: locationStub,
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: async () => ({ json: async () => ({ products }) }),
    console
  };
  vm.createContext(sandbox);
  for (const s of scripts) vm.runInContext(s, sandbox);
  await new Promise(r => setTimeout(r, 300));

  const rootHtml = els['product-root'] ? els['product-root'].innerHTML : '';
  const ok = {
    title: documentStub.title,
    hasH1: rootHtml.includes('<h1>'),
    hasRelated: rootHtml.includes('Related items'),
    hasReading: rootHtml.includes('From our blog'),
    hasCta: rootHtml.includes('Get a Quote'),
    relLinksToPathUrls: !rootHtml.includes('/product?id='),
    schemas: (head.children || []).length
  };
  console.log(id, JSON.stringify(ok));
  return ok;
}

(async () => {
  let fail = false;
  for (const [id, url] of [
    ['wave-halter-dress-coral', 'http://127.0.0.1:8095/product/wave-halter-dress-coral'],
    ['linfair-cardigan-coffee', 'http://127.0.0.1:8095/product/linfair-cardigan-coffee'],
    ['knit-polo-ivory (query fallback)', 'http://127.0.0.1:8095/product?id=knit-polo-ivory']
  ]) {
    const r = await testProduct(id, url);
    if (!r.hasH1 || !r.hasRelated || !r.hasReading || !r.relLinksToPathUrls || r.schemas < 2 || !r.title.includes('|')) fail = true;
  }
  // missing id path
  await testProduct('not-found-case', 'http://127.0.0.1:8095/product/does-not-exist');
  console.log(fail ? 'FAIL' : 'ALL CHECKS PASSED');
  process.exit(fail ? 1 : 0);
})();
