import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ADDONS, findPackage } from '../data/services.data';
import { whatsappLink } from '../data/site.data';
import { CartService, CartItem } from '../core/cart.service';
import { NavigationService } from '../core/navigation.service';
import { ReservasApiService } from '../core/reservas-api.service';
import { gsap, prefersReducedMotion } from '../core/motion';
import { MagneticDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';
import { EffectCanvasComponent } from '../shared/effect-canvas.component';

type Field = 'email' | 'nombre' | 'telefono' | 'fecha' | 'hora' | 'direccion' | 'terminos';

/**
 * Pantalla de reserva con la estructura de un "finalizar compra":
 * Contacto, Facturación, Evento y Pago a la izquierda; resumen del carrito a la derecha.
 * No hay pago en línea: la reserva se envía al backend (queda "pendiente" y llegan los correos).
 * Si el backend no responde, se ofrece WhatsApp con el mensaje completo como respaldo.
 */
@Component({
  selector: 'app-reserva',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, IconComponent, EffectCanvasComponent],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.scss',
})
export class ReservaComponent {
  readonly cart = inject(CartService);
  readonly nav = inject(NavigationService);
  private readonly api = inject(ReservasApiService);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly fx = viewChild<EffectCanvasComponent>('fx');

  readonly today = new Date().toISOString().slice(0, 10);
  readonly paises = ['Ecuador', 'Estados Unidos', 'España', 'Colombia', 'Perú', 'México', 'Otro'];
  readonly codigos = [
    { flag: '🇪🇨', code: '+593' },
    { flag: '🇺🇸', code: '+1' },
    { flag: '🇪🇸', code: '+34' },
    { flag: '🇨🇴', code: '+57' },
    { flag: '🇵🇪', code: '+51' },
    { flag: '🇲🇽', code: '+52' },
  ];

  readonly email = signal('');
  readonly nombre = signal('');
  readonly pais = signal('Ecuador');
  readonly codigo = signal('+593');
  readonly telefono = signal('');
  readonly fecha = signal('');
  readonly hora = signal('');
  readonly direccion = signal('');
  readonly terminos = signal(false);
  readonly verTerminos = signal(false);
  /** Regalo elegido por cada ítem del carrito (según lo que incluya su paquete). */
  readonly regalos = signal<Record<string, string>>({});
  readonly tried = signal(false);
  readonly sent = signal(false);
  /** Campo trampa (invisible): solo un robot lo llena. */
  readonly website = signal('');
  readonly sending = signal(false);
  /** Código que devuelve el backend (MZ-XXXX); vacío si se envió por el respaldo de WhatsApp. */
  readonly code = signal('');
  /** Por qué no se pudo registrar en línea (para mostrar el respaldo de WhatsApp). */
  readonly failure = signal<'' | 'offline' | 'limit'>('');
  /** Campos que el backend marcó como inválidos. */
  readonly serverErrors = signal<Field[]>([]);

  readonly items = computed(() => this.cart.items().map((item) => ({ item, ...this.cart.describe(item), total: this.cart.itemTotal(item) })));
  readonly total = computed(() => this.cart.subtotal());
  readonly errors = computed<Field[]>(() => {
    const e: Field[] = [];
    if (!/^\S+@\S+\.\S+$/.test(this.email().trim())) e.push('email');
    if (this.nombre().trim().length < 3) e.push('nombre');
    if (this.telefono().replace(/\D/g, '').length < 7) e.push('telefono');
    if (!this.fecha()) e.push('fecha');
    if (!this.hora()) e.push('hora');
    if (this.direccion().trim().length < 5) e.push('direccion');
    if (!this.terminos()) e.push('terminos');
    return e;
  });
  readonly firstName = computed(() => this.nombre().trim().split(' ')[0]);

  readonly waMessage = computed(() => {
    const lines: string[] = [this.code() ? `¡Hola Mariachi Mezcal! Acabo de hacer la reserva ${this.code()} 🎺` : '¡Hola Mariachi Mezcal! Quiero reservar una serenata 🎺', ''];
    for (const d of this.items()) {
      const regalo = this.regaloDe(d.item);
      lines.push(`• ${d.service?.name} — ${d.pkg?.name} ($${d.pkg?.price})`);
      if (regalo) lines.push(`   Regalo: ${regalo}`);
      for (const a of d.addons) lines.push(`   + ${a.name} ($${a.price})`);
    }
    lines.push(
      '',
      `Nombre: ${this.nombre()}`,
      `Teléfono: ${this.codigo()} ${this.telefono()}`,
      `Correo: ${this.email()}`,
      `País: ${this.pais()}`,
      `Fecha y hora: ${this.fecha().split('-').reverse().join('/')} a las ${this.hora()}`,
      `Dirección: ${this.direccion()}`,
      '',
      `Total estimado: $${this.total()}`,
    );
    return whatsappLink(lines.join('\n'));
  });

  constructor() {
    // Regalo propuesto por defecto: el primero que incluya cada paquete
    effect(() => {
      const current = this.regalos();
      const next: Record<string, string> = {};
      for (const item of this.cart.items()) {
        const gifts = findPackage(item.packageId)?.pkg.gifts ?? [];
        next[item.key] = gifts.includes(current[item.key]) ? current[item.key] : (gifts[0] ?? '');
      }
      if (JSON.stringify(next) !== JSON.stringify(current)) this.regalos.set(next);
    });
    // Confeti cuando la reserva quedó registrada
    effect(() => {
      const fx = this.fx();
      if (fx && this.sent() && this.code()) {
        setTimeout(() => fx.burst(0.5, 0.45, 120), 250);
        if (!prefersReducedMotion()) gsap.from(this.host.querySelector('.success__card'), { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' });
      }
    });
  }

  giftsOf(item: CartItem): string[] {
    return findPackage(item.packageId)?.pkg.gifts ?? [];
  }

  regaloDe(item: CartItem): string {
    return this.regalos()[item.key] ?? '';
  }

  setRegalo(item: CartItem, value: string): void {
    this.regalos.update((r) => ({ ...r, [item.key]: value }));
  }

  addonName(id: string): string {
    return ADDONS.find((a) => a.id === id)?.name ?? id;
  }

  val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  showErr(f: Field): boolean {
    return this.tried() && (this.errors().includes(f) || this.serverErrors().includes(f));
  }

  async submit(e: Event): Promise<void> {
    e.preventDefault();
    if (this.sending()) return;
    this.tried.set(true);
    this.serverErrors.set([]);
    if (this.errors().length) {
      this.shakeErrors();
      return;
    }

    this.sending.set(true);
    const res = await this.api.enviar({
      email: this.email().trim(),
      nombre: this.nombre().trim(),
      pais: this.pais(),
      codigo: this.codigo(),
      telefono: this.telefono().trim(),
      fecha: this.fecha(),
      hora: this.hora(),
      direccion: this.direccion().trim(),
      terminos: this.terminos(),
      items: this.cart.items().map((i) => ({ packageId: i.packageId, regalo: this.regaloDe(i), addons: i.addons })),
      website: this.website(),
    });
    this.sending.set(false);

    if (res.kind === 'invalid') {
      // El backend marcó algún dato: se resalta el campo; si es del carrito, se ofrece WhatsApp
      const campos = res.campos.filter((c): c is Field => ['email', 'nombre', 'telefono', 'fecha', 'hora', 'direccion', 'terminos'].includes(c));
      if (campos.length) {
        this.serverErrors.set(campos);
        setTimeout(() => this.shakeErrors());
        return;
      }
      this.failure.set('offline');
    } else if (res.kind === 'limit' || res.kind === 'offline') {
      this.failure.set(res.kind);
    } else {
      this.failure.set('');
      this.code.set(res.code);
    }
    this.sent.set(true);
  }

  private shakeErrors(): void {
    const bad = this.host.querySelectorAll('.err');
    if (bad.length && !prefersReducedMotion()) gsap.fromTo(bad, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    (bad[0]?.querySelector('input, select') as HTMLElement | null)?.focus();
  }

  /** Cerrar el aviso. Si la reserva quedó registrada, se vacía el carrito y se vuelve al inicio. */
  reset(): void {
    if (this.code()) {
      this.cart.clear();
      this.nav.section('inicio');
      return;
    }
    this.sent.set(false);
    this.tried.set(false);
  }
}
