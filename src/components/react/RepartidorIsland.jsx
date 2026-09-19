import Proveedores from './Proveedores.jsx'
import GuardPersonal from './GuardPersonal.jsx'
import BarraPersonal from './BarraPersonal.jsx'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarEstadoPedido,
  listarPedidosDelDia,
  registrarCobroPedido,
} from '../../lib/pedidos.js'
import { useRealtime } from '../../hooks/useRealtime.js'
import { useSound } from '../../hooks/useSound.js'

const PAGO_LABEL = {
  pendiente: 'Pago pendiente',
  por_verificar: 'Pago por verificar',
  pagado: 'Pagado',
  contra_entrega: 'Cobrar contra entrega',
}

function RepartidorContenido() {
  const queryClient = useQueryClient()
  const play = useSound()
  const [toast, setToast] = useState('')
  const [cobrando, setCobrando] = useState(null)
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState('efectivo')

  const mostrarToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 2500)
  }

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-reparto'],
    queryFn: listarPedidosDelDia,
    refetchInterval: 1000 * 30,
  })

  useRealtime('pedidos', (payload) => {
    if (payload.eventType === 'INSERT') {
      play({ frecuencia: 1046, duracion: 0.15 })
      mostrarToast('Nuevo pedido de delivery ðŸ””')
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
    try {
      await registrarCobroPedido(pedidoId, Number(monto) || 0, metodo)
      await actualizarEstadoPedido(pedidoId, 'entregado')
      queryClient.invalidateQueries({ queryKey: ['pedidos-reparto'] })
      setCobrando(null)
      mostrarToast('Cobro registrado y entregado âœ“')
    } catch (e) {
      mostrarToast('Error: ' + (e.message || 'no se pudo'))
    }
  }

  const enCamino = async (pedidoId) => {
    await actualizarEstadoPedido(pedidoId, 'en_camino')
    queryClient.invalidateQueries({ queryKey: ['pedidos-reparto'] })
    mostrarToast('Pedido en camino ðŸ›µ')
  }

  return (
    <div>
      <div className="page-title">Repartidor</div>

      {deliveries.length === 0 && (
        <div className="card centered" style={{ color: '#8D6E63' }}>
          No hay pedidos de delivery pendientes
        </div>
      )}

      {deliveries.map((p) => {
        const items = p.pedido_items || []
        const listo = items.length > 0 && items.every((i) => i.estado === 'listo')
        return (
          <div key={p.id} className="card orden-card delivery">
            <div className="orden-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="orden-numero">#{p.numero_orden}</span>
                <span className="canal-chip canal-delivery">Delivery</span>
              </div>
              <span className="orden-tiempo">{listo ? 'âœ… Listo' : p.estado.replace('_', ' ')}</span>
            </div>

            <div className="orden-cliente">
              <div><strong>{p.cliente_nombre}</strong> Â· {p.cliente_telefono}</div>
              {p.cliente_direccion && <div>ðŸ“ {p.cliente_direccion}</div>}
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
                  <label>Monto cobrado</label>
                  <input type="number" step="0.10" value={monto} onChange={(e) => setMonto(e.target.value)} />
                </div>
                <div className="pago-grid">
                  {['efectivo', 'yape', 'plin'].map((m) => (
                    <button key={m} className={'pago-option' + (metodo === m ? ' selected' : '')} onClick={() => setMetodo(m)}>
                      {m}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-sm btn-verde" onClick={() => confirmarCobro(p.id)}>Confirmar cobro y entrega</button>
                  <button className="btn btn-sm btn-outline" onClick={() => setCobrando(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {listo && p.estado !== 'en_camino' && (
                  <button className="btn btn-sm btn-naranja" onClick={() => enCamino(p.id)}>En camino ðŸ›µ</button>
                )}
                <button className="btn btn-sm btn-verde" onClick={() => abrirCobro(p)}>
                  Cobrar y entregar
                </button>
              </div>
            )}
          </div>
        )
      })}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default function RepartidorIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['repartidor', 'admin']}>
        <BarraPersonal>
          <RepartidorContenido />
        </BarraPersonal>
      </GuardPersonal>
    </Proveedores>
  )
}
