import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';
import type { EffectMode } from '../data/services.data';
import { prefersReducedMotion } from '../core/motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  kind: 'dot' | 'rect' | 'note' | 'heart' | 'diamond';
  glyph?: string;
}

const COLORS = {
  cream: '244,238,227',
  tomato: '202,106,65',
  deep: '163,74,44',
  green: '63,91,71',
  gold: '233,196,140',
};

/**
 * Lienzo animado con el efecto propio de cada servicio:
 * spotlight (Solista), hearts (Dúos), confetti (Show del Patrón), notes (Trío),
 * picado (Grupos), candle (Misas) y sparkle (brillos generales).
 */
@Component({
  selector: 'app-effect-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas></canvas>`,
  styles: `
    :host { position: absolute; inset: 0; pointer-events: none; display: block; }
    canvas { width: 100%; height: 100%; display: block; }
  `,
})
export class EffectCanvasComponent {
  readonly mode = input<EffectMode>('sparkle');
  readonly density = input(1);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private particles: Particle[] = [];
  private raf = 0;
  private visible = false;
  private t = 0;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      if (prefersReducedMotion()) return;
      this.canvas = this.host.querySelector('canvas')!;
      this.ctx = this.canvas.getContext('2d')!;
      this.resize();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.host);
      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible && !this.raf) this.loop();
      });
      this.io.observe(this.host);
    });
    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.raf);
      this.io?.disconnect();
      this.ro?.disconnect();
    });
  }

  /** Explosión de partículas (al elegir un paquete). */
  burst(xRatio = 0.5, yRatio = 0.5, amount = 60): void {
    if (!this.ctx) return;
    const x = this.w * xRatio;
    const y = this.h * yRatio;
    const palette = [COLORS.tomato, COLORS.cream, COLORS.green, COLORS.gold];
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 7;
      const mode = this.mode();
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 3,
        life: 0,
        max: 70 + Math.random() * 50,
        size: 3 + Math.random() * 5,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3,
        color: palette[i % palette.length],
        kind: mode === 'notes' ? 'note' : mode === 'hearts' ? 'heart' : mode === 'picado' ? 'diamond' : mode === 'confetti' ? 'rect' : 'dot',
        glyph: ['♪', '♫', '♬'][i % 3],
      });
    }
    if (!this.raf) this.loop();
  }

  private resize(): void {
    const r = this.host.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.max(1, r.width * this.dpr);
    this.canvas.height = Math.max(1, r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private spawn(): void {
    const mode = this.mode();
    const d = this.density();
    const r = Math.random;
    const add = (p: Partial<Particle>) =>
      this.particles.push({
        x: r() * this.w,
        y: this.h + 10,
        vx: 0,
        vy: -0.5,
        life: 0,
        max: 200,
        size: 2,
        rot: 0,
        vr: 0,
        color: COLORS.cream,
        kind: 'dot',
        ...p,
      });

    switch (mode) {
      case 'spotlight':
        if (r() < 0.35 * d) add({ x: this.w * (0.35 + r() * 0.3), y: this.h * (0.2 + r() * 0.8), vx: (r() - 0.5) * 0.2, vy: -0.15 - r() * 0.25, size: 0.6 + r() * 1.6, max: 260, color: COLORS.gold });
        break;
      case 'hearts':
        if (r() < 0.18 * d) add({ kind: 'heart', vy: -0.4 - r() * 0.5, vx: (r() - 0.5) * 0.3, size: 5 + r() * 6, max: 320, color: r() < 0.5 ? COLORS.tomato : COLORS.cream });
        break;
      case 'confetti':
        if (r() < 0.45 * d) add({ kind: 'rect', y: -10, vy: 0.8 + r() * 1.2, vx: (r() - 0.5) * 0.8, size: 4 + r() * 5, rot: r() * 6, vr: (r() - 0.5) * 0.2, max: 420, color: [COLORS.tomato, COLORS.cream, COLORS.green, COLORS.gold][Math.floor(r() * 4)] });
        break;
      case 'notes':
        if (r() < 0.12 * d) {
          const col = Math.floor(r() * 3);
          add({ kind: 'note', x: this.w * (0.2 + col * 0.3) + (r() - 0.5) * 40, vy: -0.5 - r() * 0.4, size: 14 + r() * 12, max: 300, glyph: ['♪', '♫', '♬'][col], color: col === 1 ? COLORS.tomato : COLORS.cream });
        }
        break;
      case 'picado':
        if (r() < 0.2 * d) add({ kind: 'diamond', y: -10, vy: 0.5 + r() * 0.7, vx: (r() - 0.5) * 0.6, size: 5 + r() * 6, rot: r() * 6, vr: (r() - 0.5) * 0.08, max: 520, color: [COLORS.tomato, COLORS.cream, COLORS.green][Math.floor(r() * 3)] });
        break;
      case 'candle':
        if (r() < 0.2 * d) add({ x: this.w * (0.45 + r() * 0.1), y: this.h * 0.85, vx: (r() - 0.5) * 0.25, vy: -0.35 - r() * 0.35, size: 0.8 + r() * 1.6, max: 280, color: COLORS.gold });
        break;
      default:
        if (r() < 0.25 * d) add({ y: r() * this.h, vy: -0.05, size: 0.6 + r() * 1.8, max: 160 + r() * 120, color: r() < 0.3 ? COLORS.tomato : COLORS.cream });
    }
  }

  private drawBackdrop(): void {
    const c = this.ctx;
    const mode = this.mode();
    if (mode === 'spotlight') {
      const sway = Math.sin(this.t * 0.012) * this.w * 0.06;
      const g = c.createLinearGradient(this.w / 2, 0, this.w / 2, this.h);
      g.addColorStop(0, 'rgba(255,236,200,0.22)');
      g.addColorStop(1, 'rgba(255,236,200,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(this.w * 0.46 + sway * 0.3, 0);
      c.lineTo(this.w * 0.54 + sway * 0.3, 0);
      c.lineTo(this.w * 0.8 + sway, this.h);
      c.lineTo(this.w * 0.2 + sway, this.h);
      c.closePath();
      c.fill();
    } else if (mode === 'candle') {
      const flick = 0.85 + Math.sin(this.t * 0.21) * 0.06 + Math.sin(this.t * 0.47) * 0.04;
      const g = c.createRadialGradient(this.w / 2, this.h * 0.85, 0, this.w / 2, this.h * 0.85, this.h * 0.7 * flick);
      g.addColorStop(0, 'rgba(255,190,120,0.28)');
      g.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, this.w, this.h);
    } else if (mode === 'hearts') {
      // Dos destellos que giran entrelazados (las dos voces)
      const cx = this.w / 2;
      const cy = this.h * 0.45;
      const R = Math.min(this.w, this.h) * 0.22;
      for (let k = 0; k < 2; k++) {
        const a = this.t * 0.018 + k * Math.PI;
        const x = cx + Math.sin(a) * R;
        const y = cy + Math.sin(a * 2) * R * 0.35;
        const g = c.createRadialGradient(x, y, 0, x, y, 70);
        g.addColorStop(0, k ? 'rgba(244,238,227,0.35)' : 'rgba(202,106,65,0.45)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(x - 70, y - 70, 140, 140);
      }
    } else if (mode === 'notes') {
      // Tres pulsos de luz que laten en compás (las tres voces)
      for (let k = 0; k < 3; k++) {
        const beat = (Math.sin(this.t * 0.08 - k * 2.1) + 1) / 2;
        const x = this.w * (0.2 + k * 0.3);
        const g = c.createRadialGradient(x, this.h * 0.7, 0, x, this.h * 0.7, 90 + beat * 60);
        g.addColorStop(0, `rgba(202,106,65,${0.12 + beat * 0.18})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, this.w, this.h);
      }
    }
  }

  private drawParticle(p: Particle, alpha: number): void {
    const c = this.ctx;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.rot);
    c.fillStyle = `rgba(${p.color},${alpha})`;
    switch (p.kind) {
      case 'rect':
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        break;
      case 'diamond':
        c.beginPath();
        c.moveTo(0, -p.size);
        c.lineTo(p.size * 0.7, 0);
        c.lineTo(0, p.size);
        c.lineTo(-p.size * 0.7, 0);
        c.closePath();
        c.fill();
        break;
      case 'note':
        c.font = `${p.size}px serif`;
        c.textAlign = 'center';
        c.fillText(p.glyph ?? '♪', 0, 0);
        break;
      case 'heart': {
        const s = p.size / 10;
        c.scale(s, s);
        c.beginPath();
        c.moveTo(0, 3);
        c.bezierCurveTo(-10, -5, -4, -12, 0, -6);
        c.bezierCurveTo(4, -12, 10, -5, 0, 3);
        c.fill();
        break;
      }
      default: {
        c.shadowBlur = 8;
        c.shadowColor = `rgba(${p.color},${alpha})`;
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }

  private loop = (): void => {
    if (!this.visible && this.particles.length === 0) {
      this.raf = 0;
      return;
    }
    this.t++;
    const c = this.ctx;
    c.clearRect(0, 0, this.w, this.h);
    this.drawBackdrop();
    if (this.visible && this.particles.length < 160) this.spawn();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx + (p.kind === 'rect' || p.kind === 'diamond' ? Math.sin((p.life + i) * 0.05) * 0.4 : 0);
      p.y += p.vy;
      p.rot += p.vr;
      if (p.vy > 2 || p.max < 130) p.vy += 0.12; // gravedad para las explosiones
      const k = p.life / p.max;
      const alpha = k < 0.15 ? k / 0.15 : k > 0.75 ? Math.max(0, (1 - k) / 0.25) : 1;
      this.drawParticle(p, alpha * 0.9);
      if (p.life >= p.max || p.y < -40 || p.y > this.h + 60) this.particles.splice(i, 1);
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
