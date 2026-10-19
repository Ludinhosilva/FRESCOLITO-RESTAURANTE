import { supabase } from './supabaseClient'

export type Promocion = {
  id: number
  titulo: string
  descripcion?: string | null
  imagen?: string | null
  badge?: string | null
  precio_oferta?: string | null
  precio_regular?: string | null
  enlace?: string | null
  cta_label?: string | null
  fecha_fin?: string | null
  activo: boolean
  orden: number
}

// La tabla promociones aun no esta en database.types.ts.
const db = supabase as any

/** Lista las promociones activas (ordenadas) para el inicio. */
export async function listarPromociones() {
  const { data, error } = await db
    .from('promociones')
    .select('*')
    .eq('activo', true)
    .order('orden')
    .order('creado_en')
  if (error) throw error
  return data as Promocion[]
}

/** Lista todas las promociones (incluye inactivas) para el admin. */
export async function listarPromocionesAdmin() {
  const { data, error } = await db
    .from('promociones')
    .select('*')
    .order('orden')
    .order('creado_en')
  if (error) throw error
  return data as Promocion[]
}

export async function siguienteOrdenPromocion() {
  const { data } = await db
    .from('promociones')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
  return (data?.[0]?.orden ?? 0) + 1
}

export async function crearPromocion(datos: Record<string, unknown>) {
  const { data, error } = await db.from('promociones').insert(datos).select().single()
  if (error) throw error
  return data
}

export async function actualizarPromocion(id: number, cambios: Record<string, unknown>) {
  const { error } = await db.from('promociones').update(cambios).eq('id', id)
  if (error) throw error
}

export async function eliminarPromocion(id: number) {
  const { error } = await db.from('promociones').delete().eq('id', id)
  if (error) throw error
}
