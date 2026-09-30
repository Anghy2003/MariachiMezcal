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
| Acceso interno | Solo el botón y una pantalla "próximamente"; el panel se hace después. |

Extras en todo el sitio: pantalla de bienvenida con el logo, botones magnéticos, cortina entre páginas, carrito lateral (se guarda en el navegador), botón flotante de WhatsApp. Si la persona pidió "reducir movimiento" en su sistema, las animaciones se desactivan.

## Dónde cambiar cosas

- **Precios, paquetes y textos de los servicios:** `src/app/data/services.data.ts`
- **Teléfono, correo, redes:** `src/app/data/site.data.ts`
- **Fotos:** `public/img/`

## Pendiente

- Videos reales y fotos de los artistas, de los adicionales (vaquita loca, ramo, vino, chocolates) y de la videollamada.
- Confirmar con la clienta los precios de Dúos (4 canciones con regalo $35, 7 canciones $55) y de los adicionales (vaquita $15, chocolates $8, vinos $12): se tomaron del diseño de Figma.
- Las reservas no se guardan en un servidor: el formulario arma el mensaje de WhatsApp. Para recibirlas por correo o en el panel hace falta un backend.
- Permiso de las familias (y sobre todo de los niños) que aparecen en las fotos reales antes de publicar.
