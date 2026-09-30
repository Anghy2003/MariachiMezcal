import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { ADDONS, Perk, SERVICES, Service } from '../data/services.data';
import { NavigationService } from '../core/navigation.service';
import { gsap, prefersReducedMotion } from '../core/motion';
import { RevealDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';
import { PhotoCycleComponent } from '../shared/photo-cycle.component';

/**
 * "Nuestros paquetes": una tarjeta tipo flyer por servicio, con la foto de fondo y sus paquetes encima (precio + regalos).
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
              <option value="rec">Recomendado</option>
              <option value="asc">Precio (de menor a mayor)</option>
              <option value="desc">Precio (de mayor a menor)</option>
            </select>
          </label>
        </div>

        <!-- Una tarjeta tipo "flyer" por servicio, con sus paquetes y regalos adentro -->
        <div class="grid" reveal="stagger">
          @for (s of sorted(); track s.slug; let i = $index) {
            <article class="card">
              <div class="flyer">
                <!-- La foto ocupa toda la tarjeta; los recuadros van encima dejando verla entre ellos -->
                <button class="bg" (click)="nav.service(s.slug)" [attr.aria-label]="s.name">
                  <app-photo-cycle [images]="photos(s)" [position]="s.cutout ? '50% 30%' : (s.imagePosition ?? 'center')" [delay]="i * 700 + 400" />
                </button>
                <span class="title">{{ s.shortName }}</span>

                <div class="tiles" [class.one]="s.packages.length === 1">
                  @for (p of s.packages; track p.id) {
                    <button class="tile" [class.star]="p.tag" (click)="nav.service(s.slug, p.id)">
                      <span class="price">\${{ p.price }}</span>
                      <b>{{ p.name }}</b>
                      @if (s.packages.length === 1) {
                        <small>{{ p.note }}</small>
                      }
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
              </div>

              <button class="caption" (click)="nav.service(s.slug)">
                <h3>{{ s.name }}</h3>
                <span>{{ s.packages.length > 1 ? 'Desde ' : '' }}\${{ s.from }}</span>
              </button>
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

    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 36px 24px; }
    .card { display: flex; flex-direction: column; min-width: 0; }

    /* ---------- El "flyer": foto de fondo a toda la tarjeta ---------- */
    .flyer {
      /* Sin overflow oculto para que la proporción 4:5 crezca si hay muchos paquetes */
      position: relative; flex: 1; display: flex; flex-direction: column; border-radius: 22px;
      aspect-ratio: 4 / 5; background: var(--green-900); color: var(--cream);
      box-shadow: 0 30px 50px -34px rgba(18, 22, 19, 0.85);
      transition: box-shadow 0.5s var(--ease-out), transform 0.5s var(--ease-out);
    }
    .card:hover .flyer { transform: translateY(-4px); box-shadow: 0 0 0 1px var(--tomato-logo), 0 40px 60px -34px rgba(163, 74, 44, 0.55); }
    .bg { position: absolute; inset: 0; display: block; overflow: hidden; border-radius: inherit; }
    /* Oscurece arriba (para el título) y abajo (para los precios), el centro queda limpio */
    .bg::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(18, 22, 19, 0.75) 0%, transparent 30%, transparent 45%, rgba(18, 22, 19, 0.7) 100%); }
    .title { position: relative; z-index: 2; padding: 20px 22px 0; pointer-events: none; font-family: var(--font-serif); font-style: italic; font-weight: 500; font-size: clamp(34px, 3vw, 44px); line-height: 1; color: var(--cream); text-shadow: 0 2px 14px rgba(0, 0, 0, 0.45); }
    .title::after { content: ''; display: block; width: 44px; height: 2px; margin-top: 10px; background: var(--tomato-logo); }

    /* ---------- Recuadros de precio con doble filete ---------- */
    .tiles { position: relative; z-index: 2; margin-top: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 90px 16px 16px; pointer-events: none; }
    .tiles:not(.one) .tile:last-child:nth-child(odd) { grid-column: 1 / -1; }
    .tiles.one { grid-template-columns: 1fr; }
    .tile {
      position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
      min-height: 92px; padding: 12px 12px 10px; text-align: left; border-radius: 10px; pointer-events: auto;
      background: rgba(18, 22, 19, 0.6);
      backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
      border: 1px solid rgba(202, 106, 65, 0.5);
      outline: 1px solid rgba(202, 106, 65, 0.18); outline-offset: -5px;
      transition: background 0.35s, border-color 0.35s;
    }
    .tile:hover, .tile:focus-visible { background: rgba(58, 30, 20, 0.82); border-color: var(--tomato-logo); }
    .tile.star { border-color: var(--tomato-logo); }
    .price { font-family: var(--font-serif); font-size: 26px; line-height: 1; }
    .tile b { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; line-height: 1.35; }
    .tile small { font-size: 12.5px; line-height: 1.45; color: var(--cream-muted); }

    /* Fotos de los regalos */
    .perks { display: flex; align-items: flex-end; align-self: flex-end; margin: auto -4px -4px 0; padding-top: 4px; pointer-events: none; }
    .perks img { height: 42px; width: auto; margin-left: -10px; filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.45)); transition: transform 0.5s var(--ease-out); }
    .perks img:nth-child(1) { rotate: -6deg; }
    .perks img:nth-child(2) { rotate: 5deg; }
    .perks .cuy, .perks .patron { height: 50px; }
    .tile:hover .perks img { transform: translateY(-4px) scale(1.06); }

    /* Un solo paquete: recuadro grande, texto a la izquierda y regalos a la derecha */
    .tiles.one .tile { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto 1fr; column-gap: 14px; min-height: 150px; padding: 18px 18px; align-content: center; }
    .tiles.one .tile > :not(.perks) { grid-column: 1; }
    .tiles.one .perks { grid-column: 2; grid-row: 1 / span 3; align-self: center; margin: 0; }
    .tiles.one .price { font-size: 44px; }
    .tiles.one .tile b { font-size: 12px; margin-top: 4px; }
    .tiles.one .perks img { height: 84px; margin-left: -16px; }

    /* ---------- Debajo del flyer ---------- */
    .caption { display: block; padding: 16px 4px 0; text-align: left; color: var(--ink); }
    .caption h3 { margin: 0; font-family: var(--font-serif); font-weight: 500; font-size: 20px; transition: color 0.3s; }
    .caption span { display: block; margin-top: 4px; font-size: 15px; color: var(--ink-muted); }
    .card:hover .caption h3 { color: var(--tomato); }

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

    @media (max-width: 1100px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 980px) {
      .extras ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .head { flex-direction: column; align-items: flex-start; }
      .grid { grid-template-columns: 1fr; gap: 32px; }
      .tiles { padding: 80px 14px 14px; }
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
  /** "Recomendado" respeta el orden de la clienta: ... Grupos, Videollamadas y Misas al final. */
  readonly order = signal<'rec' | 'asc' | 'desc'>('rec');
  readonly addons = ADDONS;

  /** Fotos de fondo de la tarjeta (sin el recorte del Patrón, que no sirve de fondo). */
  photos(s: Service): string[] {
    return s.cutout ? s.gallery.filter((g) => g !== s.image) : s.gallery;
  }
  readonly perkImage: Record<Perk, string> = {
    oso: 'img/regalos/oso.webp',
    ramo: 'img/regalos/ramo.webp',
    patron: 'img/oso.webp',
    cuy: 'img/regalos/cuy.webp',
  };
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly injector = inject(Injector);

  readonly sorted = computed(() => {
    if (this.order() === 'rec') return SERVICES;
    const list = [...SERVICES].sort((a, b) => a.from - b.from);
    return this.order() === 'desc' ? list.reverse() : list;
  });

  /** Reordena las tarjetas: salen suavemente, cambian de orden y vuelven a entrar. */
  sort(value: 'rec' | 'asc' | 'desc'): void {
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
