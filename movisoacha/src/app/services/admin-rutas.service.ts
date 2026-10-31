import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AdminRutasService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient('https://dhsqbbwdsrgndvjoktdl.supabase.co', 'sb_publishable_QqmiDqYUbsrKLW7AIK-ANg_H4OjOFCE');
  }

  async obtenerRutas() {
    const { data, error } = await this.supabase
      .from('ruta')
      .select(`
        *,
        transporte:ruta_transporte(
          transporte(*)
        ),
        ruta_parada(
          orden,
          parada(*)
        )
      `)
      .order('id_ruta', { ascending: false });

    if (error) throw error;

    return data.map((r: any) => {
      let transporteObj = r.transporte && r.transporte.length > 0 ? r.transporte[0].transporte : null;

      if (transporteObj) {
        const camposImagenes = ['letrero_url', 'frente_url', 'atras_url', 'ladoderecho_url', 'ladoizquierdo_url'];
        
        camposImagenes.forEach(campo => {
          if (transporteObj[campo] && !transporteObj[campo].startsWith('http')) {
            const { data: publicUrlData } = this.supabase.storage
              .from('buses-imagenes')
              .getPublicUrl(transporteObj[campo]);
            transporteObj[campo] = publicUrlData.publicUrl;
          }
        });
      }

      const paradasOrdenadas = (r.ruta_parada || []).sort((a: any, b: any) => a.orden - b.orden);

      return {
        ...r,
        transporte: transporteObj,
        ruta_parada: paradasOrdenadas
      };
    });
  }

  async obtenerParadasGlobales() {
    const { data, error } = await this.supabase
      .from('parada')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async crearParada(nombreParada: string) {
    const { data, error } = await this.supabase
      .from('parada')
      .insert([{ nombre: nombreParada }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async subirImagenBucket(file: any): Promise<string> {
    const fileName = `transporte/${Date.now()}_${file.name}`;
    const { error: uploadError } = await this.supabase.storage
      .from('buses-imagenes')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    return fileName;
  }

  async eliminarRuta(id_ruta: number) {
    const { error } = await this.supabase.from('ruta').delete().eq('id_ruta', id_ruta);
    if (error) throw error;
  }

  async crearRutaCompleta(datosRuta: any, datosTransporte: any, archivosImagenes: any, idsParadas: number[]) {
    const tiposImagenes = ['letrero_url', 'frente_url', 'atras_url', 'ladoderecho_url', 'ladoizquierdo_url'];

    for (const tipo of tiposImagenes) {
      if (archivosImagenes[tipo]) {
        datosTransporte[tipo] = await this.subirImagenBucket(archivosImagenes[tipo]);
      }
    }

    const { data: transpData, error: transpError } = await this.supabase
      .from('transporte')
      .insert([datosTransporte])
      .select()
      .single();

    if (transpError) throw transpError;
    const id_transporte = transpData.id_transporte;

    const { data: rutaData, error: rutaError } = await this.supabase
      .from('ruta')
      .insert([datosRuta])
      .select()
      .single();

    if (rutaError) throw rutaError;
    const id_ruta = rutaData.id_ruta;

    await this.supabase
      .from('ruta_transporte')
      .insert([{ id_ruta, id_transporte }]);

    if (idsParadas && idsParadas.length > 0) {
      const paradasInserts = idsParadas.map((id_parada, index) => ({
        id_ruta,
        id_parada,
        orden: index + 1
      }));
      await this.supabase.from('ruta_parada').insert(paradasInserts);
    }
  }

  async actualizarRutaCompleta(id_ruta: number, id_transporte: number | null, datosRuta: any, datosTransporte: any, archivosImagenes: any, idsParadas: number[]) {
    const tiposImagenes = ['letrero_url', 'frente_url', 'atras_url', 'ladoderecho_url', 'ladoizquierdo_url'];

    for (const tipo of tiposImagenes) {
      if (archivosImagenes[tipo]) {
        datosTransporte[tipo] = await this.subirImagenBucket(archivosImagenes[tipo]);
      }
    }

    const { error: rutaError } = await this.supabase
      .from('ruta')
      .update(datosRuta)
      .eq('id_ruta', id_ruta);

    if (rutaError) throw rutaError;

    if (id_transporte) {
      await this.supabase
        .from('transporte')
        .update(datosTransporte)
        .eq('id_transporte', id_transporte);
    } else {
      const { data: nuevoTransp, error: tError } = await this.supabase
        .from('transporte')
        .insert([datosTransporte])
        .select()
        .single();
      if (!tError && nuevoTransp) {
        await this.supabase
          .from('ruta_transporte')
          .insert([{ id_ruta, id_transporte: nuevoTransp.id_transporte }]);
      }
    }

    await this.supabase.from('ruta_parada').delete().eq('id_ruta', id_ruta);

    if (idsParadas && idsParadas.length > 0) {
      const paradasInserts = idsParadas.map((id_parada, index) => ({
        id_ruta,
        id_parada,
        orden: index + 1
      }));
      await this.supabase.from('ruta_parada').insert(paradasInserts);
    }
  }
}