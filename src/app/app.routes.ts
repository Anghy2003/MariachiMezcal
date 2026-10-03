import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Mariachi Mezcal · Serenatas en Cuenca desde $25' },
  {
    path: 'servicios/:slug',
    loadComponent: () => import('./detail/service-detail.page').then((m) => m.ServiceDetailPage),
    title: 'Servicio · Mariachi Mezcal',
  },
  {
    path: 'reservar',
    loadComponent: () => import('./reservar/reservar.page').then((m) => m.ReservarPage),
    title: 'Reserva tu serenata · Mariachi Mezcal',
  },
  { path: '**', redirectTo: '' },
];
