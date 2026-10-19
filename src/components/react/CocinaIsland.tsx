import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import AppShell from './AppShell.tsx'
import ConfirmDialog from './ConfirmDialog.tsx'
import EmptyState from './ui/EmptyState.tsx'
import { useToast } from './ui/Toast.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChefHat, Boxes, Clock, CheckCheck, Ban } from 'lucide-react'
import {
  actualizarEstadoItem,
  actualizarEstadoPedido,
  actualizarStock,
  cancelarPedido,
  listarPedidosDelDia,
  listarPlatos,
} from '../../lib/pedidos.ts'
import { useRealtime } from '../../hooks/useRealtime.ts'
import { sonidoNuevoPedido } from '../../lib/sonido.ts'
import { CANAL_LABEL, CANAL_CLASS, tonoPorTiempo, etiquetaMesas } from '../../lib/dominio.ts'

function minutosDesde(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
}
function tiempoDesde(iso) {
  const seg = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seg < 60) return `${seg}s`
  const min = Math.floor(seg / 60)
  if (min < 60) return `${min}min`
  return `${Math.floor(min / 60)}h`
}

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'salon', label: 'En el local' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'recojo', label: 'Recojo' },
]

function StockInput({ plato, onCommit }) {
  const [valor, setValor] = useState(String(plato.stock))
  const [stockRef, setStockRef] = useState(plato.stock)
  if (plato.stock !== stockRef) {
    setStockRef(plato.stock)
    setValor(String(plato.stock))
  }

  const commit = () => {
    if (String(plato.stock) !== valor) onCommit(valor)
  }

  return (
    <div className="stock-control">
      <span className={'plato-stock' + (plato.stock <= 0 ? ' sin' : '')}>
        {plato.stock <= 0 ? 'Sin stock' : `${plato.stock}`}
      </span>
      <input
        className="stock-input"
        type="number"
        min="0"
        max="99"
        step="1"
        inputMode="numeric"
        aria-label={`Stock de ${plato.nombre}`}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </div>
  )
}

function CocinaContenido() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [tab, setTab] = useState(() => (typeof window !== 'undefined' && window.location.hash === '#stock' ? 'stock' : 'pedidos'))
  const [filtro, setFiltro] = useState('todos')
  const [cancelando, setCancelando] = useState(null)
  const [cancelandoBusy, setCancelandoBusy] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const h = () => setTab(window.location.hash === '#stock' ? 'stock' : 'pedidos')
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-hoy'],
    queryFn: listarPedidosDelDia,
  })
  const { data: platos = [] } = useQuery({
    queryKey: ['platos-cocina'],
    queryFn: listarPlatos,
  })

  useRealtime('pedidos', (payload) => {
    if (payload.eventType === 'INSERT') {
      sonidoNuevoPedido()
      if (navigator.vibrate) navigator.vibrate([120, 60, 120])
      toast('Nuevo pedido recibido')
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
    const lista = filtro === 'todos' ? base : base.filter((p) => p.canal === filtro)
    return [...lista].sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime())
  }, [pedidos, filtro])

  const handleEstadoItem = async (itemId, estado) => {
    try {
      await actualizarEstadoItem(itemId, estado)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error')
    }
  }

  const handleEstadoPedido = async (pedidoId, estado) => {
    try {
      await actualizarEstadoPedido(pedidoId, estado)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error')
    }
  }

  const marcarTodoListo = async (pedido) => {
    try {
      await Promise.all((pedido.pedido_items || []).map((it) => actualizarEstadoItem(it.id, 'listo')))
      await actualizarEstadoPedido(pedido.id, 'listo')
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      toast('Pedido marcado como listo')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error')
    }
  }

  const handleCancelar = async () => {
    setCancelandoBusy(true)
    try {
      await cancelarPedido(cancelando.id)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      setCancelando(null)
      toast('Pedido cancelado')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo cancelar'), 'error')
    } finally {
      setCancelandoBusy(false)
    }
  }

  const handleStock = async (platoId, valor) => {
    const n = Number(valor)
    if (isNaN(n) || n < 0 || n > 99) {
      toast('El stock debe estar entre 0 y 99', 'error')
      return
    }
    try {
      await actualizarStock(platoId, n, n > 0)
      queryClient.invalidateQueries({ queryKey: ['platos-cocina'] })
      toast('Stock actualizado')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar el stock'), 'error')
    }
  }

  const porCategoria = useMemo(() => {
    const map: Record<string, any[]> = {}
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

      <div className="filtros-canal">
        <button className={'filtro-chip' + (tab === 'pedidos' ? ' active' : '')} onClick={() => setTab('pedidos')}>
          <ChefHat /> Pedidos ({activos.length})
        </button>
        <button className={'filtro-chip' + (tab === 'stock' ? ' active' : '')} onClick={() => setTab('stock')}>
          <Boxes /> Stock
        </button>
      </div>

      {tab === 'pedidos' && (
        <div>
          <div className="filtros-canal">
            {FILTROS.map((f) => (
              <button key={f.id} className={'filtro-chip' + (filtro === f.id ? ' active' : '')} onClick={() => setFiltro(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && <div className="skeleton" style={{ height: 120 }} />}

          {!isLoading && activos.length === 0 && (
            <EmptyState icon={ChefHat} title="Sin pedidos pendientes" sub="Aquí aparecerán los pedidos nuevos." />
          )}

          {activos.map((pedido) => {
            const items = pedido.pedido_items || []
            const listo = todasListas(items)
            const esDelivery = pedido.canal === 'delivery'
            const tone = tonoPorTiempo(minutosDesde(pedido.creado_en))
            return (
              <div key={pedido.id} className={`orden-card ${listo ? 'listo' : 'tone-' + tone}`}>
                <div className="orden-header">
                  <div className="row-wrap">
                    <span className="orden-numero">#{pedido.numero_orden}</span>
                    <span className={'canal-chip ' + (CANAL_CLASS[pedido.canal] || 'canal-salon')}>
                      {CANAL_LABEL[pedido.canal] || 'En el local'}
                    </span>
                    {etiquetaMesas(pedido) && <span style={{ fontWeight: 700 }}>{etiquetaMesas(pedido)}</span>}
                  </div>
                  <span className={'orden-tiempo tone-' + tone}>
                    <Clock /> {tiempoDesde(pedido.creado_en)}
                  </span>
                </div>

                {(esDelivery || pedido.canal === 'recojo') && (
                  <div className="orden-cliente">
                    <div><strong>{pedido.cliente_nombre}</strong> · {pedido.cliente_telefono}</div>
                    {esDelivery && pedido.cliente_direccion && <div>📍 {pedido.cliente_direccion}</div>}
                  </div>
                )}

                {pedido.notas ? <div className="text-sm muted mb-2">Nota: {pedido.notas}</div> : null}

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

                <div className="row-wrap mt-3">
                  {listo ? (
                    esDelivery ? (
                      <span className="orden-espera-reparto">✅ Listo — esperando repartidor</span>
                    ) : (
                      <button className="btn btn-sm btn-verde grow" onClick={() => handleEstadoPedido(pedido.id, 'entregado')}>
                        Entregado ✓
                      </button>
                    )
                  ) : (
                    <>
                      <button className="btn btn-sm btn-outline" onClick={() => handleEstadoPedido(pedido.id, pedido.estado === 'en_preparacion' ? 'pendiente' : 'en_preparacion')}>
                        {pedido.estado === 'en_preparacion' ? 'En preparación' : 'Iniciar preparación'}
                      </button>
                      <button className="btn btn-sm btn-dark grow" onClick={() => marcarTodoListo(pedido)}>
                        <CheckCheck /> Todo listo
                      </button>
                    </>
                  )}
                  <button className="btn btn-sm btn-rojo" onClick={() => setCancelando(pedido)}>
                    <Ban /> Cancelar
                  </button>
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
                    <StockInput plato={p} onCommit={(v) => handleStock(p.id, v)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelando && (
        <ConfirmDialog
          titulo="Cancelar pedido"
          peligro
          confirmLabel="Sí, cancelar"
          ocupado={cancelandoBusy}
          onCancel={() => setCancelando(null)}
          onConfirm={handleCancelar}
        >
          <p>¿Cancelar el pedido <strong>#{cancelando.numero_orden}</strong>?</p>
          <p className="cli-legal">Se devolverá el stock de los platos.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}

export default function CocinaIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['cocina', 'admin']}>
        <AppShell>
          <CocinaContenido />
        </AppShell>
      </GuardPersonal>
    </Proveedores>
  )
}
