
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const sesion = await supabaseService.obtenerSesionActual();

    if (!sesion) {
      return router.createUrlTree(['/acceso'], {
        queryParams: { returnUrl: state.url }
      });
    }

    return true;
  } catch (error) {
    console.error('No se pudo validar la sesión:', error);

    return router.createUrlTree(['/acceso']);
  }
};
