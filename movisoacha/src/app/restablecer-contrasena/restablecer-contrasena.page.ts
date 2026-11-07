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
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service'; // Ajusta la ruta a tu servicio si es necesario

@Component({
  selector: 'app-restablecer-contrasena',
  templateUrl: './restablecer-contrasena.page.html',
  styleUrls: ['./restablecer-contrasena.page.scss'],
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
export class RestablecerContrasenaPage {
  nuevaContrasena = '';
  mostrarContrasena = false;
  cargando = false;
  esError = false;
  mensaje = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({
      busOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      checkmarkCircleOutline
    });
  }

  async guardarNuevaContrasena() {
    this.mensaje = '';
    this.esError = false;

    if (!this.nuevaContrasena || this.nuevaContrasena.length < 8) {
      this.mostrarError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.cargando = true;
    try {
      await this.supabaseService.actualizarContrasena(this.nuevaContrasena.trim());
      this.mensaje = '¡Contraseña actualizada con éxito! Redirigiendo al mapa...';
      this.esError = false;

      // Esperar 2 segundos y redirigir al usuario autenticado
      setTimeout(async () => {
        await this.router.navigateByUrl('/home', { replaceUrl: true });
      }, 2000);

    } catch (error: any) {
      this.mostrarError(error.message || 'No se pudo actualizar la contraseña.');
    } finally {
      this.cargando = false;
    }
  }

  private mostrarError(texto: string) {
    this.mensaje = texto;
    this.esError = true;
  }
}