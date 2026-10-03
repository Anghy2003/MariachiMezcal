import type { Env, Reserva } from './types';
import { fechaLarga } from './email';

/**
 * Google Calendar con una "cuenta de servicio" (un robot de Google con su propia llave).
 * La dueña comparte su calendario con el correo del robot ("Hacer cambios en los eventos"),
 * y el backend crea, actualiza o borra el evento de cada serenata confirmada.
 * Sin el secreto GOOGLE_SERVICE_ACCOUNT, todo esto simplemente no hace nada.
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const ZONA = 'America/Guayaquil';
/** Duración que se reserva en el calendario para cada serenata. */
const DURACION_MIN = 60;

export function calendarioActivo(env: Env): boolean {
  return Boolean(env.GOOGLE_SERVICE_ACCOUNT && env.CALENDAR_ID);
}

/** Crea el evento y devuelve su id (o null si no se pudo). */
export async function crearEvento(env: Env, r: Reserva): Promise<string | null> {
  const res = await googleFetch(env, `/calendars/${encodeURIComponent(env.CALENDAR_ID!)}/events`, { method: 'POST', body: JSON.stringify(evento(env, r)) });
  if (!res?.ok) return null;
  return ((await res.json()) as { id?: string }).id ?? null;
}

/** Actualiza el evento (por ejemplo, si cambió el abono o las notas). */
export async function actualizarEvento(env: Env, eventId: string, r: Reserva): Promise<void> {
  await googleFetch(env, `/calendars/${encodeURIComponent(env.CALENDAR_ID!)}/events/${encodeURIComponent(eventId)}`, { method: 'PATCH', body: JSON.stringify(evento(env, r)) });
}

/** Borra el evento (al cancelar o volver a pendiente). Si ya no existía, no pasa nada. */
export async function borrarEvento(env: Env, eventId: string): Promise<void> {
  await googleFetch(env, `/calendars/${encodeURIComponent(env.CALENDAR_ID!)}/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
}

/** Lo que se ve en el calendario de la dueña. */
function evento(env: Env, r: Reserva) {
  const inicio = `${r.fecha}T${r.hora}:00`;
  const lineas = [
    `Reserva ${r.code} · ${r.abono ? 'ABONO RECIBIDO' : 'sin abono registrado'}`,
    '',
    `Cliente: ${r.nombre}`,
    `Teléfono: ${r.telefono} (WhatsApp: https://wa.me/${r.telefono.replace(/\D/g, '')})`,
    `Correo: ${r.email}`,
    '',
    ...r.items.flatMap((i) => [
      `• ${i.servicio} — ${i.paquete} ($${i.precio})`,
      ...(i.regalo ? [`   Regalo: ${i.regalo}`] : []),
      ...i.adicionales.map((a) => `   + ${a.nombre} ($${a.precio})`),
    ]),
    '',
    `Total: $${r.total}`,
    ...(r.notas ? ['', `Notas: ${r.notas}`] : []),
    '',
    `Panel: ${env.PANEL_URL}`,
  ];
  return {
    summary: `Serenata · ${r.items.map((i) => i.servicio).join(' + ')} · ${r.nombre}`,
    location: r.direccion,
    description: lineas.join('\n'),
    start: { dateTime: inicio, timeZone: ZONA },
    end: { dateTime: sumarMinutos(r.fecha, r.hora, DURACION_MIN), timeZone: ZONA },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
    // Color "tomate" de Google Calendar
    colorId: '6',
  };
}

/** Enlace "Agregar a Google Calendar" (respaldo manual, sin cuenta de servicio). */
export function enlaceManual(env: Env, r: Reserva): string {
  const fmt = (f: string, h: string) => `${f.replace(/-/g, '')}T${h.replace(':', '')}00`;
  const fin = sumarMinutos(r.fecha, r.hora, DURACION_MIN);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Serenata · ${r.nombre}`,
    dates: `${fmt(r.fecha, r.hora)}/${fmt(fin.slice(0, 10), fin.slice(11, 16))}`,
    ctz: ZONA,
    location: r.direccion,
    details: `Reserva ${r.code} · ${fechaLarga(r.fecha)} ${r.hora}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

function sumarMinutos(fecha: string, hora: string, min: number): string {
  // Se calcula en "hora local" sin zona: Date.UTC solo sirve como reloj
  const d = new Date(Date.UTC(+fecha.slice(0, 4), +fecha.slice(5, 7) - 1, +fecha.slice(8, 10), +hora.slice(0, 2), +hora.slice(3, 5) + min));
  return d.toISOString().slice(0, 19);
}

/* ---------- Conexión con Google ---------- */

let token: { value: string; exp: number } | null = null;

async function googleFetch(env: Env, path: string, init: RequestInit): Promise<Response | null> {
  if (!calendarioActivo(env)) return null;
  try {
    const access = await accessToken(env);
    const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok && res.status !== 404 && res.status !== 410) console.error('Google Calendar respondió', res.status, await res.clone().text());
    return res;
  } catch (e) {
    console.error('No se pudo conectar con Google Calendar', e);
    return null;
  }
}

/** Pide a Google un permiso de una hora firmando un "pase" (JWT) con la llave del robot. */
async function accessToken(env: Env): Promise<string> {
  if (token && token.exp - 60 > Date.now() / 1000) return token.value;
  const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT!) as ServiceAccount;
  const aud = sa.token_uri ?? 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const jwt = await firmar({ iss: sa.client_email, scope: SCOPE, aud, iat: now, exp: now + 3600 }, sa.private_key);
  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Google no dio permiso (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, exp: now + data.expires_in };
  return token.value;
}

async function firmar(payload: Record<string, unknown>, pem: string): Promise<string> {
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const input = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc(payload)}`;
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input)));
  return `${input}.${b64url(sig)}`;
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
