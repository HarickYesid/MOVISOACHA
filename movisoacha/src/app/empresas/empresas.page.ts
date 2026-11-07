import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonButton, IonBackButton, IonSpinner, IonIcon, IonAvatar 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  busOutline, homeOutline, mapOutline, locationOutline,
  peopleOutline, statsChartOutline, settingsOutline, logOutOutline,
  notificationsOutline, personCircleOutline, searchOutline,
  optionsOutline, arrowForwardOutline, chevronDownOutline, imageOutline
} from 'ionicons/icons';
import { AdminRutasService } from '../services/admin-rutas.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.page.html',
  styleUrls: ['./empresas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
    IonButton, IonIcon, IonBackButton, RouterLink, IonSpinner, IonAvatar
  ]
})
export class EmpresasPage implements OnInit {
  transportes: any[] = [];
  transportesFiltrados: any[] = [];
  textoBusqueda: string = '';
  cargando = false;

  constructor(
    private adminRutasService: AdminRutasService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      busOutline, homeOutline, mapOutline, locationOutline,
      peopleOutline, statsChartOutline, settingsOutline, logOutOutline,
      notificationsOutline, personCircleOutline, searchOutline,
      optionsOutline, arrowForwardOutline, chevronDownOutline, imageOutline
    });
  }

  async ngOnInit() {
    await this.cargarTransportes();
  }

  async ionViewWillEnter() {
    await this.cargarTransportes();
  }

  async cargarTransportes() {
    this.cargando = true;
    try {
      // Consultamos la tabla 'transporte' directamente desde el cliente de Supabase
      const { data, error } = await this.adminRutasService.supabase
        .from('transporte')
        .select('*')
        .order('id_transporte', { ascending: false });

      if (error) throw error;

      // Procesamos cada transporte para limpiar y mapear correctamente las URLs de las fotos
      const camposImagenes = ['frente_url', 'atras_url', 'ladoderecho_url', 'ladoizquierdo_url', 'letrero_url'];

      this.transportes = (data || []).map(t => {
        camposImagenes.forEach(campo => {
          let rutaImagen = t[campo];
          if (rutaImagen) {
            // Limpiar referencias a carpetas antiguas si las hubiera
            if (rutaImagen.includes('/transporte/')) {
              rutaImagen = rutaImagen.replace('/transporte/', '/');
            } else if (rutaImagen.startsWith('transporte/')) {
              rutaImagen = rutaImagen.replace('transporte/', '');
            }

            // Si no es una URL web completa, generamos la URL pública desde el bucket
            if (!rutaImagen.startsWith('http')) {
              const { data: publicUrlData } = this.adminRutasService.supabase.storage
                .from('buses-imagenes')
                .getPublicUrl(rutaImagen);
              t[campo] = publicUrlData.publicUrl;
            } else {
              t[campo] = rutaImagen;
            }
          }
        });

        return { ...t, expandido: false };
      });

      this.transportesFiltrados = [...this.transportes];
    } catch (error) {
      console.error('Error al cargar transportes:', error);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  toggleExpandir(transporte: any) {
    transporte.expandido = !transporte.expandido;
  }

  filtrarTransportes() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    if (!texto) {
      this.transportesFiltrados = [...this.transportes];
      return;
    }

    this.transportesFiltrados = this.transportes.filter(t => 
      (t.empresa && t.empresa.toLowerCase().includes(texto)) || 
      (t.tipo && t.tipo.toLowerCase().includes(texto))
    );
  }

  async cerrarSesion() {
    try {
      await this.adminRutasService.supabase.auth.signOut();
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}