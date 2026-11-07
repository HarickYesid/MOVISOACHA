import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonAvatar
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  busOutline,
  homeOutline,
  mapOutline,
  locationOutline,
  peopleOutline,
  statsChartOutline,
  settingsOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  gitCommitOutline,
  businessOutline,
  chevronForwardOutline,
  barChartOutline,
  addOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service'; // Ajusta la ruta a tu servicio de Supabase

interface AccesoReciente {
  nombre: string;
  ultimo_acceso: string;
}

@Component({
  selector: 'app-panel-admin',
  templateUrl: './panel-admin.page.html',
  styleUrls: ['./panel-admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonIcon,
    IonAvatar
  ]
})
export class PanelAdminPage implements OnInit {

  // Totales para las tarjetas
  totalRutas: number = 0;
  totalParadas: number = 0;
  totalEmpresas: number = 0;
  totalUsuarios: number = 0;

  // Lista para los accesos recientes
  accesosRecientes: AccesoReciente[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({
      busOutline,
      homeOutline,
      mapOutline,
      locationOutline,
      peopleOutline,
      statsChartOutline,
      settingsOutline,
      logOutOutline,
      notificationsOutline,
      personCircleOutline,
      gitCommitOutline,
      businessOutline,
      chevronForwardOutline,
      barChartOutline,
      addOutline
    });
  }

  async ngOnInit() {
    await this.cargarMetricas();
    await this.cargarAccesosRecientes();
  }

  // Carga los contadores del sistema desde Supabase
  async cargarMetricas() {
    try {
      this.totalRutas = await this.supabaseService.obtenerTotalRutas();
      this.totalParadas = await this.supabaseService.obtenerTotalParadas();
      this.totalEmpresas = await this.supabaseService.obtenerTotalEmpresas();
      this.totalUsuarios = await this.supabaseService.obtenerTotalUsuarios();
    } catch (e) {
      console.error('Error al cargar métricas:', e);
    }
  }

  // Carga máximo 5 usuarios ordenados por el más reciente
  async cargarAccesosRecientes() {
    try {
      this.accesosRecientes = await this.supabaseService.obtenerAccesosRecientes(5);
    } catch (e) {
      console.error('Error al cargar accesos recientes:', e);
    }
  }

  // Formatea fechas estilo "Hoy, 09:32 a. m."
  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'Recientemente';
    
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