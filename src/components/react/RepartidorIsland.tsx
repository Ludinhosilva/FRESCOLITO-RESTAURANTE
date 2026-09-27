import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import AppShell from './AppShell.tsx'
import EmptyState from './ui/EmptyState.tsx'
import { useToast } from './ui/Toast.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Truck, Phone, MapPin, WifiOff, Banknote, Bike, CheckCircle2 } from 'lucide-react'
import {
  actualizarEstadoPedido,
  listarPedidosDelDia,
  registrarCobroPedido,
} from '../../lib/pedidos.ts'
import { useRealtime } from '../../hooks/useRealtime.ts'
import { sonidoNuevoPedido } from '../../lib/sonido.ts'
import { PAGO_LABEL, METODOS_PAGO, METODO_LABEL } from '../../lib/dominio.ts'

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

const RAPIDOS = [10, 20, 50, 100]

function RepartidorContenido() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const online = useOnline()
  const [cobrando, setCobrando] = useState(null)
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState('efectivo')
  const [busy, setBusy] = useState(false)

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-reparto'],
    queryFn: listarPedidosDelDia,
  })

  useRealtime('pedidos', (payload) => {
    if (payload.eventType === 'INSERT') {
      sonidoNuevoPedido()
      if (navigator.vibrate) navigator.vibrate([120, 60, 120])
      toast('Nuevo pedido de delivery')
    }
    queryClient.invalidateQueries({ queryKey: ['pedidos-reparto'] })
  })

  const deliveries = useMemo(
    () => pedidos.filter((p) => p.canal === 'delivery' && !['cancelado', 'entregado'].includes(p.estado)),
    [pedidos],
  )

  const abrirCobro = (p) => {
    setCobrando(p.id)
    setMonto(Number(p.total).toFixed(2))
    setMetodo(p.metodo_pago || 'efectivo')
  }

  const confirmarCobro = async (pedidoId) => {
    const m = Number(monto)
    if (isNaN(m) || m < 0 || m > 9999) return toast('El monto debe estar entre 0 y 9999', 'error')
    setBusy(true)
    try {
      await registrarCobroPedido(pedidoId, m, metodo)
      await actualizarEstadoPedido(pedidoId, 'entregado')
      queryClient.invalidateQueries({ queryKey: ['pedidos-reparto'] })
      setCobrando(null)
      toast('Cobro registrado y entregado ✓')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const enCamino = async (pedidoId) => {
    try {
      await actualizarEstadoPedido(pedidoId, 'en_camino')
      queryClient.invalidateQueries({ queryKey: ['pedidos-reparto'] })
      toast('Pedido en camino 🛵')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error')
    }
  }

  return (
    <div>
      <div className="page-title">Repartidor</div>

      {!online && (
        <div className="chip tone-warning mb-3" role="status">
          <WifiOff /> Sin conexión — los cambios pueden fallar
        </div>
      )}

      {isLoading && <div className="skeleton" style={{ height: 120 }} />}

      {!isLoading && deliveries.length === 0 && (
        <EmptyState icon={Truck} title="Sin entregas pendientes" sub="Aquí aparecerán los pedidos de delivery." />
      )}

      {deliveries.map((p) => {
        const items = p.pedido_items || []
        const listo = items.length > 0 && items.every((i) => i.estado === 'listo')
        return (
          <div key={p.id} className="orden-card delivery">
            <div className="orden-header">
              <div className="row-wrap">
                <span className="orden-numero">#{p.numero_orden}</span>
                <span className="canal-chip canal-delivery">Delivery</span>
                {listo
                  ? <span className="chip tone-success"><CheckCircle2 /> Listo</span>
                  : <span className="chip tone-warning">Cocina preparando</span>}
              </div>
              <span className="orden-tiempo">{p.estado.replace('_', ' ')}</span>
            </div>

            <div className="orden-cliente">
              <div className="row-wrap">
                <strong>{p.cliente_nombre}</strong>
              </div>
              {p.cliente_direccion && <div className="mt-1"><MapPin style={{ width: 14, height: 14, verticalAlign: '-2px' }} /> {p.cliente_direccion}</div>}
              <div className="row mt-2">
                <a className="btn btn-sm btn-outline" href={`tel:${p.cliente_telefono}`}><Phone /> Llamar</a>
                <a className="btn btn-sm btn-verde" href={`https://wa.me/${(p.cliente_telefono || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            </div>

            {items.map((it) => (
              <div key={it.id} className="item-row">
                <span>{it.cantidad}x {it.plato_nombre}</span>
              </div>
            ))}

            <div className="total-row final">
              <span>{PAGO_LABEL[p.estado_pago] || 'Total'}</span>
              <span>S/ {Number(p.total).toFixed(2)}</span>
            </div>

            {cobrando === p.id ? (
              <div className="cobro-box">
                <div className="field">
                  <label>Monto cobrado (S/)</label>
                  <input type="number" min="0" max="9999" step="0.10" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} />
                </div>
                <div className="row-wrap mb-2">
                  {RAPIDOS.map((r) => (
                    <button key={r} className="filtro-chip" onClick={() => setMonto(String(r))}>S/ {r}</button>
                  ))}
                  <button className="filtro-chip" onClick={() => setMonto(Number(p.total).toFixed(2))}>Exacto</button>
                </div>
                <div className="pago-grid">
                  {METODOS_PAGO.map((m) => (
                    <button key={m} className={'pago-option' + (metodo === m ? ' selected' : '')} onClick={() => setMetodo(m)}>
                      {METODO_LABEL[m]}
                    </button>
                  ))}
                </div>
                <div className="row mt-3">
                  <button className="btn btn-verde grow" onClick={() => confirmarCobro(p.id)} disabled={busy}>
                    <Banknote /> {busy ? 'Procesando...' : 'Confirmar cobro y entrega'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setCobrando(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="row-wrap mt-3">
                {p.estado !== 'en_camino' && (
                  <button className="btn btn-sm btn-naranja" onClick={() => enCamino(p.id)}>
                    <Bike /> En camino
                  </button>
                )}
                <button className="btn btn-sm btn-verde grow" onClick={() => abrirCobro(p)}>
                  <Banknote /> Cobrar y entregar
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RepartidorIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['repartidor', 'admin']}>
        <AppShell>
          <RepartidorContenido />
        </AppShell>
      </GuardPersonal>
    </Proveedores>
  )
}
