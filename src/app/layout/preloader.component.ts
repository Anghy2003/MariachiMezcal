import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, output, signal } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';

/** Pantalla de bienvenida: el logo aparece con un destello y la cortina se levanta. */
@Component({
  selector: 'app-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.gone]': 'gone()' },
  template: `
    <div class="panel"></div>
    <div class="center">
      <div class="logo" style="-webkit-mask: url(img/logo.webp) center / contain no-repeat; mask: url(img/logo.webp) center / contain no-repeat">
        <img src="img/logo.webp" alt="Mariachi Mezcal" width="190" height="176" />
        <span class="shine"></span>
      </div>
      <p class="tag">Más que un servicio, una experiencia</p>
      <div class="bar"><span></span></div>
      <p class="count">{{ count() }}%</p>
    </div>
  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: 500; display: grid; place-items: center; }
    :host(.gone) { display: none; }
    .panel { position: absolute; inset: 0; background: var(--green-900); }
    .center { position: relative; display: grid; justify-items: center; gap: 18px; }
    .logo { position: relative; width: min(190px, 60vw); overflow: hidden; }
    .logo img { width: 100%; height: auto; }
    .shine { position: absolute; inset: -20% auto -20% -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255, 244, 220, 0.9), transparent); transform: skewX(-18deg); }
    .tag { font-family: var(--font-serif); font-style: italic; font-size: 18px; color: var(--cream-muted); margin: 0; padding: 0 24px; text-align: center; }
    .bar { width: 180px; height: 1px; background: rgba(244, 238, 227, 0.15); overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--tomato-logo); transform: scaleX(0); transform-origin: left; }
    .count { font-family: var(--font-poster); font-size: 16px; letter-spacing: 0.2em; color: var(--tomato-logo); margin: 0; }
  `,
})
export class PreloaderComponent {
  readonly done = output<void>();
  readonly count = signal(0);
  readonly gone = signal(false);

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    afterNextRender(() => {
      if (prefersReducedMotion()) {
        this.gone.set(true);
        this.done.emit();
        return;
      }
      // Seguro: si algo retrasa la animación, a los 6 segundos la bienvenida se retira igual
      const safety = setTimeout(() => {
        if (this.gone()) return;
        this.done.emit();
        this.gone.set(true);
      }, 6000);
      const state = { p: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(safety);
          this.gone.set(true);
        },
      });
      tl.from(host.querySelector('.logo'), { scale: 0.7, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from(host.querySelector('.tag'), { y: 16, autoAlpha: 0, duration: 0.8 }, '-=0.5')
        .to(state, { p: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => this.count.set(Math.round(state.p)) }, 0.2)
        .to(host.querySelector('.bar span'), { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0.2)
        .to(host.querySelector('.shine'), { left: '130%', duration: 1.1, ease: 'power2.inOut' }, 0.7)
        .to(host.querySelector('.center'), { y: -30, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '+=0.15')
        .add(() => {
          if (!this.gone()) this.done.emit();
        }, '-=0.15')
        .to(host.querySelector('.panel'), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.25');
    });
  }
}
