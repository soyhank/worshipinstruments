# Worship Instruments — Tienda (Astro 5 + Vercel)

Versión moderna, estática y optimizada para SEO + velocidad del sitio
**worshipinstruments.com** (originalmente WordPress + WooCommerce).
Tienda de proaudio, video e instrumentos musicales en Lima, Perú.

## Stack

- **Astro 5** (output `static`) · **Tailwind CSS v4** · **TypeScript** estricto
- `@astrojs/sitemap` · `astro:assets` (imágenes WebP/AVIF) · `sharp`
- Datos del catálogo extraídos de la **WooCommerce Store API** (JSON limpio)
- Despliegue en **Vercel**

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ (estático)
npm run preview
```

## Catálogo (scraping / actualización)

El catálogo vive en `src/data/products.json` y `src/data/categories.json`,
y las imágenes en `src/assets/products/`. Se generan con:

```bash
npm run scrape   # node scripts/scrape.mjs
```

El script consume la API pública de WooCommerce del sitio original
(`/wp-json/wc/store/v1/products`), normaliza productos, precios (S/),
categorías e imágenes, y descarga las fotos localmente. Vuelve a
ejecutarlo cuando cambien productos o precios en el sitio actual, y haz
commit de los archivos actualizados.

> Datos capturados: **58 productos**, **13 categorías**, 255 imágenes de
> producto + logo. Todos con precio en soles, estado de stock y descuentos.

## Estructura de URLs

```
/                         Inicio
/productos/               Catálogo completo (filtro por categoría)
/categorias/              Índice de categorías
/categoria/[slug]/        Listado por categoría (13)
/producto/[slug]/         Ficha de producto (58)
/ofertas/                 Productos en oferta
/nosotros/  /contacto/  /404
```

## SEO y rendimiento

- 100% estático → carga muy rápida (Core Web Vitals).
- Imágenes optimizadas a WebP con tamaños responsivos y `loading="lazy"`.
- JSON-LD: `Store`, `Product` (con `Offer`, precio PEN y disponibilidad),
  `BreadcrumbList`, `ItemList`.
- Meta dinámicos, Open Graph/Twitter, canonical, sitemap y `robots.txt`
  (incluye crawlers de IA).

## Despliegue en Vercel

Salida estática pura (sin adaptador). Importa el repo en
[vercel.com/new](https://vercel.com/new) (detecta Astro: build `npm run build`,
output `dist`) o usa `vercel --prod`.

---

## ⚠️ Pendientes / Placeholders a revisar

1. **Correo y horario** — en `src/config/site.ts` (`CONTACT.email`,
   `CONTACT.openingHours`) y coordenadas `geo` aproximadas: confírmalos.
2. **Formulario de contacto** — en `src/pages/contacto/index.astro`
   reemplaza `action="{{FORM_ENDPOINT}}"` por un endpoint real
   (Web3Forms / Formspree).
3. **Dominio** — al migrar el dominio `worshipinstruments.com` a este sitio,
   asegúrate de redirigir o conservar las URLs de productos. Las rutas usan
   los mismos *slugs* del WooCommerce original (`/producto/<slug>/`), pero la
   ruta antigua era `/producto/<slug>/` también (revisar coincidencia 1:1) y
   `/categoria-producto/<slug>/` → ahora `/categoria/<slug>/` (configurar
   redirecciones 301 si hace falta).
4. **Imágenes dentro de descripciones** — algunas descripciones de producto
   pueden incluir imágenes embebidas que aún apuntan al WordPress original
   (`/wp-content/uploads/...`). Si se apaga ese WordPress, migra esas
   imágenes. Las fotos de la galería principal **ya están локales**.
5. **Carrito / checkout** — esta versión es un catálogo optimizado para SEO
   con conversión por **WhatsApp** (estándar en Perú). Si necesitas checkout
   online, se puede integrar luego (Snipcart, Mercado Pago, o mantener
   WooCommerce headless).

## Licencia

Proyecto privado de Worship Instruments.
