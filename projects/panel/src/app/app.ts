import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NoAutorizado, PanelApi, Reserva, Status } from './api';

type Tab = Status | 'todas';

interface Dia {
  fecha: string;
  titulo: string;
  pasado: boolean;
  reservas: Reserva[];
}

/**
 * Panel de reservas de la dueña.
 * Lista las reservas por día, con pestañas por estado, y permite confirmar, cancelar,
 * marcar el abono y anotar. Avisa si dos reservas activas quedan a menos de 2 horas.
 */
@Component({
  selector: 'pn-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly api = inject(PanelApi);
  readonly location = location;

  readonly reservas = signal<Reserva[]>([]);
  readonly tab = signal<Tab>('pendiente');
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly sinAcceso = signal(false);
  /** Reserva que se está guardando (para desactivar sus botones). */
  readonly guardando = signal('');

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'confirmada', label: 'Confirmadas' },
    { id: 'cancelada', label: 'Canceladas' },
    { id: 'todas', label: 'Todas' },
  ];

  readonly cuenta = computed(() => {
    const c: Record<Tab, number> = { pendiente: 0, confirmada: 0, cancelada: 0, todas: 0 };
    for (const r of this.reservas()) {
      c[r.status]++;
      c.todas++;
    }
    return c;
  });

  /** Reservas de la pestaña elegida, agrupadas por día (de la más próxima a la más lejana). */
  readonly dias = computed<Dia[]>(() => {
    const t = this.tab();
    const hoy = hoyEcuador();
    const lista = this.reservas().filter((r) => t === 'todas' || r.status === t);
    const grupos = new Map<string, Reserva[]>();
    for (const r of lista) grupos.set(r.fecha, [...(grupos.get(r.fecha) ?? []), r]);
    return [...grupos.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, reservas]) => ({ fecha, titulo: fechaLarga(fecha), pasado: fecha < hoy, reservas: reservas.sort((a, b) => a.hora.localeCompare(b.hora)) }));
  });

  /** Para cada reserva activa, las otras activas del mismo día a menos de 2 horas. */
  readonly choques = computed(() => {
    const activas = this.reservas().filter((r) => r.status !== 'cancelada');
    const mapa = new Map<string, Reserva[]>();
    for (const r of activas) {
      const cerca = activas.filter((o) => o.id !== r.id && o.fecha === r.fecha && Math.abs(minutos(o.hora) - minutos(r.hora)) < 120);
      if (cerca.length) mapa.set(r.id, cerca);
    }
    return mapa;
  });

  constructor() {
    this.cargar();
    // Se actualiza solo cada minuto mientras el panel está a la vista
    const timer = setInterval(() => {
      if (!document.hidden && !this.guardando()) this.cargar(true);
    }, 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  async cargar(silencioso = false): Promise<void> {
    if (!silencioso) this.cargando.set(true);
    try {
      this.reservas.set(await this.api.listar());
      this.error.set('');
      this.sinAcceso.set(false);
    } catch (e) {
      this.manejarError(e);
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarEstado(r: Reserva, status: Status): Promise<void> {
    const preguntas: Record<Status, string> = {
      confirmada: `¿Confirmar la reserva ${r.code} de ${r.nombre}?\nSe le enviará un correo de confirmación.`,
      cancelada: `¿Cancelar la reserva ${r.code} de ${r.nombre}?\nSe le enviará un correo avisando la cancelación.`,
      pendiente: `¿Volver a poner la reserva ${r.code} como pendiente?`,
    };
    if (!confirm(preguntas[status])) return;
    await this.guardar(r, { status });
  }

  async alternarAbono(r: Reserva): Promise<void> {
    await this.guardar(r, { abono: !r.abono });
  }

  async guardarNotas(r: Reserva, notas: string): Promise<void> {
    if (notas.trim() === r.notas.trim()) return;
    await this.guardar(r, { notas: notas.trim() });
  }

  async descargar(): Promise<void> {
    try {
      await this.api.descargarCsv();
    } catch (e) {
      this.manejarError(e);
    }
  }

  entrarConClave(e: Event, valor: string): void {
    e.preventDefault();
    if (!valor.trim()) return;
    this.api.guardarToken(valor.trim());
    this.cargar();
  }

  /** Enlace de WhatsApp al cliente con un saludo que ya incluye el código de la reserva. */
  whatsapp(r: Reserva): string {
    const texto = `Hola ${r.nombre.split(' ')[0]}, te escribimos de Mariachi Mezcal por tu reserva ${r.code} del ${fechaLarga(r.fecha)} a las ${r.hora}.`;
    return `https://wa.me/${r.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
  }

  mapa(r: Reserva): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.direccion}, Cuenca, Ecuador`)}`;
  }

  creada(r: Reserva): string {
    return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' }).format(new Date(r.created_at));
  }

  valor(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }

  private async guardar(r: Reserva, cambios: { status?: Status; abono?: boolean; notas?: string }): Promise<void> {
    this.guardando.set(r.id);
    try {
      const nueva = await this.api.actualizar(r.id, cambios);
      this.reservas.update((lista) => lista.map((x) => (x.id === nueva.id ? nueva : x)));
      this.error.set('');
    } catch (e) {
      this.manejarError(e);
    } finally {
      this.guardando.set('');
    }
  }

  private manejarError(e: unknown): void {
    if (e instanceof NoAutorizado) {
      this.sinAcceso.set(true);
      return;
    }
    this.error.set('No se pudo conectar con el servidor. Revisa tu internet e inténtalo de nuevo.');
  }
}

function hoyEcuador(): string {
  return new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
}

function fechaLarga(fecha: string): string {
  const s = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${fecha}T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
