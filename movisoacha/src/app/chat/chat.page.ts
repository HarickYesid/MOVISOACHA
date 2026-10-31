import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonFooter, IonTextarea, IonButton, IonIcon 
} from '@ionic/angular';
import { IaChatService } from '../services/ia-chat.service';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, 
    IonToolbar, IonButtons, IonBackButton, IonFooter, IonTextarea, IonButton, IonIcon
  ]
})
export class ChatPage {
  mensajes: { origen: 'usuario' | 'ia', texto: string }[] = [];
  preguntaActual: string = '';
  cargando: boolean = false;

  constructor(
    private iaChatService: IaChatService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ send });
  }

  async enviarMensaje() {
    const textoUsuario = this.preguntaActual.trim();
    if (!textoUsuario) return;

    // 1. Mostrar mensaje del usuario
    this.mensajes.push({ origen: 'usuario', texto: textoUsuario });
    this.preguntaActual = '';
    this.cargando = true;
    this.cdr.detectChanges();

    try {
      // 2. Obtener respuesta de la IA
      const respuestaIA = await this.iaChatService.hacerPreguntaAlAsistente(textoUsuario);
      
      // 3. Mostrar respuesta de la IA
      this.mensajes.push({ origen: 'ia', texto: respuestaIA });
    } catch (error) {
      this.mensajes.push({ origen: 'ia', texto: 'Ocurrió un error inesperado.' });
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}