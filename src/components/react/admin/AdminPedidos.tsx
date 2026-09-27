import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Pencil, FileText, Ban, CircleDollarSign } from 'lucide-react'
import { cancelarPedido, listarPedidosDiaAdmin, verificarPagoPedido } from '../../../lib/pedidos.ts'
import { CANAL_LABEL, CANAL_CLASS, PAGO_LABEL, PAGO_CLASS } from '../../../lib/dominio.ts'
import { useToast } from '../ui/Toast.tsx'
import ConfirmDialog from '../ConfirmDialog.tsx'
import EditarPedido from '../EditarPedido.tsx'

export default function AdminPedidos({ fecha, setFecha, platos }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [editando, setEditando] = useState(null)
  const [cancelando, setCancelando] = useState(null)
  const [cancelandoBusy, setCancelandoBusy] = useState(false)

  const { data: pedidos = [], isLoading, isError } = useQuery({
    queryKey: ['pedidos-admin', fecha],
    queryFn: () => listarPedidosDiaAdmin(fecha),
  })

  const porVerificar = pedidos.filter((p) => p.estado_pago === 'por_verificar' && p.estado !== 'cancelado')

  const handleVerificar = async (pedidoId, estado) => {
    try {
      await verificarPagoPedido(pedidoId, estado, null)
      queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
      toast(estado === 'pagado' ? 'Pago confirmado' : 'Pago marcado')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo'), 'error')
    }
  }

  const handleCancelar = async () => {
    setCancelandoBusy(true)
    try {
      await cancelarPedido(cancelando.id)
      queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
      toast('Pedido cancelado')
      setCancelando(null)
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo'), 'error')
    } finally {
      setCancelandoBusy(false)
    }
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="fecha-ped">Fecha</label>
        <input id="fecha-ped" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      {isLoading && <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />}
      {isError && <div className="empty" role="alert">No se pudieron cargar los pedidos. Revisa tu conexión.</div>}

      {porVerificar.length > 0 && (
        <div className="verificar-block">
          <div className="verificar-title"><CircleDollarSign style={{ width: 16, height: 16 }} /> Pagos por verificar ({porVerificar.length})</div>
          {porVerificar.map((p) => (
            <div key={p.id} className="verificar-item">
              <div>
                <div className="verificar-main">
                  <strong>#{p.numero_orden}</strong>
                  <span>{p.cliente_nombre || (p.mesas ? `Mesa ${p.mesas.numero}` : '—')}</span>
                  <span className="verificar-monto">S/ {Number(p.total).toFixed(2)}</span>
                </div>
                <div className="verificar-ref">{p.metodo_pago} · Op. {p.referencia_pago || '—'}</div>
              </div>
              <button className="btn btn-sm btn-verde" onClick={() => handleVerificar(p.id, 'pagado')}>Confirmar pago</button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && pedidos.length === 0 && <div className="empty">No hay pedidos</div>}

      {pedidos.map((p) => {
        const items = p.pedido_items || []
        return (
          <div key={p.id} className="card">
            <div className="orden-header">
              <div className="row-wrap">
                <span className="orden-numero">#{p.numero_orden}</span>
                <span className={'canal-chip ' + (CANAL_CLASS[p.canal] || 'canal-salon')}>{CANAL_LABEL[p.canal]}</span>
                <span className={'pago-chip ' + (PAGO_CLASS[p.estado_pago] || '')}>{PAGO_LABEL[p.estado_pago]}</span>
                {p.estado === 'cancelado' && <span className="pago-chip pago-cancelado">Cancelado</span>}
              </div>
              <span className="orden-tiempo">S/ {Number(p.total).toFixed(2)}</span>
            </div>

            {(p.cliente_nombre || p.mesas) && (
              <div className="text-sm muted mb-2">
                {p.mesas ? `Mesa ${p.mesas.numero}` : p.cliente_nombre} {p.cliente_telefono ? `· ${p.cliente_telefono}` : ''}
                {p.cliente_direccion ? ` · 📍 ${p.cliente_direccion}` : ''}
              </div>
            )}

            <div className="text-xs faint mb-2">
              {p.metodo_pago || 'Sin método'} · {p.referencia_pago ? `Op. ${p.referencia_pago}` : 'sin n.º op.'} · {p.estado.replace('_', ' ')}
              {Number(p.ajuste) !== 0 ? ` · ajuste S/ ${Number(p.ajuste).toFixed(2)}` : ''}
            </div>

            {items.map((it) => (
              <div key={it.id} className="item-row">
                <span>{it.cantidad}x {it.plato_nombre}</span>
              </div>
            ))}

            <div className="row-wrap mt-3">
              {p.estado_pago === 'por_verificar' && (
                <button className="btn btn-sm btn-verde" onClick={() => handleVerificar(p.id, 'pagado')}>
                  <BadgeCheck /> Confirmar pago
                </button>
              )}
              <button className="btn btn-sm btn-outline" onClick={() => setEditando(p)}><Pencil /> Editar</button>
              <button className="btn btn-sm btn-outline" onClick={() => import('../../../lib/boleta.js').then((m) => m.generarBoletaPDF(p))}><FileText /> Boleta</button>
              {p.estado !== 'cancelado' && (
                <button className="btn btn-sm btn-rojo" onClick={() => setCancelando(p)}><Ban /> Cancelar</button>
              )}
            </div>
          </div>
        )
      })}

      {editando && (
        <EditarPedido
          pedido={editando}
          platos={platos}
          onClose={() => setEditando(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
            setEditando(null)
            toast('Pedido actualizado')
          }}
        />
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
          <p className="cli-legal">Se devolverá el stock de los platos. Esta acción no se puede deshacer.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
