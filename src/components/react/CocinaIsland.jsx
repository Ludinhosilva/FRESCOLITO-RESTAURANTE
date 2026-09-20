import Proveedores from './Proveedores.jsx'
import GuardPersonal from './GuardPersonal.jsx'
import BarraPersonal from './BarraPersonal.jsx'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEstadoItem,
  actualizarEstadoPedido,
  actualizarStock,
  listarPedidosDelDia,
  listarPlatos,
} from '../../lib/pedidos.js'
import { useRealtime } from '../../hooks/useRealtime.js'
import { sonidoNuevoPedido } from '../../lib/sonido.js'

function tiempoDesde(iso) {
  const seg = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seg < 60) return `${seg}s`
  const min = Math.floor(seg / 60)
  if (min < 60) return `${min}min`
  return `${Math.floor(min / 60)}h`
}

const CANAL_LABEL = { salon: 'Salón', delivery: 'Delivery', recojo: 'Recojo' }
const CANAL_CLASS = { salon: 'canal-salon', delivery: 'canal-delivery', recojo: 'canal-recojo' }

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'salon', label: 'Salón' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'recojo', label: 'Recojo' },
]

function CocinaContenido() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('pedidos')
  const [filtro, setFiltro] = useState('todos')
  const [toast, setToast] = useState('')

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-hoy'],
    queryFn: listarPedidosDelDia,
    refetchInterval: 1000 * 30,
  })
  const { data: platos = [] } = useQuery({
    queryKey: ['platos-cocina'],
    queryFn: listarPlatos,
  })

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useRealtime('pedidos', (payload) => {
    if (payload.eventType === 'INSERT') {
      sonidoNuevoPedido()
      mostrarToast('Nuevo pedido recibido')
    }
    queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
  })
  useRealtime('pedido_items', () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
  })
  useRealtime('platos', () => {
    queryClient.invalidateQueries({ queryKey: ['platos-cocina'] })
  })

  const activos = useMemo(() => {
    const base = pedidos.filter((p) => !['cancelado', 'entregado'].includes(p.estado))
    return filtro === 'todos' ? base : base.filter((p) => p.canal === filtro)
  }, [pedidos, filtro])

  const handleEstadoItem = async (itemId, estado) => {
    await actualizarEstadoItem(itemId, estado)
    queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
  }

  const handleEstadoPedido = async (pedidoId, estado) => {
    await actualizarEstadoPedido(pedidoId, estado)
    queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
  }

  const handleStock = async (platoId, valor) => {
    const stock = Math.max(0, Number(valor) || 0)
    await actualizarStock(platoId, stock, stock > 0)
    queryClient.invalidateQueries({ queryKey: ['platos-cocina'] })
    mostrarToast('Stock actualizado')
  }

  const porCategoria = useMemo(() => {
    const map = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const todasListas = (items) => items.length > 0 && items.every((i) => i.estado === 'listo')

  return (
    <div>
      <div className="page-title">Cocina</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={'btn' + (tab === 'pedidos' ? '' : ' btn-outline')} onClick={() => setTab('pedidos')}>
          Pedidos ({activos.length})
        </button>
        <button className={'btn' + (tab === 'stock' ? '' : ' btn-outline')} onClick={() => setTab('stock')}>
          Stock
        </button>
      </div>

      {tab === 'pedidos' && (
        <div>
          <div className="filtros-canal">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                className={'filtro-chip' + (filtro === f.id ? ' active' : '')}
                onClick={() => setFiltro(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activos.length === 0 && (
            <div className="card centered" style={{ color: '#8D6E63' }}>
              No hay pedidos pendientes
            </div>
          )}

          {activos.map((pedido) => {
            const items = pedido.pedido_items || []
            const listo = todasListas(items)
            const esDelivery = pedido.canal === 'delivery'
            return (
              <div key={pedido.id} className={'card orden-card ' + (listo ? 'listo' : pedido.estado)}>
                <div className="orden-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="orden-numero">#{pedido.numero_orden}</span>
                    <span className={'canal-chip ' + (CANAL_CLASS[pedido.canal] || 'canal-salon')}>
                      {CANAL_LABEL[pedido.canal] || 'Salón'}
                    </span>
                    {pedido.mesas && <span style={{ fontWeight: 700 }}>Mesa {pedido.mesas.numero}</span>}
                  </div>
                  <span className="orden-tiempo">{tiempoDesde(pedido.creado_en)}</span>
                </div>

                {(esDelivery || pedido.canal === 'recojo') && (
                  <div className="orden-cliente">
                    <div><strong>{pedido.cliente_nombre}</strong> · {pedido.cliente_telefono}</div>
                    {esDelivery && pedido.cliente_direccion && <div>📍 {pedido.cliente_direccion}</div>}
                  </div>
                )}

                {pedido.notas ? (
                  <div style={{ fontSize: 12, color: '#8D6E63', marginBottom: 8 }}>Nota: {pedido.notas}</div>
                ) : null}

                {items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div>
                      <span style={{ fontWeight: 700 }}>{item.cantidad}x</span> {item.plato_nombre}
                    </div>
                    {item.estado === 'listo' ? (
                      <span className="estado-chip chip-list">Listo</span>
                    ) : (
                      <button className="btn btn-sm btn-naranja" onClick={() => handleEstadoItem(item.id, 'listo')}>
                        Marcar listo
                      </button>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {listo ? (
                    esDelivery ? (
                      <span className="orden-espera-reparto">✅ Listo — esperando repartidor</span>
                    ) : (
                      <button
                        className="btn btn-sm btn-verde btn-block"
                        onClick={() => handleEstadoPedido(pedido.id, 'entregado')}
                      >
                        Entregado ✓
                      </button>
                    )
                  ) : (
                    <button
                      className="btn btn-sm btn-outline btn-block"
                      onClick={() =>
                        handleEstadoPedido(
                          pedido.id,
                          pedido.estado === 'en_preparacion' ? 'pendiente' : 'en_preparacion',
                        )
                      }
                    >
                      {pedido.estado === 'en_preparacion' ? 'En preparación' : 'Iniciar preparación'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'stock' && (
        <div>
          {Object.entries(porCategoria).map(([categoria, lista]) => (
            <div key={categoria}>
              <div className="seccion-title">{categoria}</div>
              <div className="card">
                {lista.map((p) => (
                  <div key={p.id} className="item-row">
                    <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                    <div className="stock-control">
                      <span className={'plato-stock' + (p.stock <= 0 ? ' sin' : '')}>
                        {p.stock <= 0 ? 'Sin stock' : `${p.stock}`}
                      </span>
                      <input
                        className="stock-input"
                        type="number"
                        min="0"
                        value={p.stock}
                        onChange={(e) => handleStock(p.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
export default function CocinaIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['cocina', 'admin']}>
        <BarraPersonal>
          <CocinaContenido />
        </BarraPersonal>
      </GuardPersonal>
    </Proveedores>
  )
}
