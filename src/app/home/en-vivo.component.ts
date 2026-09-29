import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';
import { RevealDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';

interface LiveVideo {
  title: string;
  poster: string;
  /** Ruta del video cuando la clienta lo envíe, p. ej. 'video/serenata-1.mp4'. */
  src?: string;
}

/**
 * "En vivo": dos videos destacados en bucle y los artistas.
 * Mientras llegan los videos reales, se muestra la foto con movimiento lento y la etiqueta "Video próximamente".
 */
@Component({
  selector: 'app-en-vivo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="en-vivo" class="section section--night">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Míranos en acción</h2>
          <div class="ornament"><span></span></div>
          <p reveal="up">Serenatas reales, emoción real. Así se vive un momento Mezcal.</p>
        </div>

        <div class="videos" reveal="stagger">
          @for (v of videos; track v.title) {
            <figure class="video">
              @if (v.src) {
                <video [src]="v.src" [poster]="v.poster" autoplay muted loop playsinline [muted]="muted()"></video>
              } @else {
                <img [src]="v.poster" alt="" class="kenburns" />
                <div class="soon"><app-icon name="play" /> Video próximamente</div>
              }
              <span class="live"><i></i> En vivo</span>
              <button class="sound" (click)="muted.set(!muted())" [attr.aria-label]="muted() ? 'Activar sonido' : 'Silenciar'">
                <app-icon [name]="muted() ? 'mute' : 'sound'" />
              </button>
              <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
              <figcaption>{{ v.title }}</figcaption>
            </figure>
          }
        </div>

        <div class="artists">
          <h3 reveal="up">Nuestros artistas</h3>
          <ul reveal="stagger">
            @for (a of artists; track $index) {
              <li>
                <div class="portrait">
                  <svg viewBox="0 0 80 80" aria-hidden="true">
                    <path d="M40 18c-6 0-8 6-9 14h18c-1-8-3-14-9-14Z" />
                    <path d="M31 32c-12 1-21 4-21 8 0 5 13 8 30 8s30-3 30-8c0-4-9-7-21-8" />
                    <circle cx="40" cy="56" r="7" />
                    <path d="M26 74c2-7 8-11 14-11s12 4 14 11" />
                  </svg>
                </div>
                <p class="name">{{ a.name }}</p>
                <p class="role">{{ a.role }}</p>
              </li>
            }
          </ul>
          <p class="hint">Fotos de los artistas próximamente.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .videos { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
    .video {
      position: relative; margin: 0; aspect-ratio: 16 / 10; border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: 0 0 0 1px rgba(202, 106, 65, 0.55), 0 30px 60px -30px rgba(0, 0, 0, 0.7);
      background: var(--green-800);
    }
    .video img, .video video { width: 100%; height: 100%; object-fit: cover; }
    .video::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(18, 22, 19, 0.85), transparent 45%); pointer-events: none; }
    .live {
      position: absolute; top: 18px; left: 18px; z-index: 2;
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
      background: rgba(18, 22, 19, 0.6); backdrop-filter: blur(8px); padding: 7px 12px; border-radius: 999px;
    }
    .live i { width: 8px; height: 8px; border-radius: 50%; background: #e0493a; animation: blink 1.4s ease-in-out infinite; }
    @keyframes blink { 50% { opacity: 0.25; } }
    .sound { position: absolute; top: 14px; right: 14px; z-index: 2; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; background: rgba(18, 22, 19, 0.55); backdrop-filter: blur(8px); }
    .soon { position: absolute; inset: 0; z-index: 1; display: grid; place-content: center; grid-auto-flow: column; gap: 10px; align-items: center; font-family: var(--font-poster); font-size: 22px; letter-spacing: 0.1em; color: var(--cream); text-shadow: 0 2px 20px rgba(0,0,0,0.6); }
    .soon app-icon { width: 54px; height: 54px; padding: 16px; border-radius: 50%; background: var(--tomato); box-shadow: 0 0 0 10px rgba(163, 74, 44, 0.3); animation: ring 2.2s ease-out infinite; }
    @keyframes ring { 0% { box-shadow: 0 0 0 0 rgba(163, 74, 44, 0.5); } 100% { box-shadow: 0 0 0 26px rgba(163, 74, 44, 0); } }
    .kenburns { animation: kb 18s ease-in-out infinite alternate; }
    @keyframes kb { from { transform: scale(1.02); } to { transform: scale(1.14) translate(-2%, -1%); } }
    .eq { position: absolute; left: 22px; bottom: 20px; z-index: 2; display: flex; gap: 3px; align-items: flex-end; height: 18px; }
    .eq i { width: 3px; background: var(--tomato-logo); animation: eq 1s ease-in-out infinite; }
    .eq i:nth-child(2) { animation-delay: -0.3s; } .eq i:nth-child(3) { animation-delay: -0.6s; } .eq i:nth-child(4) { animation-delay: -0.15s; } .eq i:nth-child(5) { animation-delay: -0.45s; }
    @keyframes eq { 0%, 100% { height: 20%; } 50% { height: 100%; } }
    figcaption { position: absolute; left: 56px; bottom: 16px; z-index: 2; font-family: var(--font-serif); font-size: 20px; }
    .artists { margin-top: 90px; text-align: center; }
    .artists h3 { font-family: var(--font-poster); font-weight: 400; font-size: 26px; letter-spacing: 0.14em; margin: 0 0 34px; }
    .artists ul { list-style: none; margin: 0; padding: 0; display: flex; justify-content: center; gap: clamp(28px, 6vw, 80px); }
    .portrait { width: 130px; height: 130px; border-radius: 50%; margin: 0 auto 16px; display: grid; place-items: center; background: var(--green-800); box-shadow: 0 0 0 2px var(--tomato), 0 0 0 8px rgba(163, 74, 44, 0.15); transition: transform 0.5s var(--ease-out), box-shadow 0.5s; }
    li:hover .portrait { transform: translateY(-6px) scale(1.04); box-shadow: 0 0 0 2px var(--tomato-logo), 0 0 0 12px rgba(163, 74, 44, 0.25); }
    .portrait svg { width: 64px; fill: none; stroke: rgba(244, 238, 227, 0.4); stroke-width: 2; }
    .name { margin: 0; font-family: var(--font-serif); font-size: 19px; }
    .role { margin: 2px 0 0; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tomato-logo); }
    .hint { margin-top: 26px; font-size: 13px; color: rgba(244, 238, 227, 0.45); }
    @media (max-width: 800px) {
      .videos { grid-template-columns: 1fr; }
      .artists ul { flex-wrap: wrap; }
      .portrait { width: 104px; height: 104px; }
    }
    @media (max-width: 560px) {
      .videos { gap: 18px; }
      figcaption { left: 48px; bottom: 14px; font-size: 16px; }
      .soon { font-size: 17px; }
      .soon app-icon { width: 44px; height: 44px; padding: 13px; }
      .artists { margin-top: 60px; }
      .artists ul { gap: 20px 28px; }
      .portrait { width: 88px; height: 88px; }
      .portrait svg { width: 46px; }
      .name { font-size: 16px; }
    }
  `,
})
export class EnVivoComponent {
  readonly muted = signal(true);
  readonly videos: LiveVideo[] = [
    { title: 'Cumpleaños sorpresa', poster: 'img/real-cumple.webp' },
    { title: 'Serenata en el parque', poster: 'img/real-parque.webp' },
  ];
  readonly artists = [
    { name: 'Artista Mezcal', role: 'Voz' },
    { name: 'Artista Mezcal', role: 'Violín' },
    { name: 'Artista Mezcal', role: 'Guitarrón' },
  ];

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        host.querySelectorAll<HTMLElement>('.video').forEach((v, i) => {
          gsap.fromTo(v, { yPercent: i ? 12 : 4 }, { yPercent: i ? -6 : -2, ease: 'none', scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }, host);
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
