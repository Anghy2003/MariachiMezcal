import type { Env, Reserva } from './types';

/** Evita que un nombre o dirección con símbolos raros rompa (o se aproveche de) el HTML del correo. */
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** "sábado 5 de octubre" */
export function fechaLarga(fecha: string): string {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${fecha}T12:00:00Z`));
}

/**
 * Envía un correo con Resend. Sin clave (en la computadora), solo lo muestra en la consola.
 * Nunca hace fallar la reserva: si el correo falla, la reserva ya quedó guardada.
 */
export async function sendEmail(env: Env, to: string, subject: string, html: string, replyTo?: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(`[correo de prueba] Para: ${to} | Asunto: ${subject}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject, html, reply_to: replyTo }),
    });
    if (!res.ok) console.error('Resend respondió', res.status, await res.text());
  } catch (e) {
    console.error('No se pudo enviar el correo', e);
  }
}

/** Marco común de todos los correos: verde Mezcal, simple y legible en el celular. */
function layout(titulo: string, cuerpo: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4eee3;font-family:Arial,Helvetica,sans-serif;color:#1e2620">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1e2620;padding:22px 28px;color:#f4eee3;font-size:13px;letter-spacing:3px;text-transform:uppercase">Mariachi Mezcal</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px;color:#1e2620">${titulo}</h1>
${cuerpo}
</td></tr>
<tr><td style="padding:18px 28px;background:#f4eee3;font-size:12px;color:#5b625c">Mariachi Mezcal · Cuenca, Ecuador · +593 95 970 9016</td></tr>
</table></td></tr></table></body></html>`;
}

/** Tabla con el detalle de la reserva (paquetes, regalos, adicionales, total, fecha y lugar). */
function detalle(r: Reserva): string {
  const filas = r.items
    .map((i) => {
      const extras = [i.regalo ? `Regalo: ${esc(i.regalo)}` : '', ...i.adicionales.map((a) => `+ ${esc(a.nombre)} ($${a.precio})`)].filter(Boolean);
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #eee"><b>${esc(i.servicio)}</b><br>${esc(i.paquete)}${
        extras.length ? `<br><span style="color:#5b625c;font-size:13px">${extras.join('<br>')}</span>` : ''
      }</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee;white-space:nowrap">$${i.subtotal}</td></tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px">${filas}
<tr><td style="padding:12px 0"><b>Total</b></td><td align="right" style="padding:12px 0;font-size:20px"><b>$${r.total}</b></td></tr></table>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6"><b>Cuándo:</b> ${esc(fechaLarga(r.fecha))}, ${esc(r.hora)}<br><b>Dónde:</b> ${esc(r.direccion)}</p>`;
}

const boton = (href: string, texto: string) =>
  `<p style="margin:24px 0 0"><a href="${esc(href)}" style="display:inline-block;background:#a34a2c;color:#f4eee3;text-decoration:none;padding:13px 22px;border-radius:8px;font-weight:bold">${texto}</a></p>`;

export function correoDuena(env: Env, r: Reserva): { subject: string; html: string } {
  const wa = `https://wa.me/${r.telefono.replace(/\D/g, '')}`;
  return {
    subject: `Nueva reserva pendiente ${r.code} · ${r.items[0]?.servicio ?? ''} · ${fechaLarga(r.fecha)} ${r.hora}`,
    html: layout(
      `Nueva reserva pendiente <span style="color:#a34a2c">${r.code}</span>`,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6"><b>${esc(r.nombre)}</b><br>${esc(r.telefono)} · <a href="${wa}" style="color:#a34a2c">WhatsApp</a><br>${esc(r.email)} · ${esc(r.pais)}</p>
${detalle(r)}
${boton(env.PANEL_URL, 'Ver en el panel')}`,
    ),
  };
}

export function correoClienteRecibida(r: Reserva): { subject: string; html: string } {
  return {
    subject: `Recibimos tu solicitud de serenata (${r.code})`,
    html: layout(
      `¡Gracias, ${esc(r.nombre.split(' ')[0])}!`,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Recibimos tu solicitud de reserva <b>${r.code}</b>. Está <b>pendiente</b>: te escribiremos por WhatsApp para confirmarla y enviarte los datos para el abono.</p>
${detalle(r)}`,
    ),
  };
}

export function correoClienteConfirmada(r: Reserva): { subject: string; html: string } {
  return {
    subject: `Tu serenata está confirmada (${r.code})`,
    html: layout(
      '¡Tu serenata está confirmada!',
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hola ${esc(r.nombre.split(' ')[0])}, tu reserva <b>${r.code}</b> quedó confirmada. Llegaremos puntuales.</p>
${detalle(r)}`,
    ),
  };
}

export function correoClienteCancelada(r: Reserva): { subject: string; html: string } {
  return {
    subject: `Tu reserva fue cancelada (${r.code})`,
    html: layout(
      'Tu reserva fue cancelada',
      `<p style="margin:0;font-size:15px;line-height:1.6">Hola ${esc(r.nombre.split(' ')[0])}, tu reserva <b>${r.code}</b> para el ${esc(fechaLarga(r.fecha))} fue cancelada. Si fue un error o quieres otra fecha, escríbenos por WhatsApp al +593 95 970 9016.</p>`,
    ),
  };
}
