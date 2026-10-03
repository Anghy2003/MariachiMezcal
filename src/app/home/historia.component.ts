import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';
import { CountUpDirective, RevealDirective, TiltDirective } from '../core/directives';

@Component({
  selector: 'app-historia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, CountUpDirective, TiltDirective],
  template: `
    <section id="historia" class="section section--cream">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Nuestra historia</h2>
          <div class="ornament"><span></span></div>
        </div>

        <figure class="photo" reveal="clip">
          <img src="img/misas.webp" alt="Mariachi Mezcal frente a la Catedral de Cuenca" loading="lazy" />
          <figcaption>Merchán Maldonado S.A.S. · Cuenca</figcaption>
        </figure>

        <div class="grid">
          <div class="text">
            <h3 reveal="lines">Pioneros del mariachi solista y a dúo en Ecuador</h3>
            <p reveal="up">
              Somos <b>Merchán Maldonado S.A.S.</b>, una empresa cuencana con 9 años en la ciudad. Somos los pioneros del país en la modalidad de
              <em>mariachi solista</em> y <em>mariachi a dúo</em>, haciendo del mariachi un servicio accesible para todo bolsillo, con paquetes que
              año a año diversificamos para su comodidad y acorde a cada ocasión.
            </p>
            <p reveal="up">Contamos con un amplio repertorio y alta versatilidad en géneros musicales, acoplándonos a sus múltiples peticiones.</p>
            <blockquote reveal="left">Con un enfoque en talento, imagen y animación, hacemos de tu evento más que un servicio: una experiencia.</blockquote>
          </div>
          <ul class="stats" reveal="stagger">
            <li tilt="8">
              <b [countUp]="9"></b>
              <div><p>Años de experiencia</p><span>Trayectoria y confianza en Cuenca y sus cantones.</span></div>
            </li>
            <li tilt="8">
              <b [countUp]="1000" prefix="+"></b>
              <div><p>Serenatas al mes</p><span>Alta demanda: reserva con tiempo.</span></div>
            </li>
            <li tilt="8">
              <b [countUp]="365"></b>
              <div><p>Días al año</p><span>Disponibles todo el año en Cuenca y sus cantones.</span></div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    .photo { position: relative; margin: 0; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 16 / 7.5; box-shadow: 0 0 0 1px rgba(163, 74, 44, 0.5), 0 40px 80px -40px rgba(30, 38, 32, 0.6); }
    .photo img { width: 100%; height: 125%; object-fit: cover; object-position: 50% 80%; }
    figcaption { position: absolute; right: 20px; bottom: 18px; background: var(--green-800); color: var(--cream); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; padding: 10px 16px; border-radius: 999px; }
    .grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: clamp(32px, 6vw, 90px); margin-top: 64px; align-items: start; }
    h3 { font-family: var(--font-display); font-size: clamp(22px, 2.2vw, 30px); letter-spacing: 0.03em; line-height: 1.2; margin: 0 0 22px; text-transform: uppercase; }
    .text p { color: var(--ink-muted); font-size: 16.5px; margin: 0 0 16px; }
    .text em { color: var(--tomato); font-style: italic; font-family: var(--font-serif); font-size: 1.08em; }
    blockquote { margin: 28px 0 0; padding: 20px 26px; border-left: 3px solid var(--tomato); background: rgba(163, 74, 44, 0.07); font-family: var(--font-serif); font-style: italic; font-size: 20px; line-height: 1.5; border-radius: 0 16px 16px 0; }
    .stats { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
    .stats li { display: flex; align-items: center; gap: 20px; padding: 22px 24px; border-radius: var(--radius); background: #fff; box-shadow: 0 20px 40px -28px rgba(30, 38, 32, 0.45); position: relative; overflow: hidden; }
    .stats li::before { content: ''; position: absolute; inset: 0; background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(202, 106, 65, 0.14), transparent 60%); opacity: 0; transition: opacity 0.4s; }
    .stats li:hover::before { opacity: 1; }
    .stats b { font-family: var(--font-poster); font-weight: 400; font-size: 46px; color: var(--tomato); min-width: 96px; line-height: 1; }
    .stats p { margin: 0; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }
    .stats span { font-size: 13.5px; color: var(--ink-muted); }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .photo { aspect-ratio: 4 / 3; }
    }
    @media (max-width: 560px) {
      figcaption { right: 10px; bottom: 10px; font-size: 9.5px; padding: 6px 10px; letter-spacing: 0.1em; }
      .grid { margin-top: 40px; }
      blockquote { font-size: 17px; padding: 16px 18px; }
      .stats li { flex-direction: column; align-items: flex-start; gap: 6px; padding: 18px 20px; }
      .stats b { min-width: 0; font-size: 40px; }
    }
  `,
})
export class HistoriaComponent {
  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        gsap.fromTo('.photo img', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      }, host);
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
