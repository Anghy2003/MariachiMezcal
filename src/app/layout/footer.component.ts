import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE, whatsappLink } from '../data/site.data';
import { SERVICES } from '../data/services.data';
import { NavigationService } from '../core/navigation.service';
import { PageTransition } from '../core/page-transition.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="greca" aria-hidden="true"></div>
    <div class="container grid">
      <div class="about">
        <img src="img/logo.webp" alt="Mariachi Mezcal" width="92" height="85" />
        <p class="company">{{ site.company }}</p>
        <p>Pioneros en Cuenca del mariachi solista y a dúo. Más que un servicio, una experiencia.</p>
        <div class="social">
          <a [href]="site.social.instagram" target="_blank" rel="noopener" aria-label="Instagram"><app-icon name="instagram" /></a>
          <a [href]="site.social.facebook" target="_blank" rel="noopener" aria-label="Facebook"><app-icon name="facebook" /></a>
          <a [href]="site.social.tiktok" target="_blank" rel="noopener" aria-label="TikTok"><app-icon name="tiktok" /></a>
          <a [href]="wa" target="_blank" rel="noopener" aria-label="WhatsApp"><app-icon name="whatsapp" /></a>
        </div>
      </div>
      <div>
        <h4>Enlaces rápidos</h4>
        <button (click)="nav.section('inicio')">Inicio</button>
        <button (click)="nav.section('historia')">Nuestra historia</button>
        <button (click)="nav.section('servicios')">Servicios</button>
        <button (click)="nav.section('reserva')">Reservas</button>
        <button (click)="nav.section('contacto')">Contáctanos</button>
      </div>
      <div>
        <h4>Modalidades</h4>
        @for (s of services; track s.slug) {
          <button (click)="nav.service(s.slug)">{{ s.shortName }} <span>{{ s.priceLabel }}</span></button>
        }
      </div>
      <div>
        <h4>Contacto Cuenca</h4>
        <a [href]="'tel:' + site.phoneIntl.replaceAll(' ', '')">{{ site.phoneDisplay }}</a>
        <a [href]="'mailto:' + site.email">{{ site.email }}</a>
        <p>{{ site.address }}</p>
        <p>{{ site.hours }}</p>
      </div>
    </div>
    <div class="container bottom">
      <p>© {{ site.year }} {{ site.company }} — Todos los derechos reservados.</p>
      <button class="access" (click)="transition.go('/acceso')"><app-icon name="lock" /> Acceso interno</button>
    </div>
  `,
  styles: `
    :host { display: block; background: var(--green-950); padding-bottom: 28px; position: relative; }
    .greca {
      height: 14px;
      background: repeating-linear-gradient(90deg, transparent 0 6px, rgba(181, 181, 181, 0.35) 6px 8px, transparent 8px 14px),
        linear-gradient(var(--green-950), var(--green-950));
      border-top: 1px solid rgba(181, 181, 181, 0.25);
      border-bottom: 1px solid rgba(181, 181, 181, 0.12);
    }
    .grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.1fr; gap: 48px; padding-block: 72px 48px; }
    h4 { font-family: var(--font-poster); font-weight: 400; font-size: 20px; letter-spacing: 0.1em; margin: 0 0 18px; color: var(--cream); }
    .grid button, .grid a, .grid p { display: flex; justify-content: space-between; gap: 12px; width: 100%; text-align: left; font-size: 14px; color: var(--cream-muted); margin: 0 0 10px; transition: color 0.3s; }
    .grid button:hover, .grid a:hover { color: var(--tomato-logo); }
    .grid button span { color: rgba(244, 238, 227, 0.45); }
    .about img { width: 92px; height: auto; margin-bottom: 16px; }
    .about .company { color: var(--cream); font-weight: 700; letter-spacing: 0.06em; }
    .social { display: flex; gap: 10px; margin-top: 18px; }
    .social a { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 19px; box-shadow: inset 0 0 0 1px rgba(244, 238, 227, 0.2); transition: background 0.3s, transform 0.4s var(--ease-out); }
    .social a:hover { background: var(--tomato); transform: translateY(-4px); color: var(--cream); }
    .bottom { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 24px; border-top: 1px solid rgba(244, 238, 227, 0.08); font-size: 13px; color: rgba(244, 238, 227, 0.5); }
    .bottom p { margin: 0; }
    .access { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(244, 238, 227, 0.55); }
    .access:hover { color: var(--cream); }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr 1fr; }
      .about { grid-column: 1 / -1; }
      .bottom { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; gap: 32px; padding-block: 52px 36px; }
    }
  `,
})
export class FooterComponent {
  readonly site = SITE;
  readonly services = SERVICES;
  readonly nav = inject(NavigationService);
  readonly transition = inject(PageTransition);
  readonly wa = whatsappLink('¡Hola Mariachi Mezcal! Quiero información sobre sus serenatas.');
}
