import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { CartService } from '../core/cart.service';
import { NavigationService } from '../core/navigation.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { ScrollTrigger } from '../core/motion';
import { ReservaComponent } from '../home/reserva.component';
import { SombreroArtComponent } from '../shared/sombrero-art.component';

/** Pantalla de reserva: solo se usa cuando hay algo en el carrito. */
@Component({
  selector: 'app-reservar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReservaComponent, SombreroArtComponent],
  template: `
    <div class="page">
      @if (cart.count()) {
        <app-reserva />
      } @else {
        <section class="empty container">
          <app-sombrero-art class="art" />
          <h1>Tu carrito está vacío</h1>
          <p>Elige primero un paquete para reservar tu serenata.</p>
          <button class="btn" (click)="nav.section('paquetes')">Ver paquetes</button>
        </section>
      }
    </div>
  `,
  styles: `
    .page { padding-top: var(--header-h); background: var(--green-900); min-height: 100vh; }
    .empty { min-height: 70vh; display: grid; place-content: center; justify-items: center; gap: 16px; text-align: center; }
    .empty .art { width: 200px; height: 136px; }
    .empty h1 { margin: 0; font-family: var(--font-serif); font-weight: 400; font-size: 38px; }
    .empty p { margin: 0 0 8px; color: var(--cream-muted); }
    @media (max-width: 560px) {
      .empty h1 { font-size: 30px; }
    }
  `,
})
export class ReservarPage {
  readonly cart = inject(CartService);
  readonly nav = inject(NavigationService);

  constructor() {
    const scroll = inject(SmoothScroll);
    afterNextRender(() => {
      scroll.to(0, { immediate: true, offset: 0 });
      setTimeout(() => ScrollTrigger.refresh(), 100);
    });
  }
}
