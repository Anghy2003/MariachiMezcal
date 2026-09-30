import { Injectable, computed, signal } from '@angular/core';
import { ADDONS, findPackage } from '../data/services.data';

export interface AddonChoice {
  id: string;
  price: number;
}

export interface CartItem {
  key: string;
  packageId: string;
  addons: AddonChoice[];
}

/** Carrito y selección de la reserva (guardados en el navegador de la persona). */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'mezcal-cart';
  readonly items = signal<CartItem[]>(this.load());
  readonly open = signal(false);
  /** Paquete que se está reservando en el formulario. */
  readonly selection = signal<CartItem | null>(null);
  /** Aumenta cada vez que se agrega algo (para animar el ícono). */
  readonly bump = signal(0);

  readonly count = computed(() => this.items().length);
  readonly subtotal = computed(() => this.items().reduce((sum, i) => sum + this.itemTotal(i), 0));

  itemTotal(item: CartItem): number {
    const pkg = findPackage(item.packageId)?.pkg.price ?? 0;
    return pkg + item.addons.reduce((s, a) => s + a.price, 0);
  }

  describe(item: CartItem) {
    const found = findPackage(item.packageId);
    return {
      service: found?.service,
      pkg: found?.pkg,
      addons: item.addons.map((a) => ({ ...a, name: ADDONS.find((x) => x.id === a.id)?.name ?? a.id })),
    };
  }

  add(packageId: string, addons: AddonChoice[]): CartItem {
    const item: CartItem = { key: `${packageId}-${Date.now()}`, packageId, addons };
    this.items.update((list) => [...list, item]);
    this.bump.update((n) => n + 1);
    this.save();
    return item;
  }

  remove(key: string): void {
    this.items.update((list) => list.filter((i) => i.key !== key));
    if (this.selection()?.key === key) this.selection.set(null);
    this.save();
  }

  clear(): void {
    this.items.set([]);
    this.save();
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      // Paquetes renombrados: el carrito guardado pasa al id nuevo en vez de perderse
      const renamed: Record<string, string> = { 'duo-12': 'duo-13' };
      return parsed.map((i) => ({ ...i, packageId: renamed[i.packageId] ?? i.packageId })).filter((i) => findPackage(i.packageId));
    } catch {
      return [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    } catch {
      /* navegador sin almacenamiento: el carrito vive solo en esta visita */
    }
  }
}
