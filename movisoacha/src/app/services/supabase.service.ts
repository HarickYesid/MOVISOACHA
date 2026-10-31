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

async iniciarSesion(  correo: string,  contrasena: string
) {
  const { data, error } =
    await this.supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena
    });

  if (error) {
    throw error;
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
  
}