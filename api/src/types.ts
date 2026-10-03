/** Configuración que Cloudflare le entrega al Worker (wrangler.toml + secretos). */
export interface Env {
  DB: D1Database;
  /** Archivos de la página o del panel (Workers static assets). */
  ASSETS?: Fetcher;
  ENVIRONMENT: string;
  OWNER_EMAIL: string;
  FROM_EMAIL: string;
  PANEL_URL: string;
  ALLOWED_ORIGINS: string;
  ADMIN_EMAILS: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  /** Secreto: clave de Resend para enviar correos. Sin ella, los correos solo se muestran en la consola. */
  RESEND_API_KEY?: string;
  /** Secreto: "sal" para cifrar la IP en el límite de reservas. */
  RATE_SALT?: string;
  /** Solo en la computadora: clave para entrar al panel sin Cloudflare Access. */
  DEV_ADMIN_TOKEN?: string;
}

export type Status = 'pendiente' | 'confirmada' | 'cancelada';

/** Una línea de la reserva, con los precios ya calculados por el servidor. */
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
  calendar_event_id: string | null;
}
