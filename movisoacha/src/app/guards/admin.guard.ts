
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const sesion = await supabaseService.obtenerSesionActual();

    if (!sesion) {
      return router.createUrlTree(['/acceso']);
    }

    const rol = await supabaseService.obtenerRolActual();

    if (rol === 'admin') {
      return true;
    }

    return router.createUrlTree(['/usuario']);

  } catch (error) {
    console.error('Error verificando el rol:', error);

    return router.createUrlTree(['/acceso']);
  }
};
