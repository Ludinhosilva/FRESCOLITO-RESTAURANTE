import { supabase } from './supabaseClient'

export type GaleriaTabla = 'galeria' | 'eventos_fotos'

// Las tablas nuevas (galeria, eventos_fotos) no estan en database.types.ts todavia.
const db = supabase as any
const storage = supabase.storage as any

// ===== Lectura publica (solo activos) =====
export async function listarGaleria() {
  const { data, error } = await db
    .from('galeria')
    .select('*')
    .eq('activo', true)
    .order('orden')
    .order('creado_en')
  if (error) throw error
  return data
}

export async function listarEventosFotos() {
  const { data, error } = await db
    .from('eventos_fotos')
    .select('*')
    .eq('activo', true)
    .order('orden')
    .order('creado_en')
  if (error) throw error
  return data
}

// ===== Lectura admin (incluye inactivos) =====
export async function listarGaleriaAdmin(tabla: GaleriaTabla) {
  const { data, error } = await db
    .from(tabla)
    .select('*')
    .order('orden')
    .order('creado_en')
  if (error) throw error
  return data
}

// ===== Optimizacion en el navegador =====
export async function optimizarImagen(file: File, { maxWidth = 1600, quality = 0.85 } = {}): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen')
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen supera los 5 MB')

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
    return blob || file
  } catch {
    return file
  }
}

// ===== Subida a Storage (admin) =====
export async function subirImagenGaleria(file: File) {
  const blob = await optimizarImagen(file)
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await storage
    .from('galeria')
    .upload(nombre, blob, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' })
  if (error) throw error
  const { data } = storage.from('galeria').getPublicUrl(nombre)
  return data.publicUrl
}

// ===== CRUD (admin) =====
export async function siguienteOrden(tabla: GaleriaTabla) {
  const { data } = await db
    .from(tabla)
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
  return (data?.[0]?.orden ?? 0) + 1
}

export async function crearFoto(tabla: GaleriaTabla, datos: Record<string, unknown>) {
  const { data, error } = await db.from(tabla).insert(datos).select().single()
  if (error) throw error
  return data
}

export async function actualizarFoto(tabla: GaleriaTabla, id: string, cambios: Record<string, unknown>) {
  const { error } = await db.from(tabla).update(cambios).eq('id', id)
  if (error) throw error
}

export async function eliminarFoto(tabla: GaleriaTabla, id: string) {
  const { error } = await db.from(tabla).delete().eq('id', id)
  if (error) throw error
}
