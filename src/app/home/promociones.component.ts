import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationService } from '../core/navigation.service';
import { MagneticDirective, RevealDirective, TiltDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { PapelPicadoComponent } from '../shared/papel-picado.component';
import { EffectCanvasComponent } from '../shared/effect-canvas.component';

/** Promociones: solo regalos gratis (los adicionales con costo viven en cada ficha). */
@Component({
  selector: 'app-promociones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, TiltDirective, MagneticDirective, StarburstComponent, PapelPicadoComponent, EffectCanvasComponent],
  template: `
    <section id="promociones" class="section section--tomato">
      <app-papel-picado class="picado" [count]="22" palette="light" />
      <app-effect-canvas class="fx" mode="confetti" [density]="0.35" />
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">¡Aprovecha nuestras promociones!</h2>
          <div class="ornament"><span></span></div>
          <p reveal="up">Detalles gratis en paquetes seleccionados para que tu serenata sea inolvidable.</p>
        </div>

        <div class="cards" reveal="stagger">
          <article class="card" tilt="7">
            <div class="art photo">
              <img src="img/patron-7.webp" alt="Ositos y mariachis en un cumpleaños" loading="lazy" style="object-position: 50% 40%" />
            </div>
            <app-starburst class="free" text="¡Gratis!" [size]="84" />
            <h3>Oso amoroso</h3>
            <p>Gratis en paquetes seleccionados: Solista, Show del Patrón, Dúos desde $35 y Trío.</p>
          </article>

          <article class="card" tilt="7">
            <div class="art photo">
              <img src="img/cuy-mascota.webp" alt="Mascota del cuysito disfrazado" loading="lazy" style="object-position: 50% 22%" />
            </div>
            <app-starburst class="free" text="¡Gratis!" [size]="84" />
            <h3>Cuysito disfrazado</h3>
            <p>Gratis con el Mariachi completo #2 ($145), a elección junto al ramo o el osito.</p>
          </article>

          <article class="card" tilt="7">
            <div class="art photo">
              <img src="img/patron-1.webp" alt="El Patrón en una serenata de cumpleaños" loading="lazy" style="object-position: 50% 18%" />
            </div>
            <app-starburst class="free" text="¡Gratis!" [size]="84" />
            <h3>Show del Patrón</h3>
            <p>Show cómico con serenata, gratis como regalo a elección en el paquete de Trío.</p>
          </article>
        </div>

        <div class="banner" reveal="scale">
          <div>
            <h3>Mariachi solista + regalo a elección</h3>
            <p>3 canciones + 1 de cortesía para tu homenajeado, con oso o ramo de regalo según la promo del mes.</p>
          </div>
          <app-starburst text="$25" [size]="104" [spin]="true" />
          <button class="btn" magnetic (click)="nav.service('solista')">Reservar promo</button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .picado { position: absolute; top: 0; left: 0; right: 0; z-index: 1; }
    .fx { opacity: 0.6; }
    .container { position: relative; z-index: 2; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
    .card { position: relative; background: var(--cream); color: var(--ink); border-radius: 24px; padding: 20px 20px 28px; box-shadow: 0 0 0 1px rgba(30, 38, 32, 0.08), 0 30px 60px -34px rgba(0, 0, 0, 0.6); }
    /* Más alto que ancho casi: las fotos verticales ya no cortan caras ni sombreros */
    .art { position: relative; aspect-ratio: 5 / 4; border-radius: 18px; overflow: hidden; display: grid; place-items: center; background: var(--cream-2); }
    .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; transition: transform 1s var(--ease-out); }
    .card:hover .photo img { transform: scale(1.07); }
    .free { position: absolute; top: 6px; right: 6px; z-index: 2; }
    h3 { margin: 24px 0 8px; font-family: var(--font-poster); font-weight: 400; font-size: 32px; letter-spacing: 0.04em; }
    .card p { margin: 0; font-size: 14.5px; color: var(--ink-muted); }
    .banner { margin-top: 44px; display: grid; grid-template-columns: 1fr auto auto; gap: 30px; align-items: center; padding: 30px 36px; border-radius: 24px; background: var(--green-800); box-shadow: 0 30px 60px -30px rgba(0,0,0,0.6); }
    .banner h3 { margin: 0 0 6px; font-family: var(--font-display); font-size: clamp(20px, 2.2vw, 28px); letter-spacing: 0.02em; text-transform: uppercase; }
    .banner p { margin: 0; color: var(--cream-muted); font-size: 14.5px; }
    @media (max-width: 900px) {
      .cards { grid-template-columns: 1fr; max-width: 420px; margin-inline: auto; }
      .banner { grid-template-columns: 1fr; justify-items: start; }
    }
    @media (max-width: 560px) {
      h3 { font-size: 28px; }
      .banner { padding: 24px 22px; gap: 18px; }
      .banner .btn { width: 100%; }
    }
  `,
})
export class PromocionesComponent {
  readonly nav = inject(NavigationService);
}
