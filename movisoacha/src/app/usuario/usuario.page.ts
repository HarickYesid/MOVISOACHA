import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonSearchbar, 
  IonAvatar, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonFooter
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, mapOutline, starOutline, personOutline, locateOutline, chatbubblesOutline } from 'ionicons/icons';
import * as L from 'leaflet';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonToolbar, 
    RouterLink,
    IonSearchbar, 
    IonAvatar, 
    IonFab, 
    IonFabButton, 
    IonIcon, 
    IonFooter
  ]
})
export class UsuarioPage implements OnInit, AfterViewInit {

  private map!: L.Map;

  constructor(private router: Router) {
    addIcons({ home, mapOutline, starOutline, personOutline, locateOutline, chatbubblesOutline });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    // Coordenadas centrales de Soacha
    const soachaCoords: [number, number] = [4.5800, -74.2167];

    // Definir los límites geográficos (Bounding Box) que encierran a Soacha y zonas aledañas
    const soachaBounds = L.latLngBounds(
      [4.42, -74.35], // Esquina Suroeste (lat, lng)
      [4.70, -74.10]  // Esquina Noreste (lat, lng)
    );

    this.map = L.map('mapaUsuario', {
      zoomControl: false,
      maxBounds: soachaBounds,       // Restringe el movimiento fuera de Soacha
      maxBoundsViscosity: 1.0,      // Hace que el rebote en los bordes sea firme
      minZoom: 12,                  // Evita que el usuario haga mucho zoom out (alejarse demasiado)
      maxZoom: 19
    }).setView(soachaCoords, 14);

    // Servidor de mapas OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Ajustar el tamaño del mapa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);
  }

  centrarMapa() {
    if (this.map) {
      this.map.setView([4.5800, -74.2167], 14);
    }
  }

  irAlChat() {
    this.router.navigate(['/chat']);
  }
}