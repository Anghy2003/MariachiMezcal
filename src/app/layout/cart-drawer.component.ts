import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from '@angular/core';
import { CartService, CartItem } from '../core/cart.service';
import { NavigationService } from '../core/navigation.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { gsap } from '../core/motion';
import { IconComponent } from '../shared/icon.component';
import { SombreroArtComponent } from '../shared/sombrero-art.component';

@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SombreroArtComponent],
  host: { '[class.open]': 'cart.open()' },
  template: `
    <div class="scrim" (click)="close()"></div>
    <aside class="panel" role="dialog" aria-label="Tu carrito" data-lenis-prevent>
      <header>
        <h3>Tu carrito</h3>
        <button class="x" (click)="close()" aria-label="Cerrar"><app-icon name="close" /></button>
      </header>

      @if (cart.items().length) {
        <ul class="items">
          @for (item of cart.items(); track item.key) {
            @let d = cart.describe(item);
            <li>
              <img [src]="d.service?.image" alt="" [class.cutout]="d.service?.cutout" />
              <div class="info">
                <p class="name">{{ d.service?.shortName }} · {{ d.pkg?.name }}</p>
                <p class="note">{{ d.pkg?.note }}</p>
                @for (a of d.addons; track a.id) {
                  <p class="addon">+ {{ a.name }} <span>\${{ a.price }}</span></p>
                }
                <div class="row">
                  <button class="reserve" (click)="reserve(item)">Reservar este →</button>
                  <button class="remove" (click)="cart.remove(item.key)">Quitar</button>
                </div>
              </div>
              <p class="price">\${{ cart.itemTotal(item) }}</p>
            </li>
          }
        </ul>
        <footer>
          <p class="note">Movilización incluida en zonas urbanas céntricas de Cuenca. Cantones: valor extra según distancia.</p>
          <div class="total"><span>Subtotal</span><b>\${{ cart.subtotal() }}</b></div>
          <button class="btn" (click)="reserve(cart.items()[cart.items().length - 1])">Continuar con la reserva</button>
          <button class="link" (click)="goServices()">Seguir viendo servicios</button>
        </footer>
      } @else {
        <div class="empty">
          <app-sombrero-art class="art" />
          <p>Tu carrito está vacío</p>
          <button class="btn" (click)="goServices()">Ver servicios</button>
        </div>
      }
    </aside>
  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: 200; pointer-events: none; }
    .scrim { position: absolute; inset: 0; background: rgba(8, 10, 9, 0.6); backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.5s; }
    .panel {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: min(440px, 100%);
      background: var(--green-800);
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.7s var(--ease-out);
      box-shadow: -30px 0 80px rgba(0, 0, 0, 0.4);
    }
    :host(.open) { pointer-events: auto; }
    :host(.open) .scrim { opacity: 1; }
    :host(.open) .panel { transform: none; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 26px 28px; border-bottom: 1px solid var(--cream-faint); }
    h3 { margin: 0; font-family: var(--font-serif); font-weight: 400; font-size: 28px; }
    .x { font-size: 22px; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; transition: background 0.3s, transform 0.4s; }
    .x:hover { background: rgba(244, 238, 227, 0.08); transform: rotate(90deg); }
    .items { list-style: none; margin: 0; padding: 8px 28px; overflow-y: auto; flex: 1; }
    li { display: grid; grid-template-columns: 64px 1fr auto; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--cream-faint); }
    li img { width: 64px; height: 76px; object-fit: cover; border-radius: 12px; }
    li img.cutout { object-fit: contain; background: var(--tomato); padding: 4px; }
    .info p { margin: 0; }
    .name { font-weight: 600; font-size: 15px; }
    .note { font-size: 12.5px; color: var(--cream-muted); line-height: 1.5; }
    .addon { font-size: 13px; color: var(--cream-muted); }
    .addon span { color: var(--tomato-logo); }
    .row { display: flex; gap: 14px; margin-top: 10px; }
    .reserve { font-size: 12.5px; font-weight: 700; color: var(--tomato-logo); }
    .remove { font-size: 12.5px; color: rgba(244, 238, 227, 0.5); }
    .remove:hover { color: var(--cream); }
    .price { font-family: var(--font-serif); font-size: 22px; margin: 0; }
    footer { padding: 22px 28px 28px; border-top: 1px solid var(--cream-faint); display: grid; gap: 14px; }
    footer .note { margin: 0; }
    .total { display: flex; justify-content: space-between; align-items: baseline; }
    .total span { font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--cream-muted); }
    .total b { font-family: var(--font-serif); font-weight: 400; font-size: 34px; }
    .link { font-size: 14px; color: var(--cream-muted); }
    .link:hover { color: var(--cream); }
    .empty { flex: 1; display: grid; place-content: center; justify-items: center; gap: 18px; text-align: center; padding: 40px; }
    .empty .art { width: 180px; height: 124px; }
    .empty p { font-family: var(--font-serif); font-size: 24px; margin: 0; }
    @media (max-width: 560px) {
      header, footer { padding-inline: 20px; }
      .items { padding-inline: 20px; }
      li { grid-template-columns: 54px 1fr auto; gap: 12px; }
      li img { width: 54px; height: 64px; }
      .price { font-size: 19px; }
    }
  `,
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  private readonly nav = inject(NavigationService);
  private readonly scroll = inject(SmoothScroll);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  constructor() {
    effect(() => {
      if (this.cart.open()) {
        this.scroll.stop();
        requestAnimationFrame(() =>
          gsap.from(this.host.querySelectorAll('li, .empty > *'), { x: 40, autoAlpha: 0, stagger: 0.07, duration: 0.8, delay: 0.25, ease: 'expo.out' }),
        );
      } else {
        this.scroll.start();
      }
    });
  }

  close(): void {
    this.cart.open.set(false);
  }

  reserve(item: CartItem): void {
    this.cart.selection.set(item);
    this.close();
    setTimeout(() => this.nav.section('reserva'), 350);
  }

  goServices(): void {
    this.close();
    setTimeout(() => this.nav.section('servicios'), 350);
  }
}
