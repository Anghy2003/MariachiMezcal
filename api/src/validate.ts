import { ADDONS, addonLabel, findPackage } from '../../src/app/data/services.data';
import type { ReservaItem } from './types';

/** Lo que manda el formulario de la página. Todo se revisa: nada se da por bueno. */
export interface ReservaInput {
  email: string;
  nombre: string;
  pais: string;
  codigo: string;
  telefono: string;
  fecha: string;
  hora: string;
  direccion: string;
  terminos: boolean;
  items: { packageId: string; regalo?: string; addons?: { id: string; price: number }[] }[];
  /** Campo trampa: invisible para las personas; si viene lleno, lo llenó un robot. */
  website?: string;
}

export interface ReservaValida {
  email: string;
  nombre: string;
  pais: string;
  telefono: string;
  fecha: string;
  hora: string;
  direccion: string;
  items: ReservaItem[];
  total: number;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Fecha de hoy en Ecuador (UTC-5, sin horario de verano), en formato AAAA-MM-DD. */
export function hoyEcuador(offsetDays = 0): string {
  return new Date(Date.now() - 5 * 3600e3 + offsetDays * 864e5).toISOString().slice(0, 10);
}

/**
 * Revisa la reserva y RECALCULA los precios con el catálogo real (el mismo archivo que usa la página).
 * Así nadie puede pagar menos cambiando un precio desde el navegador.
 */
export function validarReserva(body: unknown): { ok: true; data: ReservaValida } | { ok: false; errors: string[] } {
  const b = (body ?? {}) as Partial<ReservaInput>;
  const errors: string[] = [];

  const email = str(b.email, 120).toLowerCase();
  const nombre = str(b.nombre, 80);
  const pais = str(b.pais, 40) || 'Ecuador';
  const codigo = str(b.codigo, 6);
  const telefono = str(b.telefono, 20).replace(/[^\d ]/g, '');
  const fecha = str(b.fecha, 10);
  const hora = str(b.hora, 5);
  const direccion = str(b.direccion, 240);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('email');
  if (nombre.length < 3) errors.push('nombre');
  if (!/^\+\d{1,4}$/.test(codigo) || telefono.replace(/\D/g, '').length < 7) errors.push('telefono');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha)) || fecha < hoyEcuador() || fecha > hoyEcuador(365)) errors.push('fecha');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) errors.push('hora');
  if (direccion.length < 5) errors.push('direccion');
  if (b.terminos !== true) errors.push('terminos');

  const rawItems = Array.isArray(b.items) ? b.items.slice(0, 10) : [];
  if (!rawItems.length) errors.push('items');

  const items: ReservaItem[] = [];
  for (const raw of rawItems) {
    const found = findPackage(str(raw?.packageId, 40));
    if (!found) {
      errors.push('items');
      break;
    }
    const { service, pkg } = found;
    const gifts = pkg.gifts ?? [];
    const regalo = str(raw?.regalo, 40);
    if (regalo && !gifts.includes(regalo)) errors.push('regalo');

    const adicionales: ReservaItem['adicionales'] = [];
    for (const a of Array.isArray(raw?.addons) ? raw.addons.slice(0, ADDONS.length) : []) {
      const addon = ADDONS.find((x) => x.id === a?.id);
      // El adicional debe existir, el servicio debe aceptar adicionales y el precio debe ser uno de los del catálogo
      const precioValido = addon && (addon.options ? addon.options.includes(a.price) : a.price === addon.price);
      if (!addon || !service.addons || !precioValido || adicionales.some((x) => x.id === addon.id)) {
        errors.push('adicionales');
        break;
      }
      adicionales.push({ id: addon.id, nombre: addonLabel(addon, a.price), precio: a.price });
    }

    items.push({
      packageId: pkg.id,
      servicio: service.name,
      paquete: pkg.name,
      precio: pkg.price,
      regalo: regalo || gifts[0] || '',
      adicionales,
      subtotal: pkg.price + adicionales.reduce((s, x) => s + x.precio, 0),
    });
  }

  if (errors.length) return { ok: false, errors: [...new Set(errors)] };
  return {
    ok: true,
    data: {
      email,
      nombre,
      pais,
      // Sin el 0 inicial nacional (0991234567 → +593 991234567), para que el enlace de WhatsApp funcione
      telefono: `${codigo} ${telefono.replace(/\D/g, '').replace(/^0+/, '')}`,
      fecha,
      hora,
      direccion,
      items,
      total: items.reduce((s, i) => s + i.subtotal, 0),
    },
  };
}
