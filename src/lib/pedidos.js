import { supabase } from '../lib/supabaseClient'

/**
 * Crea un pedido via RPC (funcion de Supabase).
 * Se encarga de numero de orden, descuento de stock y calculo de total.
 */
export async function crearPedido({
  mesaId,
  metodoPago,
  paraLlevar = false,
  notas = '',
  items, // [{ plato_id, cantidad }]
}) {
  const { data, error } = await supabase.rpc('crear_pedido', {
    p_mesa_id: mesaId,
    p_metodo_pago: metodoPago,
    p_para_llevar: paraLlevar,
    p_notas: notas || null,
    p_items: items,
  })
  if (error) throw error
  return data
}

/** Lista los platos activos con su stock. */
export async function listarPlatos() {
  const { data, error } = await supabase
    .from('platos')
    .select('*')
    .eq('activo', true)
    .order('categoria')
    .order('nombre')
  if (error) throw error
  return data
}

/** Lista las mesas. */
export async function listarMesas() {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('numero')
  if (error) throw error
  return data
}

/** Lista los pedidos del dia (cocina/admin). */
export async function listarPedidosDelDia() {
  const hoy = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*), mesas(numero)')
    .eq('dia', hoy)
    .order('numero_orden', { ascending: true })
  if (error) throw error
  return data
}

/** Obtiene ventas del dia (solo admin). */
export async function ventasDelDia(dia) {
  const { data, error } = await supabase.rpc('ventas_del_dia', {
    p_dia: dia || new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
  return data
}

/** Actualiza el stock de un plato (cocina/admin). */
export async function actualizarStock(platoId, stock, stockDisponible) {
  const { error } = await supabase
    .from('platos')
    .update({ stock, stock_disponible: stockDisponible })
    .eq('id', platoId)
  if (error) throw error
}

/** Actualiza el estado de un pedido (cocina/admin). */
export async function actualizarEstadoPedido(pedidoId, estado) {
  const { error } = await supabase
    .from('pedidos')
    .update({ estado })
    .eq('id', pedidoId)
  if (error) throw error
}

/** Actualiza el estado de un item del pedido (cocina). */
export async function actualizarEstadoItem(itemId, estado) {
  const { error } = await supabase
    .from('pedido_items')
    .update({ estado })
    .eq('id', itemId)
  if (error) throw error
}

/** Crea una reserva. */
export async function crearReserva({ nombre, telefono, mesaId, fecha, hora, personas }) {
  const { data, error } = await supabase
    .from('reservas')
    .insert({
      nombre_cliente: nombre,
      telefono: telefono || null,
      mesa_id: mesaId,
      fecha,
      hora,
      personas,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Lista reservas (admin). */
export async function listarReservas() {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
  if (error) throw error
  return data
}
// ===== Pedidos de clientes: gestion =====

/** Verifica/actualiza el pago de un pedido (solo admin). */
export async function verificarPagoPedido(pedidoId, estado, referencia) {
  const { error } = await supabase.rpc('verificar_pago', {
    p_pedido_id: pedidoId,
    p_estado: estado,
    p_referencia: referencia || null,
  })
  if (error) throw error
}

/** Registra el cobro de un pedido (repartidor/admin). */
export async function registrarCobroPedido(pedidoId, monto, metodo) {
  const { error } = await supabase.rpc('registrar_cobro', {
    p_pedido_id: pedidoId,
    p_monto: monto,
    p_metodo: metodo,
  })
  if (error) throw error
}

/** Cancela un pedido y devuelve stock (admin/cocina). */
export async function cancelarPedido(pedidoId) {
  const { error } = await supabase.rpc('cancelar_pedido', { p_pedido_id: pedidoId })
  if (error) throw error
}

/** Lee toda la configuracion (admin/local). */
export async function obtenerConfiguracion() {
  const { data, error } = await supabase.from('configuracion').select('clave, valor')
  if (error) throw error
  const map = {}
  for (const row of data) map[row.clave] = row.valor
  return map
}

/** Actualiza una clave de configuracion (solo admin). */
export async function actualizarConfig(clave, valor) {
  const { error } = await supabase.from('configuracion').upsert(
    { clave, valor, actualizado_en: new Date().toISOString() },
    { onConflict: 'clave' },
  )
  if (error) throw error
}

/** Reporte de ventas por rango de fechas (solo admin). */
export async function ventasRango(desde, hasta) {
  const { data, error } = await supabase.rpc('ventas_rango', {
    p_desde: desde,
    p_hasta: hasta,
  })
  if (error) throw error
  return data
}

/** Lista TODOS los pedidos de un dia (admin; incluye cancelados). */
export async function listarPedidosDiaAdmin(dia) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*), mesas(numero)')
    .eq('dia', dia)
    .order('numero_orden', { ascending: true })
  if (error) throw error
  return data
}

// ===== Editor de menu (admin) =====
export async function listarPlatosTodos() {
  const { data, error } = await supabase
    .from('platos')
    .select('*')
    .order('categoria')
    .order('nombre')
  if (error) throw error
  return data
}

export async function crearPlato(plato) {
  const { data, error } = await supabase.from('platos').insert(plato).select().single()
  if (error) throw error
  return data
}

export async function actualizarPlato(id, cambios) {
  const { error } = await supabase.from('platos').update(cambios).eq('id', id)
  if (error) throw error
}

export async function subirImagenPlato(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('platos').upload(nombre, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('platos').getPublicUrl(nombre)
  return data.publicUrl
}

// ===== Cobro de mesa (mesera/admin) =====
export async function cobrarMesa(pedidoId, metodo, monto) {
  const { error } = await supabase.rpc('cobrar_mesa', {
    p_pedido_id: pedidoId,
    p_metodo: metodo,
    p_monto: monto,
  })
  if (error) throw error
}

// ===== Editar pedido (solo admin) =====
export async function editarPedido(pedidoId, datos) {
  const { error } = await supabase.rpc('editar_pedido', {
    p_pedido_id: pedidoId,
    p_items: datos.items,
    p_metodo_pago: datos.metodoPago ?? null,
    p_estado: datos.estado,
    p_estado_pago: datos.estadoPago,
    p_ajuste: datos.ajuste ?? 0,
    p_ajuste_nota: datos.ajusteNota ?? null,
    p_monto_cobrado: datos.montoCobrado ?? null,
    p_notas: datos.notas ?? null,
  })
  if (error) throw error
}
