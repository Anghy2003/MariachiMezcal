import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NoAutorizado, PanelApi, Reserva, Status } from './api';

type Tab = Status | 'todas';

interface Punto {
  x: number;
  y: number;
  v: number;
  label: string;
}

interface Barra {
  label: string;
  v: number;
  /** 0 a 100, para el largo de la barra */
  pct: number;
  texto: string;
}

/** Nombres cortos de los servicios para que quepan en los gráficos. */
const CORTO: Record<string, string> = {
  'Mariachi Solista': 'Solista',
  'Mariachi Dúo': 'Dúo',
  'Trío musical': 'Trío',
  'Show del Patrón o Patrona': 'Patrón',
  'Grupos con instrumentos': 'Grupos',
  'Misas y ceremonias': 'Misas',
  'Videollamadas y videos': 'Videollamadas',
};
const corto = (s: string) => CORTO[s] ?? s;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** Medidas del lienzo de los gráficos de línea (SVG). */
const LW = 600;
const LH = 190;

interface Dia {
  fecha: string;
  titulo: string;
  pasado: boolean;
  reservas: Reserva[];
}

/**
 * Panel de reservas de la dueña, en forma de tablero.
 * Arriba: filtros (año y servicio), cifras clave y gráficos. Abajo: la lista de reservas por día,
 * con pestañas por estado, para confirmar, cancelar, marcar el abono y anotar.
 * Avisa si dos reservas activas quedan a menos de 2 horas.
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

  /** Filtros del tablero (null = todos los años, '' = todos los servicios). */
  readonly anio = signal<number | null>(null);
  readonly servicio = signal('');
  /** En celular, los filtros se despliegan con un botón. */
  readonly filtrosAbiertos = signal(false);
  readonly meses = MESES;
  readonly lw = LW;
  readonly lh = LH;

  readonly anios = computed(() => [...new Set(this.reservas().map((r) => +r.fecha.slice(0, 4)))].sort((a, b) => b - a));
  readonly servicios = computed(() => [...new Set(this.reservas().flatMap((r) => r.items.map((i) => i.servicio)))].sort());

  /** Reservas que cumplen los filtros: alimentan cifras, gráficos y la lista. */
  readonly base = computed(() =>
    this.reservas().filter(
      (r) => (this.anio() === null || +r.fecha.slice(0, 4) === this.anio()) && (!this.servicio() || r.items.some((i) => i.servicio === this.servicio())),
    ),
  );

  readonly kpis = computed(() => {
    const b = this.base();
    const conf = b.filter((r) => r.status === 'confirmada');
    const pend = b.filter((r) => r.status === 'pendiente');
    const activas = b.filter((r) => r.status !== 'cancelada');
    const suma = (l: Reserva[]) => l.reduce((s, r) => s + r.total, 0);
    return {
      ingresos: suma(conf),
      porCobrar: suma(pend),
      reservas: activas.length,
      pendientes: pend.length,
      ticket: activas.length ? Math.round(suma(activas) / activas.length) : 0,
      abonos: conf.filter((r) => r.abono).length,
      confirmadas: conf.length,
    };
  });

  /** Reservas e ingresos por mes del evento (sin canceladas). */
  readonly porMes = computed(() => {
    const res = Array(12).fill(0) as number[];
    const ing = Array(12).fill(0) as number[];
    for (const r of this.base()) {
      if (r.status === 'cancelada') continue;
      const m = +r.fecha.slice(5, 7) - 1;
      res[m]++;
      if (r.status === 'confirmada') ing[m] += r.total;
    }
    return { reservas: this.linea(res, (v) => String(v)), ingresos: this.linea(ing, (v) => (v ? this.dinero(v) : '0')) };
  });

  /** Paquetes más pedidos (sin canceladas). */
  readonly topPaquetes = computed(() => {
    const c = new Map<string, number>();
    for (const r of this.base()) if (r.status !== 'cancelada') for (const i of r.items) c.set(`${corto(i.servicio)} · ${i.paquete}`, (c.get(`${corto(i.servicio)} · ${i.paquete}`) ?? 0) + 1);
    return this.barras([...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8), (v) => String(v));
  });

  readonly porServicio = computed(() => {
    const c = new Map<string, number>();
    for (const r of this.base()) if (r.status !== 'cancelada') for (const i of r.items) c.set(corto(i.servicio), (c.get(corto(i.servicio)) ?? 0) + i.subtotal);
    return this.barras([...c.entries()].sort((a, b) => b[1] - a[1]), (v) => this.dinero(v));
  });

  readonly porEstado = computed(() => {
    const k = { pendiente: 0, confirmada: 0, cancelada: 0 };
    for (const r of this.base()) k[r.status]++;
    return this.barras(
      [
        ['Pendientes', k.pendiente],
        ['Confirmadas', k.confirmada],
        ['Canceladas', k.cancelada],
      ],
      (v) => String(v),
    );
  });

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'confirmada', label: 'Confirmadas' },
    { id: 'cancelada', label: 'Canceladas' },
    { id: 'todas', label: 'Todas' },
  ];

  readonly cuenta = computed(() => {
    const c: Record<Tab, number> = { pendiente: 0, confirmada: 0, cancelada: 0, todas: 0 };
    for (const r of this.base()) {
      c[r.status]++;
      c.todas++;
    }
    return c;
  });

  /** Reservas de la pestaña elegida, agrupadas por día (de la más próxima a la más lejana). */
  readonly dias = computed<Dia[]>(() => {
    const t = this.tab();
    const hoy = hoyEcuador();
    const lista = this.base().filter((r) => t === 'todas' || r.status === t);
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
      const lista = await this.api.listar();
      this.reservas.set(lista);
      // Primera carga: se muestra el año actual si hay reservas en él
      if (!silencioso && this.anio() === null) {
        const actual = +hoyEcuador().slice(0, 4);
        if (lista.some((r) => +r.fecha.slice(0, 4) === actual)) this.anio.set(actual);
      }
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

  dinero(v: number): string {
    return '$' + v.toLocaleString('es-EC');
  }

  elegirAnio(v: string): void {
    this.anio.set(v ? +v : null);
  }

  /** Puntos y trazo de un gráfico de línea de 12 meses. */
  private linea(valores: number[], fmt: (v: number) => string) {
    const max = Math.max(1, ...valores);
    const pad = { l: 24, r: 24, t: 34, b: 30 };
    const puntos: Punto[] = valores.map((v, i) => ({
      x: pad.l + (i * (LW - pad.l - pad.r)) / 11,
      y: pad.t + (1 - v / max) * (LH - pad.t - pad.b),
      v,
      label: fmt(v),
    }));
    const path = puntos.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const base = LH - pad.b;
    const area = `${path} L${puntos[11].x.toFixed(1)} ${base} L${puntos[0].x.toFixed(1)} ${base} Z`;
    return { puntos, path, area, base, vacio: valores.every((v) => !v) };
  }

  private barras(datos: [string, number][], fmt: (v: number) => string): Barra[] {
    const max = Math.max(1, ...datos.map((d) => d[1]));
    return datos.map(([label, v]) => ({ label, v, pct: Math.max(2, (v / max) * 100), texto: fmt(v) }));
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
