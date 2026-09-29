import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';
import { NavigationService } from '../core/navigation.service';
import { MagneticDirective, RevealDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';

/** "Tu serenata en 3 pasos" y la franja "Sé parte de nuestra historia". */
@Component({
  selector: 'app-pasos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, IconComponent],
  template: `
    <section class="section section--cream pasos">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Tu serenata en 3 pasos</h2>
          <div class="ornament"><span></span></div>
        </div>
        <div class="steps">
          <svg class="path" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true"><path d="M60 20 C 300 -10, 700 50, 940 20" /></svg>
          @for (step of steps; track step.n) {
            <article class="step">
              <span class="num" [class.dark]="step.n === '02'">{{ step.n }}</span>
              <app-icon [name]="step.icon" class="ico" />
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="band">
      <div class="container band__inner">
        <div>
          <h2 reveal="lines">Sé parte de nuestra historia</h2>
          <p reveal="up">Permítenos poner la banda sonora perfecta a tus momentos más inolvidables con la elegancia y alegría que nos caracteriza.</p>
        </div>
        <button class="btn btn--cream" magnetic (click)="nav.section('reserva')">Reservar ahora <app-icon name="arrow-right" /></button>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .steps { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
    .path { position: absolute; top: 34px; left: 0; width: 100%; height: 40px; overflow: visible; }
    .path path { fill: none; stroke: var(--tomato); stroke-width: 2; stroke-dasharray: 6 8; vector-effect: non-scaling-stroke; }
    .step { position: relative; text-align: center; background: #fff; border-radius: 22px; padding: 30px 26px 34px; box-shadow: 0 24px 50px -34px rgba(30, 38, 32, 0.5); }
    .num { position: relative; z-index: 1; display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--tomato); color: var(--cream); font-family: var(--font-poster); font-size: 26px; box-shadow: 0 0 0 8px rgba(163, 74, 44, 0.12); }
    .num.dark { background: var(--green-800); box-shadow: 0 0 0 8px rgba(30, 38, 32, 0.1); }
    .ico { display: block; margin: 18px auto 0; font-size: 26px; color: var(--tomato); }
    h3 { margin: 12px 0 8px; font-family: var(--font-poster); font-weight: 400; font-size: 26px; letter-spacing: 0.05em; }
    .step p { margin: 0; font-size: 14.5px; color: var(--ink-muted); }
    .band { background: var(--tomato); padding-block: clamp(56px, 7vw, 84px); position: relative; overflow: hidden; }
    .band::before { content: ''; position: absolute; inset: 0; background: radial-gradient(600px circle at 85% 50%, rgba(255, 220, 190, 0.18), transparent 60%); }
    .band__inner { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
    .band h2 { margin: 0; font-family: var(--font-display); font-size: clamp(26px, 3.2vw, 40px); text-transform: uppercase; letter-spacing: 0.03em; }
    .band p { margin: 12px 0 0; max-width: 560px; color: rgba(244, 238, 227, 0.9); }
    @media (max-width: 800px) {
      .steps { grid-template-columns: 1fr; }
      .path { display: none; }
      .band__inner { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 560px) {
      .step { padding: 26px 20px 28px; }
      .band .btn { width: 100%; }
    }
  `,
})
export class PasosComponent {
  readonly nav = inject(NavigationService);
  readonly steps = [
    { n: '01', icon: 'music', title: 'Elige tu paquete', text: 'Solista, dúo, trío, Show del Patrón, grupo completo o misa. Agrega regalos y detalles.' },
    { n: '02', icon: 'clock', title: 'Reserva fecha y lugar', text: 'Indica fecha, hora y dirección. Reserva con tiempo y con 30 minutos de margen.' },
    { n: '03', icon: 'whatsapp', title: 'Confirma por WhatsApp', text: 'Te escribimos para confirmar y coordinar cada detalle de tu serenata.' },
  ];

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        const trigger = { trigger: '.steps', start: 'top 78%', once: true };
        gsap.from('.path path', { drawSVG: '0%', duration: 1.8, ease: 'power2.inOut', scrollTrigger: trigger });
        gsap.from('.step', { y: 60, autoAlpha: 0, duration: 1, stagger: 0.18, ease: 'expo.out', scrollTrigger: trigger });
        gsap.from('.num', { scale: 0, rotation: -120, duration: 1, stagger: 0.18, ease: 'back.out(2)', delay: 0.2, scrollTrigger: trigger });
      }, host);
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
