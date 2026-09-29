import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Viñeta de estrella con puntas (sello de oferta) para precios y promociones. */
@Component({
  selector: 'app-starburst',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--size.px]': 'size()',
    '[class.spin]': 'spin()',
    '[class.float]': 'float()',
    '[class.light]': 'tone() === "cream"',
  },
  template: `
    <div class="burst">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon class="burst__shape" [attr.points]="points()" />
        <circle cx="50" cy="50" r="36.5" class="burst__ring" />
      </svg>
      <span class="burst__text">
        @if (small()) {
          <small>{{ small() }}</small>
        }
        <b>{{ text() }}</b>
      </span>
    </div>
  `,
  styles: `
    :host {
      --size: 90px;
      display: inline-block;
      width: var(--size);
      height: var(--size);
      rotate: -8deg;
      filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35));
    }
    .burst {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    :host(:hover) .burst,
    :host-context(.card:hover) .burst,
    :host-context(.is-active) .burst {
      animation: pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes pop {
      0% { transform: scale(1) rotate(0); }
      35% { transform: scale(1.18) rotate(-10deg); }
      65% { transform: scale(0.94) rotate(6deg); }
      100% { transform: scale(1) rotate(0); }
    }
    :host(.spin) svg { animation: spin 26s linear infinite; }
    :host(.float) { animation: floaty 4.5s ease-in-out infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes floaty {
      0%, 100% { translate: 0 0; }
      50% { translate: 0 -8px; }
    }
    svg { width: 100%; height: 100%; overflow: visible; }
    .burst__shape { fill: var(--tomato); }
    .burst__ring { fill: none; stroke: rgba(244, 238, 227, 0.55); stroke-width: 0.9; stroke-dasharray: 2 2.4; }
    :host(.light) .burst__shape { fill: var(--cream); }
    :host(.light) .burst__ring { stroke: rgba(163, 74, 44, 0.5); }
    :host(.light) .burst__text { color: var(--tomato); }
    .burst__text {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--cream);
      font-family: var(--font-poster);
      line-height: 0.92;
      padding: 18%;
    }
    b { font-weight: 400; font-size: calc(var(--size) * 0.27); letter-spacing: 0.02em; }
    small { font-size: calc(var(--size) * 0.14); letter-spacing: 0.08em; opacity: 0.9; }
  `,
})
export class StarburstComponent {
  readonly text = input.required<string>();
  readonly small = input<string>('');
  readonly size = input(90);
  readonly spin = input(false);
  readonly float = input(false);
  readonly tone = input<'tomato' | 'cream'>('tomato');
  readonly spikes = input(18);

  readonly points = computed(() => {
    const n = this.spikes();
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? 49 : 41;
      const a = (Math.PI * i) / n - Math.PI / 2;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  });
}
