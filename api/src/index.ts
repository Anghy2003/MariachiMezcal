import type { Env, Reserva, Status } from './types';
import { validarReserva } from './validate';
import { adminUser } from './auth';
import { correoClienteCancelada, correoClienteConfirmada, correoClienteRecibida, correoDuena, sendEmail } from './email';
import { actualizarEvento, borrarEvento, calendarioActivo, crearEvento, enlaceManual } from './calendar';

/**
 * Backend de reservas de Mariachi Mezcal.
 *   POST  /api/reservas                 → la página guarda una reserva nueva (queda "pendiente")
 *   GET   /api/admin/reservas           → el panel lista las reservas
 *   PATCH /api/admin/reservas/:id       → el panel confirma, cancela, marca abono o guarda notas
 *   GET   /api/admin/reservas.csv       → copia de las reservas para abrir en Excel
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/api/reservas' && request.method === 'POST') {
        return withHeaders(await crearReserva(request, env, ctx), cors);
      }
      if (url.pathname.startsWith('/api/admin/')) {
        const user = await adminUser(request, env);
        if (!user) return json({ error: 'no-autorizado' }, 401);
        if (url.pathname === '/api/admin/reservas' && request.method === 'GET') return listar(url, env);
        if (url.pathname === '/api/admin/reservas.csv' && request.method === 'GET') return exportarCsv(env);
        const m = url.pathname.match(/^\/api\/admin\/reservas\/([\w-]{8,40})$/);
        if (m && request.method === 'PATCH') return actualizar(m[1], request, env, ctx);
      }
      if (!url.pathname.startsWith('/api/') && env.ASSETS) return env.ASSETS.fetch(request);
      return json({ error: 'no-encontrado' }, 404, cors);
    } catch (e) {
      console.error(e);
      return json({ error: 'error-interno' }, 500, cors);
    }
  },
} satisfies ExportedHandler<Env>;

/* ---------- Reserva nueva (pública) ---------- */

async function crearReserva(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (Number(request.headers.get('Content-Length') ?? 0) > 20_000) return json({ error: 'muy-grande' }, 413);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'json-invalido' }, 400);
  }

  // Campo trampa lleno = robot: se le responde "ok" para que no insista, pero no se guarda nada
  if ((body as { website?: string })?.website) return json({ ok: true, code: 'MZ-0000' }, 201);

  if (!(await dentroDelLimite(request, env))) return json({ error: 'demasiadas-reservas' }, 429);

  const v = validarReserva(body);
  if (!v.ok) return json({ error: 'datos-invalidos', campos: v.errors }, 422);

  const now = new Date().toISOString();
  const reserva: Reserva = {
    id: crypto.randomUUID(),
    code: '',
    status: 'pendiente',
    created_at: now,
    updated_at: now,
    ...v.data,
    abono: 0,
    notas: '',
    calendar_event_id: null,
  };

  // Código corto único (MZ-XXXX); se reintenta en el caso rarísimo de que ya exista
  for (let intento = 0; intento < 5 && !reserva.code; intento++) {
    const code = codigoCorto();
    try {
      await env.DB.prepare(
        `INSERT INTO reservas (id, code, status, created_at, updated_at, nombre, email, pais, telefono, fecha, hora, direccion, items, total)
         VALUES (?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(reserva.id, code, now, now, reserva.nombre, reserva.email, reserva.pais, reserva.telefono, reserva.fecha, reserva.hora, reserva.direccion, JSON.stringify(reserva.items), reserva.total)
        .run();
      reserva.code = code;
    } catch (e) {
      if (!String(e).includes('UNIQUE')) throw e;
    }
  }
  if (!reserva.code) return json({ error: 'error-interno' }, 500);

  // Los correos salen después de responder, para que la persona no espere
  ctx.waitUntil(
    (async () => {
      const aDuena = correoDuena(env, reserva);
      const aCliente = correoClienteRecibida(reserva);
      await sendEmail(env, env.OWNER_EMAIL, aDuena.subject, aDuena.html, reserva.email);
      await sendEmail(env, reserva.email, aCliente.subject, aCliente.html, env.OWNER_EMAIL);
    })(),
  );

  return json({ ok: true, code: reserva.code, total: reserva.total }, 201);
}

/** Máximo 5 reservas por hora desde la misma conexión. La IP no se guarda: solo su huella cifrada. */
async function dentroDelLimite(request: Request, env: Env): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const huella = await sha256(`${env.RATE_SALT ?? 'mezcal'}:${ip}`);
  const ventana = new Date().toISOString().slice(0, 13);
  const row = await env.DB.prepare(
    `INSERT INTO limites (clave, ventana, cuenta) VALUES (?, ?, 1)
     ON CONFLICT (clave, ventana) DO UPDATE SET cuenta = cuenta + 1 RETURNING cuenta`,
  )
    .bind(huella, ventana)
    .first<{ cuenta: number }>();
  // De paso se borran las ventanas viejas (más de un día)
  await env.DB.prepare('DELETE FROM limites WHERE ventana < ?').bind(new Date(Date.now() - 864e5).toISOString().slice(0, 13)).run();
  return (row?.cuenta ?? 0) <= 5;
}

/* ---------- Panel (solo la dueña) ---------- */

async function listar(url: URL, env: Env): Promise<Response> {
  const status = url.searchParams.get('status');
  const valid: Status[] = ['pendiente', 'confirmada', 'cancelada'];
  const stmt = valid.includes(status as Status)
    ? env.DB.prepare('SELECT * FROM reservas WHERE status = ? ORDER BY fecha, hora').bind(status)
    : env.DB.prepare('SELECT * FROM reservas ORDER BY fecha, hora');
  const { results } = await stmt.all<Record<string, unknown>>();
  return json({ reservas: results.map(fila).map((r) => conCalendario(env, r)) });
}

async function actualizar(id: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const actual = await env.DB.prepare('SELECT * FROM reservas WHERE id = ?').bind(id).first<Record<string, unknown>>();
  if (!actual) return json({ error: 'no-encontrado' }, 404);
  const antes = fila(actual);

  const body = (await request.json().catch(() => ({}))) as { status?: string; abono?: boolean; notas?: string };
  const status = (['pendiente', 'confirmada', 'cancelada'] as const).find((s) => s === body.status) ?? antes.status;
  const abono = typeof body.abono === 'boolean' ? Number(body.abono) : antes.abono;
  const notas = typeof body.notas === 'string' ? body.notas.slice(0, 1000) : antes.notas;
  const now = new Date().toISOString();

  await env.DB.prepare('UPDATE reservas SET status = ?, abono = ?, notas = ?, updated_at = ? WHERE id = ?').bind(status, abono, notas, now, id).run();
  const despues: Reserva = { ...antes, status, abono, notas, updated_at: now };

  // Si cambió el estado, se le avisa al cliente
  if (status !== antes.status && (status === 'confirmada' || status === 'cancelada')) {
    const correo = status === 'confirmada' ? correoClienteConfirmada(despues) : correoClienteCancelada(despues);
    ctx.waitUntil(sendEmail(env, despues.email, correo.subject, correo.html, env.OWNER_EMAIL));
  }

  // Google Calendar: confirmada → se crea (o se actualiza) el evento; si deja de estar confirmada → se borra
  if (calendarioActivo(env)) {
    if (status === 'confirmada' && !antes.calendar_event_id) {
      const eventId = await crearEvento(env, despues);
      if (eventId) {
        await env.DB.prepare('UPDATE reservas SET calendar_event_id = ? WHERE id = ?').bind(eventId, id).run();
        despues.calendar_event_id = eventId;
      }
    } else if (status === 'confirmada' && antes.calendar_event_id) {
      ctx.waitUntil(actualizarEvento(env, antes.calendar_event_id, despues));
    } else if (status !== 'confirmada' && antes.calendar_event_id) {
      ctx.waitUntil(borrarEvento(env, antes.calendar_event_id));
      await env.DB.prepare('UPDATE reservas SET calendar_event_id = NULL WHERE id = ?').bind(id).run();
      despues.calendar_event_id = null;
    }
  }
  return json({ reserva: conCalendario(env, despues) });
}

async function exportarCsv(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT * FROM reservas ORDER BY fecha, hora').all<Record<string, unknown>>();
  const cols = ['code', 'status', 'fecha', 'hora', 'nombre', 'telefono', 'email', 'pais', 'direccion', 'detalle', 'total', 'abono', 'notas', 'created_at'];
  const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lineas = results.map(fila).map((r) =>
    [r.code, r.status, r.fecha, r.hora, r.nombre, r.telefono, r.email, r.pais, r.direccion, r.items.map((i) => `${i.servicio}: ${i.paquete}`).join(' | '), r.total, r.abono ? 'sí' : 'no', r.notas, r.created_at]
      .map(celda)
      .join(','),
  );
  // El BOM (﻿) hace que Excel lea bien las tildes y la ñ
  return new Response('﻿' + [cols.join(','), ...lineas].join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="reservas-mezcal.csv"` },
  });
}

/* ---------- Utilidades ---------- */

/** Agrega el enlace manual "Agregar a Google Calendar" (respaldo si el automático no está activo). */
function conCalendario(env: Env, r: Reserva): Reserva & { calendar_url: string } {
  return { ...r, calendar_url: enlaceManual(env, r) };
}

function fila(r: Record<string, unknown>): Reserva {
  return { ...(r as unknown as Reserva), items: JSON.parse(String(r.items ?? '[]')) };
}

function codigoCorto(): string {
  const abc = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // sin 0/O ni 1/I/L, que se confunden
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return 'MZ-' + Array.from(bytes, (b) => abc[b % abc.length]).join('');
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const permitidos = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  if (env.ENVIRONMENT === 'development') permitidos.push('http://localhost:4300');
  if (!permitidos.includes(origin)) return {};
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
}

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}

function withHeaders(res: Response, headers: Record<string, string>): Response {
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}
