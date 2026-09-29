import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import AppShell from './AppShell.tsx'
import ConfirmDialog from './ConfirmDialog.tsx'
import Sheet from './ui/Sheet.tsx'
import EmptyState from './ui/EmptyState.tsx'
import { useToast } from './ui/Toast.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Minus, Plus, X, ShoppingBag, Armchair, Store, Package, Bell, ArrowRightLeft, Move, Link2 } from 'lucide-react'
import { cobrarMesa, cancelarPedido, crearPedido, listarPedidosDelDia, listarPlatos } from '../../lib/pedidos.ts'
import { listarMesas, moverItems, moverMesa, unirMesas, separarMesa } from '../../lib/mesas.ts'
import MesasPlano from './MesasPlano.tsx'
import { useRealtime } from '../../hooks/useRealtime.ts'
import { sonidoListo } from '../../lib/sonido.ts'
import { METODOS_PAGO, METODO_LABEL, etiquetaMesas } from '../../lib/dominio.ts'

const SECCIONES = [
  { id: 'llevar', label: 'Para llevar', icon: Store },
  { id: 'salon', label: 'En el local', icon: Armchair },
  { id: 'stock', label: 'Stock', icon: Package },
]

function MeseraContenido() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [seccion, setSeccion] = useState('llevar')
  const [mesa, setMesa] = useState(null)
  const [planoModo, setPlanoModo] = useState('ver')
  const [juntarSel, setJuntarSel] = useState<number[]>([])
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
  const [moverAbierto, setMoverAbierto] = useState(false)
  const [moverPedido, setMoverPedido] = useState(null)
  const [moverSel, setMoverSel] = useState([])
  const [moverDestino, setMoverDestino] = useState('')
  const [moviendo, setMoviendo] = useState(false)
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

  const pedidoPorMesa = useMemo(() => {
    const map: Record<number, any> = {}
    for (const p of pedidos) {
      if (p.canal !== 'salon') continue
      if (['cancelado', 'entregado'].includes(p.estado)) continue
      if (p.mesa_id) map[p.mesa_id] = p
      for (const pm of p.pedido_mesas || []) {
        if (pm?.mesa_id) map[pm.mesa_id] = p
      }
    }
    return map
  }, [pedidos])

  const estadosMesa = useMemo(() => {
    const map: Record<number, any> = {}
    for (const p of pedidos) {
      if (p.canal !== 'salon') continue
      if (['cancelado', 'entregado'].includes(p.estado)) continue
      const items = p.pedido_items || []
      const listo = items.length > 0 && items.every((i) => i.estado === 'listo')
      const mesasDe = [p.mesa_id, ...(p.pedido_mesas || []).map((x) => x.mesa_id)].filter(Boolean)
      const unida = mesasDe.length > 1
      const grupo = unida ? (etiquetaMesas(p) || '').replace('Mesa ', '') : null
      for (const mid of mesasDe) {
        map[mid] = { tone: listo ? 'cobrar' : 'ocupada', total: p.total, numero_orden: p.numero_orden, unida, grupo }
      }
    }
    return map
  }, [pedidos])

  const pedidoMesa = mesa ? (pedidoPorMesa[mesa] || null) : null

  const moverMesaPlano = async (id, x, y) => {
    try {
      await moverMesa(id, x, y)
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      queryClient.invalidateQueries({ queryKey: ['mesas-admin'] })
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo mover'), 'error')
    }
  }

  const seleccionarJuntar = (id) => {
    setJuntarSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const juntarSeleccionadas = async () => {
    if (juntarSel.length < 2) return toast('Selecciona al menos 2 mesas', 'error')
    const mainMesa = juntarSel.find((id) => pedidoPorMesa[id])
    if (!mainMesa) return toast('Ninguna mesa seleccionada tiene pedido abierto', 'error')
    const pedido = pedidoPorMesa[mainMesa]
    try {
      await unirMesas(pedido.id, juntarSel)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      toast('Mesas unidas')
      setJuntarSel([])
      setPlanoModo('ver')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo unir'), 'error')
    }
  }

  const juntarPorDrop = async (fromId, toId) => {
    const mainMesa = pedidoPorMesa[toId] ? toId : pedidoPorMesa[fromId] ? fromId : null
    if (!mainMesa) return toast('Ninguna de las mesas tiene pedido abierto', 'error')
    const pedido = pedidoPorMesa[mainMesa]
    try {
      await unirMesas(pedido.id, [fromId, toId])
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      toast('Mesas unidas')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo unir'), 'error')
    }
  }

  const separar = async (pedidoId, mesaId) => {
    try {
      await separarMesa(pedidoId, mesaId)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      toast('Mesa separada')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo separar'), 'error')
    }
  }

  const abrirMover = (p) => {
    setMoverPedido(p)
    setMoverSel([])
    setMoverDestino('')
    setMoverAbierto(true)
  }

  const confirmarMover = async () => {
    if (!moverPedido) return
    if (moverSel.length === 0) return toast('Selecciona al menos un plato', 'error')
    if (!moverDestino) return toast('Selecciona la mesa destino', 'error')
    setMoviendo(true)
    try {
      await moverItems(moverPedido.id, Number(moverDestino), moverSel)
      queryClient.invalidateQueries({ queryKey: ['pedidos-hoy'] })
      toast('Ítems movidos')
      setMoverAbierto(false)
      setMoverPedido(null)
      setMoverSel([])
      setMoverDestino('')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo mover'), 'error')
    } finally {
      setMoviendo(false)
    }
  }

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
              <div className="card-title">Plano del local</div>
              {mesas.length === 0 ? (
                <EmptyState icon={Armchair} title="Sin mesas" sub="No hay mesas configuradas." />
              ) : (
                <>
                  <div className="tabs-scroll" style={{ marginBottom: 10 }}>
                    <button className={'filtro-chip' + (planoModo === 'ver' ? ' active' : '')} onClick={() => { setPlanoModo('ver'); setJuntarSel([]) }}>Ver</button>
                    <button className={'filtro-chip' + (planoModo === 'mover' ? ' active' : '')} onClick={() => { setPlanoModo('mover'); setJuntarSel([]) }}><Move /> Mover</button>
                    <button className={'filtro-chip' + (planoModo === 'juntar' ? ' active' : '')} onClick={() => { setPlanoModo('juntar'); setJuntarSel([]) }}><Link2 /> Juntar</button>
                  </div>

                  <MesasPlano
                    mesas={mesas}
                    estados={estadosMesa}
                    selectedId={planoModo === 'ver' ? mesa : null}
                    selectedIds={planoModo === 'juntar' ? juntarSel : []}
                    onSelect={planoModo === 'juntar' ? seleccionarJuntar : setMesa}
                    dragMode={planoModo === 'mover' ? 'move' : planoModo === 'juntar' ? 'join' : 'none'}
                    onMove={moverMesaPlano}
                    onJoinDrop={juntarPorDrop}
                  />

                  <div className="plano-leyenda">
                    <span><i className="libre" /> Disponible</span>
                    <span><i className="ocupada" /> Ocupada</span>
                    <span><i className="cobrar" /> Por cobrar</span>
                  </div>

                  {planoModo === 'mover' && <p className="text-xs muted mt-2">Arrastra las mesas para acomodarlas. Se guarda para todos.</p>}
                  {planoModo === 'juntar' && (
                    <div className="row-wrap mt-3">
                      <button className="btn btn-sm" onClick={juntarSeleccionadas} disabled={juntarSel.length < 2}>
                        <Link2 /> Juntar seleccionadas ({juntarSel.length})
                      </button>
                      <span className="text-xs muted">Toca mesas para seleccionar, o arrastra una sobre otra.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {seccion === 'salon' && pedidoMesa && (
            <div className="card">
              <div className="card-title">
                {etiquetaMesas(pedidoMesa)} · #{pedidoMesa.numero_orden}
              </div>
              <div className="text-sm muted mb-2">
                {(pedidoMesa.pedido_items || []).map((i) => `${i.cantidad}× ${i.plato_nombre}`).join(', ')}
              </div>
              <div className="row-wrap">
                <button className="btn btn-sm btn-outline" onClick={() => abrirMover(pedidoMesa)}>
                  <ArrowRightLeft /> Mover ítems a otra mesa
                </button>
              </div>
              {[pedidoMesa.mesa_id, ...(pedidoMesa.pedido_mesas || []).map((x) => x.mesa_id)].filter(Boolean).length > 1 && (
                <div className="mt-3">
                  <div className="text-xs muted mb-1">Mesas unidas — toca para separar:</div>
                  <div className="row-wrap">
                    {[pedidoMesa.mesa_id, ...(pedidoMesa.pedido_mesas || []).map((x) => x.mesa_id)].filter(Boolean).map((mid) => (
                      <button key={mid} className="filtro-chip" onClick={() => separar(pedidoMesa.id, mid)}>
                        Separar mesa {mesas.find((m) => m.id === mid)?.numero ?? mid}
                      </button>
                    ))}
                  </div>
                </div>
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
                    <div className="mesa-abierta-num">{etiquetaMesas(p) || 'Mostrador'} · #{p.numero_orden}</div>
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
          <p>¿Cancelar el pedido <strong>#{cancelando.numero_orden}</strong> de {etiquetaMesas(cancelando) || 'mostrador'}?</p>
          <p className="cli-legal">Se devolverá el stock de los platos.</p>
        </ConfirmDialog>
      )}

      {moverAbierto && moverPedido && (
        <Sheet
          title="Mover ítems a otra mesa"
          onClose={() => setMoverAbierto(false)}
          footer={
            <>
              <button className="btn btn-outline grow" onClick={() => setMoverAbierto(false)}>Cancelar</button>
              <button className="btn grow" onClick={confirmarMover} disabled={moviendo}>
                {moviendo ? 'Moviendo...' : 'Mover ítems'}
              </button>
            </>
          }
        >
          <div className="mover-lista">
            {(moverPedido.pedido_items || []).map((it) => (
              <label key={it.id} className="mover-item">
                <input
                  type="checkbox"
                  checked={moverSel.includes(it.id)}
                  onChange={(e) => setMoverSel((s) => (e.target.checked ? [...s, it.id] : s.filter((x) => x !== it.id)))}
                />
                <span>{it.cantidad}× {it.plato_nombre}</span>
              </label>
            ))}
          </div>
          <div className="field">
            <label htmlFor="mover-destino">Mesa destino</label>
            <select id="mover-destino" value={moverDestino} onChange={(e) => setMoverDestino(e.target.value)}>
              <option value="">Selecciona...</option>
              {mesas.filter((m) => m.id !== mesa && m.activa !== false).map((m) => (
                <option key={m.id} value={m.id}>Mesa {m.numero}</option>
              ))}
            </select>
          </div>
          <p className="cli-legal">Si la mesa destino no tiene pedido abierto, se crea uno automáticamente.</p>
        </Sheet>
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
