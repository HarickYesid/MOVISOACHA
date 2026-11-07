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
  personAddOutline,
  mailUnreadOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
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
  modoRecuperacion = false;
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
      personAddOutline,
      mailUnreadOutline
    });
  }

  cambiarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.modoRecuperacion = false;
    this.mensaje = '';
    this.esError = false;
    this.mostrarContrasena = false;
  }

  alternarRecuperacion() {
    this.modoRecuperacion = !this.modoRecuperacion;
    this.modoRegistro = false;
    this.mensaje = '';
    this.esError = false;
  }

  async enviarFormulario() {
    this.mensaje = '';
    this.esError = false;

    // 1. Lógica si está pidiendo recuperar contraseña
    if (this.modoRecuperacion) {
      if (!this.correo.trim()) {
        this.mostrarError('Escribe tu correo electrónico.');
        return;
      }

      this.cargando = true;
      try {
        await this.supabaseService.enviarCorreoRecuperacion(this.correo.trim());
        this.mensaje = '¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu clave.';
        this.esError = false;
      } catch (error: any) {
        this.mostrarError(error.message || 'No se pudo enviar el correo de recuperación.');
      } finally {
        this.cargando = false;
      }
      return;
    }

    // 2. Validaciones normales de Login o Registro
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
        const resultado = await this.supabaseService.registrarUsuario(
          this.nombre.trim(),
          this.correo.trim(),
          this.contrasena
        );

        if (!resultado.user) {
          throw new Error('No se pudo crear la cuenta.');
        }
      } else {
        await this.supabaseService.iniciarSesion(
          this.correo.trim(),
          this.contrasena
        );
      }

      const rol = await this.supabaseService.obtenerRolActual();

      if (rol === 'admin') {
        await this.router.navigateByUrl('/panel-admin', { replaceUrl: true });
      } else {
        await this.router.navigateByUrl('/usuario', { replaceUrl: true });
      }

    } catch (error: unknown) {
      this.mostrarError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      );
    } finally {
      this.cargando = false;
    }
  }

  private mostrarError(texto: string) {
    this.mensaje = texto;
    this.esError = true;
  }
}