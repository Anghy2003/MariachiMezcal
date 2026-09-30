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
      'Una serenata íntima con uno de nuestros artistas. Incluye 3 canciones más 1 canción de cortesía para tu homenajeado y, según la promo del mes, un oso o un ramo de regalo.',
    from: 25,
    priceLabel: '$25',
    image: 'img/solista.webp',
    imagePosition: '50% 30%',
    gallery: ['img/solista.webp', 'img/solista-3.webp', 'img/solista-4.webp', 'img/solista-5.webp', 'img/solista-6.webp', 'img/solista-2.webp'],
    packages: [
      {
        id: 'solista-3',
        name: '3 canciones + 1 de cortesía',
        note: 'Incluye oso o ramo según la promo del mes',
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
      'Un show cómico con serenata de 3 canciones. Contamos con patrones varones y patronas mujeres, con traje de mariachi o traje regional, para celebraciones de niños y de adultos.',
    from: 25,
    priceLabel: 'Desde $25',
    image: 'img/oso.webp',
    cutout: true,
    gallery: [
      'img/oso.webp',
      'img/patron-3.webp',
      'img/patron-1.webp',
      'img/patron-2.webp',
      'img/patron-4.webp',
      'img/patron-5.webp',
      'img/patron-6.webp',
      'img/patron-7.webp',
      'img/real-cumple.webp',
    ],
    packages: [
      { id: 'patron-1', name: 'Patrón + serenata', note: '3 canciones · gratis oso amoroso o ramo', price: 25, gifts: ['Oso amoroso', 'Ramo de flores'], perks: ['oso', 'ramo'] },
      { id: 'patron-2', name: 'Patrón + osito u osita', note: 'Incluye serenata de 3 canciones', price: 30, perks: ['oso'] },
      { id: 'patron-3', name: 'Patrón + osita + ramo', note: 'Incluye serenata de 3 canciones', price: 35, tag: 'Favorito', perks: ['oso', 'ramo'] },
      { id: 'patron-4', name: 'Patrón + 1 mariachi extra + osita + ramo', note: 'Serenata de 4 canciones', price: 40, perks: ['oso', 'ramo'] },
      { id: 'patron-5', name: 'Patrón + mariachi completo + ramo', note: 'La fiesta completa', price: 150, tag: 'Completo', perks: ['ramo'] },
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
    intro: 'Varón y mujer, dos varones o dos mujeres. Todos los paquetes incluyen 1 canción de obsequio.',
    description:
      'Una serenata a dúo con dos de nuestros artistas. Todos los paquetes incluyen 1 canción de obsequio para tu persona especial.',
    from: 30,
    priceLabel: 'Desde $30',
    image: 'img/duo.webp',
    imagePosition: '50% 25%',
    gallery: ['img/duo.webp', 'img/hero-duo.webp', 'img/duo-3.webp', 'img/pareja-iglesia.webp'],
    packages: [
      { id: 'duo-4a', name: '4 canciones', note: 'Sin detalles ni obsequio', price: 30 },
      { id: 'duo-4b', name: '4 canciones', note: 'Incluye ramo u oso amoroso', price: 35, tag: 'Más elegido', gifts: ['Oso amoroso', 'Ramo de flores'], perks: ['oso', 'ramo'] },
      { id: 'duo-5', name: '5 canciones', note: 'Incluye ramo u oso amoroso', price: 37, gifts: ['Oso amoroso', 'Ramo de flores'], perks: ['oso', 'ramo'] },
      { id: 'duo-7', name: '7 canciones', note: 'Incluye ramo u oso amoroso', price: 55, tag: 'Completo', gifts: ['Oso amoroso', 'Ramo de flores'], perks: ['oso', 'ramo'] },
      { id: 'duo-12', name: '12 canciones', note: 'Incluye 1 canción de obsequio', price: 85 },
    ],
    addons: true,
    effect: 'hearts',
  },
  {
    slug: 'trio',
    name: 'Trío Mariachi',
    shortName: 'Trío',
    label: 'Disponible',
    tagline: 'Tres voces, seis canciones',
    intro: 'Tres mariachis para una serenata con más fuerza y armonía.',
    description:
      'Van 3 mariachis y cantan 6 canciones. Incluye un regalo a elección: oso amoroso, ramo de flores o el Show del Patrón.',
    from: 60,
    priceLabel: '$60',
    image: 'img/trio.webp',
    imagePosition: '50% 40%',
    gallery: ['img/trio.webp'],
    packages: [
      {
        id: 'trio-6',
        name: '3 mariachis · 6 canciones',
        note: 'Regalo a elección: oso, ramo o show del patrón',
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
      { id: 'grupo-patron', name: 'Grupo completo + Show del Patrón', note: '8 mariachis · 7 canciones', price: 150, perks: ['patron'] },
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
      'Si tu persona especial está lejos, le cantamos por videollamada en vivo o le preparamos un video pregrabado para su cumpleaños. Disponible para cualquier parte del mundo.',
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
