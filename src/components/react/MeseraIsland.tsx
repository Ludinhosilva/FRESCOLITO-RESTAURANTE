import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import AppShell from './AppShell.tsx'
import ConfirmDialog from './ConfirmDialog.tsx'
import Sheet from './ui/Sheet.tsx'
import EmptyState from './ui/EmptyState.tsx'
import { useToast } from './ui/Toast.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Minus, Plus, X, ShoppingBag, Armchair, Store, Package, Bell } from 'lucide-react'
import { cobrarMesa, cancelarPedido, crearPedido, listarMesas, listarPedidosDelDia, listarPlatos } from '../../lib/pedidos.ts'
import { useRealtime } from '../../hooks/useRealtime.ts'
import { sonidoListo } from '../../lib/sonido.ts'
import { METODOS_PAGO, METODO_LABEL } from '../../lib/dominio.ts'

const SECCIONES = [
  { id: 'llevar', label: 'Para llevar', icon: Store },
  { id: 'salon', label: 'Salón', icon: Armchair },
  { id: 'stock', label: 'Stock', icon: Package },
]

function MeseraContenido() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [seccion, setSeccion] = useState('llevar')
  const [mesa, setMesa] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [seleccion, setSeleccion] = useState<Record<string, number>>({})
  const [metodo, setMetodo] = useState('efectivo')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
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
  })

  useRealtime('platos', () => queryClient.invalidateQueries({ queryKey: ['platos'] }))
  useRealtime('pedidos', () => queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] }))
  useRealtime('pedido_items', () => queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] }))

  useEffect(() => {
    for (const p of pedidos) {
      if (p.canal !== 'salon') continue
      if (['cancelado', 'entregado'].includes(p.estado)) continue
      const items = p.pedido_items || []
      const listo = items.length > 0 && items.every((i) => i.estado === 'listo')
      if (listo && !notificados.current.has(p.id)) {
        notificados.current.add(p.id)
        sonidoListo()
        toast(`Pedido #${p.numero_orden} listo para servir`)
      }
    }
  }, [pedidos, toast])

  const porCategoria = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return null
    return platos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [platos, busqueda])

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
    if (itemsPedido.length === 0) return toast('Agrega al menos un plato', 'error')
    if (seccion === 'salon' && !mesa) return toast('Selecciona la mesa', 'error')
    setCarritoAbierto(false)
    setConfirmando(true)
  }

  const cancelarMesa = async (p) => {
    try {
      await cancelarPedido(p.id)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      setCancelando(null)
      toast('Pedido cancelado')
    } catch (err) {
      toast('Error: ' + (err.message || 'no se pudo cancelar'), 'error')
    }
  }

  const enviar = async () => {
    if (itemsPedido.length === 0) return toast('Agrega al menos un plato', 'error')
    if (seccion === 'salon' && !mesa) return toast('Selecciona la mesa', 'error')
    setEnviando(true)
    try {
      await crearPedido({
        mesaId: seccion === 'salon' ? mesa : null,
        metodoPago: seccion === 'llevar' ? metodo : null,
        paraLlevar: seccion === 'llevar',
        notas,
        items: itemsPedido.map((i) => ({ plato_id: i.plato.id, cantidad: i.cantidad })),
      })
      toast(seccion === 'llevar' ? 'Pedido para llevar enviado' : `Pedido enviado a la mesa ${mesa}`)
      limpiar()
    } catch (err) {
      toast(err.message || 'No se pudo enviar el pedido', 'error')
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
    const monto = Number(cobroMonto)
    if (isNaN(monto) || monto < 0 || monto > 9999) return toast('El monto debe estar entre 0 y 9999', 'error')
    try {
      await cobrarMesa(p.id, cobroMetodo, monto || Number(p.total))
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      setCobrando(null)
      toast('Cobro registrado ✓')
    } catch (err) {
      toast('Error: ' + (err.message || 'no se pudo cobrar'), 'error')
    }
  }

  const mesasAbiertas = useMemo(
    () => pedidos.filter((p) => p.canal === 'salon' && p.estado_pago !== 'pagado' && p.estado !== 'cancelado'),
    [pedidos],
  )

  const renderPlato = (p) => {
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
            <button className="cli-step-btn" aria-label={`Quitar ${p.nombre}`} onClick={() => cambiar(p, -1)} disabled={c <= 0}>
              <Minus />
            </button>
            <span className="cli-step-num">{c}</span>
            <button className="cli-step-btn" aria-label={`Agregar ${p.nombre}`} onClick={() => cambiar(p, 1)} disabled={c >= p.stock}>
              <Plus />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Tomar Pedido</h1>

      <div className="tabs-scroll">
        {SECCIONES.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              className={'filtro-chip' + (seccion === s.id ? ' active' : '')}
              onClick={() => { setSeccion(s.id); limpiar() }}
            >
              <Icon /> {s.label}{s.id === 'salon' && mesasAbiertas.length > 0 ? ` (${mesasAbiertas.length})` : ''}
            </button>
          )
        })}
      </div>

      {seccion !== 'stock' && (
        <>
          {seccion === 'salon' && (
            <div className="card">
              <div className="card-title">Mesa</div>
              {mesas.length === 0 ? (
                <EmptyState icon={Armchair} title="Sin mesas" sub="No hay mesas configuradas." />
              ) : (
                <ul className="table-list">
                  {mesas.map((m) => (
                    <li key={m.id}>
                      <button
                        className={'mesa-btn' + (mesa === m.id ? ' selected' : '')}
                        aria-pressed={mesa === m.id}
                        onClick={() => setMesa(m.id)}
                      >
                        {m.numero}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="card">
            <div className="card-title">Platos</div>
            <div className="field" style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: 13, width: 18, height: 18, color: 'var(--ink-400)' }} />
              <input
                style={{ paddingLeft: 38 }}
                placeholder="Buscar plato..."
                aria-label="Buscar plato"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {filtrados ? (
              filtrados.length === 0
                ? <div className="text-sm muted">Sin resultados</div>
                : filtrados.map(renderPlato)
            ) : (
              Object.entries(porCategoria).map(([cat, lista]) => (
                <div key={cat}>
                  <div className="seccion-title">{cat}</div>
                  {lista.map(renderPlato)}
                </div>
              ))
            )}
          </div>

          {seccion === 'llevar' && (
            <div className="card">
              <div className="card-title">Método de pago</div>
              <div className="pago-grid">
                {METODOS_PAGO.map((m) => (
                  <button key={m} className={'pago-option' + (metodo === m ? ' selected' : '')} onClick={() => setMetodo(m)}>
                    {METODO_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {seccion === 'salon' && mesasAbiertas.length > 0 && (
            <div className="card">
              <div className="card-title"><Bell style={{ width: 16, height: 16 }} /> Mesas abiertas (por cobrar)</div>
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
                        {METODOS_PAGO.map((m) => (
                          <button key={m} className={'pago-option' + (cobroMetodo === m ? ' selected' : '')} onClick={() => setCobroMetodo(m)}>
                            {METODO_LABEL[m]}
                          </button>
                        ))}
                      </div>
                      <div className="field mt-2">
                        <label>Monto a cobrar</label>
                        <input type="number" min="0" max="9999" step="0.10" inputMode="decimal" value={cobroMonto} onChange={(e) => setCobroMonto(e.target.value)} />
                      </div>
                      <div className="row">
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

      {seccion !== 'stock' && unidades > 0 && (
        <>
          <div style={{ height: 64 }} />
          <div className="cart-bar">
            <div className="pedir-foot-info">
              <small>{unidades} plato(s)</small>
              <strong style={{ color: '#fff' }}>S/ {total.toFixed(2)}</strong>
            </div>
            <button className="btn" onClick={() => setCarritoAbierto(true)}>
              <ShoppingBag /> Ver pedido
            </button>
          </div>
        </>
      )}

      {carritoAbierto && (
        <Sheet
          title="Pedido en curso"
          onClose={() => setCarritoAbierto(false)}
          footer={
            <>
              <div className="pedir-foot-info">
                <small className="muted">{unidades} plato(s)</small>
                <strong>S/ {total.toFixed(2)}</strong>
              </div>
              <button className="btn btn-verde" onClick={abrirConfirmacion}>Revisar y enviar</button>
            </>
          }
        >
          {itemsPedido.map(({ plato, cantidad }) => (
            <div key={plato.id} className="cli-item">
              <div>
                <div className="cli-item-nombre">{plato.nombre}</div>
                <div className="cli-item-precio">S/ {(plato.precio * cantidad).toFixed(2)}</div>
              </div>
              <div className="cant-controller">
                <button className="cant-btn" aria-label={`Quitar ${plato.nombre}`} onClick={() => cambiar(plato, -1)}><Minus /></button>
                <span className="cli-item-cant">{cantidad}</span>
                <button className="cant-btn" aria-label={`Agregar ${plato.nombre}`} onClick={() => cambiar(plato, 1)} disabled={cantidad >= plato.stock}><Plus /></button>
                <button className="cli-item-quitar" aria-label={`Eliminar ${plato.nombre}`} onClick={() => quitarPlato(plato.id)}><X /></button>
              </div>
            </div>
          ))}

          <div className="field mt-3">
            <label htmlFor="notas">Notas (opcional)</label>
            <textarea id="notas" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: sin cebolla, salsa aparte..." />
          </div>

          <div className="total-row"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
          {cargoEnvases > 0 && <div className="total-row"><span>Para llevar (S/1 x {unidades})</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
          <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
          {seccion === 'salon' && <p className="cli-legal">El cobro se hace cuando la mesa termine.</p>}
        </Sheet>
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
          <div className="total-row mt-2"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
          {cargoEnvases > 0 && <div className="total-row"><span>Para llevar (S/1 x {unidades})</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
          <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
          {seccion === 'llevar' && <p className="cli-legal">Pago: {METODO_LABEL[metodo]}</p>}
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
    </div>
  )
}

export default function MeseraIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['mesera', 'admin']}>
        <AppShell>
          <MeseraContenido />
        </AppShell>
      </GuardPersonal>
    </Proveedores>
  )
}
