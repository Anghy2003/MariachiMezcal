import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';

/**
 * Varias fotos que se van turnando dentro de una tarjeta (cruce suave con un leve deslizamiento).
 * Se detiene cuando la tarjeta no está en pantalla o la pestaña no está visible.
 */
@Component({
  selector: 'app-photo-cycle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stage">
      @for (src of images(); track src; let i = $index) {
        <img [src]="src" [alt]="i === 0 ? alt() : ''" [style.object-position]="position()" [attr.loading]="i === 0 ? null : 'lazy'" draggable="false" />
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
    img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; }
    img:first-child { opacity: 1; }
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

  readonly current = signal(0);
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
    const imgs = this.host.querySelectorAll<HTMLImageElement>('img');
    const prev = this.current();
    const next = (prev + 1) % imgs.length;
    this.current.set(next);
    gsap.set(imgs[next], { zIndex: 2 });
    gsap.set(imgs[prev], { zIndex: 1 });
    gsap.fromTo(imgs[next], { autoAlpha: 0, xPercent: 6, scale: 1.08 }, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 1.3, ease: 'expo.out' });
    gsap.to(imgs[prev], { autoAlpha: 0, xPercent: -4, duration: 1.3, ease: 'power2.inOut', onComplete: () => gsap.set(imgs[prev], { xPercent: 0, zIndex: 0 }) });
    this.schedule(this.interval());
  }
}
