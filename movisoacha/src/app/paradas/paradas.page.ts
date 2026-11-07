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
  searchOutline,
  optionsOutline,
  trashOutline,
  addOutline,
  closeOutline
} from 'ionicons/icons';

import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-paradas',
  templateUrl: './paradas.page.html',
  styleUrls: ['./paradas.page.scss'],
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
export class ParadasPage implements OnInit {
  paradas: any[] = [];
  paradasFiltradas: any[] = [];
  textoBusqueda: string = '';

  // Variables para el formulario de creación
  mostrarFormulario: boolean = false;
  nuevoNombre: string = '';
  nuevaDireccion: string = '';
  cargando: boolean = false;

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
      searchOutline,
      optionsOutline,
      trashOutline,
      addOutline,
      closeOutline
    });
  }

  async ngOnInit() {
    await this.cargarParadas();
  }

  async cargarParadas() {
    try {
      this.paradas = await this.supabaseService.obtenerParadas();
      this.paradasFiltradas = [...this.paradas];
    } catch (error) {
      console.error('Error al cargar paradas:', error);
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.nuevoNombre = '';
    this.nuevaDireccion = '';
  }

  async guardarParada() {
    if (!this.nuevoNombre.trim() || !this.nuevaDireccion.trim()) {
      alert('Por favor completa el nombre y la dirección de la parada.');
      return;
    }

    this.cargando = true;
    try {
      await this.supabaseService.agregarParada(this.nuevoNombre, this.nuevaDireccion);
      this.nuevoNombre = '';
      this.nuevaDireccion = '';
      this.mostrarFormulario = false;
      await this.cargarParadas(); // Recargar lista actualizada
    } catch (error) {
      console.error('Error al guardar parada:', error);
      alert('No se pudo guardar la parada.');
    } finally {
      this.cargando = false;
    }
  }

  filtrarParadas() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    if (!texto) {
      this.paradasFiltradas = [...this.paradas];
      return;
    }

    this.paradasFiltradas = this.paradas.filter(p => 
      p.nombre.toLowerCase().includes(texto) || 
      (p.direccion && p.direccion.toLowerCase().includes(texto))
    );
  }

async eliminarParada(id: number) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta parada?');
  if (!confirmar) return;

  try {
    await this.supabaseService.eliminarParada(id);
    // Filtrar usando id_parada
    this.paradas = this.paradas.filter(p => p.id_parada !== id);
    this.filtrarParadas();
    alert('Parada eliminada con éxito.');
  } catch (error: any) {
    console.error('Error detallado al eliminar parada:', error);
    alert(`No se pudo eliminar la parada: ${error.message || JSON.stringify(error)}`);
  }
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