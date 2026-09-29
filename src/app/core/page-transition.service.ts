import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { gsap, prefersReducedMotion } from './motion';

/**
 * Transición entre páginas: una cortina tomate con el logo cubre la pantalla,
 * se cambia de página y la cortina se retira.
 */
@Injectable({ providedIn: 'root' })
export class PageTransition {
  private readonly router = inject(Router);
  private curtain?: HTMLElement;
  private safety?: ReturnType<typeof setTimeout>;
  readonly busy = signal(false);

  register(el: HTMLElement): void {
    this.curtain = el;
    this.reset();
  }

  /** Deja la cortina oculta y lista (paneles abajo, logo invisible). */
  private reset(): void {
    const c = this.curtain;
    if (!c) return;
    gsap.killTweensOf(c.querySelectorAll('.curtain__panel, .curtain__logo'));
    gsap.set(c.querySelectorAll('.curtain__panel'), { yPercent: 100, y: 0 });
    gsap.set(c.querySelector('.curtain__logo'), { autoAlpha: 0, scale: 0.8 });
    gsap.set(c, { visibility: 'hidden' });
  }

  async go(url: string, fragment?: string): Promise<void> {
    if (this.busy()) return;
    const navigate = () => this.router.navigate([url], { fragment });
    if (!this.curtain || prefersReducedMotion()) {
      await navigate();
      return;
    }
    this.busy.set(true);
    // Seguro: pase lo que pase, a los 4 segundos la cortina desaparece
    clearTimeout(this.safety);
    this.safety = setTimeout(() => this.finish(), 4000);

    const c = this.curtain;
    const panels = c.querySelectorAll('.curtain__panel');
    const logo = c.querySelector('.curtain__logo');
    try {
      gsap.set(c, { visibility: 'visible' });
      await gsap
        .timeline()
        .fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.6, stagger: 0.07, ease: 'expo.inOut' })
        .fromTo(logo, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, '-=0.25')
        .then();
      await navigate();
      await new Promise((r) => setTimeout(r, 120));
      await gsap
        .timeline()
        .to(logo, { autoAlpha: 0, duration: 0.25 })
        .to(panels, { yPercent: -100, duration: 0.7, stagger: 0.07, ease: 'expo.inOut' }, '-=0.05')
        .then();
    } finally {
      this.finish();
    }
  }

  private finish(): void {
    clearTimeout(this.safety);
    this.reset();
    this.busy.set(false);
  }
}
