// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Dominio de produccion (la web reemplaza a la actual de WordPress)
const SITE = 'https://worshipinstruments.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: { inlineStylesheets: 'auto' },
  image: {
    // Permite optimizar imagenes remotas si en el futuro se referencian directo
    domains: ['worshipinstruments.com'],
  },
});
