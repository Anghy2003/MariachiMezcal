import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../core/navigation.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { ScrollTrigger } from '../core/motion';
import { HeroComponent } from './hero.component';
import { HistoriaComponent } from './historia.component';
import { CoberturaComponent } from './cobertura.component';
import { ServiciosComponent } from './servicios.component';
import { NuestrosServiciosComponent } from './nuestros-servicios.component';
import { InternacionalComponent } from './internacional.component';
import { PasosComponent } from './pasos.component';
import { ContactoComponent } from './contacto.component';
import { MomentosComponent } from './momentos.component';
import { FaqComponent } from './faq.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    HistoriaComponent,
    CoberturaComponent,
    ServiciosComponent,
    NuestrosServiciosComponent,
    InternacionalComponent,
    PasosComponent,
    ContactoComponent,
    MomentosComponent,
    FaqComponent,
  ],
  template: `
    <app-hero [start]="nav.introDone()" />
    <app-historia />
    <app-cobertura />
    <app-nuestros-servicios />
    <app-paquetes />
    <app-internacional />
    <app-pasos />
    <app-contacto />
    <app-momentos />
    <app-faq />
  `,
})
export class HomePage {
  readonly nav = inject(NavigationService);
  private readonly scroll = inject(SmoothScroll);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const refresh = () => ScrollTrigger.refresh();
    afterNextRender(() => {
      window.addEventListener('load', refresh);
      // Si se llegó con #seccion (desde una ficha), bajar hasta ella
      const fragment = this.route.snapshot.fragment;
      // Enlaces viejos a #reserva: ahora la reserva es otra pantalla
      if (fragment === 'reserva') {
        setTimeout(() => this.nav.section('reserva'), 150);
        return;
      }
      setTimeout(() => {
        ScrollTrigger.refresh();
        if (fragment) this.scroll.to(`#${fragment}`, { immediate: true });
      }, 60);
      // Segunda corrección cuando ya cargaron fuentes e imágenes
      if (fragment) setTimeout(() => this.scroll.to(`#${fragment}`, { duration: 0.6 }), 900);
    });
    this.route.fragment.subscribe((f) => {
      if (f && f !== 'reserva' && this.nav.isHome()) setTimeout(() => this.scroll.to(`#${f}`), 80);
    });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('load', refresh));
  }
}
