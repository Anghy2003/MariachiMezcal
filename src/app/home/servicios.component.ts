import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { ADDONS, Perk, SERVICES } from '../data/services.data';
import { NavigationService } from '../core/navigation.service';
import { gsap, prefersReducedMotion } from '../core/motion';
import { RevealDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';
import { PhotoCycleComponent } from '../shared/photo-cycle.component';

/**
 * "Nuestros paquetes": cada servicio es una carta con su portada y sus paquetes (precio + fotos de lo que incluye).
 * Al tocar un paquete se abre la ficha del servicio con ese paquete ya marcado.
 */
@Component({
  selector: 'app-paquetes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent, PhotoCycleComponent],
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

        <!-- Una carta por servicio: portada a un lado y sus paquetes con precio y regalos al otro -->
        <div class="menus">
          @for (s of sorted(); track s.slug; let i = $index) {
            <article class="menu" reveal="up">
              <button class="cover" [class.cutout]="s.cutout" (click)="nav.service(s.slug)" [attr.aria-label]="s.name">
                @if (s.cutout) {
                  <img [src]="s.image" alt="" loading="lazy" />
                } @else {
                  <app-photo-cycle [images]="s.gallery" [position]="s.imagePosition ?? 'center'" [delay]="i * 700 + 400" />
                }
                <span class="cover__text">
                  <h3>{{ s.name }}</h3>
                  <em>{{ s.tagline }}</em>
                </span>
              </button>

              <div class="tiles" [class.one]="s.packages.length === 1">
                @for (p of s.packages; track p.id) {
                  <button class="tile" [class.star]="p.tag" (click)="nav.service(s.slug, p.id)">
                    <span class="price">\${{ p.price }}</span>
                    <b>{{ p.name }}</b>
                    <small>{{ p.note }}</small>
                    @if (p.perks?.length) {
                      <span class="perks" aria-hidden="true">
                        @for (k of p.perks; track k) {
                          <img [src]="perkImage[k]" alt="" loading="lazy" [class]="k" />
                        }
                      </span>
                    }
                  </button>
                }
              </div>
            </article>
          }
        </div>

        <!-- Adicionales con costo extra -->
        <div class="extras">
          <h3 reveal="up">Agrega a tu serenata</h3>
          <ul reveal="stagger">
            @for (a of addons; track a.id) {
              <li>
                <img [src]="a.image" alt="" loading="lazy" />
                <span>{{ a.name }}</span>
                <b>{{ a.options ? 'desde' : '+' }} \${{ a.price }}</b>
              </li>
            }
          </ul>
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

    /* ---------- Carta de cada servicio ---------- */
    .menus { display: grid; gap: 28px; }
    .menu {
      display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      min-height: 420px; border-radius: 24px; overflow: hidden;
      background: var(--green-900); color: var(--cream);
      box-shadow: 0 34px 60px -40px rgba(18, 22, 19, 0.8);
    }
    /* Uno sí y uno no, la portada cambia de lado */
    .menu:nth-child(even) { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
    .menu:nth-child(even) .cover { order: 2; }

    .cover { position: relative; display: block; min-height: 100%; overflow: hidden; text-align: left; background: var(--green-800); }
    .cover::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(18, 22, 19, 0.9) 0%, rgba(18, 22, 19, 0.2) 45%, transparent 70%); pointer-events: none; }
    .cover.cutout { background: radial-gradient(circle at 50% 42%, var(--tomato) 0 30%, var(--green-800) 30.5%); }
    .cover.cutout img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 8% 14% 22%; filter: drop-shadow(0 16px 20px rgba(0, 0, 0, 0.5)); transition: transform 1.2s var(--ease-out); }
    .cover.cutout:hover img { transform: scale(1.05); }
    .cover__text { position: absolute; z-index: 3; left: 28px; right: 28px; bottom: 26px; }
    .cover h3 { margin: 0; font-family: var(--font-poster); font-weight: 400; font-size: clamp(34px, 3.2vw, 48px); letter-spacing: 0.04em; line-height: 0.95; color: var(--cream); }
    .cover em { display: block; margin-top: 8px; font-family: var(--font-serif); font-size: 16px; color: var(--cream-muted); }

    /* ---------- Paquetes: recuadros con doble filete, como una carta ---------- */
    .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: clamp(20px, 2.6vw, 36px); align-content: center; }
    .tiles:not(.one) .tile:last-child:nth-child(odd) { grid-column: 1 / -1; }
    .tiles.one { grid-template-columns: 1fr; }
    .tile {
      position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
      min-height: 168px; padding: 22px 22px 20px; text-align: left; border-radius: 14px;
      background: rgba(244, 238, 227, 0.03);
      border: 1px solid rgba(202, 106, 65, 0.45);
      outline: 1px solid rgba(202, 106, 65, 0.16); outline-offset: -7px;
      transition: background 0.4s, border-color 0.4s, transform 0.5s var(--ease-out);
    }
    .tile:hover, .tile:focus-visible { background: rgba(202, 106, 65, 0.1); border-color: var(--tomato-logo); transform: translateY(-3px); }
    .tile.star { border-color: var(--tomato-logo); background: rgba(202, 106, 65, 0.07); }
    /* Un solo paquete: texto a la izquierda y regalos a la derecha */
    .tiles.one .tile { min-height: 240px; padding: 34px; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto 1fr; column-gap: 20px; align-content: center; }
    .tiles.one .tile > :not(.perks) { grid-column: 1; }
    .tiles.one .perks { grid-column: 2; grid-row: 1 / span 3; align-self: center; margin: 0; }
    /* El último recuadro cuando queda solo en su fila: mismo acomodo a lo ancho */
    .tiles:not(.one) .tile:last-child:nth-child(odd) { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto 1fr; column-gap: 20px; }
    .tiles:not(.one) .tile:last-child:nth-child(odd) > :not(.perks) { grid-column: 1; }
    .tiles:not(.one) .tile:last-child:nth-child(odd) .perks { grid-column: 2; grid-row: 1 / span 3; align-self: end; }
    .price { font-family: var(--font-serif); font-size: clamp(34px, 3vw, 44px); line-height: 1; color: var(--cream); }
    .tiles.one .price { font-size: clamp(48px, 4.6vw, 64px); }
    .tile b { margin-top: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.35; }
    .tile small { font-size: 13px; line-height: 1.45; color: var(--cream-muted); }

    /* Fotos de los regalos asomando en la esquina */
    .perks { display: flex; align-items: flex-end; align-self: flex-end; margin: auto -6px -6px 0; padding-top: 8px; padding-left: 18px; pointer-events: none; }
    .perks img { height: 92px; width: auto; margin-left: -18px; filter: drop-shadow(0 10px 12px rgba(0, 0, 0, 0.45)); transition: transform 0.6s var(--ease-out); }
    .perks img:nth-child(1) { rotate: -6deg; }
    .perks img:nth-child(2) { rotate: 5deg; }
    .perks .cuy { height: 108px; }
    .perks .patron { height: 104px; }
    .tiles.one .perks img { height: 136px; margin-left: -26px; }
    .tile:hover .perks img { transform: translateY(-6px) scale(1.06); }
    .tile:hover .perks img:nth-child(2) { transition-delay: 0.05s; }
    .tile:hover .perks img:nth-child(3) { transition-delay: 0.1s; }

    /* ---------- Adicionales ---------- */
    .extras { margin-top: 64px; text-align: center; }
    .extras h3 { margin: 0 0 26px; font-family: var(--font-serif); font-weight: 500; font-size: clamp(24px, 2.4vw, 32px); color: var(--ink); }
    .extras ul { list-style: none; margin: 0 auto; padding: 0; max-width: 980px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
    .extras li { display: grid; justify-items: center; gap: 6px; padding: 24px 14px 20px; border-radius: 16px; background: #fff; box-shadow: 0 18px 40px -30px rgba(30, 38, 32, 0.55); }
    .extras img { height: 110px; width: auto; max-width: 100%; object-fit: contain; margin-bottom: 8px; filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.18)); transition: transform 0.6s var(--ease-out); }
    .extras li:hover img { transform: translateY(-5px) rotate(-3deg); }
    .extras span { font-weight: 600; font-size: 15px; color: var(--ink); }
    .extras b { font-family: var(--font-serif); font-weight: 500; font-size: 18px; color: var(--tomato); }

    .notes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 980px; margin: 48px auto 0; }
    .notes p { margin: 0; display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; border-radius: 12px; background: #fff; border-left: 3px solid var(--tomato); box-shadow: 0 16px 36px -28px rgba(30, 38, 32, 0.5); font-size: 13.5px; color: var(--ink-muted); }
    .notes app-icon { color: var(--tomato); font-size: 20px; margin-top: 2px; }
    .notes b { color: var(--ink); }

    @media (max-width: 980px) {
      .menu, .menu:nth-child(even) { grid-template-columns: 1fr; min-height: 0; }
      .menu:nth-child(even) .cover { order: 0; }
      .cover { min-height: 260px; }
      .extras ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .head { flex-direction: column; align-items: flex-start; }
      .menus { gap: 22px; }
      .menu { border-radius: 20px; }
      .cover { min-height: 220px; }
      .cover__text { left: 20px; right: 20px; bottom: 18px; }
      .cover h3 { font-size: 34px; }
      .cover em { font-size: 14.5px; }
      .tiles { gap: 10px; padding: 14px; }
      .tile { min-height: 150px; padding: 16px 14px 14px; gap: 4px; border-radius: 12px; outline-offset: -5px; }
      .price { font-size: 30px; }
      .tile b { max-width: none; font-size: 11.5px; letter-spacing: 0.06em; }
      .tile small { font-size: 12px; }
      .perks img { height: 56px; margin-left: -14px; }
      .perks .cuy, .perks .patron { height: 64px; }
      .tiles.one .tile { min-height: 190px; padding: 22px 18px; }
      .tiles.one .price { font-size: 44px; }
      .tiles.one .perks img { height: 96px; margin-left: -20px; }
      .extras { margin-top: 48px; }
      .extras li { padding: 18px 10px 16px; }
      .extras img { height: 84px; }
      .notes { grid-template-columns: 1fr; }
      .notes p { padding: 16px; }
    }
  `,
})
export class ServiciosComponent {
  readonly nav = inject(NavigationService);
  readonly order = signal<'asc' | 'desc'>('asc');
  readonly addons = ADDONS;
  readonly perkImage: Record<Perk, string> = {
    oso: 'img/regalos/oso.webp',
    ramo: 'img/regalos/ramo.webp',
    patron: 'img/oso.webp',
    cuy: 'img/regalos/cuy.webp',
  };
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly injector = inject(Injector);

  readonly sorted = computed(() => {
    const list = [...SERVICES].sort((a, b) => a.from - b.from);
    return this.order() === 'desc' ? list.reverse() : list;
  });

  /** Reordena las tarjetas: salen suavemente, cambian de orden y vuelven a entrar. */
  sort(value: 'asc' | 'desc'): void {
    if (value === this.order()) return;
    const cards = this.host.querySelectorAll<HTMLElement>('.menu');
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
            const fresh = this.host.querySelectorAll<HTMLElement>('.menu');
            gsap.fromTo(fresh, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out', clearProps: 'opacity,visibility' });
          },
          { injector: this.injector },
        );
      },
    });
  }
}
