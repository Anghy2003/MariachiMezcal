import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { whatsappLink } from '../data/site.data';
import { IconComponent } from '../shared/icon.component';
import { MagneticDirective } from '../core/directives';

/** Botón flotante de WhatsApp con un globo "¡Reserva aquí!" que aparece a los pocos segundos. */
@Component({
  selector: 'app-whatsapp-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MagneticDirective],
  template: `
    @if (bubble()) {
      <span class="bubble">¡Reserva aquí!</span>
    }
    <a class="fab" [href]="link" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp" magnetic="0.35">
      <span class="pulse"></span>
      <app-icon name="whatsapp" />
    </a>
  `,
  styles: `
    :host { position: fixed; right: 24px; bottom: 24px; z-index: 150; display: flex; align-items: center; gap: 12px; }
    .fab { position: relative; width: 60px; height: 60px; border-radius: 50%; background: #1f8f5a; display: grid; place-items: center; font-size: 30px; color: #fff; box-shadow: 0 14px 34px -10px rgba(31, 143, 90, 0.7); }
    .pulse { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #1f8f5a; animation: pulse 2.4s ease-out infinite; }
    @keyframes pulse { from { transform: scale(1); opacity: 0.8; } to { transform: scale(1.7); opacity: 0; } }
    .bubble {
      background: var(--tomato); color: var(--cream);
      font-family: var(--font-poster); font-size: 18px; letter-spacing: 0.06em;
      padding: 8px 16px; border-radius: 18px 18px 4px 18px;
      box-shadow: 0 10px 26px -10px rgba(0, 0, 0, 0.5);
      animation: in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes in { from { opacity: 0; transform: translateX(20px) scale(0.8); } }
    @media (max-width: 600px) { :host { right: 16px; bottom: 16px; } .bubble { display: none; } }
    @media (max-width: 560px) {
      .fab { width: 54px; height: 54px; font-size: 27px; }
    }
  `,
})
export class WhatsappFabComponent {
  readonly link = whatsappLink('¡Hola Mariachi Mezcal! Quiero reservar una serenata.');
  readonly bubble = signal(false);

  constructor() {
    const show = setTimeout(() => this.bubble.set(true), 4500);
    const hide = setTimeout(() => this.bubble.set(false), 13000);
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(show);
      clearTimeout(hide);
    });
  }
}
