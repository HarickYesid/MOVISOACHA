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
  optionsOutline, trashOutline, createOutline, navigateCircleOutline
} from 'ionicons/icons';
import { AdminRutasService } from '../services/admin-rutas.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
    IonButton, IonIcon, IonBackButton, RouterLink, IonSpinner, IonAvatar
  ]
})
export class RutasPage implements OnInit {
  rutas: any[] = [];
  rutasFiltradas: any[] = [];
  textoBusqueda: string = '';
  cargando = false;

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      busOutline, homeOutline, mapOutline, locationOutline,
      peopleOutline, statsChartOutline, settingsOutline, logOutOutline,
      notificationsOutline, personCircleOutline, searchOutline,
      optionsOutline, trashOutline, createOutline, navigateCircleOutline
    });
  }

  async ngOnInit() {
    await this.cargarRutas();
  }

  async ionViewWillEnter() {
    await this.cargarRutas();
  }

  async cargarRutas() {
    this.cargando = true;
    try {
      this.rutas = await this.adminRutasService.obtenerRutas();
      this.rutasFiltradas = [...this.rutas];
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  filtrarRutas() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    if (!texto) {
      this.rutasFiltradas = [...this.rutas];
      return;
    }

    this.rutasFiltradas = this.rutas.filter(r => 
      r.nombre.toLowerCase().includes(texto) || 
      (r.origen && r.origen.toLowerCase().includes(texto)) ||
      (r.destino && r.destino.toLowerCase().includes(texto))
    );
  }

  editarRuta(ruta: any, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/admin'], { queryParams: { id_ruta: ruta.id_ruta } });
  }

  async eliminarRuta(idRuta: number, event?: Event) {
    if (event) event.stopPropagation();

    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta ruta?');
    if (!confirmado) return;

    try {
      const { error } = await this.adminRutasService.supabase
        .from('ruta')
        .delete()
        .eq('id_ruta', idRuta);

      if (error) {
        console.error('Error al eliminar la ruta en Supabase:', error);
        alert('No se pudo eliminar la ruta de la base de datos.');
        return;
      }

      alert('¡Ruta eliminada con éxito!');
      await this.cargarRutas();

    } catch (err) {
      console.error('Error inesperado al eliminar:', err);
    }
  }

  async cerrarSesion() {
    try {
      await this.adminRutasService.supabase.auth.signOut();
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}