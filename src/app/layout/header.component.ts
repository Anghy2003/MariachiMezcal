import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { CartService } from '../core/cart.service';
import { NavigationService } from '../core/navigation.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { PageTransition } from '../core/page-transition.service';
import { gsap } from '../core/motion';
import { MagneticDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MagneticDirective],
  host: {
    '[class.solid]': 'solid()',
    '[class.tucked]': 'tucked()',
    '[class.menu-open]': 'menuOpen()',
  },
  template: `
    <div class="bar container">
      <button class="brand" (click)="go('inicio')" aria-label="Mariachi Mezcal, ir al inicio">
        <img src="img/logo.webp" alt="" width="44" height="41" />
        <span>Mariachi Mezcal</span>
      </button>

      <nav class="links" aria-label="Principal">
        @for (link of links; track link.id) {
          <button (click)="go(link.id)">{{ link.label }}</button>
        }
      </nav>

      <div class="actions">
        <button class="cart" [class.bump]="bumping()" (click)="cart.open.set(true)" aria-label="Abrir carrito">
          <app-icon name="cart" />
          @if (cart.count()) {
            <span class="badge">{{ cart.count() }}</span>
          }
        </button>
        <button class="access" (click)="transition.go('/acceso')">
          <app-icon name="lock" /> Acceso interno
        </button>
        <button class="btn btn--sm" magnetic="0.25" (click)="go('reserva')">Reservar</button>
        <button class="burger" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Menú">
          <span></span><span></span>
        </button>
      </div>
    </div>

    <div class="mobile" [attr.aria-hidden]="!menuOpen()">
      <nav>
        @for (link of links; track link.id) {
          <button (click)="go(link.id)">{{ link.label }}</button>
        }
      </nav>
      <button class="access access--mobile" (click)="transition.go('/acceso'); menuOpen.set(false)">
        <app-icon name="lock" /> Acceso interno
      </button>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0 0 auto;
      z-index: 100;
      transition: transform 0.6s var(--ease-out), background 0.4s, backdrop-filter 0.4s, box-shadow 0.4s;
    }
    :host(.solid) {
      background: rgba(18, 22, 19, 0.82);
      backdrop-filter: blur(14px);
      box-shadow: 0 1px 0 rgba(244, 238, 227, 0.08);
    }
    :host(.tucked) { transform: translateY(-100%); }
    .bar {
      width: auto;
      max-width: none;
      margin: 0;
      padding-inline: clamp(20px, 4vw, 72px);
      height: var(--header-h);
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .brand { display: flex; align-items: center; gap: 12px; flex: none; }
    .brand img { width: 44px; height: auto; flex: none; }
    .brand span { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.12em; font-size: 15px; text-transform: uppercase; white-space: nowrap; }
    .links { display: flex; gap: clamp(16px, 1.7vw, 26px); margin-left: auto; }
    .links button {
      position: relative;
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--cream-muted);
      padding: 8px 0;
      transition: color 0.3s;
    }
    .links button::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: 2px;
      height: 1.5px;
      background: var(--tomato-logo);
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.45s var(--ease-out);
    }
    .links button:hover { color: var(--cream); }
    .links button:hover::after { transform: scaleX(1); transform-origin: left; }
    .actions { display: flex; align-items: center; gap: 16px; }
    .cart { position: relative; font-size: 22px; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; transition: background 0.3s; }
    .cart:hover { background: rgba(244, 238, 227, 0.08); }
    .cart.bump { animation: bump 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes bump { 40% { transform: scale(1.3) rotate(-10deg); } }
    .badge {
      position: absolute; top: 2px; right: 0;
      min-width: 18px; height: 18px; padding: 0 5px;
      border-radius: 9px; background: var(--tomato-logo);
      font-size: 11px; font-weight: 700; display: grid; place-items: center;
    }
    .access {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
      padding: 9px 14px; border-radius: 999px; white-space: nowrap;
      box-shadow: inset 0 0 0 1px rgba(244, 238, 227, 0.3);
      color: var(--cream-muted);
      transition: color 0.3s, box-shadow 0.3s;
    }
    .access:hover { color: var(--cream); box-shadow: inset 0 0 0 1px var(--cream); }
    .burger { display: none; width: 42px; height: 42px; position: relative; }
    .burger span { position: absolute; left: 10px; right: 10px; height: 1.5px; background: var(--cream); transition: transform 0.4s var(--ease-out); }
    .burger span:first-child { top: 16px; }
    .burger span:last-child { top: 25px; right: 16px; }
    :host(.menu-open) .burger span:first-child { transform: translateY(4.5px) rotate(45deg); }
    :host(.menu-open) .burger span:last-child { transform: translateY(-4.5px) rotate(-45deg); right: 10px; }
    .mobile {
      position: fixed; inset: var(--header-h) 0 0;
      background: var(--green-900);
      display: flex; flex-direction: column; justify-content: center; gap: 40px;
      padding: 0 32px 80px;
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.7s var(--ease-out);
      pointer-events: none;
    }
    :host(.menu-open) .mobile { clip-path: inset(0 0 0 0); pointer-events: auto; }
    .mobile nav { display: flex; flex-direction: column; gap: 10px; }
    .mobile nav button { text-align: left; font-family: var(--font-display); font-size: 34px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
    .access--mobile { align-self: flex-start; }
    @media (min-width: 1081px) and (max-width: 1320px) { .brand span { display: none; } }
    @media (max-width: 1080px) {
      .links, .access:not(.access--mobile) { display: none; }
      .actions { margin-left: auto; }
      .burger { display: block; }
    }
    @media (max-width: 480px) {
      .brand span { display: none; }
      .actions .btn { padding: 0 16px; }
      .actions { gap: 8px; }
    }
  `,
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly transition = inject(PageTransition);
  private readonly nav = inject(NavigationService);
  private readonly scroll = inject(SmoothScroll);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  readonly menuOpen = signal(false);
  readonly bumping = signal(false);
  readonly solid = computed(() => this.scroll.scrollY() > 40 || this.menuOpen());
  readonly tucked = computed(() => !this.menuOpen() && this.scroll.scrollY() > 500 && this.scroll.direction() === 1);

  readonly links = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'historia', label: 'Historia' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'contacto', label: 'Contáctanos' },
  ];

  constructor() {
    let first = true;
    effect(() => {
      this.cart.bump();
      if (first) {
        first = false;
        return;
      }
      this.bumping.set(false);
      requestAnimationFrame(() => this.bumping.set(true));
      setTimeout(() => this.bumping.set(false), 700);
    });
    effect(() => {
      if (this.menuOpen()) {
        this.scroll.stop();
        gsap.from(this.host.querySelectorAll('.mobile nav button'), { y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.8, delay: 0.2, ease: 'expo.out' });
      } else {
        this.scroll.start();
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  go(id: string): void {
    this.menuOpen.set(false);
    this.nav.section(id);
  }
}
