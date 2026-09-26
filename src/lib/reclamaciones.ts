import { supabase } from './supabaseClient'

/** Registra un reclamo o queja en el Libro de Reclamaciones. */
export async function crearReclamacion({ nombre, dni, domicilio, telefono, email, tipo, detalle, pedido }) {
  const { error } = await supabase.from('reclamaciones').insert({
    nombre,
    dni,
    domicilio: domicilio || null,
    telefono: telefono || null,
    email,
    tipo,
    detalle,
    pedido: pedido || null,
  })
  if (error) throw error
}
