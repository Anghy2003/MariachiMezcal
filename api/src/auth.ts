import type { Env } from './types';

/**
 * ¿Quién está usando el panel?
 * Publicado: Cloudflare Access verifica la cuenta de Google y manda un "pase" firmado (JWT) en la
 * cabecera Cf-Access-Jwt-Assertion. Aquí se comprueba la firma, que el pase sea para esta aplicación,
 * que no haya vencido y que el correo esté en ADMIN_EMAILS.
 * En la computadora: si ENVIRONMENT = "development", basta la clave DEV_ADMIN_TOKEN.
 */
export async function adminUser(request: Request, env: Env): Promise<string | null> {
  if (env.ENVIRONMENT === 'development' && env.DEV_ADMIN_TOKEN) {
    return request.headers.get('Authorization') === `Bearer ${env.DEV_ADMIN_TOKEN}` ? 'desarrollo' : null;
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  try {
    const header = JSON.parse(b64urlText(h)) as { kid?: string; alg?: string };
    const payload = JSON.parse(b64urlText(p)) as { aud?: string | string[]; exp?: number; iss?: string; email?: string };
    if (header.alg !== 'RS256') return null;

    const key = await accessKey(env.ACCESS_TEAM_DOMAIN, header.kid ?? '');
    if (!key) return null;
    const firmaValida = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
    if (!firmaValida) return null;

    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    if (payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;

    const email = (payload.email ?? '').toLowerCase();
    const permitidos = env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    return permitidos.includes(email) ? email : null;
  } catch {
    return null;
  }
}

/** Llaves públicas de Cloudflare Access (se guardan una hora para no pedirlas en cada clic). */
let certs: { at: number; keys: (JsonWebKey & { kid?: string })[] } | null = null;

async function accessKey(team: string, kid: string): Promise<CryptoKey | null> {
  if (!certs || Date.now() - certs.at > 3600e3) {
    const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
    if (!res.ok) return null;
    certs = { at: Date.now(), keys: ((await res.json()) as { keys: (JsonWebKey & { kid?: string })[] }).keys };
  }
  const jwk = certs.keys.find((k) => k.kid === kid);
  if (!jwk) return null;
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
}

function b64urlBytes(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function b64urlText(s: string): string {
  return new TextDecoder().decode(b64urlBytes(s));
}
