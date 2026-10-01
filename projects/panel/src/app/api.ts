import { Injectable, signal } from '@angular/core';

export type Status = 'pendiente' | 'confirmada' | 'cancelada';

export interface ReservaItem {
  packageId: string;
  servicio: string;
  paquete: string;
  precio: number;
  regalo: string;
  adicionales: { id: string; nombre: string; precio: number }[];
  subtotal: number;
}

export interface Reserva {
  id: string;
  code: string;
  status: Status;
  created_at: string;
  updated_at: string;
  nombre: string;
  email: string;
  pais: string;
  telefono: string;
  fecha: string;
  hora: string;
  direccion: string;
  items: ReservaItem[];
  total: number;
  abono: number;
  notas: string;
}

/** La sesión venció o falta la clave de desarrollo. */
export class NoAutorizado extends Error {}

/**
 * Conexión del panel con el backend (/api/admin/...).
 * Publicado: Cloudflare Access ya pidió la cuenta de Google antes de abrir el panel, así que no hace falta nada más.
 * En la computadora: se usa la clave de desarrollo (DEV_ADMIN_TOKEN de api/.dev.vars), guardada solo en esta pestaña.
 */
@Injectable({ providedIn: 'root' })
export class PanelApi {
  readonly esLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  readonly devToken = signal(this.leerToken());

  async listar(): Promise<Reserva[]> {
    const data = await this.pedir<{ reservas: Reserva[] }>('/api/admin/reservas');
    return data.reservas;
  }

  async actualizar(id: string, cambios: { status?: Status; abono?: boolean; notas?: string }): Promise<Reserva> {
    const data = await this.pedir<{ reserva: Reserva }>(`/api/admin/reservas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    });
    return data.reserva;
  }

  /** Descarga el archivo de Excel (CSV) con todas las reservas. */
  async descargarCsv(): Promise<void> {
    const res = await fetch('/api/admin/reservas.csv', { headers: this.cabeceras() });
    if (res.status === 401) throw new NoAutorizado();
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: `reservas-mezcal-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  guardarToken(token: string): void {
    try {
      sessionStorage.setItem('mezcal-dev-token', token);
    } catch {
      /* sin almacenamiento: vale solo mientras la pestaña esté abierta */
    }
    this.devToken.set(token);
  }

  private async pedir<T>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), ...this.cabeceras() } });
    if (res.status === 401) throw new NoAutorizado();
    if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
    return (await res.json()) as T;
  }

  private cabeceras(): Record<string, string> {
    const token = this.devToken();
    return this.esLocal && token ? { Authorization: `Bearer ${token}` } : {};
  }

  private leerToken(): string {
    try {
      return sessionStorage.getItem('mezcal-dev-token') ?? '';
    } catch {
      return '';
    }
  }
}
