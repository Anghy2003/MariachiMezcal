import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, signal } from '@angular/core';
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from '../core/motion';
import { NavigationService } from '../core/navigation.service';
import { CountUpDirective, MagneticDirective } from '../core/directives';
import { IconComponent } from '../shared/icon.component';

interface Slide {
  image: string;
  position: string;
  alt: string;
}

const SLIDE_MS = 7;

/**
 * Portada según el diseño de Figma. El título entra gigante y se achica hasta su lugar
 * (efecto de la referencia); las fotos cambian con una cortina y un zoom lento.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MagneticDirective, CountUpDirective],
  template: `
    <section id="inicio" class="hero" aria-label="Portada" (pointerdown)="swipeStart($event)" (pointerup)="swipeEnd($event)">
      <div class="media">
        @for (s of slides; track s.image; let i = $index) {
          <div class="frame" [attr.aria-hidden]="i !== current()">
            <img [src]="s.image" [style.object-position]="s.position" [alt]="s.alt" [attr.fetchpriority]="i === 0 ? 'high' : null" />
          </div>
        }
      </div>
      <div class="shade"></div>

      <div class="content container">
        <h1 class="title">
          <span class="line">Más que un</span>
          <span class="line">servicio,</span>
          <span class="line accent">una experiencia</span>
        </h1>
        <p class="lead">
          Pioneros en Cuenca de los formatos solista y dúo con trajes de gala bordados a mano, voces educadas y la mejor animación del Ecuador.
          Calidad de lujo al alcance de todo presupuesto.
        </p>
        <div class="ctas">
          <button class="btn" magnetic (click)="nav.section('reserva')">Reservar ahora</button>
          <button class="btn btn--ghost" magnetic (click)="nav.section('servicios')">Ver servicios</button>
        </div>
        <dl class="stats">
          <div><dt [countUp]="9" suffix=" años"></dt><dd>en Cuenca</dd></div>
          <div><dt [countUp]="1000" prefix="+"></dt><dd>serenatas / mes</dd></div>
          <div><dt [countUp]="365" suffix=" días"></dt><dd>disponibles al año</dd></div>
        </dl>
      </div>

      <div class="controls container">
        <p class="counter"><b>{{ pad(current() + 1) }}</b> / {{ pad(slides.length) }}</p>
        <div class="progress"><span></span></div>
        <div class="arrows">
          <button (click)="go(current() - 1)" aria-label="Foto anterior"><app-icon name="arrow-left" /></button>
          <button (click)="go(current() + 1)" aria-label="Foto siguiente"><app-icon name="arrow-right" /></button>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  /** La bienvenida terminó: arranca la animación de entrada. */
  readonly start = input(false);
  readonly nav = inject(NavigationService);
  readonly current = signal(0);

  readonly slides: Slide[] = [
    { image: 'img/hero-mezcal.webp', position: '50% 6%', alt: 'Mariachi con el sombrero bordado Mezcal' },
    { image: 'img/hero-xavier.webp', position: '50% 30%', alt: 'Mariachi solista con el sombrero Mezcal' },
    { image: 'img/hero-duo.webp', position: '50% 30%', alt: 'Dúo de mariachis con sombreros blancos' },
    { image: 'img/hero-fiesta.webp', position: '50% 45%', alt: 'El grupo completo de Mariachi Mezcal' },
  ];

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private ctx?: gsap.Context;
  private split?: SplitText;
  private slideTl?: gsap.core.Timeline;
  private progress?: gsap.core.Tween;
  private started = false;
  private inView = true;
  private startX = 0;
  private pan?: gsap.core.Tween;

  constructor() {
    effect(() => {
      if (this.start() && !this.started) {
        this.started = true;
        document.fonts.ready.then(() => this.intro());
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.ctx?.revert();
      this.split?.revert();
      this.slideTl?.kill();
      this.progress?.kill();
      this.pan?.kill();
      document.removeEventListener('visibilitychange', this.onVisibility);
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private q<T extends Element = HTMLElement>(sel: string): T[] {
    return Array.from(this.host.querySelectorAll<T>(sel));
  }

  private intro(): void {
    const frames = this.q('.frame');
    gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0%)', zIndex: 0 });
    gsap.set(frames[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 1 });

    if (prefersReducedMotion()) {
      this.runProgress();
      return;
    }

    this.ctx = gsap.context(() => {
      const title = this.host.querySelector<HTMLElement>('.title')!;
      this.split = SplitText.create(this.q('.line'), { type: 'words, chars' });

      // Efecto de la referencia: el título aparece enorme en el centro y se achica hasta su lugar
      const heroBox = this.host.getBoundingClientRect();
      const box = title.getBoundingClientRect();
      const scale = Math.min((heroBox.width * 1.15) / box.width, 4.2);
      const dx = heroBox.left + heroBox.width / 2 - (box.left + box.width / 2);
      const dy = heroBox.top + heroBox.height / 2 - (box.top + box.height / 2);

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from(this.q('.frame img')[0], { scale: 1.35, duration: 2.6, ease: 'power2.out' }, 0)
        .add(() => this.panMobile(0), 0)
        .fromTo(title, { x: dx, y: dy, scale, autoAlpha: 0, filter: 'blur(16px)' }, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0.1)
        .fromTo(this.split.chars, { letterSpacing: '0.18em' }, { letterSpacing: '0em', duration: 1.8, ease: 'expo.inOut' }, 0.1)
        .to(title, { x: 0, y: 0, scale: 1, duration: 1.8, ease: 'expo.inOut' }, 0.6)
        .from(this.q('.lead, .ctas > *, .stats > div'), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1 }, 2)
        .from(this.q('.controls'), { autoAlpha: 0, y: 20, duration: 0.8 }, 2.4)
        .fromTo(this.split.chars, { textShadow: '0 0 0 rgba(255,220,180,0)' }, { textShadow: '0 0 26px rgba(255,220,180,0.5)', duration: 0.45, yoyo: true, repeat: 1, stagger: 0.025 }, 2.3)
        .add(() => this.runProgress(), 2.6);

      // Parallax al bajar: la foto se acerca y el texto sube
      gsap.to(this.q('.media'), { scale: 1.1, yPercent: 7, ease: 'none', scrollTrigger: { trigger: this.host, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(this.q('.content'), { yPercent: -16, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: this.host, start: 'top top', end: 'bottom top', scrub: true } });
      ScrollTrigger.create({
        trigger: this.host,
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => {
          this.inView = self.isActive;
          if (self.isActive) this.progress?.resume();
          else this.progress?.pause();
        },
      });
    }, this.host);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private onVisibility = () => {
    if (document.hidden) this.progress?.pause();
    else if (this.inView) this.progress?.resume();
  };

  go(index: number): void {
    const n = this.slides.length;
    const next = ((index % n) + n) % n;
    const prev = this.current();
    if (next === prev) return;
    this.current.set(next);
    this.slideTl?.kill();
    this.progress?.kill();

    const frames = this.q('.frame');
    if (prefersReducedMotion()) {
      gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(frames[next], { clipPath: 'inset(0% 0% 0% 0%)' });
      this.runProgress();
      return;
    }
    frames.forEach((f, i) => gsap.set(f, { zIndex: i === next ? 2 : i === prev ? 1 : 0 }));
    const mobile = this.isMobile();
    const dir = index > prev || (prev === n - 1 && next === 0) ? 1 : -1;
    const hidden = mobile ? (dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)') : 'inset(100% 0% 0% 0%)';
    this.panMobile(next);
    this.slideTl = gsap
      .timeline()
      .fromTo(frames[next], { clipPath: hidden }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0)
      .fromTo(frames[next].querySelector('img'), { scale: 1.3 }, { scale: 1.02, duration: SLIDE_MS + 1.4, ease: 'power1.out' }, 0)
      .to(frames[prev].querySelector('img'), mobile ? { xPercent: -dir * 14, duration: 1.3, ease: 'expo.inOut' } : { scale: 1.12, yPercent: -6, duration: 1.4, ease: 'expo.inOut' }, 0)
      .set(frames[prev], { clipPath: 'inset(100% 0% 0% 0%)' }, 1.4)
      .set(frames[prev].querySelector('img'), { yPercent: 0, xPercent: 0 }, 1.4)
      // Un destello recorre el título en cada cambio de foto
      .fromTo(this.split?.chars ?? [], { textShadow: '0 0 0 rgba(255,220,180,0)' }, { textShadow: '0 0 22px rgba(255,220,180,0.45)', duration: 0.4, yoyo: true, repeat: 1, stagger: 0.02 }, 0.7)
      .add(() => this.runProgress(), 1.2);
  }

  private isMobile(): boolean {
    return window.innerWidth < 900;
  }

  /** En celular la foto se desliza de un borde al otro, para que se vea completa. */
  private panMobile(index: number): void {
    this.pan?.kill();
    if (!this.isMobile() || prefersReducedMotion()) return;
    const img = this.q('.frame img')[index];
    const y = this.slides[index].position.split(' ')[1] ?? '50%';
    this.pan = gsap.fromTo(img, { objectPosition: `0% ${y}` }, { objectPosition: `100% ${y}`, duration: SLIDE_MS + 1.6, ease: 'none' });
  }

  swipeStart(e: PointerEvent): void {
    this.startX = e.clientX;
  }

  swipeEnd(e: PointerEvent): void {
    const dx = e.clientX - this.startX;
    if (Math.abs(dx) > 60 && this.isMobile()) this.go(this.current() + (dx < 0 ? 1 : -1));
  }

  private runProgress(): void {
    const bar = this.host.querySelector('.progress span');
    this.progress = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: SLIDE_MS, ease: 'none', onComplete: () => this.go(this.current() + 1) });
    if (!this.inView || document.hidden) this.progress.pause();
  }
}
