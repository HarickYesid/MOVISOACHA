import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  async registrarUsuario(
    nombre: string,
    correo: string,
    contrasena: string
  ) {
    const { data, error } = await this.supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: {
          nombre: nombre
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async iniciarSesion(correo: string, contrasena: string) {
  // 1. Autenticar con Supabase Auth
  const { data, error } = await this.supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena
  });

  if (error) {
    throw error;
  }

  // 2. Si el login es exitoso, actualizar el campo 'ultimo_acceso' en la tabla 'usuario'
  if (data.user) {
    const { error: updateError } = await this.supabase
      .from('usuario')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('auth_user_id', data.user.id); // Asegúrate de que esta columna relacione el Auth ID con tu tabla usuario

    if (updateError) {
      console.error('No se pudo actualizar el registro de último acceso:', updateError);
    }
  }

  return data;
}

  async obtenerSesionActual() {
    const { data, error } =
      await this.supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async obtenerRutas() {
    const { data, error } = await this.supabase
      .from('ruta')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async obtenerRolActual(): Promise<string | null> {
    const { data: authData, error: authError } =
      await this.supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error('No se pudo verificar la sesión.');
    }

    const { data, error } = await this.supabase
      .from('usuario')
      .select('rol')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error consultando el rol:', error);
      throw new Error('No se pudo consultar el rol del usuario.');
    }

    if (!data) {
      throw new Error('La cuenta no tiene un perfil registrado.');
    }

    return data.rol;
  }

  async obtenerTransportes() {
    const { data, error } = await this.supabase
      .from('transporte')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async enviarCorreoRecuperacion(correo: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'http://localhost:8100/restablecer-contrasena',
    });
    
    if (error) {
      throw error;
    }
    return data;
  }

  async actualizarContrasena(nuevaContrasena: string) {
    const { data, error } = await this.supabase.auth.updateUser({
      password: nuevaContrasena
    });

    if (error) {
      throw error;
    }
    return data;
  }

  // ==========================================
  // MÉTODOS NUEVOS PARA EL PANEL DE ADMINISTRADOR
  // ==========================================

  // 1. Obtener el total de rutas registradas
  async obtenerTotalRutas(): Promise<number> {
    const { count, error } = await this.supabase
      .from('ruta')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error al contar rutas:', error);
      return 0;
    }
    return count || 0;
  }

  // 2. Obtener el total de paradas activas
  async obtenerTotalParadas(): Promise<number> {
    const { count, error } = await this.supabase
      .from('parada')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error al contar paradas:', error);
      return 0;
    }
    return count || 0;
  }

  // 3. Obtener el total de empresas aliadas (tabla transporte)
  async obtenerTotalEmpresas(): Promise<number> {
    const { count, error } = await this.supabase
      .from('transporte')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error al contar empresas:', error);
      return 0;
    }
    return count || 0;
  }

  // 4. Obtener el total de usuarios registrados
  async obtenerTotalUsuarios(): Promise<number> {
    const { count, error } = await this.supabase
      .from('usuario')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error al contar usuarios:', error);
      return 0;
    }
    return count || 0;
  }

  // 5. Obtener los últimos accesos recientes para la tabla del panel
  async obtenerAccesosRecientes(limite: number = 5) {
    const { data, error } = await this.supabase
      .from('usuario')
      .select('nombre, ultimo_acceso')
      .order('ultimo_acceso', { ascending: false })
      .limit(limite);

    if (error) {
      console.error('Error al obtener accesos recientes:', error);
      return [];
    }
    return data || [];
  }
  // 1. Obtener todas las paradas de la tabla 'parada'
async obtenerParadas() {
  const { data, error } = await this.supabase
    .from('parada')
    .select('*')
    .order('id_parada', { ascending: true });

  if (error) {
    throw error;
  }
  return data || [];
}

// 2. Eliminar una parada por su ID
async eliminarParada(id: number) {
  const { error } = await this.supabase
    .from('parada')
    .delete()
    .eq('id_parada', id);

  if (error) {
    throw error;
  }
  return true;
}
async agregarParada(nombre: string, direccion: string) {
  const { data, error } = await this.supabase
    .from('parada')
    .insert([
      { nombre: nombre.trim(), direccion: direccion.trim() }
    ])
    .select();

  if (error) {
    throw error;
  }
  return data;
}
// Obtener lista completa de usuarios para la página de lista-usuarios
async obtenerTodosLosUsuarios() {
  const { data, error } = await this.supabase
    .from('usuario')
    .select('*')
    .order('ultimo_acceso', { ascending: false });

  if (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    return [];
  }
  return data || [];
}

}