/**
 * Servicios de Mariachi Mezcal.
 * Precios de la clienta; los de Dúos y los adicionales se tomaron del diseño final en Figma.
 */

/** Efecto visual propio de cada servicio (lienzo animado en su ficha). */
export type EffectMode = 'spotlight' | 'hearts' | 'confetti' | 'notes' | 'picado' | 'candle' | 'sparkle';

/** Regalo o detalle que se ve en la tarjeta del paquete (foto recortada en img/regalos). */
export type Perk = 'oso' | 'ramo' | 'patron' | 'cuy';

export interface ServicePackage {
  id: string;
  name: string;
  note: string;
  price: number;
  tag?: string;
  /** Si el paquete incluye un regalo a elegir. */
  gifts?: string[];
  /** Lo que incluye, para mostrar sus fotos en "Nuestros paquetes". */
  perks?: Perk[];
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  label: string;
  tagline: string;
  intro: string;
  description: string;
  from: number;
  priceLabel: string;
  image: string;
  imagePosition?: string;
  /** La imagen es un recorte con fondo transparente (el oso). */
  cutout?: boolean;
  gallery: string[];
  /** Fotos con clientes reales para la tarjeta de "Nuestros paquetes" (si no hay, se usa la galería). */
  clientPhotos?: string[];
  packages: ServicePackage[];
  addons: boolean;
  effect: EffectMode;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  options?: number[];
  image: string;
}

export const ADDONS: Addon[] = [
  { id: 'ramo', name: 'Ramo de rosas', price: 5, options: [5, 10, 15], image: 'img/regalos/ramo.webp' },
  { id: 'vaquita', name: 'Vaquita loca', price: 15, image: 'img/regalos/vaquita.webp' },
  { id: 'chocolates', name: 'Chocolates', price: 8, image: 'img/regalos/chocolates.webp' },
  { id: 'vinos', name: 'Vinos', price: 12, image: 'img/regalos/vino.webp' },
  { id: 'cuy', name: 'Cuysito disfrazado', price: 5, image: 'img/regalos/cuy.webp' },
];

export const INCLUDED = [
  'Audio profesional en vivo',
  'Movilización en la zona urbana de Cuenca',
  'Puntualidad y trajes de gala',
];

export const SERVICES: Service[] = [
  {
    slug: 'solista',
    name: 'Mariachi Solista',
    shortName: 'Solista',
    label: 'Oferta',
    tagline: 'La magia de una sola voz',
    intro: 'Un artista, varón o mujer, para una serenata íntima.',
    description:
      'Un mariachi solista, varón o mujer, canta 3 canciones más 1 canción de cortesía para tu homenajeado. Gratis: ramo u oso amoroso.',
    from: 25,
    priceLabel: '$25',
    image: 'img/solista.webp',
    imagePosition: '50% 30%',
    clientPhotos: ['img/momento-4.webp', 'img/momento-3.webp'],
    gallery: ['img/solista.webp', 'img/solista-3.webp', 'img/solista-4.webp', 'img/solista-5.webp', 'img/solista-6.webp', 'img/solista-2.webp'],
    packages: [
      {
        id: 'solista-3',
        name: '3 canciones + 1 de cortesía',
        note: 'Gratis: ramo u oso amoroso',
        price: 25,
        tag: 'Oferta',
        gifts: ['Oso amoroso', 'Ramo de flores'],
        perks: ['oso', 'ramo'],
      },
    ],
    addons: true,
    effect: 'spotlight',
  },
  {
    slug: 'show-del-patron',
    name: 'Show del Patrón',
    shortName: 'Show del Patrón',
    label: 'Nuevo',
    tagline: 'Show cómico + serenata',
    intro: 'Tú eliges: patrón o patrona, traje de mariachi o regional, para niños o para adultos.',
    description:
      'Show cómico con serenata de 3 canciones. Tú eliges la vestimenta, traje de mariachi o traje regional, y contamos con patrones varones y patronas mujeres para niños y adultos. Un detalle que recuerda que abrazar a los tuyos no necesita una fecha especial. Incluye transporte a la zona urbana céntrica; a las afueras el valor sube.',
    from: 25,
    priceLabel: 'Desde $25',
    image: 'img/oso.webp',
    cutout: true,
    gallery: [
      'img/oso.webp',
      'img/patron-3.webp',
      'img/patron-1.webp',
      'img/patron-4.webp',
      'img/patron-5.webp',
      'img/patron-2.webp',
    ],
    packages: [
      { id: 'patron-1', name: 'Patrón + serenata', note: 'Show cómico + 3 canciones · gratis oso amoroso o ramo', price: 25, gifts: ['Oso amoroso', 'Ramo de flores'], perks: ['oso', 'ramo'] },
      { id: 'patron-2', name: 'Patrón + osito u osita', note: 'Incluye serenata de 3 canciones', price: 30, perks: ['oso'] },
      { id: 'patron-3', name: 'Patrón + osita + ramo', note: 'Incluye serenata de 3 canciones', price: 35, tag: 'Favorito', perks: ['oso', 'ramo'] },
      { id: 'patron-4', name: 'Patrón + 1 mariachi extra + osita + ramo', note: 'Mariachi varón o mujer · serenata de 4 canciones', price: 40, perks: ['oso', 'ramo'] },
    ],
    addons: true,
    effect: 'confetti',
  },
  {
    slug: 'duos',
    name: 'Mariachi Dúo',
    shortName: 'Dúos',
    label: 'Más pedido',
    tagline: 'Dos voces que llegan al corazón',
    intro: 'Varón y mujer, dos varones o dos mujeres.',
    description:
      'Una serenata a dúo: varón y mujer, dos varones o dos mujeres. Desde el paquete de $35 eliges gratis oso amoroso, ramo de flores o Show del Patrón.',
    from: 30,
    priceLabel: 'Desde $30',
    image: 'img/duo.webp',
    imagePosition: '50% 25%',
    clientPhotos: ['img/momento-1.webp', 'img/momento-2.webp'],
    gallery: ['img/duo.webp', 'img/hero-duo.webp', 'img/duo-3.webp', 'img/pareja-iglesia.webp'],
    packages: [
      { id: 'duo-4a', name: '4 canciones', note: 'No incluye ramo ni osito', price: 30 },
      { id: 'duo-4b', name: '4 canciones', note: 'Gratis a elegir: oso, ramo o Show del Patrón', price: 35, tag: 'Más elegido', gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'], perks: ['oso', 'ramo', 'patron'] },
      { id: 'duo-5', name: '5 canciones', note: 'Gratis a elegir: oso, ramo o Show del Patrón', price: 37, gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'], perks: ['oso', 'ramo', 'patron'] },
      { id: 'duo-6', name: '6 canciones', note: 'Gratis a elegir: oso, ramo o Show del Patrón', price: 40, gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'], perks: ['oso', 'ramo', 'patron'] },
      // El id duo-7 se mantiene para no romper carritos ya guardados
      { id: 'duo-7', name: '8 canciones', note: 'Gratis a elegir: oso, ramo o Show del Patrón', price: 55, tag: 'Completo', gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'], perks: ['oso', 'ramo', 'patron'] },
      { id: 'duo-13', name: '13 canciones', note: 'Gratis a elegir: oso, ramo o Show del Patrón', price: 85, gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'], perks: ['oso', 'ramo', 'patron'] },
    ],
    addons: true,
    effect: 'hearts',
  },
  {
    slug: 'trio',
    name: 'Trío musical',
    shortName: 'Trío',
    label: 'Disponible',
    tagline: 'Tres voces con pista',
    intro: 'Tres mariachis cantan con pista, sin instrumentos.',
    description:
      'Van 3 mariachis y cantan 6 canciones con pista (sin instrumentos). Gratis a elección: oso amoroso, ramo de flores o Show del Patrón.',
    from: 60,
    priceLabel: '$60',
    image: 'img/trio.webp',
    imagePosition: '50% 40%',
    gallery: ['img/trio.webp'],
    packages: [
      {
        id: 'trio-6',
        name: '3 mariachis · 6 canciones',
        note: 'Con pista · gratis oso, ramo o Show del Patrón',
        price: 60,
        gifts: ['Oso amoroso', 'Ramo de flores', 'Show del Patrón'],
        perks: ['oso', 'ramo', 'patron'],
      },
    ],
    addons: true,
    effect: 'notes',
  },
  {
    slug: 'grupos',
    name: 'Grupos con instrumentos',
    shortName: 'Grupos',
    label: 'Disponible',
    tagline: 'La orquesta mexicana completa',
    intro: 'Violines, trompetas, guitarrón y vihuela para tu gran celebración.',
    description:
      'Grupos con todos los instrumentos para eventos, cumpleaños y fiestas especiales. Movilización incluida a las zonas urbanas de Cuenca.',
    from: 95,
    priceLabel: 'Desde $95',
    image: 'img/historia.webp',
    imagePosition: '50% 55%',
    gallery: ['img/historia.webp', 'img/grupos-2.webp', 'img/grupo-centro.webp', 'img/hero-fiesta.webp', 'img/grupos-3.webp'],
    packages: [
      { id: 'grupo-semi', name: 'Semicompleto', note: '6 mariachis · 7 canciones', price: 95 },
      { id: 'grupo-c1', name: 'Completo #1', note: '7 mariachis · 8 canciones', price: 125 },
      {
        id: 'grupo-c2',
        name: 'Completo #2',
        note: '8 mariachis · 8 canciones · gratis ramo, osito o cuysito disfrazado',
        price: 145,
        tag: 'Con regalo',
        gifts: ['Ramo de flores', 'Oso amoroso', 'Cuysito disfrazado'],
        perks: ['ramo', 'oso', 'cuy'],
      },
      { id: 'grupo-patron', name: 'Grupo completo + Show del Patrón', note: '8 mariachis · 7 canciones · patrón o patrona + ramo', price: 150, perks: ['patron', 'ramo'] },
    ],
    addons: true,
    effect: 'picado',
  },
  {
    slug: 'videollamada',
    name: 'Videollamadas y videos',
    shortName: 'Videollamadas',
    label: 'Disponible',
    tagline: 'Tu serenata a cualquier parte del mundo',
    intro: 'Serenata en vivo por videollamada o un video pregrabado para cumpleaños.',
    description:
      'Para nuestros hermanos migrantes: grabamos tu evento o lo transmitimos en vivo, le cantamos por videollamada a tu persona especial o le preparamos un video pregrabado para su cumpleaños. Disponible para cualquier parte del mundo.',
    from: 25,
    priceLabel: '$25',
    image: 'img/videollamada.webp',
    imagePosition: '50% 40%',
    gallery: ['img/videollamada.webp'],
    packages: [
      { id: 'video-llamada', name: 'Serenata por videollamada', note: 'En vivo, a cualquier parte del mundo', price: 25 },
      { id: 'video-grabado', name: 'Video pregrabado de cumpleaños', note: 'Listo para enviar a quien quieras', price: 25 },
    ],
    addons: false,
    effect: 'sparkle',
  },
  {
    slug: 'misas',
    name: 'Misas y ceremonias',
    shortName: 'Misas',
    label: 'Disponible',
    tagline: 'Voz y piano o guitarra para tu ceremonia',
    intro: 'Acompañamiento musical sobrio y emotivo para misas y ceremonias.',
    description: 'Cantantes para misa con voz y piano o guitarra, para acompañar con respeto y emoción cada momento de la ceremonia.',
    from: 70,
    priceLabel: '$70',
    image: 'img/misas.webp',
    imagePosition: '50% 60%',
    gallery: ['img/misas.webp', 'img/pareja-iglesia.webp'],
    packages: [{ id: 'misa', name: 'Cantantes para misa', note: 'Voz y piano o guitarra', price: 70 }],
    addons: false,
    effect: 'candle',
  },
];

export function findService(slug: string | null | undefined): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function findPackage(id: string): { service: Service; pkg: ServicePackage } | undefined {
  for (const service of SERVICES) {
    const pkg = service.packages.find((p) => p.id === id);
    if (pkg) return { service, pkg };
  }
  return undefined;
}
