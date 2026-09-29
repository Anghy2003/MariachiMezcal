/** Datos de contacto del negocio (fuente: la clienta). */
export const SITE = {
  name: 'Mariachi Mezcal',
  company: 'Merchán Maldonado S.A.S.',
  phoneDisplay: '095 970 9016',
  phoneIntl: '+593 95 970 9016',
  whatsapp: '593959709016',
  email: 'jannethbridge@gmail.com',
  address: 'Cuenca, Ecuador, 010107',
  hours: 'Disponibles todo el año',
  social: {
    instagram: 'https://www.instagram.com/mezcal_cuenca/',
    facebook: 'https://www.facebook.com/animacionesmm/',
    tiktok: 'https://www.tiktok.com/@mariachimezcalcuenca',
  },
  year: 2026,
};

/** Enlace de WhatsApp con un mensaje ya escrito. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
