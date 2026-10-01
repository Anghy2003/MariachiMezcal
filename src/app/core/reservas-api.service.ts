import { Injectable } from '@angular/core';

/** Lo que se envía al backend. Los precios NO viajan como verdad: el servidor los recalcula con el catálogo. */
export interface ReservaPayload {
  email: string;
  nombre: string;
  pais: string;
  codigo: string;
  telefono: string;
  fecha: string;
  hora: string;
  direccion: string;
  terminos: boolean;
  items: { packageId: string; regalo: string; addons: { id: string; price: number }[] }[];
  website: string;
}

export type ReservaResultado =
  | { kind: 'ok'; code: string; total: number }
  | { kind: 'invalid'; campos: string[] }
  | { kind: 'limit' }
  | { kind: 'offline' };

/**
 * Envía la reserva al backend (Cloudflare Worker). Publicado, responde en la misma dirección que la
 * página (/api/...); en la computadora, ng serve lo redirige al backend de prueba (proxy.conf.json).
 * Si el backend no está disponible, devuelve "offline" y la página ofrece WhatsApp como respaldo.
 */
@Injectable({ providedIn: 'root' })
export class ReservasApiService {
  async enviar(payload: ReservaPayload): Promise<ReservaResultado> {
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const data = (await res.json().catch(() => ({}))) as { code?: string; total?: number; campos?: string[] };
      if (res.status === 201 && data.code) return { kind: 'ok', code: data.code, total: data.total ?? 0 };
      if (res.status === 422) return { kind: 'invalid', campos: data.campos ?? [] };
      if (res.status === 429) return { kind: 'limit' };
      return { kind: 'offline' };
    } catch {
      return { kind: 'offline' };
    }
  }
}
