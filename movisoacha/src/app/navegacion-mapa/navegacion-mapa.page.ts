import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, timeOutline, busOutline } from 'ionicons/icons';
import { AdminRutasService } from '../services/admin-rutas.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-navegacion-mapa',
  templateUrl: './navegacion-mapa.page.html',
  styleUrls: ['./navegacion-mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon, RouterLink]
})
export class NavegacionMapaPage implements OnInit, OnDestroy {
  rutaActual: any = null;
  idRuta: any;
  mapaInstancia: L.Map | null = null;
  marcadorUsuario: any = null;
  watchId: any = null;

  constructor(
    private route: ActivatedRoute,
    private adminRutasService: AdminRutasService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ arrowBackOutline, timeOutline, busOutline });
  }

  async ngOnInit() {
    this.idRuta = this.route.snapshot.paramMap.get('id') || 
                  this.route.snapshot.queryParamMap.get('id') || 
                  this.route.snapshot.queryParamMap.get('id_ruta');
  }

  async ionViewDidEnter() {
    setTimeout(async () => {
      if (this.idRuta && !this.rutaActual) {
        await this.cargarDetalleRuta(this.idRuta);
      } else if (this.rutaActual) {
        this.inicializarMapaYNavegacion();
      }
    }, 350);
  }

  async cargarDetalleRuta(id: any) {
    try {
      const rutas = await this.adminRutasService.obtenerRutas();
      const encontrada = rutas.find((r: any) => String(r.id_ruta || r.id) === String(id));
      
      if (encontrada) {
        this.rutaActual = { ...encontrada };

        // Normalizamos las paradas de Supabase exactamente igual que en admin
        if (encontrada.ruta_parada && Array.isArray(encontrada.ruta_parada)) {
          this.rutaActual.paradas = encontrada.ruta_parada.map((rp: any) => rp.parada || rp);
        } else if (!this.rutaActual.paradas) {
          this.rutaActual.paradas = [];
        }
      }
      
      this.cdr.detectChanges();
      if (this.rutaActual) {
        this.inicializarMapaYNavegacion();
      }
    } catch (error) {
      console.error('Error al cargar detalle de la ruta en mapa:', error);
    }
  }

  inicializarMapaYNavegacion() {
    const container = document.getElementById('mapa-navegacion');
    if (!container) return;

    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }

    try {
      const centroSoacha: [number, number] = [4.5779, -74.2165];
      const limitesSoacha: [[number, number], [number, number]] = [
        [4.4200, -74.3500],
        [4.7200, -74.1200]
      ];

      this.mapaInstancia = L.map('mapa-navegacion', {
        center: centroSoacha,
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        maxBounds: limitesSoacha,
        maxBoundsViscosity: 1.0
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
      }).addTo(this.mapaInstancia);

      // Pintar el trazado azul de la ruta
      const trazadoData = this.rutaActual?.trazado || this.rutaActual?.coordenadas || this.rutaActual?.geojson;
      if (trazadoData) {
        const coords = typeof trazadoData === 'string' ? JSON.parse(trazadoData) : trazadoData;
        
        if (coords && coords.length > 0 && this.mapaInstancia) {
          const polyline = L.polyline(coords, { color: '#1976d2', weight: 6 }).addTo(this.mapaInstancia);
          this.mapaInstancia.fitBounds(polyline.getBounds(), { padding: [40, 40] });

          L.marker(coords[0]).addTo(this.mapaInstancia).bindPopup(`<b>📍 Origen:</b><br>${this.rutaActual.origen}`);
          L.marker(coords[coords.length - 1]).addTo(this.mapaInstancia).bindPopup(`<b>🏁 Destino:</b><br>${this.rutaActual.destino}`);
        }
      }

      // Volver a activar el GPS en tiempo real
      this.iniciarGPSReal();

      // Forzar renderizado de baldosas
      setTimeout(() => {
        if (this.mapaInstancia) {
          this.mapaInstancia.invalidateSize(true);
        }
      }, 300);

    } catch (e) {
      console.error('Error al inicializar mapa:', e);
    }
  }

  iniciarGPSReal() {
    if (navigator.geolocation && this.mapaInstancia) {
      const mapaActual = this.mapaInstancia;

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (!this.marcadorUsuario) {
            const iconoUser = L.divIcon({
              className: 'user-marker',
              html: '<div style="background-color: #2196f3; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.6);"></div>',
              iconSize: [22, 22]
            });
            this.marcadorUsuario = L.marker([lat, lng], { icon: iconoUser }).addTo(mapaActual);
            this.marcadorUsuario.bindPopup('<b>Tu ubicación actual (GPS)</b>');
          } else {
            this.marcadorUsuario.setLatLng([lat, lng]);
          }
        },
        (error) => console.warn('GPS no disponible:', error.message),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  }

  ngOnDestroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }
  }
}