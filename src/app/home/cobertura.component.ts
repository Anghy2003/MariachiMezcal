import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { RevealDirective } from '../core/directives';
import { prefersReducedMotion } from '../core/motion';

/** Cobertura: los cantones donde llevamos la serenata, entre dos banderas de Ecuador ondeando. Va debajo de "Nuestra historia". */
@Component({
  selector: 'app-cobertura',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="cobertura" class="section section--cream cobertura">
      <div class="container">
        <div class="card" reveal="up">
          <div class="head">
            <canvas class="flag" aria-hidden="true"></canvas>
            <div class="centro">
              <h2>Cobertura</h2>
              <p>Cubrimos las siguientes zonas</p>
              <ul class="zonas" reveal="stagger">
                @for (z of zonas; track z) {
                  <li>{{ z }}</li>
                }
              </ul>
            </div>
            <canvas class="flag flag--right" aria-hidden="true"></canvas>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cobertura { padding-top: 0; }
    .card {
      padding: clamp(32px, 4.5vw, 56px) clamp(18px, 4vw, 48px) clamp(30px, 4vw, 48px);
      border-radius: var(--radius-lg);
      background: #fff;
      box-shadow: 0 0 0 1px rgba(163, 74, 44, 0.25), 0 30px 60px -40px rgba(30, 38, 32, 0.5);
    }
    /* Banderas a los lados y, en medio, el título con los cantones */
    .head { max-width: 1060px; margin: 0 auto; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: clamp(14px, 4vw, 56px); text-align: center; }
    h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 3.4vw, 44px); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); }
    .head p { margin: 6px 0 clamp(20px, 2.6vw, 30px); font-family: var(--font-serif); font-style: italic; font-size: clamp(16px, 1.6vw, 20px); color: var(--tomato); }

    /* Bandera de Ecuador ondeando: se dibuja en un canvas (ver ondear()), sin asta.
       Alto extra para que la onda no se corte. */
    .flag { --w: clamp(96px, 12vw, 170px); width: var(--w); height: calc(var(--w) * 0.9); flex: none; }

    .zonas { list-style: none; margin: 0 auto; padding: 0; max-width: 760px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 12px; }
    .zonas li {
      padding: 10px 20px;
      border-radius: 999px;
      background: var(--cream);
      box-shadow: inset 0 0 0 1px rgba(163, 74, 44, 0.22);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink);
      transition: background 0.3s, color 0.3s;
    }
    .zonas li:hover { background: var(--green-800); color: var(--cream); }

    @media (max-width: 640px) {
      .head { gap: 10px; align-items: start; }
      .head p { font-size: 15px; }
      .flag { --w: 46px; margin-top: 14px; }
      .zonas { gap: 7px; }
      .zonas li { padding: 7px 11px; font-size: 10.5px; letter-spacing: 0.08em; }
    }
  `,
})
export class CoberturaComponent {
  readonly zonas = ['Cuenca', 'Azogues', 'Paute', 'Gualaceo', 'Cañar', 'Déleg', 'Sígsig', 'Tarqui', 'Chordeleg', 'Nabón', 'Jima', 'San José de Raranga'];

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let stop = () => {};
    afterNextRender(() => (stop = ondear(host)));
    inject(DestroyRef).onDestroy(() => stop());
  }
}

/**
 * Dibuja las banderas ondeando en sus canvas: la tela se corta en tiras de 2 px que suben y bajan con
 * una onda que crece hacia el borde libre, con luz y sombra que viajan con ella.
 * Es mucho más liviano que animar decenas de elementos con CSS, y solo se anima mientras se ve en pantalla.
 */
function ondear(host: HTMLElement): () => void {
  const canvases = [...host.querySelectorAll<HTMLCanvasElement>('canvas.flag')];
  const img = new Image();
  img.src = 'img/banderas/ecuador.webp';
  let raf = 0;
  let visible = false;
  let last = 0;

  const ajustar = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const c of canvases) {
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    }
  };

  const dibujar = (t: number) => {
    if (!img.complete || !img.naturalWidth) return;
    canvases.forEach((c, k) => {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const W = c.width;
      const fh = (W * 2) / 3;
      const top = (c.height - fh) / 2;
      const paso = Math.max(2, Math.round(W / 90));
      ctx.clearRect(0, 0, W, c.height);
      for (let x = 0; x < W; x += paso) {
        const d = k === 0 ? x / W : 1 - x / W; // distancia al borde de afuera (lado "sujeto": ahí la onda es menor)
        const ramp = 0.18 + 0.82 * Math.pow(d, 1.15);
        const fase = 2 * Math.PI * (d * 1.05 - t);
        const y = top + W * 0.08 * ramp * Math.sin(fase);
        ctx.drawImage(img, (x / W) * img.naturalWidth, 0, (paso / W) * img.naturalWidth, img.naturalHeight, x, y, paso + 0.5, fh);
        const luz = 0.2 * Math.cos(fase) * (0.25 + 0.75 * ramp);
        ctx.fillStyle = luz > 0 ? `rgba(255,255,255,${luz * 0.55})` : `rgba(0,0,0,${-luz * 0.7})`;
        ctx.fillRect(x, y, paso + 0.5, fh);
      }
    });
  };

  const bucle = (now: number) => {
    raf = requestAnimationFrame(bucle);
    if (now - last < 33) return; // ~30 cuadros por segundo es suficiente para una tela
    last = now;
    dibujar((now / 1800) % 1);
  };
  const arrancar = () => {
    if (!raf && visible && !document.hidden && !prefersReducedMotion()) raf = requestAnimationFrame(bucle);
  };
  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  ajustar();
  img.onload = () => dibujar(0.25);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) arrancar();
    else parar();
  });
  io.observe(host);
  const ro = new ResizeObserver(() => {
    ajustar();
    dibujar(0.25);
  });
  ro.observe(canvases[0]);
  const alCambiarPestana = () => (document.hidden ? parar() : arrancar());
  document.addEventListener('visibilitychange', alCambiarPestana);

  return () => {
    parar();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', alCambiarPestana);
  };
}
