import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { SITE, whatsappLink } from '../data/site.data';
import { MagneticDirective, RevealDirective, TiltDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-contacto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, TiltDirective, IconComponent],
  template: `
    <section id="contacto" class="section section--cream">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" reveal="lines">Contáctanos</h2>
          <div class="ornament"><span></span></div>
          <p reveal="up">Celebra con nosotros y crea momentos memorables.</p>
        </div>

        <div class="grid">
          <div class="cards" reveal="stagger">
            <a class="card" [href]="'tel:' + tel" tilt="6">
              <span class="ico"><app-icon name="phone" /></span>
              <span><small>Teléfono / WhatsApp</small><b>{{ site.phoneDisplay }}</b><em>{{ site.phoneIntl }}</em></span>
            </a>
            <a class="card" [href]="'mailto:' + site.email" tilt="6">
              <span class="ico"><app-icon name="mail" /></span>
              <span><small>Correo electrónico</small><b>{{ site.email }}</b></span>
            </a>
            <div class="card" tilt="6">
              <span class="ico"><app-icon name="pin" /></span>
              <span><small>Dirección</small><b>{{ site.address }}</b><em>Atendemos Cuenca y sus cantones</em></span>
            </div>
            <div class="card" tilt="6">
              <span class="ico"><app-icon name="clock" /></span>
              <span><small>Horario</small><b>{{ site.hours }}</b><em>Reserva con tiempo: alta demanda</em></span>
            </div>
            <div class="actions">
              <a class="btn btn--whatsapp" [href]="wa" target="_blank" rel="noopener" magnetic><app-icon name="whatsapp" /> Escribir por WhatsApp</a>
              <div class="social">
                <a [href]="site.social.instagram" target="_blank" rel="noopener" aria-label="Instagram @mezcal_cuenca"><app-icon name="instagram" /></a>
                <a [href]="site.social.facebook" target="_blank" rel="noopener" aria-label="Facebook Mariachi Mezcal"><app-icon name="facebook" /></a>
                <a [href]="site.social.tiktok" target="_blank" rel="noopener" aria-label="TikTok @mariachimezcalcuenca"><app-icon name="tiktok" /></a>
              </div>
            </div>
          </div>

          <div class="map" reveal="scale">
            <iframe [src]="mapUrl" title="Mapa de Cuenca, Ecuador" loading="lazy" referrerpolicy="no-referrer"></iframe>
            <div class="map__card">
              <span class="pin"><app-icon name="pin" /></span>
              <b>Cuenca, Ecuador</b>
              <p>Movilización incluida en zonas urbanas céntricas de Cuenca. Para cantones, el valor extra se cotiza según la distancia.</p>
              <a class="btn btn--sm" href="https://www.google.com/maps/search/?api=1&query=Cuenca%2C%20Ecuador" target="_blank" rel="noopener">Cómo llegar</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: 1fr 1.25fr; gap: 28px; align-items: stretch; }
    .cards { display: grid; gap: 14px; align-content: start; }
    .card { display: flex; gap: 18px; align-items: center; padding: 18px 22px; border-radius: 18px; background: #fff; box-shadow: 0 20px 40px -30px rgba(30, 38, 32, 0.45); transition: box-shadow 0.4s; }
    a.card:hover { box-shadow: 0 0 0 1.5px var(--tomato), 0 24px 44px -28px rgba(163, 74, 44, 0.5); }
    .ico { flex: none; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; font-size: 22px; color: var(--tomato); background: rgba(163, 74, 44, 0.1); }
    small { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-muted); }
    b { display: block; font-size: 16px; font-weight: 700; margin-top: 2px; word-break: break-word; }
    em { display: block; font-style: normal; font-size: 13px; color: var(--ink-muted); }
    .actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-top: 8px; }
    .social { display: flex; gap: 10px; }
    .social a { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; background: var(--green-800); color: var(--cream); transition: background 0.3s, transform 0.4s var(--ease-out); }
    .social a:hover { background: var(--tomato); transform: translateY(-4px); }
    .map { position: relative; border-radius: var(--radius-lg); overflow: hidden; min-height: 460px; background: var(--green-800); box-shadow: 0 30px 60px -34px rgba(30, 38, 32, 0.6); }
    iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; filter: invert(0.92) hue-rotate(160deg) saturate(0.35) brightness(0.85) contrast(1.05); }
    .map::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 50%, transparent 30%, rgba(18, 22, 19, 0.55)); }
    .map__card { position: absolute; z-index: 1; left: 24px; bottom: 24px; max-width: 320px; background: var(--cream); border-radius: 18px; padding: 20px 22px; box-shadow: 0 30px 50px -20px rgba(0,0,0,0.5); }
    .map__card b { font-family: var(--font-serif); font-weight: 500; font-size: 20px; }
    .map__card p { margin: 6px 0 14px; font-size: 13.5px; color: var(--ink-muted); }
    .pin { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--tomato); color: var(--cream); font-size: 20px; margin-bottom: 10px; animation: bob 2s ease-in-out infinite; }
    @keyframes bob { 50% { transform: translateY(-5px); } }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    @media (max-width: 560px) {
      .card { padding: 16px; gap: 14px; }
      .ico { width: 42px; height: 42px; font-size: 20px; }
      b { font-size: 15px; }
      .actions { flex-direction: column; align-items: stretch; }
      .actions .btn { width: 100%; }
      .social { justify-content: center; }
      .map { min-height: 420px; }
      .map__card { left: 12px; right: 12px; bottom: 12px; max-width: none; padding: 16px 18px; }
    }
  `,
})
export class ContactoComponent {
  readonly site = SITE;
  readonly tel = SITE.phoneIntl.replace(/\s/g, '');
  readonly wa = whatsappLink('¡Hola Mariachi Mezcal! Quiero información para una serenata.');
  readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://www.openstreetmap.org/export/embed.html?bbox=-79.05%2C-2.93%2C-78.95%2C-2.86&layer=mapnik&marker=-2.8975%2C-79.0045',
  );
}
