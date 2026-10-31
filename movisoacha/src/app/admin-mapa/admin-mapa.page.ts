import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonButton 
} from '@ionic/angular';
import * as L from 'leaflet';
import { SupabaseService } from '../services/supabase.service';
// Asegúrate de importar tu cliente de Supabase correctamente según tu estructura:
// import { supabase } from '../../services/supabase.service'; 

@Component({
  selector: 'app-admin-mapa',
  templateUrl: './admin-mapa.page.html',
  styleUrls: ['./admin-mapa.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonButton
  ]
})
export class AdminMapaPage implements OnInit {
  private map!: L.Map;
  private latLngs: L.LatLng[] = [];
  private polyline!: L.Polyline;
  //private markers: L.Marker[] = [];
  
  idRuta!: number; // ID de la ruta actual
  private soachaCenter: L.LatLngExpression = [4.577, -74.216];

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private supabaseService: SupabaseService) {}

  ngOnInit() {
    // Capturamos el id_ruta enviado desde la página de rutas
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.idRuta = +params['id'];
      }
    });
  }

  ionViewDidEnter() {
    if (!this.map) {
      this.inicializarMapa();
    } else {
      this.map.invalidateSize();
    }
  }

  inicializarMapa() {
    this.map = L.map('mapId', {
      center: this.soachaCenter,
      zoom: 14,
      maxBounds: [
        [4.45, -74.35],
        [4.70, -74.10]
      ],
      maxBoundsViscosity: 1.0,
      minZoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.polyline = L.polyline([], { color: '#3880ff', weight: 4 }).addTo(this.map);

    // Evento para añadir puntos al hacer clic
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.agregarPuntoTrazado(lat, lng);
    });

    // Si tenemos un id de ruta, consultamos si ya tiene un trazado previo guardado
    if (this.idRuta) {
      this.cargarTrazadoExistente();
    }

    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  agregarPuntoTrazado(lat: number, lng: number) {
  const latLng = L.latLng(lat, lng);
  this.latLngs.push(latLng);
  this.polyline.setLatLngs(this.latLngs);
  // (Ya no añadimos L.marker al mapa)
}

  deshacerUltimoPunto() {
  if (this.latLngs.length > 0) {
    this.latLngs.pop();
    this.polyline.setLatLngs(this.latLngs);
  }
}

  // Carga y dibuja el trazado previamente guardado en Supabase
  async cargarTrazadoExistente() {
  const { data, error } = await this.supabaseService.supabase
    .from('ruta')
    .select('trazado')
    .eq('id_ruta', this.idRuta)
    .single();

  if (data && data.trazado) {
    try {
      let puntosGuardados = data.trazado;
      if (typeof puntosGuardados === 'string') {
        puntosGuardados = JSON.parse(puntosGuardados);
      }

      this.latLngs = puntosGuardados.map((pt: [number, number]) => L.latLng(pt[0], pt[1]));
      this.polyline.setLatLngs(this.latLngs);
      
      // Eliminamos el foreach de marcadores, dejando exclusivamente la línea
    } catch (e) {
      console.error('Error al interpretar el trazado guardado:', e);
    }
  }
}

  // Guarda o actualiza el trazado dibujado en la base de datos de Supabase
  async guardarTrazado() {
    if (!this.idRuta) {
      alert('Error: No se encontró el ID de la ruta.');
      return;
    }

    const coordenadasJSON = this.latLngs.map(pt => [pt.lat, pt.lng]);

    const { error } = await this.supabaseService.supabase
      .from('ruta')
      .update({ trazado: JSON.stringify(coordenadasJSON) })
      .eq('id_ruta', this.idRuta);

    if (error) {
      console.error('Error al guardar en Supabase:', error);
      alert('No se pudo guardar el trazado.');
    } else {
      alert('¡Trazado guardado exitosamente!');
      this.router.navigate(['/rutas']); // Regresa a la lista de rutas al guardar
    }
  }

  ionViewDidLeave() {
    if (this.map) {
      this.map.remove();
      this.map = undefined as any;
    }
  }
}