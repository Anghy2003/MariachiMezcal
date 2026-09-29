import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';

/** Guirnalda de papel picado que se balancea suavemente con el viento. */
@Component({
  selector: 'app-papel-picado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="string" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
      <path d="M0,1 Q50,9 100,1" />
    </svg>
    <ul aria-hidden="true">
      @for (flag of flags(); track $index) {
        <li class="flag" [style.--c]="flag.color" [style.--i]="$index" [style.--sag.px]="flag.sag">
          <svg viewBox="0 0 40 52">
            <path class="paper" d="M0 0H40V44L34 52L28 44L22 52L16 44L10 52L4 44L0 52Z" />
            <g class="cut">
              @switch ($index % 3) {
                @case (0) {
                  <circle cx="20" cy="20" r="6" />
                  <path d="M20 6l3 5h-6zM20 34l3-5h-6zM6 20l5 3v-6zM34 20l-5 3v-6z" />
                }
                @case (1) {
                  <path d="M20 8l10 12-10 12-10-12z" />
                  <circle cx="9" cy="36" r="2.4" /><circle cx="31" cy="36" r="2.4" />
                }
                @default {
                  <path d="M20 9c4 5 9 6 9 12a9 9 0 0 1-18 0c0-6 5-7 9-12z" />
                  <rect x="8" y="35" width="24" height="2.4" rx="1.2" />
                }
              }
            </g>
          </svg>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      height: 70px;
      pointer-events: none;
    }
    .string {
      position: absolute;
      inset: 0 0 auto;
      width: 100%;
      height: 26px;
    }
    .string path { fill: none; stroke: rgba(244, 238, 227, 0.45); stroke-width: 0.25; vector-effect: non-scaling-stroke; }
    ul {
      list-style: none;
      margin: 0;
      padding: 0 1%;
      display: flex;
      justify-content: space-between;
    }
    .flag {
      width: clamp(26px, 3.4vw, 40px);
      transform-origin: 50% 0;
      translate: 0 var(--sag);
    }
    .paper { fill: var(--c); }
    .cut { fill: rgba(0, 0, 0, 0.28); }
  `,
})
export class PapelPicadoComponent {
  /** Cantidad de banderines. */
  readonly count = input(18);
  readonly palette = input<'mix' | 'light'>('mix');

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private tween?: gsap.core.Tween;

  readonly flags = computed(() => {
    const colors =
      this.palette() === 'light'
        ? ['#f4eee3', '#ca6a41', '#f4eee3', '#3f5b47']
        : ['#ca6a41', '#f4eee3', '#3f5b47', '#f4eee3'];
    const n = this.count();
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      return { color: colors[i % colors.length], sag: Math.round(Math.sin(t * Math.PI) * 14) };
    });
  });

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      const flags = this.host.querySelectorAll('.flag');
      this.tween = gsap.fromTo(
        flags,
        { rotation: -6 },
        { rotation: 6, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.12, from: 'start' } },
      );
    });
    inject(DestroyRef).onDestroy(() => this.tween?.kill());
  }
}
