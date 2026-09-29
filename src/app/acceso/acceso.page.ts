import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationService } from '../core/navigation.service';
import { IconComponent } from '../shared/icon.component';
import { EffectCanvasComponent } from '../shared/effect-canvas.component';

/** Acceso al panel interno de reservas. Por ahora solo la entrada: el panel se construye después. */
@Component({
  selector: 'app-acceso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, EffectCanvasComponent],
  template: `
    <section class="wrap">
      <app-effect-canvas mode="sparkle" />
      <div class="card">
        <span class="lock"><app-icon name="lock" /></span>
        <h1>Panel de reservas</h1>
        <p>Este espacio es solo para el equipo de Mariachi Mezcal. El panel administrativo de reservas estará disponible próximamente.</p>
        <button class="btn" (click)="nav.section('inicio')"><app-icon name="arrow-left" /> Volver al sitio</button>
      </div>
    </section>
  `,
  styles: `
    .wrap { position: relative; min-height: 100vh; display: grid; place-items: center; padding: 120px 20px 60px; background: radial-gradient(800px circle at 50% 30%, rgba(163, 74, 44, 0.2), transparent 60%), var(--green-900); }
    .card { position: relative; max-width: 480px; text-align: center; padding: 48px 40px; border-radius: 28px; background: rgba(30, 38, 32, 0.8); backdrop-filter: blur(10px); box-shadow: inset 0 0 0 1px var(--cream-faint), 0 50px 90px -40px rgba(0,0,0,0.8); }
    .lock { display: inline-grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: var(--tomato); font-size: 30px; margin-bottom: 18px; box-shadow: 0 0 0 10px rgba(163, 74, 44, 0.15); }
    h1 { margin: 0 0 12px; font-family: var(--font-serif); font-weight: 400; font-size: 40px; }
    .card p { color: var(--cream-muted); margin: 0 0 28px; }
    @media (max-width: 560px) {
      .card { padding: 36px 22px; width: 100%; }
      h1 { font-size: 32px; }
    }
  `,
})
export class AccesoPage {
  readonly nav = inject(NavigationService);
}
