import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonSpinner 
} from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonSpinner
  ]
})
export class DetalleRutaPage implements OnInit {
  ruta: any = null;
  cargando = true;
  idRuta: any;
  mapaInstancia: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminRutasService: AdminRutasService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.idRuta = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
    if (this.idRuta) {
      await this.cargarDetalleRuta(this.idRuta);
    } else {
      this.cargando = false;
    }
  }

  async cargarDetalleRuta(id: any) {
    this.cargando = true;
    try {
      const rutas = await this.adminRutasService.obtenerRutas();
      this.ruta = rutas.find((r: any) => String(r.id_ruta || r.id) === String(id));
    } catch (error) {
      console.error('Error al cargar detalle de la ruta:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
      
      // Una vez pintada la vista, inicializamos el mapa con el trazado
      if (this.ruta) {
        setTimeout(() => {
          this.inicializarMapaTrazado();
        }, 300);
      }
    }
  }

inicializarMapaTrazado() {
    const container = document.getElementById('mapa-detalle-ruta');
    if (!container) return;

    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }

    // Coordenadas base (Soacha por defecto)
    this.mapaInstancia = L.map('mapa-detalle-ruta').setView([4.5794, -74.2172], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap'
    }).addTo(this.mapaInstancia);

    // Obtener y pintar el trazado almacenado
    const trazadoData = this.ruta.trazado || this.ruta.coordenadas || this.ruta.geojson;
    if (trazadoData) {
      try {
        const coords = typeof trazadoData === 'string' ? JSON.parse(trazadoData) : trazadoData;
        
        if (coords && coords.length > 0) {
          // 1. Dibujar la línea azul del recorrido
          const polyline = L.polyline(coords, { color: '#1976d2', weight: 5 }).addTo(this.mapaInstancia);
          this.mapaInstancia.fitBounds(polyline.getBounds());

          // 2. Agregar marcador en el punto de Origen (Inicio del trazado)
          const puntoInicio = coords[0];
          L.marker(puntoInicio)
            .addTo(this.mapaInstancia)
            .bindPopup(`<b>📍 Origen:</b><br>${this.ruta.origen}`)
            .openPopup(); // Abre el popup del origen por defecto al cargar

          // 3. Agregar marcador en el punto de Destino (Fin del trazado)
          const puntoFin = coords[coords.length - 1];
          L.marker(puntoFin)
            .addTo(this.mapaInstancia)
            .bindPopup(`<b>🏁 Destino:</b><br>${this.ruta.destino}`);
        }
      } catch (e) {
        console.error('Error al renderizar el trazado o los marcadores en el mapa:', e);
      }
    }
  }
}