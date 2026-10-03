import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ADDONS, Addon, INCLUDED, SERVICES, Service, addonLabel, findService } from '../data/services.data';
import { whatsappLink } from '../data/site.data';
import { CartService } from '../core/cart.service';
import { NavigationService } from '../core/navigation.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { gsap, SplitText, ScrollTrigger, prefersReducedMotion } from '../core/motion';
import { MagneticDirective, RevealDirective, TiltDirective } from '../core/directives';
import { StarburstComponent } from '../shared/starburst.component';
import { EffectCanvasComponent } from '../shared/effect-canvas.component';
import { IconComponent } from '../shared/icon.component';

/** Ficha de cada servicio: foto, paquetes, adicionales, total y reserva. */
@Component({
  selector: 'app-service-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, RevealDirective, TiltDirective, StarburstComponent, EffectCanvasComponent, IconComponent],
  templateUrl: './service-detail.page.html',
  styleUrl: './service-detail.page.scss',
})
export class ServiceDetailPage {
  /** Viene de la ruta /servicios/:slug */
  readonly slug = input<string>('duos');

  readonly nav = inject(NavigationService);
  private readonly cart = inject(CartService);
  private readonly scroll = inject(SmoothScroll);
  private readonly injector = inject(Injector);
  private readonly title = inject(Title);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly fx = viewChild<EffectCanvasComponent>('fx');

  readonly service = computed(() => findService(this.slug()) ?? SERVICES[2]);
  readonly addons = ADDONS;
  readonly included = INCLUDED;
  readonly photo = signal('');
  readonly selectedId = signal('');
  readonly extras = signal<Record<string, number>>({});
  readonly shownTotal = signal(0);
  readonly added = signal(false);

  readonly selected = computed(() => this.service().packages.find((p) => p.id === this.selectedId()) ?? this.service().packages[0]);
  readonly hasExtras = computed(() => Object.keys(this.extras()).length > 0);
  readonly total = computed(() => this.selected().price + (this.service().addons ? Object.values(this.extras()).reduce((s, n) => s + n, 0) : 0));
  readonly suggestions = computed(() => {
    const others = SERVICES.filter((s) => s.slug !== this.service().slug);
    return others.slice(0, 4);
  });
  /** Foto de la tarjeta sugerida: si la imagen principal es un recorte (el Patrón), se usa su primera foto real. */
  suggestPhoto(o: Service): string {
    return o.cutout ? (o.gallery.find((g) => g !== o.image) ?? o.image) : o.image;
  }
  readonly waLink = computed(() => {
    const extras = Object.entries(this.extras())
      .map(([id, p]) => `${addonLabel(ADDONS.find((a) => a.id === id), p, id)} ($${p})`)
      .join(', ');
    return whatsappLink(
      `¡Hola Mariachi Mezcal! Me interesa ${this.service().name}: ${this.selected().name} ($${this.selected().price})` +
        (extras ? ` + ${extras}` : '') +
        `. Total estimado $${this.total()}.`,
    );
  });

  private ctx?: gsap.Context;
  private split?: SplitText;
  private totalTween?: gsap.core.Tween;

  constructor() {
    // Cada vez que cambia el servicio: reiniciar selección y animar la entrada
    effect(() => {
      const s = this.service();
      untracked(() => {
        this.title.setTitle(`${s.name} · desde $${s.from} · Mariachi Mezcal`);
        const pending = s.packages.find((p) => p.id === this.nav.pendingPackage());
        this.nav.pendingPackage.set(null);
        const featured = pending ?? s.packages.find((p) => p.tag === 'Más elegido') ?? s.packages[0];
        this.selectedId.set(featured.id);
        this.extras.set({});
        this.photo.set(s.image);
        this.shownTotal.set(featured.price);
        this.added.set(false);
        afterNextRender(() => this.enter(), { injector: this.injector });
      });
    });

    // El total cuenta hasta su nuevo valor
    effect(() => {
      const target = this.total();
      untracked(() => {
        this.totalTween?.kill();
        // Sin animación si la persona la desactivó o si la pestaña no está visible (el total nunca queda desfasado)
        if (prefersReducedMotion() || document.hidden) {
          this.shownTotal.set(target);
          return;
        }
        const state = { v: this.shownTotal() };
        this.totalTween = gsap.to(state, {
          v: target,
          duration: 0.7,
          ease: 'power3.out',
          onUpdate: () => this.shownTotal.set(Math.round(state.v)),
          onComplete: () => this.shownTotal.set(target),
        });
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.ctx?.revert();
      this.split?.revert();
      this.totalTween?.kill();
    });
  }

  private enter(): void {
    this.scroll.to(0, { immediate: true, offset: 0 });
    this.ctx?.revert();
    this.split?.revert();
    ScrollTrigger.refresh();
    if (prefersReducedMotion()) return;
    const h = this.host;
    this.ctx = gsap.context(() => {
      this.split = SplitText.create(h.querySelector('.title'), { type: 'chars', mask: 'chars' });
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.main', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
        .from('.main img', { scale: 1.3, duration: 1.8 }, 0.1)
        .from('.thumbs > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.8)
        .from(this.split.chars, { yPercent: 110, stagger: 0.04, duration: 1 }, 0.55)
        .from('.head app-starburst', { scale: 0, rotation: -140, duration: 1.1, ease: 'back.out(1.8)' }, 0.9)
        .from('.tagline, .intro, .divider', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.8)
        .from('.block', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9 }, 1)
        .from('.row', { x: 30, autoAlpha: 0, stagger: 0.05, duration: 0.7 }, 1.1);
    }, h);
  }

  choose(id: string, ev?: Event): void {
    if (id === this.selectedId()) return;
    this.selectedId.set(id);
    const fx = this.fx();
    const amount = this.service().effect === 'confetti' ? 90 : 36;
    fx?.burst(0.5, 0.5, amount);
    const row = (ev?.currentTarget as HTMLElement | undefined) ?? null;
    if (row && !prefersReducedMotion()) gsap.fromTo(row, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  }

  isOn(id: string): boolean {
    return id in this.extras();
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

  /** Texto de cada opción: "$10" o, si es por unidad, "2 · $10". */
  optionLabel(a: Addon, price: number): string {
    return a.unit ? `${Math.round(price / a.price)} · $${price}` : `$${price}`;
  }

  setAddon(id: string, price: number): void {
    this.extras.update((x) => ({ ...x, [id]: price }));
  }

  swap(src: string): void {
    if (src === this.photo()) return;
    const img = this.host.querySelector('.main img');
    if (!img || prefersReducedMotion()) {
      this.photo.set(src);
      return;
    }
    gsap.to(img, {
      autoAlpha: 0,
      scale: 1.06,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        this.photo.set(src);
        gsap.fromTo(img, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'expo.out', delay: 0.05 });
      },
    });
  }

  reserve(): void {
    const item = this.cart.add(
      this.selected().id,
      Object.entries(this.extras()).map(([id, price]) => ({ id, price })),
    );
    this.cart.selection.set(item);
    this.added.set(true);
    this.fx()?.burst(0.5, 0.6, 80);
    setTimeout(() => this.nav.section('reserva'), 650);
  }

  close(): void {
    this.nav.section('servicios');
  }
}
