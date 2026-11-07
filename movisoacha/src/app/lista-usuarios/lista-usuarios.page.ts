import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonButton, IonBackButton, IonSpinner, IonIcon, IonAvatar 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  busOutline, homeOutline, mapOutline, locationOutline,
  peopleOutline, statsChartOutline, settingsOutline, logOutOutline,
  notificationsOutline, personCircleOutline, searchOutline,
  optionsOutline
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.page.html',
  styleUrls: ['./lista-usuarios.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
    IonButton, IonIcon, IonBackButton, RouterLink, IonSpinner, IonAvatar
  ]
})
export class ListaUsuariosPage implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  textoBusqueda: string = '';
  cargando = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      busOutline, homeOutline, mapOutline, locationOutline,
      peopleOutline, statsChartOutline, settingsOutline, logOutOutline,
      notificationsOutline, personCircleOutline, searchOutline,
      optionsOutline
    });
  }

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async ionViewWillEnter() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    try {
      this.usuarios = await this.supabaseService.obtenerTodosLosUsuarios();
      this.usuariosFiltrados = [...this.usuarios];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  filtrarUsuarios() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    if (!texto) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(u => 
      (u.nombre && u.nombre.toLowerCase().includes(texto)) || 
      (u.correo && u.correo.toLowerCase().includes(texto)) ||
      (u.email && u.email.toLowerCase().includes(texto))
    );
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'Sin registros recientes';
    
    const fecha = new Date(fechaStr);
    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const hoy = new Date();
    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy, ${hora}`;
    }
    
    return `${fecha.toLocaleDateString()} ${hora}`;
  }

  async cerrarSesion() {
    try {
      await this.supabaseService.cerrarSesion();
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}