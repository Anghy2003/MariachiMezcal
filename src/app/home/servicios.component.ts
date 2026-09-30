import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { SERVICES } from '../data/services.data';
import { NavigationService } from '../core/navigation.service';
import { gsap, prefersReducedMotion } from '../core/motion';
import { RevealDirective, TiltDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { IconComponent } from '../shared/icon.component';
import { PhotoCycleComponent } from '../shared/photo-cycle.component';

/** "Nuestros paquetes" según el Figma: tarjetas limpias que llevan directo a la ficha del servicio. */
@Component({
  selector: 'app-paquetes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective, StarburstComponent, IconComponent, PhotoCycleComponent],
  template: `
    <section id="paquetes" class="section section--cream">
      <div class="container">
        <div class="head">
          <div>
            <h2 class="section-title" reveal="lines">Nuestros paquetes</h2>
            <span class="rule" aria-hidden="true"></span>
            <p class="sub" reveal="up">Elige tu serenata y descubre qué incluye</p>
          </div>
          <label class="sort" reveal="fade">
            <span>Ordenar por:</span>
            <select [value]="order()" (change)="sort($any($event.target).value)">
              <option value="asc">Precio (de menor a mayor)</option>
              <option value="desc">Precio (de mayor a menor)</option>
            </select>
          </label>
        </div>

        <div class="grid" reveal="stagger">
          @for (s of sorted(); track s.slug; let i = $index) {
            <button class="card" tilt="8" (click)="nav.service(s.slug)" [attr.aria-label]="s.name">
              <div class="media" [class.cutout]="s.cutout">
                @if (s.cutout) {
                  <span class="halo"></span>
                }
                @if (s.cutout) {
                  <img [src]="s.image" alt="" loading="lazy" />
                } @else {
                  <app-photo-cycle [images]="s.gallery" [position]="s.imagePosition ?? 'center'" [delay]="i * 700 + 400" />
                }
              </div>
              <app-starburst class="price" [small]="s.packages.length > 1 ? 'Desde' : ''" [text]="'$' + s.from" [size]="64" />
              <h3>{{ s.slug === 'solista' ? 'Mariachi solista' : s.shortName }}</h3>
              <span class="go" aria-hidden="true"><app-icon name="arrow-right" /></span>
              <span class="glow"></span>
            </button>
          }
        </div>

        <div class="notes" reveal="stagger">
          <p>
            <app-icon name="audio" />
            <span><b>Sonido profesional incluido:</b> Todas nuestras presentaciones cuentan con equipo de audio y amplificación móvil autónomo, más transporte incluido a zonas urbanas céntricas de Cuenca.</span>
          </p>
          <p>
            <app-icon name="pin" />
            <span><b>Cobertura a cantones:</b> El costo a cantones vecinos (Gualaceo, Chordeleg, Paute, Santa Isabel, etc.) varía según la distancia exacta. Envíanos tu ubicación por WhatsApp y te cotizamos el recargo mínimo al instante.</span>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 40px; }
    .section-title { font-size: clamp(28px, 3.4vw, 44px); }
    .rule { display: block; width: 64px; height: 3px; margin-top: 14px; background: var(--tomato); }
    .sub { margin: 12px 0 0; color: var(--ink-muted); font-size: 14.5px; }
    .sort { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; max-width: 100%; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); }
    select { max-width: 100%; font: inherit; font-weight: 500; letter-spacing: 0; text-transform: none; font-size: 14px; color: var(--ink); background: #fff; border: 1px solid rgba(30, 38, 32, 0.15); border-radius: 6px; padding: 9px 14px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .card {
      position: relative; display: block; text-align: left; aspect-ratio: 4 / 4.4; border-radius: 18px; overflow: hidden;
      background: var(--green-800);
      box-shadow: 0 26px 50px -30px rgba(30, 38, 32, 0.7);
      transition: box-shadow 0.5s var(--ease-out);
      will-change: transform;
    }
    .card:hover { box-shadow: 0 0 0 2px var(--tomato), 0 34px 60px -28px rgba(163, 74, 44, 0.6); }
    .media { position: absolute; inset: 0; }
    .media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease-out); }
    .card:hover .media img { transform: scale(1.08); }
    .media.cutout { background: radial-gradient(circle at 50% 46%, var(--tomato) 0 30%, var(--green-800) 30.5%); }
    .media.cutout img { object-fit: contain; padding: 16% 22% 20%; filter: drop-shadow(0 16px 20px rgba(0, 0, 0, 0.5)); }
    .halo { position: absolute; left: 50%; top: 46%; width: 66%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; border: 1px dashed rgba(244, 238, 227, 0.3); animation: turn 30s linear infinite; }
    @keyframes turn { to { rotate: 360deg; } }
    .card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(18, 22, 19, 0.85) 0%, transparent 42%); }
    .glow { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), rgba(255, 220, 190, 0.18), transparent 55%); opacity: 0; transition: opacity 0.4s; }
    .card:hover .glow { opacity: 1; }
    .price { position: absolute; z-index: 3; top: 10px; right: 10px; }
    /* Indicador sutil: una flechita que aparece al pasar el mouse */
    .go {
      position: absolute; z-index: 3; right: 18px; bottom: 18px;
      width: 38px; height: 38px; border-radius: 50%;
      display: grid; place-items: center; font-size: 17px; color: var(--cream);
      box-shadow: inset 0 0 0 1px rgba(244, 238, 227, 0.55);
      opacity: 0; transform: translateX(-10px);
      transition: opacity 0.4s var(--ease-out), transform 0.5s var(--ease-out), background 0.3s, box-shadow 0.3s;
    }
    .card:hover .go, .card:focus-visible .go { opacity: 1; transform: none; background: var(--tomato); box-shadow: none; }
    @media (hover: none) { .go { opacity: 0.85; transform: none; } }
    h3 { position: absolute; z-index: 3; left: 22px; right: 22px; bottom: 20px; margin: 0; font-family: var(--font-poster); font-weight: 400; font-size: clamp(26px, 2.4vw, 34px); letter-spacing: 0.04em; line-height: 1; color: var(--cream); }
    .notes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 980px; margin: 48px auto 0; }
    .notes p { margin: 0; display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; border-radius: 12px; background: #fff; border-left: 3px solid var(--tomato); box-shadow: 0 16px 36px -28px rgba(30, 38, 32, 0.5); font-size: 13.5px; color: var(--ink-muted); }
    .notes app-icon { color: var(--tomato); font-size: 20px; margin-top: 2px; }
    .notes b { color: var(--ink); }
    @media (max-width: 980px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .head { flex-direction: column; align-items: flex-start; }
      .grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 78%; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 10px; }
      .card { scroll-snap-align: start; }
      .notes { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .grid { grid-auto-columns: 82%; }
      h3 { font-size: 28px; left: 18px; bottom: 16px; }
      .notes p { padding: 16px; }
    }
  `,
})
export class ServiciosComponent {
  readonly nav = inject(NavigationService);
  readonly order = signal<'asc' | 'desc'>('asc');
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly injector = inject(Injector);

  readonly sorted = computed(() => {
    const list = [...SERVICES].sort((a, b) => a.from - b.from);
    return this.order() === 'desc' ? list.reverse() : list;
  });

  /** Reordena las tarjetas: salen suavemente, cambian de orden y vuelven a entrar. */
  sort(value: 'asc' | 'desc'): void {
    if (value === this.order()) return;
    const cards = this.host.querySelectorAll<HTMLElement>('.card');
    if (prefersReducedMotion() || document.hidden) {
      this.order.set(value);
      return;
    }
    gsap.killTweensOf(cards);
    gsap.to(cards, {
      autoAlpha: 0,
      y: 24,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => {
        this.order.set(value);
        afterNextRender(
          () => {
            const fresh = this.host.querySelectorAll<HTMLElement>('.card');
            gsap.fromTo(fresh, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out', clearProps: 'opacity,visibility' });
          },
          { injector: this.injector },
        );
      },
    });
  }
}
