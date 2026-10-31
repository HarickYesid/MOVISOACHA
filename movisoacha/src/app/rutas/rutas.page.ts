import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonSpinner, IonIcon } from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
    IonButton, IonIcon, IonBackButton, RouterLink, IonSpinner]
})
export class RutasPage implements OnInit {
  rutas: any[] = [];
  cargando = false;

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

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
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  editarRuta(ruta: any, event?: Event) {
    if (event) event.stopPropagation();
    // Redirige al panel admin pasando el ID de la ruta por parámetro de URL
    this.router.navigate(['/admin'], { queryParams: { id_ruta: ruta.id_ruta } });
  }

  async eliminarRuta(idRuta: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta ruta?');
    if (!confirmado) return;

    try {
      // Usamos el cliente de Supabase encapsulado en tu AdminRutasService 
      // (O asegúrate de tener un método eliminarRuta en tu servicio)
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
      
      // Recargamos la lista y actualizamos la vista
      await this.cargarRutas();

    } catch (err) {
      console.error('Error inesperado al eliminar:', err);
    }
  }
}