import { Injectable, signal } from '@angular/core';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';

/** Desplazamiento suave (Lenis) sincronizado con las animaciones de GSAP. */
@Injectable({ providedIn: 'root' })
export class SmoothScroll {
  private lenis?: Lenis;
  readonly scrollY = signal(0);
  readonly direction = signal<1 | -1>(1);

  init(): void {
    if (this.lenis) return;
    if (prefersReducedMotion()) {
      window.addEventListener('scroll', () => this.scrollY.set(window.scrollY), { passive: true });
      return;
    }
    this.lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    this.lenis.on('scroll', (l: Lenis) => {
      ScrollTrigger.update();
      this.scrollY.set(l.scroll);
      this.direction.set(l.direction === -1 ? -1 : 1);
    });
    gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  to(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean; duration?: number } = {}): void {
    const offset = opts.offset ?? -70;
    if (this.lenis) {
      // Re-medir la página antes de saltar (las secciones pudieron cambiar de alto)
      this.lenis.resize();
      this.lenis.scrollTo(target, { offset, immediate: opts.immediate, force: true, duration: opts.duration ?? 1.5 });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    const top = typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY + offset : 0;
    window.scrollTo({ top, behavior: opts.immediate ? 'auto' : 'smooth' });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }
}
