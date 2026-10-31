import { Injectable } from '@angular/core';
import { AdminRutasService } from './admin-rutas.service';

@Injectable({
  providedIn: 'root'
})
export class IaChatService {
  private apiKey = ''; // Tu API Key real

  constructor(private adminRutasService: AdminRutasService) {}

  async hacerPreguntaAlAsistente(preguntaUsuario: string): Promise<string> {
    try {
      // 1. Obtenemos las rutas de Supabase
      let rutasDB = [];
      try {
        const resultado = this.adminRutasService.obtenerRutas();
        rutasDB = resultado instanceof Promise ? await resultado : await Promise.resolve(resultado);
      } catch (e) {
        console.warn("Usando respaldo de rutas local:", e);
      }

      if (!rutasDB || rutasDB.length === 0) {
        rutasDB = [
          { nombre: "San Mateo - Ciudad Verde", origen: "San Mateo", destino: "Ciudad Verde", tipo: "Bus urbano", tiempo: "25 min" },
          { nombre: "Terreros - Terminal", origen: "Terreros", destino: "Terminal Sur", tipo: "Alimentador", tiempo: "20 min" }
        ];
      }

      const contextoRutas = JSON.stringify(rutasDB, null, 2);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${this.apiKey}`;

      const payload = {
        contents: [{
          parts: [{
            text: `Eres "MoviBot", un asistente virtual experto en transporte público de Soacha.
            Usa EXCLUSIVAMENTE esta información de la base de datos para responder de forma breve y amable:
            ${contextoRutas}

            Pregunta del usuario: ${preguntaUsuario}`
          }]
        }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Si Google AI Studio está saturado o devuelve error, respondemos localmente con los datos de Supabase
      if (data.error) {
        console.warn("⚠️ Servidor de IA saturado, activando respuesta inteligente local.");
        const preguntaLower = preguntaUsuario.toLowerCase();
        
        // Buscamos coincidencia en las rutas obtenidas
        const rutaEncontrada = rutasDB.find((r: any) => 
          r.nombre?.toLowerCase().includes(preguntaLower) || 
          r.destino?.toLowerCase().includes(preguntaLower) ||
          r.origen?.toLowerCase().includes(preguntaLower)
        );

        if (rutaEncontrada) {
          return `MoviBot (Modo Local): Para tu solicitud, te recomiendo la ruta **${rutaEncontrada.nombre}** (Origen: ${rutaEncontrada.origen} ➔ Destino: ${rutaEncontrada.destino}).`;
        }

        return `MoviBot: En este momento la IA de Google está con alta demanda, pero en nuestras rutas registradas en Supabase tenemos opciones principales como San Mateo y Ciudad Verde. ¡Inténtalo de nuevo en un momento!`;
      }

      return data.candidates[0].content.parts[0].text;

    } catch (error: any) {
      console.error("Error en MoviBot:", error);
      return "MoviBot: Ocurrió un error de red al procesar tu consulta.";
    }
  }
}