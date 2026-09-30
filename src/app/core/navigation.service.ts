import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SmoothScroll } from './smooth-scroll.service';
import { PageTransition } from './page-transition.service';
import { CartService } from './cart.service';

/** Navegación entre secciones de la landing y hacia las fichas de servicio. */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly scroll = inject(SmoothScroll);
  private readonly transition = inject(PageTransition);
  private readonly cart = inject(CartService);
  /** true cuando terminó la pantalla de bienvenida. */
  readonly introDone = signal(false);
  /** Paquete elegido desde "Nuestros paquetes": la ficha lo deja marcado al abrirse. */
  readonly pendingPackage = signal<string | null>(null);

  isHome(): boolean {
    return this.router.url.split('#')[0].split('?')[0] === '/';
  }

  section(id: string): void {
    // La reserva es una pantalla aparte y solo tiene sentido con algo en el carrito:
    // si está vacío, primero se elige un paquete.
    if (id === 'reserva') {
      if (this.cart.count() > 0) {
        this.transition.go('/reservar');
        return;
      }
      id = 'paquetes';
    }
    if (this.isHome()) {
      this.scroll.to(`#${id}`);
    } else {
      this.transition.go('/', id);
    }
  }

  service(slug: string, packageId?: string): void {
    this.pendingPackage.set(packageId ?? null);
    this.transition.go(`/servicios/${slug}`);
  }
}
