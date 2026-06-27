// Scraper de Worship Instruments (WooCommerce Store API -> JSON limpio + imagenes locales)
// Uso: node scripts/scrape.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://worshipinstruments.com';
const API = `${BASE}/wp-json/wc/store/v1`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const PROD_IMG_DIR = path.join(ROOT, 'src', 'assets', 'products');
const BRAND_DIR = path.join(ROOT, 'src', 'assets', 'brand');

for (const d of [DATA_DIR, PROD_IMG_DIR, BRAND_DIR]) {
  if (!existsSync(d)) await mkdir(d, { recursive: true });
}

function slugify(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 WI-migration' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Descarga con limite de concurrencia
async function pool(items, limit, worker) {
  const ret = [];
  let i = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return ret;
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 WI-migration' } });
    if (!res.ok) { console.warn('  ! img', res.status, url); return false; }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(destPath, buf);
    return true;
  } catch (e) { console.warn('  ! img err', url, e.message); return false; }
}

const money = (p) => {
  if (p == null || p === '') return null;
  const minor = 2;
  return Number(p) / 10 ** minor;
};

console.log('1) Categorias…');
const rawCats = await getJSON(`${API}/products/categories?per_page=100`);
const categories = rawCats
  .filter((c) => c.count > 0)
  .map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.count,
    description: (c.description || '').trim(),
    image: c.image?.src || null }));
console.log(`   ${categories.length} categorias con productos`);

console.log('2) Productos…');
const rawProds = await getJSON(`${API}/products?per_page=100&order=asc&orderby=title`);
console.log(`   ${rawProds.length} productos`);

console.log('3) Descargando imagenes de productos…');
const products = [];
let imgCount = 0;
for (const p of rawProds) {
  const baseSlug = p.slug || slugify(p.name);
  const images = [];
  const imgs = (p.images || []).slice(0, 5);
  await pool(imgs, 4, async (img, i) => {
    const srcUrl = img.src;
    const ext = (path.extname(new URL(srcUrl).pathname) || '.jpg').split('?')[0].toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const file = `${baseSlug}-${i + 1}${safeExt}`;
    const ok = await downloadImage(srcUrl, path.join(PROD_IMG_DIR, file));
    if (ok) { images[i] = { file, alt: (img.alt || p.name).trim() }; imgCount++; }
  });
  const cleanImages = images.filter(Boolean);

  products.push({
    id: p.id,
    name: p.name.trim(),
    slug: baseSlug,
    sku: (p.sku || '').trim(),
    permalinkOriginal: p.permalink,
    categories: (p.categories || []).map((c) => ({ name: c.name, slug: c.slug })),
    brands: (p.brands || []).map((b) => ({ name: b.name, slug: b.slug })),
    price: money(p.prices?.price),
    regularPrice: money(p.prices?.regular_price),
    salePrice: money(p.prices?.sale_price),
    onSale: !!p.on_sale,
    currencyPrefix: p.prices?.currency_prefix || 'S/ ',
    currencyCode: p.prices?.currency_code || 'PEN',
    inStock: !!p.is_in_stock,
    shortDescriptionHtml: p.short_description || '',
    descriptionHtml: p.description || '',
    images: cleanImages,
    attributes: (p.attributes || []).map((a) => ({
      name: a.name, terms: (a.terms || []).map((t) => t.name),
    })),
  });
  process.stdout.write(`   · ${products.length}/${rawProds.length} ${p.name.slice(0, 40)}\r`);
}
console.log(`\n   ${imgCount} imagenes descargadas`);

console.log('4) Logo + icono de marca…');
await downloadImage(`${BASE}/wp-content/uploads/2024/08/WI_2024_SET.png`, path.join(BRAND_DIR, 'logo.png'));
await downloadImage(`${BASE}/wp-content/uploads/2024/08/cropped-icono_wi-1-270x270.png`, path.join(BRAND_DIR, 'icon.png'));
await downloadImage(`${BASE}/wp-content/uploads/2024/08/cropped-icono_wi-1-192x192.png`, path.join(BRAND_DIR, 'favicon-192.png'));

await writeFile(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
await writeFile(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
console.log('5) Escrito src/data/products.json y categories.json');
console.log('Listo.');
