// Constantes de dominio compartidas por los paneles.

export type Canal = 'salon' | 'delivery' | 'recojo'
export type EstadoPago = 'pendiente' | 'por_verificar' | 'pagado' | 'contra_entrega'
export type MetodoPago = 'efectivo' | 'yape' | 'plin'

export const CANAL_LABEL: Record<string, string> = {
  salon: 'En el local',
  delivery: 'Delivery',
  recojo: 'Recojo',
}

export const CANAL_CLASS: Record<string, string> = {
  salon: 'canal-salon',
  delivery: 'canal-delivery',
  recojo: 'canal-recojo',
}

export const PAGO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  por_verificar: 'Por verificar',
  pagado: 'Pagado',
  contra_entrega: 'Contra entrega',
}

export const PAGO_CLASS: Record<string, string> = {
  pendiente: 'pago-pendiente',
  por_verificar: 'pago-porverificar',
  pagado: 'pago-pagado',
  contra_entrega: 'pago-contraentrega',
}

export const METODOS_PAGO: MetodoPago[] = ['efectivo', 'yape', 'plin']

export const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
}

// Línea de tiempo del pedido del cliente.
export const ESTADOS_PEDIDO = [
  { key: 'pendiente', label: 'Recibido', icon: '📥' },
  { key: 'en_preparacion', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'listo', label: 'Listo', icon: '✅' },
  { key: 'en_camino', label: 'En camino', icon: '🛵' },
  { key: 'entregado', label: 'Entregado', icon: '🎉' },
] as const

/** Tono (semántico) según minutos transcurridos desde la creación. */
export function tonoPorTiempo(minutos: number): 'ok' | 'warn' | 'late' {
  if (minutos >= 20) return 'late'
  if (minutos >= 10) return 'warn'
  return 'ok'
}

/**
 * Etiqueta de mesas de un pedido, incluyendo mesas unidas.
 * Ej: "Mesa 1" o "Mesa 1+2". null si el pedido no tiene mesa.
 */
export function etiquetaMesas(pedido: any): string | null {
  if (!pedido) return null
  const nums = new Set<number>()
  if (pedido.mesas?.numero) nums.add(pedido.mesas.numero)
  for (const pm of pedido.pedido_mesas || []) {
    const n = pm?.mesas?.numero
    if (n) nums.add(n)
  }
  if (nums.size === 0) return null
  return 'Mesa ' + [...nums].sort((a, b) => a - b).join('+')
}
