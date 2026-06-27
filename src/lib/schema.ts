import { SITE, CONTACT, SOCIAL } from '../config/site';
import type { Product } from './catalog';

export function storeSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${SITE.url}/#store`,
    name: SITE.name,
    image: `${SITE.url}/og-default.png`,
    url: SITE.url,
    telephone: `+${CONTACT.phone}`,
    description: SITE.description,
    priceRange: 'S/S/S/',
    currenciesAccepted: 'PEN',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.district,
      addressRegion: CONTACT.address.region,
      addressCountry: 'PE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.geo.lat,
      longitude: CONTACT.geo.lng,
    },
    areaServed: { '@type': 'Country', name: 'Perú' },
    sameAs: [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.youtube].filter(Boolean),
  };
}

export function productSchema(p: Product, opts: { url: string; image: string }) {
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'PEN',
    price: (p.salePrice ?? p.price ?? 0).toFixed(2),
    availability: p.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: opts.url,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${SITE.url}/#store` },
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: opts.image,
    sku: p.sku || undefined,
    brand: p.brands[0] ? { '@type': 'Brand', name: p.brands[0].name } : undefined,
    category: p.categories[0]?.name,
    offers: offer,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.url, SITE.url).toString(),
    })),
  };
}

export function itemListSchema(
  prods: Product[],
  pathFor: (slug: string) => string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: prods.length,
    itemListElement: prods.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: new URL(pathFor(p.slug), SITE.url).toString(),
      name: p.name,
    })),
  };
}
