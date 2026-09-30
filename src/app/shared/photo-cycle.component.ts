import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';

/**
 * Varias fotos que se van turnando dentro de una tarjeta (cruce suave con un leve deslizamiento).
 * Se detiene cuando la tarjeta no está en pantalla o la pestaña no está visible.
 * Con `fitWide`, una foto mucho más ancha que la tarjeta se muestra completa sobre un fondo
 * desenfocado de sí misma, en vez de recortarse (así no se pierde gente en las orillas).
 */
@Component({
  selector: 'app-photo-cycle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stage">
      @for (src of images(); track src; let i = $index) {
        <div class="slide" [class.wide]="wide()[i]">
          @if (wide()[i]) {
            <img class="fill" [src]="src" alt="" aria-hidden="true" draggable="false" />
          }
          <img
            class="main"
            [src]="src"
            [alt]="i === 0 ? alt() : ''"
            [style.object-position]="wide()[i] ? 'center 8%' : position()"
            [attr.loading]="i === 0 ? null : 'lazy'"
            draggable="false"
            (load)="measure(i, $event)"
          />
        </div>
      }
    </div>
    @if (images().length > 1) {
      <div class="dots" aria-hidden="true">
        @for (src of images(); track src; let i = $index) {
          <i [class.on]="i === current()"></i>
        }
      </div>
    }
  `,
  styles: `
    :host { position: absolute; inset: 0; display: block; overflow: hidden; }
    .stage { position: absolute; inset: 0; transition: transform 1.2s var(--ease-out); }
    :host-context(.card:hover) .stage { transform: scale(1.07); }
    .slide { position: absolute; inset: 0; opacity: 0; }
    .slide:first-child { opacity: 1; }
    img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .wide .main { object-fit: contain; }
    .fill { filter: blur(22px) brightness(0.6); transform: scale(1.15); }
    .dots { position: absolute; z-index: 2; left: 50%; top: 14px; translate: -50% 0; display: flex; gap: 5px; }
    .dots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(244, 238, 227, 0.45); transition: width 0.4s var(--ease-out), background 0.3s; }
    .dots i.on { width: 16px; border-radius: 3px; background: var(--cream); }
  `,
})
export class PhotoCycleComponent {
  readonly images = input.required<string[]>();
  readonly position = input('center');
  readonly alt = input('');
  /** Milisegundos entre una foto y la siguiente. */
  readonly interval = input(4200);
  /** Retraso inicial, para que las tarjetas no cambien todas a la vez. */
  readonly delay = input(0);
  /** Mostrar completas (sin recortar) las fotos mucho más anchas que la tarjeta. */
  readonly fitWide = input(false);

  readonly current = signal(0);
  /** Qué fotos se muestran completas (se decide al cargar cada una). */
  readonly wide = signal<boolean[]>([]);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private visible = false;
  private io?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (this.images().length < 2 || prefersReducedMotion()) return;
      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.schedule(this.delay() + 1200);
        else clearTimeout(this.timer);
      });
      this.io.observe(this.host);
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.io?.disconnect();
    });
  }

  /** Una foto es "ancha" si es horizontal y bastante más ancha que la tarjeta: recortarla dejaría gente fuera.
   *  (Una tarjeta muy alta no vuelve "ancha" a una foto vertical.) */
  measure(i: number, e: Event): void {
    if (!this.fitWide()) return;
    const img = e.target as HTMLImageElement;
    const box = this.host.getBoundingClientRect();
    if (!img.naturalHeight || !box.height) return;
    const isWide = img.naturalWidth / img.naturalHeight > Math.max(1, (box.width / box.height) * 1.3);
    if (isWide !== !!this.wide()[i]) {
      this.wide.update((w) => {
        const next = [...w];
        next[i] = isWide;
        return next;
      });
    }
  }

  private schedule(ms: number): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.next(), ms);
  }

  private next(): void {
    if (!this.visible) return;
    if (document.hidden) {
      this.schedule(this.interval());
      return;
    }
    const slides = this.host.querySelectorAll<HTMLElement>('.slide');
    const prev = this.current();
    const next = (prev + 1) % slides.length;
    this.current.set(next);
    gsap.set(slides[next], { zIndex: 2 });
    gsap.set(slides[prev], { zIndex: 1 });
    gsap.fromTo(slides[next], { autoAlpha: 0, xPercent: 6, scale: 1.08 }, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 1.3, ease: 'expo.out' });
    gsap.to(slides[prev], { autoAlpha: 0, xPercent: -4, duration: 1.3, ease: 'power2.inOut', onComplete: () => gsap.set(slides[prev], { xPercent: 0, zIndex: 0 }) });
    this.schedule(this.interval());
  }
}
