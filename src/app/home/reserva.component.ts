import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ADDONS, SERVICES, findPackage } from '../data/services.data';
import { SITE, whatsappLink } from '../data/site.data';
import { CartService } from '../core/cart.service';
import { gsap, prefersReducedMotion } from '../core/motion';
import { MagneticDirective, RevealDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { IconComponent } from '../shared/icon.component';
import { EffectCanvasComponent } from '../shared/effect-canvas.component';

type Field = 'nombre' | 'telefono' | 'fecha' | 'hora' | 'direccion' | 'paquete';

/**
 * Formulario de reserva. Por ahora no hay servidor: al enviar se arma el mensaje
 * completo para WhatsApp, que es como el negocio confirma sus reservas.
 */
@Component({
  selector: 'app-reserva',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, MagneticDirective, StarburstComponent, IconComponent, EffectCanvasComponent],
  template: `
    <section id="reserva" class="section section--green">
      <div class="container">
        <div class="alert" reveal="up">
          <app-icon name="alert" />
          <p><b>Alta demanda.</b> Manejamos cerca de 1.000 serenatas al mes: reserva con tiempo y, de preferencia, con <b>30 minutos de margen</b> antes de tu hora deseada, para evitar retrasos por las serenatas anteriores.</p>
        </div>

        <div class="section-head">
          <h2 class="section-title" reveal="lines">Reserva tu serenata</h2>
          <div class="ornament"><span></span></div>
        </div>

        <div class="layout">
          <form class="form" (submit)="submit($event)" novalidate reveal="up">
            <h3>Datos del evento</h3>
            <div class="grid">
              <label [class.err]="showErr('nombre')">
                <span>Tu nombre completo *</span>
                <input type="text" [value]="nombre()" (input)="nombre.set(val($event))" placeholder="Ej. Carla Ochoa" autocomplete="name" />
              </label>
              <label [class.err]="showErr('telefono')">
                <span>Teléfono / WhatsApp *</span>
                <input type="tel" [value]="telefono()" (input)="telefono.set(val($event))" placeholder="09XXXXXXXX" autocomplete="tel" />
              </label>
              <label [class.err]="showErr('fecha')">
                <span>Fecha del evento *</span>
                <input type="date" [min]="today" [value]="fecha()" (input)="fecha.set(val($event))" />
              </label>
              <label [class.err]="showErr('hora')">
                <span>Hora estimada *</span>
                <input type="time" [value]="hora()" (input)="hora.set(val($event))" />
              </label>
              <label class="wide" [class.err]="showErr('paquete')">
                <span>Modalidad / paquete *</span>
                <select [value]="paquete()" (change)="paquete.set(val($event))">
                  <option value="">Elige tu paquete</option>
                  @for (s of services; track s.slug) {
                    <optgroup [label]="s.name">
                      @for (p of s.packages; track p.id) {
                        <option [value]="p.id" [selected]="p.id === paquete()">{{ p.name }} — \${{ p.price }}</option>
                      }
                    </optgroup>
                  }
                </select>
              </label>
              <label>
                <span>Regalo incluido</span>
                <select [value]="regalo()" (change)="regalo.set(val($event))" [disabled]="!gifts().length">
                  @if (!gifts().length) {
                    <option value="">Este paquete no incluye regalo</option>
                  }
                  @for (g of gifts(); track g) {
                    <option [value]="g" [selected]="g === regalo()">{{ g }}</option>
                  }
                </select>
              </label>
              <label>
                <span>Ocasión</span>
                <select [value]="ocasion()" (change)="ocasion.set(val($event))">
                  @for (o of ocasiones; track o) {
                    <option [value]="o">{{ o }}</option>
                  }
                </select>
              </label>
              <label class="wide" [class.err]="showErr('direccion')">
                <span>Dirección en Cuenca o cantón *</span>
                <input type="text" [value]="direccion()" (input)="direccion.set(val($event))" placeholder="Calle, número y referencia" autocomplete="street-address" />
              </label>
              <label>
                <span>Zona</span>
                <select [value]="zona()" (change)="zona.set(val($event))">
                  <option value="urbana">Zona urbana céntrica de Cuenca</option>
                  <option value="canton">Cantón o fuera de la ciudad</option>
                </select>
              </label>
              <label>
                <span>Nombre del homenajeado</span>
                <input type="text" [value]="homenajeado()" (input)="homenajeado.set(val($event))" placeholder="¿A quién le cantamos?" />
              </label>
              @if (zona() === 'canton') {
                <p class="wide hint"><app-icon name="pin" /> El valor extra se cotiza según el kilometraje; te lo confirmaremos por WhatsApp.</p>
              }
            </div>

            @if (hasAddons()) {
              <fieldset class="addons">
                <legend>Adicionales (costo extra)</legend>
                @for (a of addons; track a.id) {
                  <div class="addon" [class.on]="isOn(a.id)">
                    <label class="check">
                      <input type="checkbox" [checked]="isOn(a.id)" (change)="toggleAddon(a.id)" />
                      <i><app-icon name="check" /></i>
                      {{ a.name }}
                    </label>
                    @if (a.options && isOn(a.id)) {
                      <span class="sizes">
                        @for (o of a.options; track o) {
                          <button type="button" [class.on]="addonPrice(a.id) === o" (click)="setAddon(a.id, o)">\${{ o }}</button>
                        }
                      </span>
                    } @else {
                      <span class="p">+\${{ a.price }}</span>
                    }
                  </div>
                }
              </fieldset>
            }

            <label class="wide">
              <span>Canciones favoritas o indicaciones</span>
              <textarea rows="3" [value]="notas()" (input)="notas.set(val($event))" placeholder="Canciones que te gustaría escuchar, sorpresa, vestimenta del patrón…"></textarea>
            </label>

            @if (tried() && errors().length) {
              <p class="error-msg">Completa los campos marcados con * para enviar tu reserva.</p>
            }
            <button class="btn submit" type="submit" magnetic="0.15">Enviar solicitud de reserva <app-icon name="arrow-right" /></button>
          </form>

          <aside class="summary" reveal="right">
            <div class="summary__head">
              <h3>Resumen en vivo</h3>
              <app-starburst [text]="'$' + total()" [size]="92" />
            </div>
            <dl>
              <div><dt>Servicio</dt><dd>{{ selected()?.service?.name ?? '—' }}</dd></div>
              <div><dt>Paquete</dt><dd>{{ selected()?.pkg?.name ?? '—' }}</dd></div>
              <div><dt>Regalo</dt><dd>{{ regalo() || 'Sin regalo' }}</dd></div>
              <div><dt>Adicionales</dt><dd>{{ addonNames() || 'Ninguno' }}</dd></div>
              <div><dt>Movilidad</dt><dd [class.hl]="zona() === 'canton'">{{ zona() === 'canton' ? 'Cantón: se cotiza aparte' : 'Incluida en Cuenca' }}</dd></div>
            </dl>
            <div class="total"><span>Total estimado</span><b>\${{ total() }}</b></div>
            <ul class="included">
              <li><app-icon name="check" /> Audio profesional en vivo</li>
              <li><app-icon name="check" /> Puntualidad y trajes de gala</li>
              <li><app-icon name="check" /> Confirmación por WhatsApp</li>
            </ul>
            <p class="fine">No se realiza ningún pago en línea.</p>
          </aside>
        </div>
      </div>

      @if (sent()) {
        <div class="success" role="dialog" aria-label="Reserva enviada">
          <app-effect-canvas #fx mode="confetti" [density]="1.2" />
          <div class="success__card">
            <span class="check"><app-icon name="check" /></span>
            <h3>¡Solicitud lista, {{ firstName() }}!</h3>
            <p>Envíanos el mensaje por WhatsApp y te confirmamos tu serenata. Ya lleva todos los datos de tu reserva.</p>
            <a class="btn btn--whatsapp" [href]="waMessage()" target="_blank" rel="noopener"><app-icon name="whatsapp" /> Enviar por WhatsApp</a>
            <button class="again" (click)="reset()">Hacer otra reserva</button>
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: './reserva.component.scss',
})
export class ReservaComponent {
  private readonly cart = inject(CartService);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly fx = viewChild<EffectCanvasComponent>('fx');

  readonly services = SERVICES;
  readonly addons = ADDONS;
  readonly today = new Date().toISOString().slice(0, 10);
  readonly ocasiones = ['Cumpleaños', '15 años', 'Pedida de mano', 'Aniversario', 'Declaración', 'Reconciliación', 'Día de la Madre', 'Graduación', 'Misa', 'Otro'];

  readonly nombre = signal('');
  readonly telefono = signal('');
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly paquete = signal('');
  readonly regalo = signal('');
  readonly ocasion = signal('Cumpleaños');
  readonly direccion = signal('');
  readonly zona = signal<'urbana' | 'canton' | string>('urbana');
  readonly homenajeado = signal('');
  readonly notas = signal('');
  readonly extras = signal<Record<string, number>>({});
  readonly tried = signal(false);
  readonly sent = signal(false);

  readonly selected = computed(() => findPackage(this.paquete()));
  readonly gifts = computed(() => this.selected()?.pkg.gifts ?? []);
  readonly hasAddons = computed(() => this.selected()?.service.addons ?? true);
  readonly total = computed(() => {
    const base = this.selected()?.pkg.price ?? 0;
    const extra = this.hasAddons() ? Object.values(this.extras()).reduce((s, n) => s + n, 0) : 0;
    return base + extra;
  });
  readonly addonNames = computed(() =>
    Object.entries(this.extras())
      .map(([id, price]) => `${ADDONS.find((a) => a.id === id)?.name} ($${price})`)
      .join(', '),
  );
  readonly errors = computed<Field[]>(() => {
    const e: Field[] = [];
    if (this.nombre().trim().length < 3) e.push('nombre');
    if (this.telefono().replace(/\D/g, '').length < 7) e.push('telefono');
    if (!this.fecha()) e.push('fecha');
    if (!this.hora()) e.push('hora');
    if (this.direccion().trim().length < 5) e.push('direccion');
    if (!this.paquete()) e.push('paquete');
    return e;
  });
  readonly firstName = computed(() => this.nombre().trim().split(' ')[0]);
  readonly waMessage = computed(() => {
    const s = this.selected();
    const lines = [
      '¡Hola Mariachi Mezcal! Quiero reservar una serenata 🎺',
      '',
      `• Nombre: ${this.nombre()}`,
      `• Teléfono: ${this.telefono()}`,
      `• Servicio: ${s?.service.name} — ${s?.pkg.name} ($${s?.pkg.price})`,
      `• Regalo: ${this.regalo() || 'Sin regalo'}`,
      `• Adicionales: ${this.addonNames() || 'Ninguno'}`,
      `• Fecha y hora: ${this.fecha().split('-').reverse().join('/')} a las ${this.hora()}`,
      `• Ocasión: ${this.ocasion()}`,
      `• Dirección: ${this.direccion()} (${this.zona() === 'canton' ? 'cantón / fuera de la ciudad' : 'zona urbana de Cuenca'})`,
      this.homenajeado() ? `• Homenajeado: ${this.homenajeado()}` : '',
      this.notas() ? `• Notas: ${this.notas()}` : '',
      '',
      `Total estimado: $${this.total()}`,
    ];
    return whatsappLink(lines.filter((l, i) => l !== '' || i === 1 || i === lines.length - 2).join('\n'));
  });

  constructor() {
    // Si se entra sin elegir un paquete concreto, se usa el último del carrito
    if (!this.cart.selection() && this.cart.items().length) {
      this.cart.selection.set(this.cart.items()[this.cart.items().length - 1]);
    }
    // Un paquete elegido en una ficha o en el carrito llena el formulario
    effect(() => {
      const item = this.cart.selection();
      if (!item) return;
      this.paquete.set(item.packageId);
      this.extras.set(Object.fromEntries(item.addons.map((a) => [a.id, a.price])));
    });
    // Al cambiar de paquete, se propone el primer regalo disponible
    effect(() => {
      const g = this.gifts();
      if (!g.includes(this.regalo())) this.regalo.set(g[0] ?? '');
    });
    // Explosión de confeti al enviar
    effect(() => {
      const fx = this.fx();
      if (fx && this.sent()) {
        setTimeout(() => fx.burst(0.5, 0.45, 120), 250);
        if (!prefersReducedMotion()) gsap.from(this.host.querySelector('.success__card'), { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' });
      }
    });
  }

  val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  showErr(f: Field): boolean {
    return this.tried() && this.errors().includes(f);
  }

  isOn(id: string): boolean {
    return id in this.extras();
  }

  addonPrice(id: string): number | undefined {
    return this.extras()[id];
  }

  toggleAddon(id: string): void {
    const addon = ADDONS.find((a) => a.id === id)!;
    this.extras.update((x) => {
      const copy = { ...x };
      if (id in copy) delete copy[id];
      else copy[id] = addon.price;
      return copy;
    });
  }

  setAddon(id: string, price: number): void {
    this.extras.update((x) => ({ ...x, [id]: price }));
  }

  submit(e: Event): void {
    e.preventDefault();
    this.tried.set(true);
    if (this.errors().length) {
      const first = this.host.querySelector('.err');
      if (first && !prefersReducedMotion()) gsap.fromTo(this.host.querySelectorAll('.err'), { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      (first?.querySelector('input, select') as HTMLElement | null)?.focus();
      return;
    }
    this.sent.set(true);
  }

  reset(): void {
    this.sent.set(false);
    this.tried.set(false);
    this.nombre.set('');
    this.telefono.set('');
    this.fecha.set('');
    this.hora.set('');
    this.direccion.set('');
    this.homenajeado.set('');
    this.notas.set('');
    this.extras.set({});
    this.paquete.set('');
  }

  protected readonly site = SITE;
}
