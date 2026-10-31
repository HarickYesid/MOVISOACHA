
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  busOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  personAddOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-acceso',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class HomePage {
  modoRegistro = false;
  mostrarContrasena = false;
  cargando = false;
  esError = false;

  nombre = '';
  correo = '';
  contrasena = '';
  mensaje = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({
      busOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      personAddOutline
    });
  }

  cambiarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.mensaje = '';
    this.esError = false;
    this.mostrarContrasena = false;
  }


async enviarFormulario() {
  this.mensaje = '';
  this.esError = false;

  if (!this.correo.trim() || !this.contrasena) {
    this.mostrarError('Escribe tu correo y contraseña.');
    return;
  }

  if (this.modoRegistro && !this.nombre.trim()) {
    this.mostrarError('Escribe tu nombre.');
    return;
  }

  if (this.modoRegistro && this.contrasena.length < 8) {
    this.mostrarError('La contraseña debe tener al menos 8 caracteres.');
    return;
  }

  this.cargando = true;

  try {
    if (this.modoRegistro) {
      // 1. Registrar el usuario en Supabase Auth
      const resultado = await this.supabaseService.registrarUsuario(
        this.nombre.trim(),
        this.correo.trim(),
        this.contrasena
      );

      if (!resultado.user) {
        throw new Error('No se pudo crear la cuenta.');
      }

      console.log('Cuenta creada con éxito.');

    } else {
      // 2. Iniciar sesión si ya tiene cuenta
      await this.supabaseService.iniciarSesion(
        this.correo.trim(),
        this.contrasena
      );

      console.log('Inicio de sesión correcto.');
    }

    // 3. Consultar el rol del usuario en la base de datos y redirigir de inmediato
    const rol = await this.supabaseService.obtenerRolActual();

    if (rol === 'admin') {
      await this.router.navigateByUrl('/admin', { replaceUrl: true });
    } else if (rol === 'usuario') {
      await this.router.navigateByUrl('/usuario', { replaceUrl: true });
    } else {
      // Si se registra por primera vez y aún no tiene rol asignado en tu tabla perfiles,
      // puedes definir aquí una ruta por defecto o asignarle 'usuario' automáticamente.
      await this.router.navigateByUrl('/usuario', { replaceUrl: true });
    }

  } catch (error: unknown) {
    console.error('Error en el acceso:', error);

    this.mostrarError(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado.'
    );
  } finally {
    this.cargando = false;
  }
}


  private async redirigirSegunRol() {
    const rol = await this.supabaseService.obtenerRolActual();

    if (rol === 'admin') {
      await this.router.navigateByUrl('/admin', {
        replaceUrl: true
      });
    } else if (rol === 'usuario') {
      await this.router.navigateByUrl('/usuario', {
        replaceUrl: true
      });
    } else {
      await this.supabaseService.cerrarSesion();

      throw new Error(
        'No se encontró un perfil válido para esta cuenta.'
      );
    }
  }

  private mostrarError(texto: string) {
    this.mensaje = texto;
    this.esError = true;
  }
}
