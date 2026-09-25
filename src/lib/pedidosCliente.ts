import { supabase } from './supabaseClient'
import type { PedidoCliente, CrearPedidoResultado } from './tipos'

/** Lee la configuracion publica (horario, tarifas, pagos). */
export async function obtenerConfig() {
  const { data, error } = await supabase.from('configuracion').select('clave, valor')
  if (error) throw error
  const map: Record<string, any> = {}
  for (const row of data) map[row.clave] = row.valor
  return map
}

/** Lista los platos activos (menu publico). */
export async function listarPlatosPublico() {
  const { data, error } = await supabase
    .from('platos')
    .select('id, nombre, categoria, precio, stock, stock_disponible, incluye_refresco, descripcion, imagen')
    .eq('activo', true)
    .order('categoria')
    .order('nombre')
  if (error) throw error
  return data
}

/** Crea un pedido de cliente (invitado). */
export async function crearPedidoCliente({
  nombre,
  telefono,
  direccion,
  canal,
  metodoPago,
  notas,
  items,
}) {
  const { data, error } = await supabase.rpc('crear_pedido_cliente', {
    p_nombre: nombre,
    p_telefono: telefono,
    p_direccion: direccion || null,
    p_canal: canal,
    p_metodo_pago: metodoPago,
    p_notas: notas || null,
    p_items: items,
  })
  if (error) throw error
  return data as unknown as CrearPedidoResultado
}

/** Adjunta el N.º de operacion Yape/Plin a un pedido por su codigo. */
export async function adjuntarReferencia(codigo, referencia) {
  const { error } = await supabase.rpc('adjuntar_referencia', {
    p_codigo: codigo,
    p_referencia: referencia,
  })
  if (error) throw error
}

/** Consulta el estado de un pedido por su codigo. */
export async function consultarPedidoCliente(codigo) {
  const { data, error } = await supabase.rpc('consultar_pedido_cliente', {
    p_codigo: codigo,
  })
  if (error) throw error
  return data as unknown as PedidoCliente | null
}

export { horarioIncluye, estaAbierto } from './horario'

/** Guarda el codigo del ultimo pedido del cliente (para volver a verlo). */
const ULTIMO_KEY = 'frescolito_ultimo_pedido'
export function guardarUltimoPedido(codigo) {
  try {
    localStorage.setItem(ULTIMO_KEY, codigo)
  } catch {
    /* noop */
  }
}
export function obtenerUltimoPedido() {
  try {
    return localStorage.getItem(ULTIMO_KEY)
  } catch {
    return null
  }
}