# Mariachi Mezcal — sitio web

Landing de una sola página + fichas de cada servicio, en **Angular 21** con animaciones **GSAP** (ScrollTrigger, SplitText, Flip, DrawSVG) y desplazamiento suave **Lenis**. Basado en el diseño final de Figma (versión minimalista) con los ajustes pendientes ya aplicados.

## Cómo verlo

```bash
npm install
npm start
```

Abre http://localhost:4200. Para la versión de producción: `npm run build` (queda en `dist/mariachi-mezcal`).

## Páginas y ajustes aplicados

| Página / sección | Qué tiene |
|---|---|
| Portada (3 fotos) | Texto exacto del Figma. El título entra gigante y se achica hasta su lugar (efecto de la referencia); las fotos cambian con cortina y zoom lento. En celular las fotos se deslizan de lado a lado y se pueden pasar con el dedo. |
| Nuestra historia | Foto con profundidad al bajar, texto que aparece por líneas, cifras que cuentan. |
| Nuestros servicios | Las 5 tarjetas del Figma (descripción, etiqueta y "¡Lo quiero!"); cada tarjeta turna varias fotos de su categoría. |
| Nuestros paquetes | 6 tarjetas limpias (fondo crema) que turnan fotos y llevan directo a la ficha; ordenar por precio. |
| Serenatas internacionales | Nuevo servicio por videollamada, con celular animado. |
| Promociones | Solo regalos gratis: oso sin fondo que flota, cuy recortado (sin la señora), ilustración del Show del Patrón que se dibuja sola. Se quitó "Personaliza tu paquete". |
| 3 pasos + "Sé parte de nuestra historia" | Camino punteado que se dibuja y pasos en secuencia. |
| Reserva | Solo aparece cuando hay algo en el carrito. Total en vivo, validación y mensaje completo para WhatsApp. |
| Contáctanos | Teléfono, correo, dirección, horario, WhatsApp, redes y mapa oscuro de Cuenca. |
| Momentos reales | Carrusel de 12 elementos (fotos + espacios para video), avanza solo y se puede deslizar. |
| Preguntas frecuentes | Solo las 4 preguntas reales de la clienta. |
| Fichas de servicio (6) | `/servicios/solista`, `show-del-patron`, `duos`, `trio`, `grupos`, `misas`. Cada una con su efecto propio: haz de luz (Solista), confeti (Patrón), destellos entrelazados (Dúos), notas musicales (Trío), papel picado (Grupos) y luz de vela (Misas). |
| Acceso interno | Solo el botón y una pantalla "próximamente". El panel real es una aplicación aparte (ver "Sistema de reservas"). |

Extras en todo el sitio: pantalla de bienvenida con el logo, botones magnéticos, cortina entre páginas, carrito lateral (se guarda en el navegador), botón flotante de WhatsApp. Si la persona pidió "reducir movimiento" en su sistema, las animaciones se desactivan.

## Sistema de reservas

Tres piezas en este mismo repositorio:

| Pieza | Carpeta | Qué hace |
|---|---|---|
| Página | `src/` | "Hacer mi reserva" envía los datos a `/api/reservas`. Si el backend no responde, ofrece WhatsApp. |
| Backend | `api/` | Cloudflare Worker + base de datos D1. Valida, recalcula precios con `services.data.ts`, guarda como *pendiente*, frena spam y envía correos (Resend). |
| Panel | `projects/panel/` | La dueña ve las reservas por día, confirma, cancela, marca el abono, anota y descarga Excel. Avisa si dos reservas quedan a menos de 2 horas. |

Probar todo en la computadora (tres terminales):

```bash
cd api && npm install && cp .dev.vars.example .dev.vars   # una sola vez; pon una clave larga en DEV_ADMIN_TOKEN
cd api && npm run db:migrate:local                          # crea la base de prueba
cd api && npm run dev                                       # backend en http://localhost:8787
npx ng serve --port 4300                                    # página (envía a /api gracias a proxy.conf.json)
npx ng serve panel --port 4301                              # panel (pide la clave DEV_ADMIN_TOKEN)
```

En modo prueba los correos no se envían: se muestran en la consola del backend.

Publicado (pendiente): página y panel en Cloudflare Pages, el backend respondiendo en `tudominio.com/api/*` y `panel.tudominio.com/api/*`, y el panel protegido con Cloudflare Access (cuenta de Google). Valores a completar en `api/wrangler.toml`: dominio, `database_id`, `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`; secretos con `wrangler secret put RESEND_API_KEY` y `RATE_SALT`.

## Dónde cambiar cosas

- **Precios, paquetes y textos de los servicios:** `src/app/data/services.data.ts`
- **Teléfono, correo, redes:** `src/app/data/site.data.ts`
- **Fotos:** `public/img/`

## Pendiente

- Videos reales y fotos de los artistas, de los adicionales (vaquita loca, ramo, vino, chocolates) y de la videollamada.
- Confirmar con la clienta los precios de Dúos (4 canciones con regalo $35, 7 canciones $55) y de los adicionales (vaquita $15, chocolates $8, vinos $12): se tomaron del diseño de Figma.
- Publicar el sistema de reservas: cuentas de Cloudflare y Resend, dominio, Cloudflare Access para el panel. Fase 2: Google Calendar automático. Fase 3: recordatorio del día anterior y copia semanal por correo.
- Permiso de las familias (y sobre todo de los niños) que aparecen en las fotos reales antes de publicar.
