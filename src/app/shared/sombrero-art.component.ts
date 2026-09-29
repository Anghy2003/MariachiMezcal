import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';

/** Ilustración de un sombrero charro bordado que se dibuja sola al aparecer. */
@Component({
  selector: 'app-sombrero-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 220 150" aria-hidden="true">
      <g class="stroke">
        <path d="M110 22c-16 0-22 16-24 46h48c-2-30-8-46-24-46Z" />
        <path d="M86 68c-40 2-72 12-72 26 0 16 43 28 96 28s96-12 96-28c0-14-32-24-72-26" />
        <path d="M86 68c3 9 13 13 24 13s21-4 24-13" />
        <path d="M34 96c20 9 46 13 76 13s56-4 76-13" class="fine" />
        <path d="M92 40c6 4 12 4 18 0s12-4 18 0" class="fine" />
        <path d="M52 101l6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8" class="fine" />
      </g>
      <g class="notes">
        <path d="M176 30v18" /><circle cx="172" cy="49" r="4" />
        <path d="M190 18v16l8-3" /><circle cx="186" cy="35" r="4" />
      </g>
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .stroke path { fill: none; stroke: var(--tomato); stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
    .stroke .fine { stroke-width: 1.6; opacity: 0.8; }
    .notes path, .notes circle { fill: none; stroke: var(--tomato-logo); stroke-width: 2; }
    .notes circle { fill: var(--tomato-logo); }
  `,
})
export class SombreroArtComponent {
  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      ctx = gsap.context(() => {
        gsap.from(host.querySelectorAll('.stroke path'), {
          drawSVG: '0%',
          duration: 2,
          stagger: 0.18,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: host, start: 'top 85%', once: true },
        });
        gsap.to(host.querySelector('.notes'), { y: -8, rotation: 6, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' });
      }, host);
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
