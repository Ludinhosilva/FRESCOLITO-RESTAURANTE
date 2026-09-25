import { useMemo, useState } from 'react'
import { editarPedido } from '../../lib/pedidos.js'

const METODOS = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'yape', label: 'Yape' },
  { id: 'plin', label: 'Plin' },
]
const ESTADOS = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'en_preparacion', label: 'En preparación' },
  { id: 'listo', label: 'Listo' },
  { id: 'en_camino', label: 'En camino' },
  { id: 'entregado', label: 'Entregado' },
  { id: 'cancelado', label: 'Cancelado' },
]
const ESTADOS_PAGO = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'por_verificar', label: 'Por verificar' },
  { id: 'pagado', label: 'Pagado' },
  { id: 'contra_entrega', label: 'Contra entrega' },
]

export default function EditarPedido({ pedido, platos, onClose, onSaved }) {
  const [items, setItems] = useState(() =>
    (pedido.pedido_items || []).map((i) => ({
      plato_id: i.plato_id,
      cantidad: i.cantidad,
      plato_nombre: i.plato_nombre,
      precio: Number(i.precio_unitario),
    })),
  )
  const [metodo, setMetodo] = useState(pedido.metodo_pago || 'efectivo')
  const [estado, setEstado] = useState(pedido.estado)
  const [estadoPago, setEstadoPago] = useState(pedido.estado_pago)
  const [ajuste, setAjuste] = useState(String(pedido.ajuste ?? 0))
  const [ajusteNota, setAjusteNota] = useState(pedido.ajuste_nota || '')
  const [montoCobrado, setMontoCobrado] = useState(String(pedido.monto_cobrado ?? ''))
  const [notas, setNotas] = useState(pedido.notas || '')
  const [nuevoPlato, setNuevoPlato] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [err, setErr] = useState('')

  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0)
  const unidades = items.reduce((a, i) => a + i.cantidad, 0)
  const cargoEnvases = pedido.canal === 'recojo' ? unidades * 1 : 0
  const costoDelivery = pedido.canal === 'delivery' ? unidades * 2 : 0
  const total = subtotal + cargoEnvases + costoDelivery + (Number(ajuste) || 0)

  const totalItems = useMemo(() => items.length, [items])

  const setCantidad = (platoId, cantidad) => {
    const c = Math.max(1, Math.min(99, cantidad))
    setItems((prev) => prev.map((i) => (i.plato_id === platoId ? { ...i, cantidad: c } : i)))
  }
  const quitar = (platoId) => setItems((prev) => prev.filter((i) => i.plato_id !== platoId))
  const agregar = () => {
    const p = platos.find((x) => String(x.id) === String(nuevoPlato))
    if (!p) return
    if (items.some((i) => i.plato_id === p.id)) return
    setItems((prev) => [...prev, { plato_id: p.id, cantidad: 1, plato_nombre: p.nombre, precio: Number(p.precio) }])
    setNuevoPlato('')
  }

  const guardar = async () => {
    setErr('')
    if (items.length === 0) return setErr('El pedido debe tener al menos un plato')
    if (!items.every((i) => i.cantidad > 0 && i.cantidad <= 99)) return setErr('Las cantidades deben estar entre 1 y 99')
    const aj = Number(ajuste) || 0
    if (aj < -999 || aj > 999) return setErr('El ajuste debe estar entre -999 y 999')
    if (montoCobrado !== '' && (Number(montoCobrado) < 0 || Number(montoCobrado) > 9999)) {
      return setErr('El monto cobrado debe estar entre 0 y 9999')
    }
    setGuardando(true)
    try {
      await editarPedido(pedido.id, {
        items: items.map((i) => ({ plato_id: i.plato_id, cantidad: i.cantidad })),
        metodoPago: metodo,
        estado,
        estadoPago,
        ajuste: Number(ajuste) || 0,
        ajusteNota,
        montoCobrado: montoCobrado === '' ? null : Number(montoCobrado),
        notas,
      })
      onSaved()
    } catch (e) {
      setErr(e.message || 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="pedir-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pedir-panel">
        <div className="pedir-head">
          <strong>Editar pedido #{pedido.numero_orden}</strong>
          <button className="pedir-close" onClick={onClose}>✕</button>
        </div>

        <div className="pedir-body">
          <div className="seccion-title">Platos</div>
          {items.map((i) => (
            <div key={i.plato_id} className="cli-item">
              <div>
                <div className="cli-item-nombre">{i.plato_nombre}</div>
                <div className="cli-item-precio">S/ {i.precio.toFixed(2)}</div>
              </div>
              <div className="cant-controller">
                <button className="cant-btn" onClick={() => setCantidad(i.plato_id, i.cantidad - 1)}>−</button>
                <span className="cli-item-cant">{i.cantidad}</span>
                <button className="cant-btn" onClick={() => setCantidad(i.plato_id, i.cantidad + 1)} disabled={i.cantidad >= 99}>+</button>
                <button className="cli-item-quitar" onClick={() => quitar(i.plato_id)}>✕</button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <select value={nuevoPlato} onChange={(e) => setNuevoPlato(e.target.value)} className="field" style={{ flex: 1, padding: 12, border: '1px solid #EADFD0', borderRadius: 10 }}>
              <option value="">Agregar plato...</option>
              {platos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} — S/ {Number(p.precio).toFixed(2)}</option>
              ))}
            </select>
            <button className="btn btn-sm" onClick={agregar} disabled={!nuevoPlato}>Agregar</button>
          </div>

          <div className="seccion-title">Pago y estado</div>
          <div className="field">
            <label>Método de pago</label>
            <div className="pago-grid">
              {METODOS.map((m) => (
                <button key={m.id} className={'pago-option' + (metodo === m.id ? ' selected' : '')} onClick={() => setMetodo(m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado de pago</label>
              <select value={estadoPago} onChange={(e) => setEstadoPago(e.target.value)}>
                {ESTADOS_PAGO.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Ajuste / descuento (S/, usa − para descontar)</label>
              <input type="number" min="-999" max="999" step="0.10" inputMode="decimal" value={ajuste} onChange={(e) => setAjuste(e.target.value)} />
            </div>
            <div className="field">
              <label>Monto cobrado (S/)</label>
              <input type="number" min="0" max="9999" step="0.10" inputMode="decimal" value={montoCobrado} onChange={(e) => setMontoCobrado(e.target.value)} placeholder="—" />
            </div>
          </div>
          <div className="field">
            <label>Motivo del ajuste (opcional)</label>
            <input value={ajusteNota} onChange={(e) => setAjusteNota(e.target.value)} placeholder="Ej: descuento, error de cobro..." />
          </div>
          <div className="field">
            <label>Notas</label>
            <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>

          <div className="card" style={{ marginTop: 8 }}>
            <div className="total-row"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
            {cargoEnvases > 0 && <div className="total-row"><span>Envases ({unidades})</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
            {costoDelivery > 0 && <div className="total-row"><span>Delivery ({unidades})</span><span>S/ {costoDelivery.toFixed(2)}</span></div>}
            <div className="total-row"><span>Ajuste</span><span>S/ {(Number(ajuste) || 0).toFixed(2)}</span></div>
            <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
          </div>

          {err && <p className="error-text" style={{ marginTop: 10 }}>{err}</p>}
        </div>

        <div className="pedir-foot">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-verde" onClick={guardar} disabled={guardando || totalItems === 0}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
