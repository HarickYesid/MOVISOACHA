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
    path: 'restablecer-contrasena',
    canActivate: [authGuard],
    loadComponent: () => import('./restablecer-contrasena/restablecer-contrasena.page').then( m => m.RestablecerContrasenaPage)
  },
  {
    path: 'panel-admin',
    canActivate: [authGuard],
    loadComponent: () => import('./panel-admin/panel-admin.page').then( m => m.PanelAdminPage)
  },
  
  {
    path: 'paradas',
    canActivate: [authGuard],
    loadComponent: () => import('./paradas/paradas.page').then( m => m.ParadasPage)
  },
  {
    path: 'empresas',
    canActivate: [authGuard],
    loadComponent: () => import('./empresas/empresas.page').then( m => m.EmpresasPage)
  },
  {
    path: 'lista-usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./lista-usuarios/lista-usuarios.page').then( m => m.ListaUsuariosPage)
  },
  {
    path: 'navegacion-mapa',
    canActivate: [authGuard],
    loadComponent: () => import('./navegacion-mapa/navegacion-mapa.page').then( m => m.NavegacionMapaPage)
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
