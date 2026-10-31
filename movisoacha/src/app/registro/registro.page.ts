import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/angular';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText
  ]
})
export class RegistroPage {

  nombre = '';
  correo = '';
  contrasena = '';

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async registrar() {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (
      !this.nombre.trim() ||
      !this.correo.trim() ||
      !this.contrasena
    ) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    if (this.contrasena.length < 8) {
      this.mensajeError =
        'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.cargando = true;

    try {
      const resultado =
        await this.supabaseService.registrarUsuario(
          this.nombre.trim(),
          this.correo.trim(),
          this.contrasena
        );

      if (resultado.user) {
        this.mensajeExito = resultado.session
          ? '¡Registro exitoso! Sesión iniciada.'
          : 'Cuenta creada. Revisa tu correo para confirmarla si es necesario.';

        this.nombre = '';
        this.correo = '';
        this.contrasena = '';
      } else {
        this.mensajeError =
          'No se pudo confirmar la creación de la cuenta.';
      }
    } catch (error: unknown) {
      console.error('Error en el registro:', error);

      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al registrar el usuario.';
    } finally {
      this.cargando = false;
    }
  }
}