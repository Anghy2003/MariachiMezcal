import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../core/directives';

interface Zona {
  nombre: string;
  bandera: string;
  /** Si no hay bandera propia publicada, se usa la de su provincia. */
  provincia?: string;
}

/** Cobertura: zonas donde llevamos la serenata, cada una con su bandera. Va debajo de "Nuestra historia". */
@Component({
  selector: 'app-cobertura',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="cobertura" class="section section--cream cobertura">
      <div class="container">
        <div class="card" reveal="up">
          <div class="head">
            <span class="flag" aria-hidden="true">
              @for (i of slices; track i) {
                <i [style.--i]="i"></i>
              }
            </span>
            <div>
              <h2>Cobertura</h2>
              <p>Cubrimos las siguientes zonas</p>
            </div>
            <span class="flag flag--right" aria-hidden="true">
              @for (i of slices; track i) {
                <i [style.--i]="i"></i>
              }
            </span>
          </div>

          <ul class="zonas" reveal="stagger">
            @for (z of zonas; track z.nombre) {
              <li [title]="z.provincia ? 'Bandera de la provincia de ' + z.provincia : 'Bandera de ' + z.nombre">
                <img [src]="'img/banderas/' + z.bandera + '.webp'" [alt]="'Bandera de ' + (z.provincia ?? z.nombre)" loading="lazy" />
                <span>{{ z.nombre }}</span>
              </li>
            }
          </ul>

          <p class="creditos">
            Banderas:
            <a href="https://commons.wikimedia.org/wiki/Category:Flags_of_cantons_of_Ecuador" target="_blank" rel="noopener">Wikimedia Commons</a>
            · Paute, Gualaceo, Sígsig, Chordeleg y Nabón por Milenioscuro (CC BY 4.0) · Cañar por David C. S. (CC BY-SA 3.0) · demás de dominio público o CC0.
          </p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cobertura { padding-top: 0; }
    .card {
      padding: clamp(28px, 4vw, 48px) clamp(18px, 4vw, 48px) 22px;
      border-radius: var(--radius-lg);
      background: #fff;
      box-shadow: 0 0 0 1px rgba(163, 74, 44, 0.25), 0 30px 60px -40px rgba(30, 38, 32, 0.5);
    }
    .head { display: flex; align-items: center; justify-content: center; gap: clamp(14px, 3vw, 34px); text-align: center; margin-bottom: 30px; }
    h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 3.4vw, 44px); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); }
    .head p { margin: 6px 0 0; font-family: var(--font-serif); font-style: italic; font-size: clamp(16px, 1.6vw, 20px); color: var(--tomato); }

    /* Bandera de Ecuador ondeando: tiras verticales que suben y bajan con un pequeño desfase */
    .flag {
      --w: clamp(72px, 9vw, 120px);
      --n: 20;
      position: relative;
      display: flex;
      width: var(--w);
      height: calc(var(--w) * 2 / 3);
      flex: none;
      filter: drop-shadow(0 10px 12px rgba(30, 38, 32, 0.25));
    }
    .flag::before {
      /* asta */
      content: '';
      position: absolute;
      left: -7px;
      top: -6px;
      bottom: -26px;
      width: 4px;
      border-radius: 2px;
      background: linear-gradient(90deg, #8a6a3a, #c9a46a, #8a6a3a);
    }
    .flag--right::before { left: auto; right: -7px; }
    .flag--right { transform: scaleX(-1); }
    .flag i {
      flex: 1;
      height: 100%;
      background: url(/img/banderas/ecuador.webp) no-repeat;
      background-size: var(--w) 100%;
      background-position: calc(var(--i) * var(--w) / var(--n) * -1) 0;
      animation: ondear 2.2s ease-in-out infinite;
      animation-delay: calc(var(--i) * -0.11s);
    }
    .flag--right i { transform-origin: center; }
    @keyframes ondear {
      0%, 100% { transform: translateY(0); filter: brightness(1); }
      50% { transform: translateY(calc(var(--w) * 0.06)); filter: brightness(0.86); }
    }

    .zonas { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
    .zonas li {
      display: grid;
      justify-items: center;
      gap: 10px;
      padding: 16px 8px 14px;
      border-radius: 14px;
      background: var(--cream);
      text-align: center;
      transition: transform 0.4s var(--ease-out), box-shadow 0.4s;
    }
    .zonas li:hover { transform: translateY(-4px); box-shadow: 0 14px 26px -18px rgba(30, 38, 32, 0.5); }
    .zonas img { width: 72px; height: 48px; object-fit: cover; border-radius: 4px; box-shadow: 0 0 0 1px rgba(30, 38, 32, 0.12), 0 6px 12px -6px rgba(30, 38, 32, 0.45); }
    .zonas span { font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); line-height: 1.3; }
    .creditos { margin: 22px 0 0; font-size: 11px; color: var(--ink-muted); text-align: center; opacity: 0.75; }
    .creditos a { color: inherit; }

    @media (prefers-reduced-motion: reduce) { .flag i { animation: none; } }
    @media (max-width: 1000px) { .zonas { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    @media (max-width: 640px) {
      .zonas { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .head { gap: 12px; }
      .flag { --w: 58px; }
      .flag::before { bottom: -16px; }
    }
  `,
})
export class CoberturaComponent {
  readonly slices = Array.from({ length: 20 }, (_, i) => i);
  readonly zonas: Zona[] = [
    { nombre: 'Cuenca', bandera: 'cuenca' },
    { nombre: 'Azogues', bandera: 'azogues' },
    { nombre: 'Paute', bandera: 'paute' },
    { nombre: 'Gualaceo', bandera: 'gualaceo' },
    { nombre: 'Cañar', bandera: 'canar' },
    { nombre: 'Déleg', bandera: 'prov-canar', provincia: 'Cañar' },
    { nombre: 'Sígsig', bandera: 'sigsig' },
    { nombre: 'Tarqui', bandera: 'prov-azuay', provincia: 'Azuay' },
    { nombre: 'Chordeleg', bandera: 'chordeleg' },
    { nombre: 'Nabón', bandera: 'nabon' },
    { nombre: 'Jima', bandera: 'prov-azuay', provincia: 'Azuay' },
    { nombre: 'San José de Raranga', bandera: 'prov-azuay', provincia: 'Azuay' },
  ];
}
