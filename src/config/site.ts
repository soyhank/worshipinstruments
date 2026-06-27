/**
 * Configuración central — Worship Instruments
 * Datos reales obtenidos del sitio actual (worshipinstruments.com).
 */
export const SITE = {
  name: 'Worship Instruments',
  legalName: 'Worship Instruments',
  url: 'https://worshipinstruments.com',
  locale: 'es-PE',
  lang: 'es',
  tagline: 'Proaudio · Video · Instrumentos musicales · Sonido para iglesia',
  description:
    'Tienda de proaudio, video e instrumentos musicales en Lima, Perú. Micrófonos, consolas digitales, parlantes, pianos, baterías electrónicas y equipos para iglesias. Precios en soles y entrega en todo el Perú.',
  shortDescription:
    'Proaudio, video e instrumentos musicales para iglesias y profesionales en Lima, Perú.',
} as const;

export const CONTACT = {
  whatsapp: '51997597511',
  whatsappDisplay: '+51 997 597 511',
  phone: '51997597511',
  phoneDisplay: '997 597 511',
  email: 'ventas@worshipinstruments.com', // {{EMAIL}} — confirmar correo real
  address: {
    street: 'Av. Mariano Cornejo 1009, Of. 203',
    district: 'Pueblo Libre',
    city: 'Lima',
    region: 'Lima',
    country: 'PE',
  },
  openingHours: 'Lu-Sa 10:00-19:00', // {{HORARIO}} — confirmar horario real
  geo: { lat: '-12.0746', lng: '-77.0628' }, // aprox. Pueblo Libre — confirmar
} as const;

export const SOCIAL = {
  facebook: 'https://www.facebook.com/worship.lima',
  instagram: 'https://www.instagram.com/worship_instruments',
  youtube: 'https://youtu.be/JRHzq5emZkE',
  tiktok: '',
} as const;

export const WHATSAPP_DEFAULT =
  'Hola Worship Instruments, quisiera más información sobre un producto.';

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? WHATSAPP_DEFAULT);
  return `https://wa.me/${CONTACT.whatsapp}?text=${text}`;
}

export const NAV = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/productos/' },
  { label: 'Categorías', href: '/categorias/' },
  { label: 'Ofertas', href: '/ofertas/' },
  { label: 'Nosotros', href: '/nosotros/' },
  { label: 'Contacto', href: '/contacto/' },
] as const;
