// End-to-end verification of this fork's own behaviour: TriMet branding, the
// three TriMet basemaps, and the Portland metro bounds. The inherited suite in
// tests/e2e asserts the upstream multi-catalog product and no longer applies —
// see the note in .github/workflows/playwright.yml.
//
// This hits the network on purpose: the live catalog on Source Cooperative and
// tiles.trimet.org. It verifies against real data rather than mocks.
//
// Usage:
//   node_modules/.bin/vite --port 8080 --strictPort &
//   node verify-trimet.mjs [baseUrl]
//
// Screenshots land in ./verify-out (override with VERIFY_OUT).
/* global process */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8080';
const OUT = process.env.VERIFY_OUT || './verify-out';
mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

// Reaches into the page for the live MapLibre instance. MapView keeps it on the
// component, so walk the Vue tree from the map container element.
const MAP_PROBE = `(() => {
  const el = document.querySelector('.maplibregl-map');
  if (!el) return null;
  let node = el;
  while (node) {
    const vnode = node.__vueParentComponent || node.__vnode;
    if (vnode) {
      let c = node.__vueParentComponent;
      while (c) {
        if (c.ctx && c.ctx.map && c.ctx.map.getStyle) return c.ctx.map;
        if (c.proxy && c.proxy.map && c.proxy.map.getStyle) return c.proxy.map;
        c = c.parent;
      }
    }
    node = node.parentElement;
  }
  return null;
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(`pageerror: ${e.message}`));

const tileRequests = [];
page.on('request', r => { if (r.url().includes('tiles.trimet.org')) tileRequests.push(r.url()); });

// ---------- 1. Root catalog ----------
await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const title = await page.textContent('h1').catch(() => null);
check('root catalog loads', title === 'TriMet Geospatial Data', `h1 = ${JSON.stringify(title)}`);

const cardCount = await page.locator('.catalog-card').count();
check('all 8 collections listed', cardCount === 8, `${cardCount} cards`);

await page.screenshot({ path: `${OUT}/tm-01-root.png` });

// ---------- 2. Header branding ----------
const header = await page.evaluate(() => {
  const bar = document.querySelector('.tm-bar');
  const menu = document.querySelector('.tm-menu');
  const stripe = document.querySelector('.tm-stripes i');
  const brand = document.querySelector('.tm-brand');
  const cs = e => e && getComputedStyle(e);
  return {
    barBg: cs(document.querySelector('.tm-header'))?.backgroundColor,
    menuBg: cs(menu)?.backgroundColor,
    stripeBg: cs(stripe)?.backgroundColor,
    font: cs(brand)?.fontFamily,
    brandText: brand?.innerText.replace(/\s+/g, ''),
    barWidth: bar?.getBoundingClientRect().width,
    swirlSrc: document.querySelector('.tm-swirl')?.getAttribute('src'),
    hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
});
check('header blue is #214B88', header.barBg === 'rgb(33, 75, 136)', header.barBg);
check('MENU green is #4E8227', header.menuBg === 'rgb(78, 130, 39)', header.menuBg);
check('stripe orange is #C04F2E', header.stripeBg === 'rgb(192, 79, 46)', header.stripeBg);
check('Source Sans Pro applied', /Source Sans Pro/.test(header.font || ''), header.font);
check('wordmark reads TRIMET', header.brandText?.startsWith('TRIMET'), header.brandText);
check('swirl asset referenced', !!header.swirlSrc, header.swirlSrc);
check('no horizontal overflow', header.hOverflow === 0, `${header.hOverflow}px`);

// ---------- 3. Collection map ----------
await page.goto(`${BASE}/#/routes/collection.json`, { waitUntil: 'networkidle' });
await page.waitForSelector('.maplibregl-map', { timeout: 30000 });

// Wait for the basemap style to actually finish loading.
await page.waitForFunction(`(() => { const m = ${MAP_PROBE}; return m && m.isStyleLoaded && m.isStyleLoaded() && m.getStyle() && !!m.getStyle().name; })()`, null, { timeout: 45000 });
await page.waitForTimeout(4000);

const mapState = await page.evaluate(`(() => {
  const m = ${MAP_PROBE};
  const s = m.getStyle();
  return {
    name: s.name,
    sources: Object.keys(s.sources),
    minZoom: m.getMinZoom(), maxZoom: m.getMaxZoom(),
    maxBounds: m.getMaxBounds() && m.getMaxBounds().toArray(),
    center: [m.getCenter().lng, m.getCenter().lat],
    zoom: m.getZoom(),
    has3D: s.layers.some(l => l.type === 'fill-extrusion'),
    stacLayers: s.layers.filter(l => /stac|parquet|pmtiles|routes/i.test(l.id)).map(l => l.id)
  };
})()`);

check('default basemap is TriMet 3D', mapState.name === 'TriMet 3D', mapState.name);
check('3D building layer present', mapState.has3D === true, `fill-extrusion: ${mapState.has3D}`);
check('minZoom clamped to 7.5', mapState.minZoom === 7.5, String(mapState.minZoom));
check('maxBounds set to metro', JSON.stringify(mapState.maxBounds) === JSON.stringify([[-124.2, 44.4], [-120.3, 46.4]]), JSON.stringify(mapState.maxBounds));
check('tiles fetched from tiles.trimet.org', tileRequests.length > 0, `${tileRequests.length} requests`);
check('collection data layer rendered', mapState.stacLayers.length > 0, mapState.stacLayers.join(', ') || 'none');

await page.screenshot({ path: `${OUT}/tm-02-routes-3d.png` });

// ---------- 4. Bounds clamping ----------
const clamp = await page.evaluate(`(async () => {
  const m = ${MAP_PROBE};
  m.jumpTo({ center: [-122.33, 47.61], zoom: 10 });   // Seattle
  await new Promise(r => setTimeout(r, 600));
  const afterPan = [m.getCenter().lng, m.getCenter().lat];
  m.setZoom(2);                                        // try to zoom to world
  await new Promise(r => setTimeout(r, 600));
  const afterZoom = m.getZoom();
  return { afterPan, afterZoom };
})()`);
check('pan to Seattle is clamped', clamp.afterPan[1] < 46.5, `lat ${clamp.afterPan[1].toFixed(3)}`);
check('zoom-out is clamped to minZoom', clamp.afterZoom >= 7.5, `zoom ${clamp.afterZoom}`);

// ---------- 5. Basemap switching ----------
await page.goto(`${BASE}/#/routes/collection.json`, { waitUntil: 'networkidle' });
await page.waitForFunction(`(() => { const m = ${MAP_PROBE}; return m && m.isStyleLoaded && m.isStyleLoaded() && m.getStyle() && !!m.getStyle().name; })()`, null, { timeout: 45000 });

await page.click('.map-layercontrol button, .map-layercontrol');
await page.waitForTimeout(800);
const radios = await page.locator('input[type=radio]').count();
check('basemap switcher offers exactly 3', radios === 3, `${radios} options`);

const labels = await page.locator('.layercontrol label').allInnerTexts().catch(() => []);
check('basemaps are the TriMet three',
  ['TriMet 3D', 'TriMet Dark 3D', 'TriMet Satellite'].every(t => labels.join('|').includes(t)),
  labels.join(' | '));

for (const [idx, expected] of [[1, 'TriMet Dark 3D'], [2, 'TriMet Satellite']]) {
  await page.locator('input[type=radio]').nth(idx).click({ force: true });
  await page.waitForFunction(
    `(() => { const m = ${MAP_PROBE}; return m && m.isStyleLoaded() && m.getStyle() && m.getStyle().name === ${JSON.stringify(expected)}; })()`,
    null, { timeout: 45000 }
  ).catch(() => {});
  await page.waitForTimeout(3500);
  const now = await page.evaluate(`(() => { const m = ${MAP_PROBE}; const s = m.getStyle(); return s && s.name; })()`);
  check(`switch to ${expected}`, now === expected, `style = ${now}`);
  await page.screenshot({ path: `${OUT}/tm-0${3 + idx}-${expected.toLowerCase().replace(/ /g, '-')}.png` });
}

const realErrors = consoleErrors.filter(e => !/favicon|ResizeObserver/i.test(e));
check('no console errors', realErrors.length === 0, realErrors.slice(0, 3).join(' ;; ') || 'clean');

await browser.close();

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map(f => f.name).join(', '));
  process.exit(1);
}
