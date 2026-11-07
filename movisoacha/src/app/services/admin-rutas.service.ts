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
          let rutaImagen = transporteObj[campo];
          if (rutaImagen) {
            // Si por alguna razón antigua la ruta incluye 'transporte/', lo limpiamos
            if (rutaImagen.includes('/transporte/')) {
              rutaImagen = rutaImagen.replace('/transporte/', '/');
            } else if (rutaImagen.startsWith('transporte/')) {
              rutaImagen = rutaImagen.replace('transporte/', '');
            }

            // Si es una ruta relativa, obtenemos su URL pública limpia de la raíz
            if (!rutaImagen.startsWith('http')) {
              const { data: publicUrlData } = this.supabase.storage
                .from('buses-imagenes')
                .getPublicUrl(rutaImagen);
              transporteObj[campo] = publicUrlData.publicUrl;
            } else {
              transporteObj[campo] = rutaImagen;
            }
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

  async subirImagenBucket(file: any, tipoImagen: string): Promise<string> {
    // CORREGIDO: Guardar directamente en la raíz del bucket con un nombre único limpio
    const extension = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `${tipoImagen}_${Date.now()}.${extension}`;
    
    const { error: uploadError } = await this.supabase.storage
      .from('buses-imagenes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;
    
    // Retornamos directamente la URL pública generada para asegurarnos de que se guarde limpia
    const { data: publicUrlData } = this.supabase.storage
      .from('buses-imagenes')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async eliminarRuta(id_ruta: number) {
    const { error } = await this.supabase.from('ruta').delete().eq('id_ruta', id_ruta);
    if (error) throw error;
  }

  async crearRutaCompleta(datosRuta: any, datosTransporte: any, archivosImagenes: any, idsParadas: number[]) {
    const tiposImagenes = ['letrero_url', 'frente_url', 'atras_url', 'ladoderecho_url', 'ladoizquierdo_url'];

    for (const tipo of tiposImagenes) {
      if (archivosImagenes[tipo]) {
        datosTransporte[tipo] = await this.subirImagenBucket(archivosImagenes[tipo], tipo);
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
        datosTransporte[tipo] = await this.subirImagenBucket(archivosImagenes[tipo], tipo);
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