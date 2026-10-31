import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonButton, IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption 
} from '@ionic/angular';
import { AdminRutasService } from '../services/admin-rutas.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonButtons, IonBackButton, IonButton, IonItem, 
    IonLabel, IonInput, IonList, IonSelect, IonSelectOption
  ]
})
export class AdminPage implements OnInit {
  modoEdicion: boolean = false;
  idRutaEditando: number | null = null;
  idTransporteEditando: number | null = null;
  cargando: boolean = false;

  datosRuta: any = { nombre: '', codigo: '', origen: '', destino: '', tiempo_estimado: '' };
  
  // Eliminado el campo 'codigo' de aquí
  datosTransporte: any = { 
    tipo: '',
    empresa: '',       
    color: '',   
    tamano: '',
    letrero_url: '',
    frente_url: '',
    atras_url: '',
    ladoderecho_url: '',
    ladoizquierdo_url: ''
  };

  camposImagenesConfig = [
    { key: 'letrero_url', label: 'Letrero' },
    { key: 'frente_url', label: 'Frontal' },
    { key: 'atras_url', label: 'Trasera' },
    { key: 'ladoderecho_url', label: 'Lat. Derecho' },
    { key: 'ladoizquierdo_url', label: 'Lat. Izquierdo' }
  ];

  paradasDisponibles: any[] = [];
  paradasSeleccionadas: any[] = [];
  nuevaParadaNombre: string = '';
  archivosImagenes: { [key: string]: any } = {};
  vistasPreviasLocales: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminRutasService: AdminRutasService
  ) {}

  async ngOnInit() {
    await this.cargarParadasGlobales();

    this.route.queryParams.subscribe(async params => {
      if (params['id_ruta']) {
        const id = +params['id_ruta'];
        await this.cargarDatosParaEditar(id);
      } else {
        this.limpiarFormularioCompleto();
      }
    });
  }

  async cargarParadasGlobales() {
    try {
      this.paradasDisponibles = await this.adminRutasService.obtenerParadasGlobales();
    } catch (error) {
      console.error('Error al cargar paradas:', error);
    }
  }

  onFileSelected(event: any, tipoImagen: string) {
    const file = event.target.files[0];
    if (file) {
      this.archivosImagenes[tipoImagen] = file;
      this.vistasPreviasLocales[tipoImagen] = URL.createObjectURL(file);
    }
  }

  obtenerUrlVistaPrevia(tipoImagen: string): string {
    if (this.vistasPreviasLocales[tipoImagen]) {
      return this.vistasPreviasLocales[tipoImagen];
    }
    return this.datosTransporte[tipoImagen] || '';
  }

  async crearNuevaParada() {
    if (!this.nuevaParadaNombre.trim()) {
      alert('Escribe el nombre de la nueva parada.');
      return;
    }
    try {
      const nueva = await this.adminRutasService.crearParada(this.nuevaParadaNombre.trim());
      await this.cargarParadasGlobales();
      this.paradasSeleccionadas.push(nueva);
      this.nuevaParadaNombre = '';
      alert('¡Parada creada y agregada con éxito!');
    } catch (error: any) {
      console.error('Error al crear parada:', error);
      alert('No se pudo crear la parada: ' + error.message);
    }
  }

  agregarParadaExistente(parada: any) {
    if (parada && !this.paradasSeleccionadas.some(p => p.id_parada === parada.id_parada)) {
      this.paradasSeleccionadas.push(parada);
    }
  }

  removerParada(index: number) {
    this.paradasSeleccionadas.splice(index, 1);
  }

  async cargarDatosParaEditar(id: number) {
    this.cargando = true;
    try {
      const todasLasRutas = await this.adminRutasService.obtenerRutas();
      const rutaData = todasLasRutas.find((r: any) => r.id_ruta === id);

      if (rutaData) {
        this.modoEdicion = true;
        this.idRutaEditando = rutaData.id_ruta;

        this.datosRuta = {
          nombre: rutaData.nombre || '',
          origen: rutaData.origen || '',
          destino: rutaData.destino || '',
          tiempo_estimado: rutaData.tiempo_estimado || ''
        };

        if (rutaData.transporte) {
          this.idTransporteEditando = rutaData.transporte.id_transporte;
          this.datosTransporte = { ...rutaData.transporte };
        }

        if (rutaData.ruta_parada) {
          this.paradasSeleccionadas = rutaData.ruta_parada.map((rp: any) => rp.parada);
        }
      }
    } catch (error) {
      console.error('Error al cargar para edición:', error);
    } finally {
      this.cargando = false;
    }
  }

  async guardarRuta() {
    if (!this.datosRuta.nombre || !this.datosRuta.origen || !this.datosRuta.destino) {
      alert('Completa los campos obligatorios de la ruta.');
      return;
    }

    if (this.paradasSeleccionadas.length === 0) {
      alert('Debes agregar al menos una parada a la ruta.');
      return;
    }

    this.cargando = true;

    try {
      const idsParadasOrdenadas = this.paradasSeleccionadas.map(p => p.id_parada);

      if (this.modoEdicion && this.idRutaEditando) {
        await this.adminRutasService.actualizarRutaCompleta(
          this.idRutaEditando,
          this.idTransporteEditando,
          this.datosRuta,
          this.datosTransporte,
          this.archivosImagenes,
          idsParadasOrdenadas
        );
        alert('¡Ruta actualizada exitosamente!');
      } else {
        await this.adminRutasService.crearRutaCompleta(
          this.datosRuta,
          this.datosTransporte,
          this.archivosImagenes,
          idsParadasOrdenadas
        );
        alert('¡Ruta creada exitosamente!');
      }

      this.limpiarFormularioCompleto();
      this.router.navigate(['/rutas']);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert('Error: ' + (error.message || JSON.stringify(error)));
    } finally {
      this.cargando = false;
    }
  }

  descartarCambios() {
    if (confirm('¿Estás seguro de descartar los cambios?')) {
      this.limpiarFormularioCompleto();
      this.router.navigate(['/rutas']);
    }
  }

  limpiarFormularioCompleto() {
    this.modoEdicion = false;
    this.idRutaEditando = null;
    this.idTransporteEditando = null;
    this.datosRuta = { nombre: '', origen: '', destino: '', tiempo_estimado: '' };
    this.datosTransporte = { tipo: '', letrero_url: '', frente_url: '', atras_url: '', ladoderecho_url: '', ladoizquierdo_url: '' };
    this.paradasSeleccionadas = [];
    this.archivosImagenes = {};
    this.vistasPreviasLocales = {};
    this.nuevaParadaNombre = '';
  }

  cerrarSesion() {
    this.router.navigate(['/rutas']);
  }
}