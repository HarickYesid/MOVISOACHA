import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonSpinner, 
  IonIcon
} from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';
import { addIcons } from 'ionicons';
import { 
  navigateCircleOutline, 
  mapOutline, 
  map, 
  starOutline, 
  star, 
  personOutline, 
  homeOutline, 
  busOutline, 
  logOutOutline, 
  personCircleOutline, 
  searchOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-rutas-usuario',
  templateUrl: './rutas-usuario.page.html',
  styleUrls: ['./rutas-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink, 
    IonContent, 
    IonSpinner, 
    IonIcon
  ]
})
export class RutasUsuarioPage implements OnInit {
  rutas: any[] = [];
  rutasOriginales: any[] = [];
  cargando = false;
  favoritos: number[] = [];
  terminoBusqueda: string = '';

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ 
      navigateCircleOutline, 
      mapOutline, 
      map, 
      starOutline, 
      star, 
      personOutline, 
      homeOutline, 
      busOutline, 
      logOutOutline, 
      personCircleOutline, 
      searchOutline 
    });
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
    this.cargarFavoritos();
    
    try {
      const data = await this.adminRutasService.obtenerRutas();
      this.rutasOriginales = data || [];
      this.rutas = [...this.rutasOriginales];
      
      // Aplicar filtro si el usuario ya tenía un término escrito
      if (this.terminoBusqueda.trim()) {
        this.filtrarRutas();
      }
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarRutas() {
    await this.cargarDatosCompletos();
  }

  // Filtrado de rutas según lo escrito en la barra de búsqueda del panel
  filtrarRutas(event?: any) {
    const valor = this.terminoBusqueda.toLowerCase().trim();
    if (!valor) {
      this.rutas = [...this.rutasOriginales];
    } else {
      this.rutas = this.rutasOriginales.filter((r: any) => {
        const nombre = r.nombre ? r.nombre.toLowerCase() : '';
        const origen = r.origen ? r.origen.toLowerCase() : '';
        const destino = r.destino ? r.destino.toLowerCase() : '';
        return nombre.includes(valor) || origen.includes(valor) || destino.includes(valor);
      });
    }
    this.cdr.detectChanges();
  }

  // Gestión de Favoritos en LocalStorage
  cargarFavoritos() {
    const favs = localStorage.getItem('rutas_favoritas');
    this.favoritos = favs ? JSON.parse(favs) : [];
  }

  esFavorito(idRuta: number): boolean {
    return this.favoritos.includes(idRuta);
  }

  toggleFavorito(r: any, event: Event) {
    event.stopPropagation(); // Evita navegar al detalle al pulsar la estrella
    const id = r.id_ruta || r.id;
    const index = this.favoritos.indexOf(id);
    
    if (index > -1) {
      this.favoritos.splice(index, 1);
    } else {
      this.favoritos.push(id);
    }
    
    localStorage.setItem('rutas_favoritas', JSON.stringify(this.favoritos));
    this.cdr.detectChanges();
  }

  verDetalleRuta(r: any) {
    this.router.navigate(['/detalle-ruta'], { queryParams: { id: r.id_ruta || r.id } });
  }
}