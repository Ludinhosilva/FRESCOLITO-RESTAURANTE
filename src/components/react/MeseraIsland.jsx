import Proveedores from './Proveedores.jsx'
import GuardPersonal from './GuardPersonal.jsx'
import BarraPersonal from './BarraPersonal.jsx'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { crearPedido, listarMesas, listarPlatos } from '../../lib/pedidos.js'
import { useRealtime } from '../../hooks/useRealtime.js'
import { calcularTotales, construirItems } from '../../lib/carrito.js'

const METODOS = [
  { id: 'efectivo', label: 'ðŸ’µ Efectivo' },
  { id: 'yape', label: 'ðŸ“± Yape' },
  { id: 'plin', label: 'ðŸ“± Plin' },
]

function MeseraContenido() {
  const [mesa, setMesa] = useState(null)
  const [seleccion, setSeleccion] = useState({}) // plato_id -> cantidad
  const [metodo, setMetodo] = useState('efectivo')
  const [paraLlevar, setParaLlevar] = useState(false)
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const { data: platos = [] } = useQuery({ queryKey: ['platos'], queryFn: listarPlatos })
  const { data: mesas = [] } = useQuery({ queryKey: ['mesas'], queryFn: listarMesas })
  const queryClient = useQueryClient()

  // Refrescar stock en tiempo real (cocina puede cambiar stock)
  useRealtime('platos', (payload) => {
    const { eventType } = payload
    if (eventType === 'UPDATE' || eventType === 'INSERT') {
      // invalidar query para refrescar stock
      queryClient.invalidateQueries({ queryKey: ['platos'] })
    }
  })

  const porCategoria = useMemo(() => {
    const map = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const togglePlato = (plato) => {
    if (!plato.stock_disponible || plato.stock <= 0) return
    setSeleccion((prev) => {
      const next = { ...prev }
      if (next[plato.id]) delete next[plato.id]
      else next[plato.id] = 1
      return next
    })
  }

  const cambiarCantidad = (platoId, delta) => {
    setSeleccion((prev) => {
      const next = { ...prev }
      const nueva = (next[platoId] || 0) + delta
      const plato = platos.find((p) => p.id === platoId)
      if (nueva <= 0) delete next[platoId]
      else if (plato && nueva <= plato.stock) next[platoId] = nueva
      return next
    })
  }

  const itemsPedido = construirItems(seleccion, platos)

  const { subtotal, comision, total } = calcularTotales(itemsPedido, paraLlevar)

  const handleEnviar = async () => {
    if (!mesa) return setMensaje('Selecciona una mesa')
    if (itemsPedido.length === 0) return setMensaje('Agrega al menos un plato')

    setEnviando(true)
    setMensaje('')
    try {
      await crearPedido({
        mesaId: mesa,
        metodoPago: metodo,
        paraLlevar,
        notas,
        items: itemsPedido.map((i) => ({ plato_id: i.plato.id, cantidad: i.cantidad })),
      })
      setMensaje('Pedido enviado a cocina âœ…')
      setSeleccion({})
      setMesa(null)
      setParaLlevar(false)
      setNotas('')
    } catch (err) {
      setMensaje(err.message || 'No se pudo enviar el pedido')
    } finally {
      setEnviando(false)
    }
  }

  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(() => setMensaje(''), 3000)
    return () => clearTimeout(t)
  }, [mensaje])

  return (
    <div>
      <h1 className="page-title">Tomar Pedido</h1>

      <div className="card">
        <div className="card-title">Mesa</div>
        <ul className="table-list">
          {mesas.map((m) => (
            <li key={m.id}>
              <button
                className={'mesa-btn' + (mesa === m.id ? ' selected' : '')}
                onClick={() => setMesa(m.id)}
              >
                {m.numero}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {Object.entries(porCategoria).map(([categoria, lista]) => (
        <div key={categoria}>
          <div className="seccion-title">{categoria}</div>
          <div className="plato-grid">
            {lista.map((p) => (
              <button
                key={p.id}
                className={
                  'plato-item' +
                  (seleccion[p.id] ? ' selected' : '') +
                  (!p.stock_disponible || p.stock <= 0 ? ' sinstock' : '')
                }
                onClick={() => togglePlato(p)}
                disabled={!p.stock_disponible || p.stock <= 0}
              >
                <div className="plato-nombre">{p.nombre}</div>
                <div className="plato-precio">S/ {p.precio.toFixed(2)}</div>
                <div className={'plato-stock' + (p.stock <= 0 ? ' sin' : '')}>
                  {p.stock_disponible && p.stock > 0 ? `${p.stock} disp.` : 'Sin stock'}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {itemsPedido.length > 0 && (
        <div className="card">
          <div className="card-title">Pedido en curso</div>
          <ul className="pedido-lista">
            {itemsPedido.map(({ plato, cantidad }) => (
              <li key={plato.id} className="pedido-item">
                <div>
                  <div style={{ fontWeight: 700 }}>{plato.nombre}</div>
                  <div style={{ fontSize: 12, color: '#8D6E63' }}>
                    S/ {(plato.precio * cantidad).toFixed(2)}
                  </div>
                </div>
                <div className="cant-controller">
                  <button className="cant-btn" onClick={() => cambiarCantidad(plato.id, -1)}>âˆ’</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{cantidad}</span>
                  <button className="cant-btn" onClick={() => cambiarCantidad(plato.id, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-title">MÃ©todo de pago</div>
        <div className="pago-grid">
          {METODOS.map((m) => (
            <button
              key={m.id}
              className={'pago-option' + (metodo === m.id ? ' selected' : '')}
              onClick={() => setMetodo(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={paraLlevar}
            onChange={(e) => setParaLlevar(e.target.checked)}
          />
          Para llevar (+ S/ 2.00 por plato)
        </label>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Notas (opcional)</label>
          <textarea
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: sin cebolla, salsa aparte..."
          />
        </div>
      </div>

      <div className="card">
        <div className="total-row"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
        <div className="total-row"><span>ComisiÃ³n llevar</span><span>S/ {comision.toFixed(2)}</span></div>
        <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
        <button
          className="btn btn-block btn-verde"
          onClick={handleEnviar}
          disabled={enviando}
          style={{ marginTop: 12 }}
        >
          {enviando ? 'Enviando...' : 'Enviar pedido a cocina'}
        </button>
      </div>

      {mensaje && <div className="toast">{mensaje}</div>}
    </div>
  )
}

export default function MeseraIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['mesera', 'admin']}>
        <BarraPersonal>
          <MeseraContenido />
        </BarraPersonal>
      </GuardPersonal>
    </Proveedores>
  )
}
