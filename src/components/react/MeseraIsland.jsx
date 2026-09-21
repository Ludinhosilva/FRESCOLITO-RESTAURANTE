import Proveedores from './Proveedores.jsx'
import GuardPersonal from './GuardPersonal.jsx'
import BarraPersonal from './BarraPersonal.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cobrarMesa, cancelarPedido, crearPedido, listarMesas, listarPedidosDelDia, listarPlatos } from '../../lib/pedidos.js'
import { useRealtime } from '../../hooks/useRealtime.js'
import { sonidoListo } from '../../lib/sonido.js'
import ConfirmDialog from './ConfirmDialog.jsx'

const METODOS = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'yape', label: 'Yape' },
  { id: 'plin', label: 'Plin' },
]

const SECCIONES = [
  { id: 'llevar', label: 'Para llevar' },
  { id: 'salon', label: 'Salón' },
  { id: 'stock', label: 'Stock' },
]

function MeseraContenido() {
  const queryClient = useQueryClient()
  const [seccion, setSeccion] = useState('llevar')
  const [mesa, setMesa] = useState(null)
  const [seleccion, setSeleccion] = useState({})
  const [metodo, setMetodo] = useState('efectivo')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [cobrando, setCobrando] = useState(null)
  const [cobroMetodo, setCobroMetodo] = useState('efectivo')
  const [cobroMonto, setCobroMonto] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [cancelando, setCancelando] = useState(null)
  const notificados = useRef(new Set())

  const { data: platos = [] } = useQuery({ queryKey: ['platos'], queryFn: listarPlatos })
  const { data: mesas = [] } = useQuery({ queryKey: ['mesas'], queryFn: listarMesas })
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-hoy'],
    queryFn: listarPedidosDelDia,
    refetchInterval: 1000 * 20,
  })

  useRealtime('platos', () => queryClient.invalidateQueries({ queryKey: ['platos'] }))
  useRealtime('pedidos', () => queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] }))
  useRealtime('pedido_items', () => queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] }))

  // Aviso: pedido de salon listo para servir
  useEffect(() => {
    for (const p of pedidos) {
      if (p.canal !== 'salon') continue
      if (['cancelado', 'entregado'].includes(p.estado)) continue
      const items = p.pedido_items || []
      const listo = items.length > 0 && items.every((i) => i.estado === 'listo')
      if (listo && !notificados.current.has(p.id)) {
        notificados.current.add(p.id)
        sonidoListo()
        setMensaje(`Pedido #${p.numero_orden} listo para servir`)
      }
    }
  }, [pedidos])

  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(() => setMensaje(''), 3500)
    return () => clearTimeout(t)
  }, [mensaje])

  const porCategoria = useMemo(() => {
    const map = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const itemsPedido = Object.entries(seleccion)
    .map(([id, cantidad]) => {
      const plato = platos.find((p) => p.id === Number(id))
      return plato ? { plato, cantidad } : null
    })
    .filter(Boolean)

  const subtotal = itemsPedido.reduce((a, i) => a + i.plato.precio * i.cantidad, 0)
  const unidades = itemsPedido.reduce((a, i) => a + i.cantidad, 0)
  const cargoEnvases = seccion === 'llevar' ? unidades * 1 : 0
  const total = subtotal + cargoEnvases

  const cant = (id) => seleccion[id] || 0

  const cambiar = (plato, delta) => {
    setSeleccion((prev) => {
      const actual = prev[plato.id] || 0
      const nueva = actual + delta
      const next = { ...prev }
      if (nueva <= 0) delete next[plato.id]
      else next[plato.id] = Math.min(nueva, plato.stock)
      return next
    })
  }

  const limpiar = () => {
    setSeleccion({})
    setNotas('')
    setMesa(null)
  }

  const quitarPlato = (id) => setSeleccion((prev) => {
    const n = { ...prev }
    delete n[id]
    return n
  })

  const abrirConfirmacion = () => {
    if (itemsPedido.length === 0) return setMensaje('Agrega al menos un plato')
    if (seccion === 'salon' && !mesa) return setMensaje('Selecciona la mesa')
    setConfirmando(true)
  }

  const cancelarMesa = async (p) => {
    try {
      await cancelarPedido(p.id)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      setCancelando(null)
      setMensaje('Pedido cancelado')
    } catch (err) {
      setMensaje('Error: ' + (err.message || 'no se pudo cancelar'))
    }
  }

  const enviar = async () => {
    if (itemsPedido.length === 0) return setMensaje('Agrega al menos un plato')
    if (seccion === 'salon' && !mesa) return setMensaje('Selecciona la mesa')
    setEnviando(true)
    setMensaje('')
    try {
      await crearPedido({
        mesaId: seccion === 'salon' ? mesa : null,
        metodoPago: seccion === 'llevar' ? metodo : null,
        paraLlevar: seccion === 'llevar',
        notas,
        items: itemsPedido.map((i) => ({ plato_id: i.plato.id, cantidad: i.cantidad })),
      })
      setMensaje(seccion === 'llevar' ? 'Pedido para llevar enviado' : `Pedido enviado a la mesa ${mesa}`)
      limpiar()
    } catch (err) {
      setMensaje(err.message || 'No se pudo enviar el pedido')
    } finally {
      setEnviando(false)
    }
  }

  const abrirCobro = (p) => {
    setCobrando(p.id)
    setCobroMetodo('efectivo')
    setCobroMonto(Number(p.total).toFixed(2))
  }

  const confirmarCobro = async (p) => {
    try {
      await cobrarMesa(p.id, cobroMetodo, Number(cobroMonto) || Number(p.total))
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      setCobrando(null)
      setMensaje('Cobro registrado ✓')
    } catch (err) {
      setMensaje('Error: ' + (err.message || 'no se pudo cobrar'))
    }
  }

  const mesasAbiertas = useMemo(
    () => pedidos.filter((p) => p.canal === 'salon' && p.estado_pago !== 'pagado' && p.estado !== 'cancelado'),
    [pedidos],
  )

  return (
    <div>
      <h1 className="page-title">Tomar Pedido</h1>

      <div className="tabs-scroll">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            className={'filtro-chip' + (seccion === s.id ? ' active' : '')}
            onClick={() => { setSeccion(s.id); limpiar() }}
          >
            {s.label}{s.id === 'salon' && mesasAbiertas.length > 0 ? ` (${mesasAbiertas.length})` : ''}
          </button>
        ))}
      </div>

      {seccion !== 'stock' && (
        <>
          {seccion === 'salon' && (
            <div className="card">
              <div className="card-title">Mesa</div>
              <ul className="table-list">
                {mesas.map((m) => (
                  <li key={m.id}>
                    <button className={'mesa-btn' + (mesa === m.id ? ' selected' : '')} onClick={() => setMesa(m.id)}>
                      {m.numero}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <div className="card-title">Platos</div>
            <div className="cli-leyenda">
              <span><i className="cli-dot verde" /> Disponible</span>
              <span><i className="cli-dot rojo" /> Agotado</span>
            </div>
            {Object.entries(porCategoria).map(([cat, lista]) => (
              <div key={cat}>
                <div className="seccion-title">{cat}</div>
                {lista.map((p) => {
                  const sinStock = !p.stock_disponible || p.stock <= 0
                  const c = cant(p.id)
                  return (
                    <div key={p.id} className={'cli-plato' + (sinStock ? ' sinstock' : '')}>
                      <div className="cli-plato-left">
                        <div>
                          <div className="cli-plato-nombre">
                            <i className={'cli-dot ' + (sinStock ? 'rojo' : 'verde')} />
                            {p.nombre}
                          </div>
                          <div className="cli-plato-precio">S/ {Number(p.precio).toFixed(2)} · {sinStock ? 'Agotado' : `${p.stock} disp.`}</div>
                        </div>
                      </div>
                      {sinStock ? (
                        <span className="cli-plato-agotado">Agotado</span>
                      ) : (
                        <div className="cli-stepper">
                          <button className="cli-step-btn" onClick={() => cambiar(p, -1)} disabled={c <= 0}>−</button>
                          <span className="cli-step-num">{c}</span>
                          <button className="cli-step-btn" onClick={() => cambiar(p, 1)} disabled={c >= p.stock}>+</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {seccion === 'llevar' && (
            <div className="card">
              <div className="card-title">Método de pago</div>
              <div className="pago-grid">
                {METODOS.map((m) => (
                  <button key={m.id} className={'pago-option' + (metodo === m.id ? ' selected' : '')} onClick={() => setMetodo(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="field">
              <label>Notas (opcional)</label>
              <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: sin cebolla, salsa aparte..." />
            </div>
          </div>

          {itemsPedido.length > 0 && (
            <div className="card">
              <div className="card-title">Pedido en curso</div>
              {itemsPedido.map(({ plato, cantidad }) => (
                <div key={plato.id} className="cli-item">
                  <div>
                    <div className="cli-item-nombre">{plato.nombre}</div>
                    <div className="cli-item-precio">S/ {(plato.precio * cantidad).toFixed(2)}</div>
                  </div>
                  <div className="cant-controller">
                    <button className="cant-btn" onClick={() => cambiar(plato, -1)}>−</button>
                    <span className="cli-item-cant">{cantidad}</span>
                    <button className="cant-btn" onClick={() => cambiar(plato, 1)} disabled={cantidad >= plato.stock}>+</button>
                    <button className="cli-item-quitar" onClick={() => quitarPlato(plato.id)}>✕</button>
                  </div>
                </div>
              ))}
              <div className="total-row"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
              {cargoEnvases > 0 && <div className="total-row"><span>Para llevar (S/1 x {unidades})</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
              <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
              {seccion === 'salon' && (
                <p className="cli-legal">El cobro se hace cuando la mesa termine (sección Salón → Cobrar).</p>
              )}
              <button className="btn btn-block btn-verde" onClick={abrirConfirmacion} disabled={enviando} style={{ marginTop: 10 }}>
                Revisar y enviar
              </button>
            </div>
          )}

          {seccion === 'salon' && mesasAbiertas.length > 0 && (
            <div className="card">
              <div className="card-title">Mesas abiertas (por cobrar)</div>
              {mesasAbiertas.map((p) => (
                <div key={p.id} className="mesa-abierta">
                  <div>
                    <div className="mesa-abierta-num">Mesa {p.mesas?.numero ?? '—'} · #{p.numero_orden}</div>
                    <div className="mesa-abierta-items">
                      {(p.pedido_items || []).map((i) => `${i.cantidad}× ${i.plato_nombre}`).join(', ')}
                    </div>
                  </div>
                  <div className="mesa-abierta-right">
                    <span className="mesa-abierta-total">S/ {Number(p.total).toFixed(2)}</span>
                    {cobrando === p.id ? null : (
                      <>
                        <button className="btn btn-sm" onClick={() => abrirCobro(p)}>Cobrar</button>
                        <button className="btn btn-sm btn-rojo" onClick={() => setCancelando(p)}>Cancelar</button>
                      </>
                    )}
                  </div>
                  {cobrando === p.id && (
                    <div className="mesa-cobro">
                      <div className="pago-grid">
                        {METODOS.map((m) => (
                          <button key={m.id} className={'pago-option' + (cobroMetodo === m.id ? ' selected' : '')} onClick={() => setCobroMetodo(m.id)}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                      <div className="field" style={{ marginTop: 8 }}>
                        <label>Monto a cobrar</label>
                        <input type="number" step="0.10" value={cobroMonto} onChange={(e) => setCobroMonto(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-verde" onClick={() => confirmarCobro(p)}>Confirmar cobro</button>
                        <button className="btn btn-sm btn-outline" onClick={() => setCobrando(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {seccion === 'stock' && (
        <div className="card">
          <div className="card-title">Stock del día</div>
          {Object.entries(porCategoria).map(([cat, lista]) => (
            <div key={cat}>
              <div className="seccion-title">{cat}</div>
              {lista.map((p) => (
                <div key={p.id} className="item-row">
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <span className={'plato-stock' + (p.stock <= 0 ? ' sin' : '')}>
                    {p.stock <= 0 ? 'Sin stock' : `${p.stock} disp.`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {confirmando && (
        <ConfirmDialog
          titulo={seccion === 'llevar' ? 'Confirmar pedido para llevar' : `Confirmar pedido — Mesa ${mesa ?? ''}`}
          onCancel={() => setConfirmando(false)}
          onConfirm={async () => { setConfirmando(false); await enviar() }}
          confirmLabel="Confirmar y enviar"
          ocupado={enviando}
        >
          {itemsPedido.map(({ plato, cantidad }) => (
            <div key={plato.id} className="cli-item-simple">{cantidad}× {plato.nombre} — S/ {(plato.precio * cantidad).toFixed(2)}</div>
          ))}
          <div className="total-row" style={{ marginTop: 8 }}><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
          {cargoEnvases > 0 && <div className="total-row"><span>Para llevar (S/1 x {unidades})</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
          <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
          {seccion === 'llevar' && <p className="cli-legal">Pago: {metodo}</p>}
          {notas ? <p className="cli-legal">Nota: {notas}</p> : null}
        </ConfirmDialog>
      )}

      {cancelando && (
        <ConfirmDialog
          titulo="Cancelar pedido"
          peligro
          confirmLabel="Sí, cancelar"
          onCancel={() => setCancelando(null)}
          onConfirm={() => cancelarMesa(cancelando)}
        >
          <p>¿Cancelar el pedido <strong>#{cancelando.numero_orden}</strong> de {cancelando.mesas ? `Mesa ${cancelando.mesas.numero}` : 'mostrador'}?</p>
          <p className="cli-legal">Se devolverá el stock de los platos.</p>
        </ConfirmDialog>
      )}

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