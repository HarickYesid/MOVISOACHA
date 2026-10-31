import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage),
    data: { rol: 'admin' }
  },
  {
    path: 'usuario',
    loadComponent: () => import('./usuario/usuario.page').then( m => m.UsuarioPage),
    data: { rol: 'usuario' }
  },
  {
    path: 'rutas',
    canActivate: [authGuard],
    loadComponent: () => import('./rutas/rutas.page').then( m => m.RutasPage)
  },
  
  {
    path: 'admin-mapa',
    canActivate: [authGuard],
    loadComponent: () => import('./admin-mapa/admin-mapa.page').then( m => m.AdminMapaPage)
  },
  
  {
    path: 'rutas-usuario',
    canActivate: [authGuard],
    loadComponent: () => import('./rutas-usuario/rutas-usuario.page').then( m => m.RutasUsuarioPage)
  },
  
  {
    path: 'detalle-ruta',
    canActivate: [authGuard],
    loadComponent: () => import('./detalle-ruta/detalle-ruta.page').then( m => m.DetalleRutaPage)
  },
  {
    path: 'favoritos',
    canActivate: [authGuard],
    loadComponent: () => import('./favoritos/favoritos.page').then( m => m.FavoritosPage)
  },
  {
    path: 'buscar-ruta',
    canActivate: [authGuard],
    loadComponent: () => import('./buscar-ruta/buscar-ruta.page').then( m => m.BuscarRutaPage)
  },
  
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
    {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
