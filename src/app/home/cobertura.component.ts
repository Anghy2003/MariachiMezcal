import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../core/directives';

/** Cobertura: los cantones donde llevamos la serenata, entre dos banderas de Ecuador ondeando. Va debajo de "Nuestra historia". */
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
                <i [style.--i]="i" [style.--p]="i"></i>
              }
            </span>
            <div class="centro">
              <h2>Cobertura</h2>
              <p>Cubrimos las siguientes zonas</p>
              <ul class="zonas" reveal="stagger">
                @for (z of zonas; track z) {
                  <li>{{ z }}</li>
                }
              </ul>
            </div>
            <span class="flag flag--right" aria-hidden="true">
              @for (i of slices; track i) {
                <i [style.--i]="i" [style.--p]="slices.length - 1 - i"></i>
              }
            </span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cobertura { padding-top: 0; }
    .card {
      padding: clamp(32px, 4.5vw, 56px) clamp(18px, 4vw, 48px) clamp(30px, 4vw, 48px);
      border-radius: var(--radius-lg);
      background: #fff;
      box-shadow: 0 0 0 1px rgba(163, 74, 44, 0.25), 0 30px 60px -40px rgba(30, 38, 32, 0.5);
    }
    /* Banderas a los lados y, en medio, el título con los cantones */
    .head { max-width: 1060px; margin: 0 auto; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: clamp(14px, 4vw, 56px); text-align: center; }
    h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 3.4vw, 44px); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); }
    .head p { margin: 6px 0 clamp(20px, 2.6vw, 30px); font-family: var(--font-serif); font-style: italic; font-size: clamp(16px, 1.6vw, 20px); color: var(--tomato); }

    /* Bandera de Ecuador ondeando: tiras verticales con una onda que nace en el asta y crece hacia la punta,
       con luz y sombra que viajan junto con la onda. --p = distancia de la tira al asta. */
    .flag {
      --w: clamp(96px, 12vw, 170px);
      --n: 72;
      position: relative;
      display: flex;
      width: var(--w);
      height: calc(var(--w) * 2 / 3);
      margin-top: calc(var(--w) * 0.12);
      flex: none;
      filter: drop-shadow(0 12px 14px rgba(30, 38, 32, 0.28));
    }
    .flag::before {
      /* asta */
      content: '';
      position: absolute;
      left: -6px;
      top: calc(var(--w) * -0.1);
      bottom: calc(var(--w) * -0.42);
      width: 5px;
      border-radius: 3px;
      background: linear-gradient(90deg, #6f5330, #d9b77c 45%, #7a5b34);
    }
    .flag::after {
      /* punta dorada del asta */
      content: '';
      position: absolute;
      left: -9.5px;
      top: calc(var(--w) * -0.1 - 10px);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #fff3c9, #d7a943 45%, #8a6420);
    }
    .flag--right::before { left: auto; right: -6px; }
    .flag--right::after { left: auto; right: -9.5px; }
    .flag i {
      --amp: calc(var(--p) / var(--n) * var(--w) * 0.11);
      flex: 1;
      height: 100%;
      margin-right: -0.5px; /* sin rayitas entre tiras */
      background: url(/img/banderas/ecuador.webp) no-repeat;
      background-size: var(--w) 100%;
      background-position: calc(var(--i) * var(--w) / var(--n) * -1) 0;
      animation: ondear 1.25s ease-in-out infinite alternate;
      animation-delay: calc(var(--p) * -0.035s);
    }
    @keyframes ondear {
      from { transform: translateY(calc(var(--amp) * -1)) scaleY(1.02); filter: brightness(1.14) saturate(1.08); }
      to { transform: translateY(var(--amp)) scaleY(0.98); filter: brightness(0.76); }
    }

    .zonas { list-style: none; margin: 0 auto; padding: 0; max-width: 760px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 12px; }
    .zonas li {
      padding: 10px 20px;
      border-radius: 999px;
      background: var(--cream);
      box-shadow: inset 0 0 0 1px rgba(163, 74, 44, 0.22);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink);
      transition: background 0.3s, color 0.3s;
    }
    .zonas li:hover { background: var(--green-800); color: var(--cream); }

    @media (prefers-reduced-motion: reduce) { .flag i { animation: none; } }
    @media (max-width: 640px) {
      .head { gap: 10px; align-items: start; }
      .head p { font-size: 15px; }
      .flag { --w: 46px; margin-top: 24px; }
      .flag::before { bottom: calc(var(--w) * -0.5); }
      .zonas { gap: 7px; }
      .zonas li { padding: 7px 11px; font-size: 10.5px; letter-spacing: 0.08em; }
    }
  `,
})
export class CoberturaComponent {
  readonly slices = Array.from({ length: 72 }, (_, i) => i);
  readonly zonas = ['Cuenca', 'Azogues', 'Paute', 'Gualaceo', 'Cañar', 'Déleg', 'Sígsig', 'Tarqui', 'Chordeleg', 'Nabón', 'Jima', 'San José de Raranga'];
}
