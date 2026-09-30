import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';
import { whatsappLink } from '../data/site.data';
import { NavigationService } from '../core/navigation.service';
import { MagneticDirective, RevealDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { PapelPicadoComponent } from '../shared/papel-picado.component';
import { IconComponent } from '../shared/icon.component';

/** Nuevo servicio: serenatas internacionales por videollamada, con el mismo costo. */
@Component({
  selector: 'app-internacional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, StarburstComponent, PapelPicadoComponent, IconComponent],
  template: `
    <section id="internacional" class="section section--tomato">
      <app-papel-picado class="picado" [count]="20" palette="light" />
      <div class="container grid">
        <div class="text">
          <h2 class="section-title" reveal="lines">Serenatas internacionales</h2>
          <p class="sub" reveal="up">Por videollamada, a cualquier parte del mundo</p>
          <p class="body" reveal="up">
            ¿Tu persona especial está lejos? Llevamos la serenata hasta su pantalla, en vivo, con el mismo costo de nuestros paquetes.
          </p>
          <div class="ctas" reveal="stagger">
            <button class="btn btn--green" magnetic (click)="nav.section('reserva')">Reservar videollamada</button>
            <a class="btn btn--ghost" [href]="wa" target="_blank" rel="noopener" magnetic><app-icon name="whatsapp" /> Escribir por WhatsApp</a>
          </div>
        </div>

        <div class="stage">
          <div class="orbit" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="phone">
            <div class="screen">
              <img src="img/videollamada.webp" alt="Serenata por videollamada" />
              <span class="rec"><i></i> En llamada · 02:14</span>
              <div class="pip">
                <app-icon name="globe" />
                <span>Tu persona especial</span>
              </div>
              <div class="bar"><span></span><span class="end"></span><span></span></div>
            </div>
          </div>
          <app-starburst class="burst" small="¡Mismo" text="precio!" [size]="126" tone="cream" [spin]="true" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .picado { position: absolute; top: 0; left: 0; right: 0; }
    .grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(30px, 6vw, 90px); align-items: center; }
    .sub { font-family: var(--font-serif); font-style: italic; font-size: clamp(22px, 2.4vw, 30px); margin: 16px 0 0; }
    .body { margin: 18px 0 0; max-width: 470px; color: rgba(244, 238, 227, 0.88); font-size: 17px; }
    .ctas { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 34px; }
    .stage { position: relative; display: grid; place-items: center; min-height: 520px; }
    .orbit { position: absolute; inset: 0; display: grid; place-items: center; }
    .orbit span { position: absolute; width: 360px; aspect-ratio: 1; border-radius: 50%; border: 1px dashed rgba(244, 238, 227, 0.35); animation: wave 4.5s ease-out infinite; }
    .orbit span:nth-child(2) { animation-delay: 1.5s; } .orbit span:nth-child(3) { animation-delay: 3s; }
    @keyframes wave { from { transform: scale(0.6); opacity: 0.9; } to { transform: scale(1.5); opacity: 0; } }
    .phone { position: relative; width: 250px; aspect-ratio: 9 / 18.5; border-radius: 40px; padding: 10px; background: var(--green-900); box-shadow: 0 50px 90px -30px rgba(0, 0, 0, 0.6), inset 0 0 0 2px rgba(244, 238, 227, 0.15); }
    .screen { position: relative; width: 100%; height: 100%; border-radius: 30px; overflow: hidden; }
    .screen img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; }
    .screen::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.35), transparent 25%, transparent 70%, rgba(0,0,0,0.55)); }
    .rec { position: absolute; z-index: 1; top: 14px; left: 50%; translate: -50% 0; white-space: nowrap; font-size: 10.5px; letter-spacing: 0.1em; background: rgba(0,0,0,0.45); padding: 5px 10px; border-radius: 999px; display: flex; align-items: center; gap: 6px; }
    .rec i { width: 6px; height: 6px; border-radius: 50%; background: #3ddc84; animation: blink 1.2s infinite; }
    @keyframes blink { 50% { opacity: 0.2; } }
    .pip { position: absolute; z-index: 1; right: 12px; top: 46px; width: 76px; height: 100px; border-radius: 14px; background: var(--green-700); border: 2px solid rgba(244, 238, 227, 0.8); display: grid; place-content: center; justify-items: center; gap: 4px; font-size: 8.5px; text-align: center; padding: 6px; }
    .pip app-icon { font-size: 22px; color: var(--tomato-logo); }
    .bar { position: absolute; z-index: 1; bottom: 16px; left: 0; right: 0; display: flex; justify-content: center; gap: 14px; }
    .bar span { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(6px); }
    .bar .end { background: #e0493a; }
    .burst { position: absolute; right: 4%; top: 8%; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .stage { min-height: 460px; }
    }
    @media (max-width: 560px) {
      .stage { min-height: 420px; }
      .phone { width: 200px; border-radius: 32px; }
      .orbit span { width: 260px; }
      .burst { right: -6px; top: 0; scale: 0.72; transform-origin: top right; }
      .ctas .btn { width: 100%; }
    }
  `,
})
export class InternacionalComponent {
  readonly nav = inject(NavigationService);
  readonly wa = whatsappLink('¡Hola Mariachi Mezcal! Quiero una serenata internacional por videollamada.');

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        gsap.from('.phone', { y: 120, rotation: 8, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.stage', start: 'top 80%', once: true } });
        gsap.to('.phone', { y: -14, rotation: -2, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4 });
      }, host);
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
