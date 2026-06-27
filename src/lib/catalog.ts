import type { ImageMetadata } from 'astro';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

export interface ProductImage { file: string; alt: string }
export interface Taxonomy { name: string; slug: string }
export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  permalinkOriginal: string;
  categories: Taxonomy[];
  brands: Taxonomy[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  currencyPrefix: string;
  currencyCode: string;
  inStock: boolean;
  shortDescriptionHtml: string;
  descriptionHtml: string;
  images: ProductImage[];
  attributes: { name: string; terms: string[] }[];
}
export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description: string;
  image: string | null;
}

export const products: Product[] = productsData as Product[];
export const categories: Category[] = (categoriesData as Category[])
  .slice()
  .sort((a, b) => b.count - a.count);

/** Mapa filename -> ImageMetadata para <Image> de astro:assets */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/products/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);
const imageByFile: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(imageModules)) {
  const file = path.split('/').pop()!;
  imageByFile[file] = mod.default;
}

export function productImage(file: string | undefined): ImageMetadata | undefined {
  if (!file) return undefined;
  return imageByFile[file];
}

export function primaryImage(p: Product): ImageMetadata | undefined {
  return productImage(p.images[0]?.file);
}

const priceFmt = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return 'Consultar precio';
  return priceFmt.format(value); // p. ej. "S/ 2,290.00"
}

export function discountPct(p: Product): number | null {
  if (!p.onSale || !p.regularPrice || !p.salePrice) return null;
  const pct = Math.round((1 - p.salePrice / p.regularPrice) * 100);
  return pct > 0 ? pct : null;
}

export function productPath(slug: string): string {
  return `/producto/${slug}/`;
}
export function categoryPath(slug: string): string {
  return `/categoria/${slug}/`;
}

export function productsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categories.some((c) => c.slug === slug));
}

export function onSaleProducts(): Product[] {
  return products.filter((p) => discountPct(p) !== null);
}

export function relatedProducts(p: Product, limit = 4): Product[] {
  const catSlugs = new Set(p.categories.map((c) => c.slug));
  return products
    .filter((x) => x.id !== p.id && x.categories.some((c) => catSlugs.has(c.slug)))
    .slice(0, limit);
}

/** Marcas únicas a partir de los productos */
export function allBrands(): { name: string; slug: string; count: number }[] {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of products) {
    for (const b of p.brands) {
      const e = map.get(b.slug) ?? { name: b.name, slug: b.slug, count: 0 };
      e.count++;
      map.set(b.slug, e);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Texto plano corto desde HTML (para meta description) */
export function plainText(html: string, max = 155): string {
  const txt = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return txt.length > max ? txt.slice(0, max - 1).trimEnd() + '…' : txt;
}
