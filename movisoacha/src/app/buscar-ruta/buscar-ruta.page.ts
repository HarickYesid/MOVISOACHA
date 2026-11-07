import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonBackButton,
  IonButton, 
  IonIcon, 
  IonSpinner 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locationOutline, timeOutline, busOutline, searchOutline, arrowForwardOutline } from 'ionicons/icons';
import { AdminRutasService } from '../services/admin-rutas.service';

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
    IonSpinner
  ]
})
export class BuscarRutaPage implements OnInit {
  rutas: any[] = [];
  rutasFiltradas: any[] = [];
  
  puntoPartida: string = '';
  destinoBusqueda: string = '';
  terminoBusqueda: string = '';
  cargando = true;

  // Lista de sugerencias para el autocompletado de destino
  destinosSugeridos: string[] = [];

  get rutasEncontradas() {
    return this.rutasFiltradas;
  }
  set rutasEncontradas(value: any[]) {
    this.rutasFiltradas = value;
  }

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ locationOutline, timeOutline, busOutline, searchOutline, arrowForwardOutline });
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
      console.error('Error al cargar las rutas:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // Método de autocompletado en tiempo real para el destino
  onDestinoInput() {
    const valor = this.destinoBusqueda.toLowerCase().trim();
    if (!valor) {
      this.destinosSugeridos = [];
      return;
    }

    // Extraer todos los destinos únicos disponibles en las rutas
    const todosLosDestinos = this.rutas
      .map(r => r.destino)
      .filter((dest, index, self) => dest && self.indexOf(dest) === index);

    // Filtrar los que coincidan con lo que escribe el usuario
    this.destinosSugeridos = todosLosDestinos.filter(dest => 
      dest.toLowerCase().includes(valor)
    );
  }

  // Seleccionar una sugerencia del autocompletado
  seleccionarDestino(destino: string) {
    this.destinoBusqueda = destino;
    this.destinosSugeridos = [];
    this.buscarRutas();
  }

  // Búsqueda avanzada por origen y destino
  buscarRutas() {
    this.destinosSugeridos = []; // Ocultar sugerencias al buscar
    this.rutasFiltradas = this.rutas.filter((ruta: any) => {
      const origenMatch = this.puntoPartida ? (ruta.origen && ruta.origen.toLowerCase().includes(this.puntoPartida.toLowerCase())) : true;
      const destinoMatch = this.destinoBusqueda ? (ruta.destino && ruta.destino.toLowerCase().includes(this.destinoBusqueda.toLowerCase())) : true;
      return origenMatch && destinoMatch;
    });
    this.cdr.detectChanges();
  }

  // Obtener ubicación GPS actual y asignarla automáticamente al punto de partida
  obtenerUbicacionActual() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.puntoPartida = 'Mi ubicación actual (GPS)';
          this.cdr.detectChanges();
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación:', error.message);
          alert('No se pudo acceder a la ubicación GPS. Verifica los permisos de tu navegador.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('La geolocalización no es compatible en este dispositivo.');
    }
  }

  verDetallesRuta(id: any) {
    this.router.navigate(['/detalle-ruta'], { queryParams: { id } });
  }

  iniciarNavegacion(id: any) {
    this.router.navigate(['/navegacion-mapa'], { queryParams: { id } });
  }
}