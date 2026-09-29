import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { gsap, prefersReducedMotion } from '../core/motion';
import { RevealDirective } from '../core/directives';

/** Preguntas frecuentes: solo información dada por la clienta. */
@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="faq" class="section section--night">
      <div class="container narrow">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Preguntas frecuentes</h2>
          <div class="ornament"><span></span></div>
        </div>
        <div class="list" reveal="stagger">
          @for (item of items; track item.q; let i = $index) {
            <div class="item" [class.open]="open() === i">
              <button (click)="toggle(i)" [attr.aria-expanded]="open() === i">
                <span>{{ item.q }}</span>
                <i class="plus" aria-hidden="true"></i>
              </button>
              <div class="answer"><p>{{ item.a }}</p></div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .narrow { max-width: 860px; }
    .item { border-bottom: 1px solid var(--cream-faint); }
    .item button { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 26px 4px; text-align: left; font-family: var(--font-serif); font-size: clamp(19px, 2vw, 23px); transition: color 0.3s; }
    .item button:hover, .item.open button { color: var(--tomato-logo); }
    .plus { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(244,238,227,0.3); transition: transform 0.5s var(--ease-out), background 0.3s; }
    .plus::before, .plus::after { content: ''; position: absolute; inset: 0; margin: auto; width: 12px; height: 1.5px; background: currentColor; }
    .plus::after { transform: rotate(90deg); transition: transform 0.5s var(--ease-out); }
    .item.open .plus { background: var(--tomato); transform: rotate(180deg); box-shadow: none; color: var(--cream); }
    .item.open .plus::after { transform: rotate(0); }
    .answer { height: 0; overflow: hidden; }
    .answer p { margin: 0; padding: 0 4px 26px; color: var(--cream-muted); font-size: 16px; max-width: 700px; }
    @media (max-width: 560px) {
      .item button { padding: 20px 2px; font-size: 18px; }
      .plus { width: 30px; height: 30px; }
    }
  `,
})
export class FaqComponent {
  readonly open = signal<number | null>(null);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  readonly items = [
    {
      q: '¿Con cuánto tiempo debo reservar?',
      a: 'Lo antes posible; manejamos alta demanda. Te recomendamos reservar con 30 minutos de margen antes de tu hora deseada, para evitar retrasos por las serenatas anteriores.',
    },
    {
      q: '¿Van fuera de Cuenca?',
      a: 'Sí. La movilización está incluida en las zonas urbanas céntricas de Cuenca. Para cantones, el costo varía según la distancia: envíanos la ubicación y te cotizamos.',
    },
    {
      q: '¿Qué es el Show del Patrón?',
      a: 'Un show cómico con serenata de 3 canciones. Eliges patrón o patrona, traje de mariachi o traje regional, para niños o para adultos.',
    },
    {
      q: '¿Qué es un solista o un dúo?',
      a: 'Solista es 1 artista, varón o mujer. Dúo son 2 artistas: varón y mujer, dos varones o dos mujeres.',
    },
  ];

  toggle(i: number): void {
    const answers = this.host.querySelectorAll<HTMLElement>('.answer');
    const prev = this.open();
    const next = prev === i ? null : i;
    this.open.set(next);
    const dur = prefersReducedMotion() ? 0 : 0.6;
    if (prev !== null) gsap.to(answers[prev], { height: 0, duration: dur, ease: 'expo.inOut' });
    if (next !== null) gsap.to(answers[next], { height: 'auto', duration: dur, ease: 'expo.inOut' });
  }
}
