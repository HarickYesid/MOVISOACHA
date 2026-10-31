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
  selector: 'app-rutas-usuario',
  templateUrl: './rutas-usuario.page.html',
  styleUrls: ['./rutas-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
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
  ]
})
export class RutasUsuarioPage implements OnInit {
  rutas: any[] = [];
  cargando = false;
  favoritos: number[] = [];

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ navigateCircleOutline, mapOutline, home, personOutline, starOutline });
  }

  async ngOnInit() {
    this.cargarFavoritos();
    await this.cargarRutas();
  }
  
  async ionViewWillEnter() {
    await this.cargarDatosCompletos();
  }

  async cargarDatosCompletos() {
    this.cargando = true;
    // 1. Cargamos los favoritos del localStorage primero
    this.cargarFavoritos();
    
    try {
      // 2. Luego cargamos las rutas de la base de datos
      this.rutas = await this.adminRutasService.obtenerRutas();
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      this.cargando = false;
      // 3. Forzamos a Angular a actualizar la vista con los estados correctos de las estrellas
      this.cdr.detectChanges();
    }
  }

  cargarFavoritos() {
    const favs = localStorage.getItem('rutas_favoritas');
    this.favoritos = favs ? JSON.parse(favs) : [];
  }

  esFavorito(idRuta: number): boolean {
    return this.favoritos.includes(idRuta);
  }

  toggleFavorito(r: any, event: Event) {
    event.stopPropagation(); // Evita que se abra el detalle al hacer clic en la estrella
    const index = this.favoritos.indexOf(r.id_ruta);
    if (index > -1) {
      this.favoritos.splice(index, 1); // Quitar de favoritos
    } else {
      this.favoritos.push(r.id_ruta); // Agregar a favoritos
    }
    localStorage.setItem('rutas_favoritas', JSON.stringify(this.favoritos));
    this.cdr.detectChanges();
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

  verDetalleRuta(r: any) {
    this.router.navigate(['/detalle-ruta'], { queryParams: { id: r.id_ruta } });
  }
}