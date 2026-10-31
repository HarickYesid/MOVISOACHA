import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonButton, 
  IonIcon 
} from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';
import { addIcons } from 'ionicons';
import { location, locateOutline } from 'ionicons/icons';

@Component({
  selector: 'app-buscar-ruta',
  templateUrl: './buscar-ruta.page.html',
  styleUrls: ['./buscar-ruta.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonButton, 
    IonIcon,
    RouterLink
  ]
})
export class BuscarRutaPage implements OnInit {
  origenBusqueda: string = '';
  destinoBusqueda: string = '';
  todasLasRutas: any[] = [];
  resultados: any[] = [];
  busquedaRealizada: boolean = false;

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ location, locateOutline });
  }

  async ngOnInit() {
    try {
      this.todasLasRutas = await this.adminRutasService.obtenerRutas();
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    }
  }

  usarMiUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.origenBusqueda = 'Mi ubicación actual (Soacha)';
          this.cdr.detectChanges();
        },
        (error) => {
          alert('No se pudo obtener tu ubicación actual.');
        }
      );
    }
  }

  // Búsqueda inteligente por puntos de referencia (Origen, Destino o Paradas)
 buscarRutasCoincidentes() {
  this.busquedaRealizada = true;
  const origenFiltro = this.origenBusqueda.toLowerCase().trim();
  const destinoFiltro = this.destinoBusqueda.toLowerCase().trim();

  this.resultados = this.todasLasRutas.filter((r: any) => {
    const origenRuta = (r.origen || '').toLowerCase();
    const destinoRuta = (r.destino || '').toLowerCase();
    
    // Extraemos los nombres de las paradas de la tabla relacional de Supabase
    const nombreParadas: string[] = [];
    if (r.parada && Array.isArray(r.parada)) {
      r.parada.forEach((p: any) => {
        if (p && p.nombre) {
          nombreParadas.push(String(p.nombre).toLowerCase());
        }
      });
    }

    // Verificamos si el destino o parada de llegada coincide
    const coincideDestino = !destinoFiltro || 
      destinoRuta.includes(destinoFiltro) || 
      origenRuta.includes(destinoFiltro) ||
      nombreParadas.some((nombre: string) => nombre.includes(destinoFiltro));

    // Verificamos el origen
    const esUbicacionActual = origenFiltro.includes('ubicación') || origenFiltro === '';
    const coincideOrigen = esUbicacionActual || 
      origenRuta.includes(origenFiltro) || 
      destinoRuta.includes(origenFiltro) ||
      nombreParadas.some((nombre: string) => nombre.includes(origenFiltro));

    // Si solo escribió el destino, mostramos las rutas que pasen por ahí o lleguen ahí
    if (origenFiltro === '' || origenFiltro.includes('ubicación')) {
      return coincideDestino;
    }

    return coincideOrigen && coincideDestino;
  });

  this.cdr.detectChanges();
}

  verEnMapa(r: any) {
  const idRuta = r.id_ruta || r.id;
  this.router.navigate(['/detalle-ruta'], { queryParams: { id: idRuta } });
}
}