// Tipos de los resultados de funciones RPC (que en la BD son `jsonb`/`Json`).

export interface PorPlato {
  plato_nombre: string
  cantidad: number
  total: number
}

export interface VentasResumen {
  dia?: string
  desde?: string
  hasta?: string
  total_vendido: number
  cobrado: number
  cuentas_abiertas: number
  num_pedidos: number
  por_metodo: Record<string, number>
  por_canal?: Record<string, number>
  por_plato: PorPlato[]
  por_mesa?: { mesa_id: number | null; pedidos: number; total: number }[]
  por_dia?: { dia: string; pedidos: number; total: number }[]
  detalle?: unknown[]
}

export interface Monitoreo {
  pedidos_mes: number
  pedidos_total: number
  items_total: number
  db_bytes: number
  db_pretty: string
  por_mes: { mes: string; pedidos: number }[]
}

export interface PedidoClienteItem {
  plato: string
  cantidad: number
  precio: number
}

export interface PedidoCliente {
  numero_orden: number
  canal: string
  estado: string
  estado_pago: string
  metodo_pago: string | null
  cliente_nombre: string | null
  cliente_telefono: string | null
  cliente_direccion: string | null
  subtotal: number
  cargo_envases: number
  costo_delivery: number
  total: number
  creado_en: string
  items: PedidoClienteItem[]
}

export interface CrearPedidoResultado {
  id: string
  codigo: string
  numero_orden: number
  subtotal: number
  cargo_envases: number
  costo_delivery: number
  total: number
}

