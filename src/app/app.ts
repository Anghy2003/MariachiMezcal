import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import './core/motion';
import { SmoothScroll } from './core/smooth-scroll.service';
import { PageTransition } from './core/page-transition.service';
import { NavigationService } from './core/navigation.service';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { CartDrawerComponent } from './layout/cart-drawer.component';
import { WhatsappFabComponent } from './layout/whatsapp-fab.component';
import { PreloaderComponent } from './layout/preloader.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent, WhatsappFabComponent, PreloaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly scroll = inject(SmoothScroll);
  private readonly transition = inject(PageTransition);
  readonly nav = inject(NavigationService);
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  readonly isDetail = signal(false);
  /** La bienvenida solo se muestra si se entra por la portada. */
  readonly showPreloader = signal(location.pathname === '/' && !location.hash);

  constructor() {
    if (!this.showPreloader()) this.nav.introDone.set(true);
    afterNextRender(() => {
      this.scroll.init();
      this.transition.register(this.host.querySelector('.curtain') as HTMLElement);
    });
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.isDetail.set(url.startsWith('/servicios') || url.startsWith('/reservar'));
      });
  }

  introFinished(): void {
    this.nav.introDone.set(true);
  }
}
