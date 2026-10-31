import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonSpinner, 
  IonIcon,
  IonButton,
  IonFooter
} from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';
import { addIcons } from 'ionicons';
import { navigateCircleOutline, mapOutline, starOutline, personOutline, home } from 'ionicons/icons';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    RouterLink,
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonSpinner, 
    IonIcon,
    IonFooter
  ]
})
export class FavoritosPage implements OnInit {
  rutasFavoritas: any[] = [];
  cargando = false;

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ navigateCircleOutline, mapOutline, home, personOutline, starOutline });
  }

  async ngOnInit() {
    await this.cargarFavoritos();
  }

  async ionViewWillEnter() {
    await this.cargarFavoritos();
  }

  obtenerId(r: any): string {
    if (!r) return '';
    return String(r.id_ruta || r.id || '');
  }

  async cargarFavoritos() {
    this.cargando = true;
    try {
      const favsGuardados = localStorage.getItem('rutas_favoritas');
      const idsFavoritos: string[] = favsGuardados ? JSON.parse(favsGuardados).map((id: any) => String(id)) : [];

      const todasLasRutas = await this.adminRutasService.obtenerRutas();

      // Filtramos las rutas que estén guardadas en favoritos
      this.rutasFavoritas = todasLasRutas.filter((r: any) => idsFavoritos.includes(this.obtenerId(r)));

    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  removerFavorito(r: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const idRuta = this.obtenerId(r);
    const favsGuardados = localStorage.getItem('rutas_favoritas');
    let idsFavoritos: string[] = favsGuardados ? JSON.parse(favsGuardados).map((id: any) => String(id)) : [];

    // Quitamos el ID de la lista
    idsFavoritos = idsFavoritos.filter((id: string) => id !== idRuta);
    localStorage.setItem('rutas_favoritas', JSON.stringify(idsFavoritos));

    // Actualizamos la vista eliminando el elemento de forma inmediata
    this.rutasFavoritas = this.rutasFavoritas.filter((item: any) => this.obtenerId(item) !== idRuta);
    this.cdr.detectChanges();
  }

  verDetalleRuta(r: any) {
    const id = this.obtenerId(r);
    this.router.navigate(['/detalle-ruta'], { queryParams: { id } });
  }
}