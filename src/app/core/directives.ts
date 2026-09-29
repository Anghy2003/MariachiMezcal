import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input, numberAttribute } from '@angular/core';
import { gsap, SplitText, isTouch, prefersReducedMotion } from './motion';

type RevealKind = 'up' | 'fade' | 'lines' | 'words' | 'scale' | 'left' | 'right' | 'clip' | 'stagger';

/**
 * Hace aparecer un elemento cuando entra en pantalla.
 * Uso: <h2 reveal="lines">, <div reveal="stagger"> (anima a sus hijos uno por uno).
 */
@Directive({ selector: '[reveal]' })
export class RevealDirective {
  readonly reveal = input<RevealKind | ''>('up');
  readonly revealDelay = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly revealStart = input('top 86%');

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private ctx?: gsap.Context;
  private split?: SplitText;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      document.fonts.ready.then(() => this.build());
    });
    inject(DestroyRef).onDestroy(() => {
      this.ctx?.revert();
      this.split?.revert();
    });
  }

  private build(): void {
    const el = this.el;
    const kind = this.reveal() || 'up';
    const trigger = { trigger: el, start: this.revealStart(), once: true };
    const delay = this.revealDelay();
    // En celulares el desplazamiento lateral es menor para que nada se salga de la pantalla
    const side = window.innerWidth < 600 ? 24 : 60;

    this.ctx = gsap.context(() => {
      switch (kind) {
        case 'lines': {
          this.split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
          gsap.from(this.split.lines, { yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'expo.out', delay, scrollTrigger: trigger });
          break;
        }
        case 'words': {
          this.split = SplitText.create(el, { type: 'words', mask: 'words' });
          gsap.from(this.split.words, { yPercent: 100, opacity: 0, duration: 0.9, stagger: 0.035, ease: 'expo.out', delay, scrollTrigger: trigger });
          break;
        }
        case 'fade':
          gsap.from(el, { autoAlpha: 0, duration: 1.2, delay, scrollTrigger: trigger });
          break;
        case 'scale':
          gsap.from(el, { scale: 0.86, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay, scrollTrigger: trigger });
          break;
        case 'left':
          gsap.from(el, { x: -side, autoAlpha: 0, duration: 1.1, delay, scrollTrigger: trigger });
          break;
        case 'right':
          gsap.from(el, { x: side, autoAlpha: 0, duration: 1.1, delay, scrollTrigger: trigger });
          break;
        case 'clip':
          gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay, scrollTrigger: trigger });
          break;
        case 'stagger':
          gsap.from(el.children, { y: 50, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out', delay, scrollTrigger: trigger });
          break;
        default:
          gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay, scrollTrigger: trigger });
      }
    }, el);
  }
}

/** Inclinación 3D que sigue al cursor, con un brillo que se mueve encima. */
@Directive({
  selector: '[tilt]',
  host: {
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'leave()',
  },
})
export class TiltDirective {
  readonly tilt = input(10, { transform: (v: unknown) => numberAttribute(v, 10) });
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly enabled = !isTouch() && !prefersReducedMotion();
  private rx = this.enabled ? gsap.quickTo(this.el, 'rotationX', { duration: 0.6, ease: 'power3' }) : null;
  private ry = this.enabled ? gsap.quickTo(this.el, 'rotationY', { duration: 0.6, ease: 'power3' }) : null;

  constructor() {
    if (this.enabled) gsap.set(this.el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
  }

  move(e: PointerEvent): void {
    if (!this.enabled) return;
    const r = this.el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    this.ry?.((px - 0.5) * this.tilt());
    this.rx?.((0.5 - py) * this.tilt());
    this.el.style.setProperty('--mx', `${px * 100}%`);
    this.el.style.setProperty('--my', `${py * 100}%`);
  }

  leave(): void {
    this.rx?.(0);
    this.ry?.(0);
  }
}

/** El elemento se acerca un poco al cursor (botones "magnéticos"). */
@Directive({
  selector: '[magnetic]',
  host: {
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'leave()',
  },
})
export class MagneticDirective {
  readonly magnetic = input(0.3, { transform: (v: unknown) => numberAttribute(v, 0.3) });
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly enabled = !isTouch() && !prefersReducedMotion();
  private x = this.enabled ? gsap.quickTo(this.el, 'x', { duration: 0.5, ease: 'power3' }) : null;
  private y = this.enabled ? gsap.quickTo(this.el, 'y', { duration: 0.5, ease: 'power3' }) : null;

  move(e: PointerEvent): void {
    if (!this.enabled) return;
    const r = this.el.getBoundingClientRect();
    const strength = Number(this.magnetic()) || 0.3;
    this.x?.((e.clientX - (r.left + r.width / 2)) * strength);
    this.y?.((e.clientY - (r.top + r.height / 2)) * strength);
  }

  leave(): void {
    this.x?.(0);
    this.y?.(0);
  }
}

/** Número que cuenta desde 0 hasta su valor al aparecer en pantalla. */
@Directive({ selector: '[countUp]' })
export class CountUpDirective {
  readonly countUp = input.required<number>();
  readonly prefix = input('');
  readonly suffix = input('');
  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private tween?: gsap.core.Tween;

  constructor() {
    afterNextRender(() => {
      const target = this.countUp();
      const format = (n: number) => `${this.prefix()}${Math.round(n).toLocaleString('es-EC')}${this.suffix()}`;
      if (prefersReducedMotion()) {
        this.el.textContent = format(target);
        return;
      }
      const state = { n: 0 };
      this.el.textContent = format(0);
      this.tween = gsap.to(state, {
        n: target,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: this.el, start: 'top bottom', once: true },
        onUpdate: () => (this.el.textContent = format(state.n)),
      });
    });
    inject(DestroyRef).onDestroy(() => this.tween?.kill());
  }
}

export const MOTION_DIRECTIVES = [RevealDirective, TiltDirective, MagneticDirective, CountUpDirective];
