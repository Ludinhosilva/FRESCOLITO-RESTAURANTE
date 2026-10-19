import { supabase } from './supabaseClient'

// Tabla mesas con columnas nuevas (capacidad/forma/x/y/activa) y RPC mover_items.
const db = supabase as any

export async function listarMesas() {
  const { data, error } = await db.from('mesas').select('*').order('numero')
  if (error) throw error
  return data
}

export async function crearMesa({ numero, nombre, capacidad = 4, forma = 'cuadrada', x = 20, y = 20 }) {
  const { data, error } = await db
    .from('mesas')
    .insert({ numero, nombre: nombre || `Mesa ${numero}`, capacidad, forma, x, y, activa: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarMesa(id: number, cambios: Record<string, unknown>) {
  const { error } = await db.from('mesas').update(cambios).eq('id', id)
  if (error) throw error
}

export async function eliminarMesa(id: number) {
  const { error } = await db.from('mesas').delete().eq('id', id)
  if (error) throw error
}

/** Mueve items de un pedido a una mesa destino. Devuelve el id del pedido destino. */
export async function moverItems(origen: string, mesaDestino: number, itemIds: string[]) {
  const { data, error } = await db.rpc('mover_items', {
    p_origen: origen,
    p_mesa_destino: mesaDestino,
    p_item_ids: itemIds,
  })
  if (error) throw error
  return data
}

/** Mueve (acomoda) una mesa en el plano. Mesera/admin. */
export async function moverMesa(id: number, x: number, y: number) {
  const { error } = await db.rpc('mover_mesa', { p_id: id, p_x: x, p_y: y })
  if (error) throw error
}

/** Une mesas a un pedido (una sola cuenta). Fusiona los pedidos abiertos. */
export async function unirMesas(pedidoId: string, mesaIds: number[]) {
  const { error } = await db.rpc('unir_mesas', { p_pedido_id: pedidoId, p_mesa_ids: mesaIds })
  if (error) throw error
}

/** Separa una mesa del grupo (queda libre). */
export async function separarMesa(pedidoId: string, mesaId: number) {
  const { error } = await db.rpc('separar_mesa', { p_pedido_id: pedidoId, p_mesa_id: mesaId })
  if (error) throw error
}
