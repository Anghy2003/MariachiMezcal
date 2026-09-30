import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../core/motion';
import { NavigationService } from '../core/navigation.service';
import { MagneticDirective, RevealDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';
import { PapelPicadoComponent } from '../shared/papel-picado.component';

interface Moment {
  src: string;
  caption: string;
  pos?: string;
}

const AUTOPLAY = 5;

/** Carrusel "Momentos reales": una foto o video a la vez, avanza solo y se puede deslizar. */
@Component({
  selector: 'app-momentos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, IconComponent, PapelPicadoComponent],
  template: `
    <section id="momentos" class="section section--green">
      <app-papel-picado class="picado" [count]="20" />
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Momentos reales</h2>
          <div class="ornament"><span></span></div>
          <p reveal="up">Serenatas de verdad, con familias de verdad. Cumpleaños, sorpresas y abrazos que se quedan para siempre.</p>
        </div>

        <div class="viewer" reveal="scale" (pointerenter)="pause()" (pointerleave)="resume()" (pointerdown)="dragStart($event)" (pointerup)="dragEnd($event)">
          @for (m of moments; track m.src + $index; let i = $index) {
            <figure class="slide" [attr.aria-hidden]="i !== index()">
              <img [src]="m.src" [style.object-position]="m.pos ?? '50% 40%'" alt="" loading="lazy" draggable="false" />
              <figcaption>{{ m.caption }}</figcaption>
            </figure>
          }
          <button class="nav prev" (click)="go(index() - 1)" aria-label="Anterior"><app-icon name="arrow-left" /></button>
          <button class="nav next" (click)="go(index() + 1)" aria-label="Siguiente"><app-icon name="arrow-right" /></button>
        </div>

        <div class="meta">
          <p class="counter"><b>{{ pad(index() + 1) }}</b> / {{ pad(moments.length) }}</p>
          <div class="bar"><span></span></div>
          <div class="dots">
            @for (m of moments; track $index; let i = $index) {
              <button [class.on]="i === index()" (click)="go(i)" [attr.aria-label]="'Ver momento ' + (i + 1)"></button>
            }
          </div>
        </div>

        <div class="thumbs" data-lenis-prevent>
          @for (m of moments; track $index; let i = $index) {
            <button [class.on]="i === index()" (click)="go(i)" [attr.aria-label]="m.caption">
              <img [src]="m.src" alt="" loading="lazy" />
            </button>
          }
        </div>

        <div class="cta">
          <div>
            <h3>¿Quieres el próximo momento?</h3>
            <p>Reserva tu serenata y déjanos crear un recuerdo que durará toda la vida.</p>
          </div>
          <button class="btn" magnetic (click)="nav.section('reserva')">Reservar ahora <app-icon name="arrow-right" /></button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .picado { position: absolute; top: 0; left: 0; right: 0; }
    .viewer { position: relative; aspect-ratio: 16 / 9; border-radius: var(--radius-lg); overflow: hidden; background: var(--green-900); box-shadow: 0 50px 90px -40px rgba(0,0,0,0.8); touch-action: pan-y; user-select: none; }
    .slide { position: absolute; inset: 0; margin: 0; visibility: hidden; }
    .slide img { width: 100%; height: 100%; object-fit: cover; }
    .slide::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(18,22,19,0.85), transparent 40%); }
    figcaption { position: absolute; z-index: 1; left: 28px; bottom: 24px; display: flex; align-items: center; gap: 12px; font-family: var(--font-poster); font-size: clamp(22px, 2.4vw, 32px); letter-spacing: 0.05em; }
    .nav { position: absolute; z-index: 2; top: 50%; translate: 0 -50%; width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; background: rgba(18,22,19,0.45); backdrop-filter: blur(8px); box-shadow: inset 0 0 0 1px rgba(244,238,227,0.35); transition: background 0.3s, transform 0.4s var(--ease-out); }
    .nav:hover { background: var(--tomato); transform: scale(1.08); }
    .prev { left: 20px; } .next { right: 20px; }
    .meta { display: flex; align-items: center; gap: 20px; margin-top: 22px; }
    .counter { margin: 0; font-family: var(--font-poster); font-size: 20px; letter-spacing: 0.12em; color: var(--cream-muted); }
    .counter b { color: var(--tomato-logo); font-weight: 400; }
    .bar { flex: 1; max-width: 220px; height: 2px; background: rgba(244,238,227,0.18); }
    .bar span { display: block; height: 100%; background: var(--tomato-logo); transform: scaleX(0); transform-origin: left; }
    .dots { margin-left: auto; display: flex; gap: 8px; }
    .dots button { width: 8px; height: 8px; border-radius: 50%; background: rgba(244,238,227,0.25); transition: background 0.3s, width 0.4s var(--ease-out); }
    .dots button.on { background: var(--tomato-logo); width: 26px; border-radius: 4px; }
    .thumbs { display: flex; gap: 12px; margin-top: 22px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
    .thumbs button { position: relative; flex: none; width: 110px; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; opacity: 0.45; transition: opacity 0.4s, transform 0.4s var(--ease-out), box-shadow 0.4s; }
    .thumbs button:hover { opacity: 0.8; transform: translateY(-3px); }
    .thumbs button.on { opacity: 1; box-shadow: 0 0 0 2px var(--tomato-logo); }
    .thumbs img { width: 100%; height: 100%; object-fit: cover; }
    .cta { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 50px; padding-top: 34px; border-top: 1px solid var(--cream-faint); }
    .cta h3 { margin: 0; font-family: var(--font-poster); font-weight: 400; font-size: 30px; letter-spacing: 0.05em; }
    .cta p { margin: 4px 0 0; color: var(--cream-muted); }
    @media (max-width: 700px) {
      .viewer { aspect-ratio: 4 / 5; }
      .nav { display: none; }
      .dots { display: none; }
      .cta { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 560px) {
      figcaption { left: 16px; right: 16px; bottom: 14px; font-size: 20px; flex-wrap: wrap; gap: 8px; }
      .thumbs button { width: 80px; }
      .cta .btn { width: 100%; }
      .cta h3 { font-size: 26px; }
    }
  `,
})
export class MomentosComponent {
  readonly nav = inject(NavigationService);
  readonly index = signal(0);
  readonly moments: Moment[] = [
    { src: 'img/real-cumple.webp', caption: 'Cumpleaños sorpresa con oso amoroso', pos: '50% 45%' },
    { src: 'img/real-parque.webp', caption: 'Serenata en el parque', pos: '50% 35%' },
    { src: 'img/real-cuy.webp', caption: 'El cuysito disfrazado', pos: '50% 30%' },
    { src: 'img/patron-grupo.webp', caption: 'Grupo completo con mascotas', pos: '50% 50%' },
    { src: 'img/pareja-iglesia.webp', caption: 'Elegancia en cada presentación', pos: '50% 35%' },
    { src: 'img/grupo-centro.webp', caption: 'En el centro histórico de Cuenca', pos: '50% 60%' },
    { src: 'img/hero-fiesta.webp', caption: 'Toda la familia Mezcal', pos: '50% 45%' },
    { src: 'img/duo-3.webp', caption: 'Dúo varón y mujer', pos: '50% 30%' },
    { src: 'img/trio.webp', caption: 'Trío en el mercado de flores', pos: '50% 45%' },
  ];

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private progress?: gsap.core.Tween;
  private inView = false;
  private hovering = false;
  private startX = 0;

  constructor() {
    afterNextRender(() => {
      const slides = this.slides();
      gsap.set(slides[0], { visibility: 'visible' });
      ScrollTrigger.create({
        trigger: this.host,
        start: 'top 70%',
        end: 'bottom 20%',
        onToggle: (self) => {
          this.inView = self.isActive;
          if (self.isActive) this.resume();
          else this.progress?.pause();
        },
      });
      this.run();
    });
    inject(DestroyRef).onDestroy(() => this.progress?.kill());
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private slides(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('.slide'));
  }

  private run(): void {
    this.progress?.kill();
    const bar = this.host.querySelector('.bar span');
    this.progress = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: 'none', onComplete: () => this.go(this.index() + 1) });
    if (!this.inView || this.hovering) this.progress.pause();
  }

  pause(): void {
    this.hovering = true;
    this.progress?.pause();
  }

  resume(): void {
    this.hovering = false;
    if (this.inView) this.progress?.resume();
  }

  go(target: number): void {
    const n = this.moments.length;
    const next = ((target % n) + n) % n;
    const prev = this.index();
    if (next === prev) return;
    const dir = target > prev ? 1 : -1;
    this.index.set(next);
    const slides = this.slides();
    const inEl = slides[next];
    const outEl = slides[prev];

    if (prefersReducedMotion()) {
      gsap.set(outEl, { visibility: 'hidden' });
      gsap.set(inEl, { visibility: 'visible' });
    } else {
      gsap.killTweensOf([inEl, outEl, inEl.querySelector('img'), outEl.querySelector('img')]);
      gsap.set(inEl, { visibility: 'visible', zIndex: 1 });
      gsap.set(outEl, { zIndex: 0 });
      gsap.fromTo(inEl, { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, ease: 'expo.inOut' });
      gsap.fromTo(inEl.querySelector('img'), { scale: 1.25, xPercent: dir * 8 }, { scale: 1.04, xPercent: 0, duration: 1.6, ease: 'expo.out' });
      gsap.to(outEl.querySelector('img'), { xPercent: -dir * 12, duration: 1.1, ease: 'expo.inOut' });
      gsap.fromTo(inEl.querySelector('figcaption'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.6 });
      gsap.delayedCall(1.15, () => {
        if (this.index() !== prev) gsap.set(outEl, { visibility: 'hidden', clipPath: 'none' });
        gsap.set(outEl.querySelector('img'), { xPercent: 0 });
      });
    }
    const thumb = this.host.querySelectorAll<HTMLElement>('.thumbs button')[next];
    thumb?.parentElement?.scrollTo({ left: thumb.offsetLeft - 40, behavior: 'smooth' });
    this.run();
  }

  dragStart(e: PointerEvent): void {
    this.startX = e.clientX;
  }

  dragEnd(e: PointerEvent): void {
    const dx = e.clientX - this.startX;
    if (Math.abs(dx) > 50) this.go(this.index() + (dx < 0 ? 1 : -1));
  }
}
