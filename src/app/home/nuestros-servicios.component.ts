import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationService } from '../core/navigation.service';
import { MagneticDirective, RevealDirective, TiltDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { PhotoCycleComponent } from '../shared/photo-cycle.component';
import { SERVICES } from '../data/services.data';

interface ServiceCard {
  slug: string;
  label: string;
  price: string;
  priceSmall?: string;
  title: string;
  subtitle: string;
  text: string;
  chip: string;
  image: string;
  position: string;
  wide?: boolean;
}

/** "Nuestros servicios" tal cual el diseño de Figma: 5 tarjetas con descripción y "¡Lo quiero!". */
@Component({
  selector: 'app-nuestros-servicios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective, MagneticDirective, StarburstComponent, PhotoCycleComponent],
  template: `
    <section id="servicios" class="section section--green">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Nuestros servicios</h2>
          <div class="dots" aria-hidden="true"></div>
          <p reveal="up">Selecciona tu formato preferido con trajes de gala y sonido nítido</p>
        </div>

        <div class="grid" reveal="stagger">
          @for (c of cards; track c.slug; let i = $index) {
            <article class="card" [class.wide]="c.wide" tilt="5">
              <div class="media">
                <app-photo-cycle [images]="photosFor(c)" [position]="c.position" [alt]="c.title" [delay]="i * 900" />
                <span class="label">{{ c.label }}</span>
                <app-starburst class="price" [small]="c.priceSmall ?? ''" [text]="c.price" [size]="82" />
              </div>
              <div class="body">
                <h3>{{ c.title }}</h3>
                <p class="sub">{{ c.subtitle }}</p>
                <p class="text">{{ c.text }}</p>
                <span class="chip">{{ c.chip }}</span>
                <button class="btn want" magnetic="0.12" (click)="nav.service(c.slug)">¡Lo quiero!</button>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .section-head { margin-bottom: 52px; }
    .section-head p { color: var(--cream-muted); }
    .dots { width: 280px; max-width: 70%; height: 2px; margin: 18px auto 0; background: radial-gradient(circle, var(--tomato-logo) 1px, transparent 1.5px) 0 0 / 8px 2px repeat-x; opacity: 0.8; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
    .card {
      display: flex; flex-direction: column;
      border-radius: 14px; overflow: hidden;
      background: #161b17;
      box-shadow: 0 0 0 1.5px rgba(202, 106, 65, 0.55), 0 30px 60px -36px rgba(0, 0, 0, 0.8);
      transition: box-shadow 0.45s var(--ease-out);
    }
    .card:hover { box-shadow: 0 0 0 1.5px var(--tomato-logo), 0 36px 70px -30px rgba(163, 74, 44, 0.55); }
    .card.wide { grid-column: span 2; }
    .media { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
    .card.wide .media { aspect-ratio: 8.2 / 3; }
    .label {
      position: absolute; z-index: 3; top: 14px; left: 14px;
      background: var(--tomato); color: var(--cream);
      font-family: var(--font-poster); font-size: 13px; letter-spacing: 0.08em;
      padding: 4px 12px;
      clip-path: polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%);
    }
    .price { position: absolute; z-index: 3; right: 12px; bottom: -4px; }
    .body { flex: 1; display: flex; flex-direction: column; padding: 22px 24px 24px; }
    h3 { margin: 0; font-family: var(--font-poster); font-weight: 400; font-size: 27px; letter-spacing: 0.03em; line-height: 1.1; }
    .sub { margin: 4px 0 10px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tomato-logo); }
    .text { margin: 0 0 16px; font-size: 14.5px; color: var(--cream-muted); line-height: 1.6; }
    .chip { align-self: flex-start; margin-bottom: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 12px; border-radius: 4px; background: rgba(163, 74, 44, 0.18); box-shadow: inset 0 0 0 1px rgba(202, 106, 65, 0.35); color: var(--cream-muted); }
    .want { margin-top: auto; width: 100%; }
    @media (max-width: 980px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .card.wide { grid-column: span 2; }
    }
    @media (max-width: 640px) {
      .grid { grid-template-columns: 1fr; }
      .card.wide { grid-column: auto; }
      .card.wide .media { aspect-ratio: 4 / 3; }
    }
    @media (max-width: 560px) {
      .body { padding: 18px 18px 20px; }
      h3 { font-size: 25px; }
      .text { font-size: 14px; }
    }
  `,
})
export class NuestrosServiciosComponent {
  readonly nav = inject(NavigationService);

  /** Fotos que se turnan en cada tarjeta: la del diseño primero y luego las demás de esa categoría. */
  photosFor(c: ServiceCard): string[] {
    const gallery = SERVICES.find((s) => s.slug === c.slug)?.gallery ?? [];
    return [c.image, ...gallery.filter((g) => g !== c.image && !g.includes('oso'))];
  }

  readonly cards: ServiceCard[] = [
    {
      slug: 'solista',
      label: 'Oferta',
      price: '$25',
      title: 'Mariachi solista',
      subtitle: '3 canciones + 1 de cortesía',
      text: 'Ideal para serenatas íntimas y sorpresas directas. Voz varón o mujer a elección con vestimenta impecable de gala.',
      chip: 'Gratis oso o ramo',
      image: 'img/solista.webp',
      position: '50% 25%',
    },
    {
      slug: 'show-del-patron',
      label: '¡Nuevo!',
      price: '$25',
      title: 'Show del Patrón',
      subtitle: 'Show cómico teatralizado',
      text: 'Personaje charro del patrón + serenata de 3 canciones. Bromas sanas, animación cómica y risas garantizadas.',
      chip: 'Animación de risas',
      image: 'img/patron-3.webp',
      position: '50% 15%',
    },
    {
      slug: 'duos',
      label: 'Más pedido',
      price: '$30',
      priceSmall: 'Desde',
      title: 'Mariachi dúo',
      subtitle: 'Desde 4 canciones',
      text: 'Dos voces para tu persona especial: varón y mujer, dos varones o dos mujeres, con traje de gala.',
      chip: 'Armonía & ritmo',
      image: 'img/duo.webp',
      position: '50% 25%',
    },
    {
      slug: 'trio',
      label: 'Incluye regalo',
      price: '$60',
      title: 'Trío musical',
      subtitle: '3 mariachis · 6 canciones',
      text: 'Tres voces cantando con pista, sin instrumentos. Gratis a elección: ramo, oso amoroso o Show del Patrón.',
      chip: 'Regalo a elección',
      image: 'img/trio.webp',
      position: '50% 55%',
    },
    {
      slug: 'grupos',
      label: 'Experiencia total',
      price: '$95',
      priceSmall: 'Desde',
      title: 'Mariachi completo',
      subtitle: '6 a 8 mariachis con todos los instrumentos',
      text: 'Orquestación mexicana completa con trompetas, violines, guitarrón y voces estelares. La fiesta en su máxima cúspide.',
      chip: 'Regalo + ramo incluido',
      image: 'img/historia.webp',
      position: '50% 62%',
      wide: true,
    },
  ];
}
