import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Proveedores from './Proveedores.tsx'
import Sheet from './ui/Sheet.tsx'
import { useCarritoCliente } from '../../context/CarritoClienteContext.tsx'
import {
  adjuntarReferencia,
  consultarPedidoCliente,
  crearPedidoCliente,
  guardarUltimoPedido,
  listarPlatosPublico,
  obtenerConfig,
  obtenerUltimoPedido,
} from '../../lib/pedidosCliente.ts'
import { estaAbierto, horarioConDias } from '../../lib/horario.ts'
import { ESTADOS_PEDIDO, PAGO_LABEL } from '../../lib/dominio.ts'
import { Plus, Minus, Utensils, ArrowRight, ArrowLeft, Download } from 'lucide-react'

function Contenido() {
  const { items, agregar, setCantidad, quitar, limpiar, subtotal, unidades } = useCarritoCliente()
  const [visible, setVisible] = useState(false)
  const [paso, setPaso] = useState('menu')
  const [canal, setCanal] = useState('delivery')
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '', notas: '' })
  const [metodo, setMetodo] = useState('yape')
  const [referencia, setReferencia] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [codigo, setCodigo] = useState(() => obtenerUltimoPedido())
  const [hayUltimo, setHayUltimo] = useState(() => !!obtenerUltimoPedido())
  const [catActiva, setCatActiva] = useState(null)

  const bodyRef = useRef(null)
  const sectionRefs = useRef({})

  const { data: platos = [], isLoading } = useQuery({ queryKey: ['platos-publico'], queryFn: listarPlatosPublico })
  const { data: config } = useQuery({ queryKey: ['config-publica'], queryFn: obtenerConfig })
  const tarifas = config?.tarifas || { delivery_por_plato: 2, envase_por_plato: 1 }
  const abierto = config?.horario ? estaAbierto(horarioConDias(config.horario.dias)) : true

  const { data: pedido } = useQuery({
    queryKey: ['pedido-cliente', codigo],
    queryFn: () => consultarPedidoCliente(codigo),
    enabled: paso === 'seguimiento' && !!codigo,
    refetchInterval: 15000,
    retry: false,
  })

  useEffect(() => {
    const abrir = () => {
      setVisible(true)
      setPaso('menu')
    }
    window.addEventListener('abrir-pedido', abrir)
    return () => window.removeEventListener('abrir-pedido', abrir)
  }, [])

  const porCategoria = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const nombres = Object.keys(porCategoria)

  // Scroll-spy de categorías
  useEffect(() => {
    if (paso !== 'menu' || !visible) return
    const body = bodyRef.current
    if (!body) return
    const onScroll = () => {
      const top = body.getBoundingClientRect().top
      let current = nombres[0]
      for (const cat of nombres) {
        const el = sectionRefs.current[cat]
        if (el && el.getBoundingClientRect().top - top <= 70) current = cat
      }
      setCatActiva(current)
    }
    onScroll()
    body.addEventListener('scroll', onScroll, { passive: true })
    return () => body.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, visible, nombres.join('|')])

  const irACategoria = (cat) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCatActiva(cat)
  }

  const cargoEnvases = canal === 'recojo' ? unidades * Number(tarifas.envase_por_plato) : 0
  const costoDelivery = canal === 'delivery' ? unidades * Number(tarifas.delivery_por_plato) : 0
  const total = subtotal + cargoEnvases + costoDelivery
  const cant = (id) => items.find((i) => i.plato.id === id)?.cantidad || 0

  const campo = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (error) setError('')
  }

  const irADatos = () => {
    if (items.length === 0) return
    setPaso('datos')
  }

  const irAPago = () => {
    setError('')
    if (form.nombre.trim().length < 2) return setError('Ingresa tu nombre')
    if (form.telefono.replace(/\D/g, '').length < 6) return setError('Ingresa un teléfono válido')
    if (canal === 'delivery' && form.direccion.trim().length < 5) return setError('Ingresa la dirección')
    setPaso('pago')
  }

  const confirmar = async () => {
    setError('')
    if ((metodo === 'yape' || metodo === 'plin') && referencia.trim().length < 3) {
      return setError('Ingresa el N.º de operación de tu pago')
    }
    setEnviando(true)
    try {
      const res = await crearPedidoCliente({
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        canal,
        metodoPago: metodo,
        notas: form.notas,
        items: items.map((i) => ({ plato_id: i.plato.id, cantidad: i.cantidad })),
      })
      if ((metodo === 'yape' || metodo === 'plin') && res?.codigo) {
        try { await adjuntarReferencia(res.codigo, referencia.trim()) } catch { /* noop */ }
      }
      guardarUltimoPedido(res.codigo)
      setCodigo(res.codigo)
      setHayUltimo(true)
      limpiar()
      setReferencia('')
      setPaso('seguimiento')
    } catch (e) {
      setError(e.message || 'No se pudo enviar el pedido')
    } finally {
      setEnviando(false)
    }
  }

  const verUltimo = () => {
    setCodigo(obtenerUltimoPedido())
    setPaso('seguimiento')
    setVisible(true)
  }

  const pasoActual = pedido ? ESTADOS_PEDIDO.findIndex((e) => e.key === pedido.estado) : -1

  const titulo = paso === 'menu' ? 'Nuestro menú' : paso === 'pago' ? 'Pago' : 'Tu pedido'

  const renderPlato = (p) => {
    const sinStock = !p.stock_disponible || p.stock <= 0
    const c = cant(p.id)
    return (
      <div key={p.id} className={'cli-dish' + (sinStock ? ' sinstock' : '')}>
        <div className="cli-dish-thumb">
          {p.imagen
            ? <img src={p.imagen} alt={p.nombre} className="cli-dish-img" loading="lazy" />
            : <div className="cli-dish-ph"><Utensils /></div>}
          {sinStock && <span className="cli-dish-badge">Agotado</span>}
        </div>
        <div className="cli-dish-info">
          <div className="cli-dish-name">{p.nombre}</div>
          {p.descripcion && <div className="cli-dish-desc">{p.descripcion}</div>}
          <div className="cli-dish-price">S/ {Number(p.precio).toFixed(2)}</div>
        </div>
        {!sinStock && (c === 0 ? (
          <button className="cli-add-btn" aria-label={`Agregar ${p.nombre}`} onClick={() => agregar(p)}>
            <Plus />
          </button>
        ) : (
          <div className="cli-stepper">
            <button className="cli-step-btn" aria-label={`Quitar ${p.nombre}`} onClick={() => setCantidad(p.id, c - 1)}>
              <Minus />
            </button>
            <span className="cli-step-num">{c}</span>
            <button className="cli-step-btn" aria-label={`Agregar ${p.nombre}`} onClick={() => setCantidad(p.id, c + 1)} disabled={c >= p.stock}>
              <Plus />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const footer = (() => {
    if (paso === 'menu') {
      return (
        <>
          <div className="pedir-foot-info">
            <small>{unidades} plato(s)</small>
            <strong>S/ {subtotal.toFixed(2)}</strong>
          </div>
          <button className="btn" disabled={unidades === 0 || !abierto} onClick={irADatos}>
            Continuar <ArrowRight />
          </button>
        </>
      )
    }
    if (paso === 'datos') {
      return (
        <>
          <button className="btn btn-outline" onClick={() => setPaso('menu')}><ArrowLeft /> Menú</button>
          <button className="btn grow" onClick={irAPago}>Ir a pagar <ArrowRight /></button>
        </>
      )
    }
    if (paso === 'pago') {
      return (
        <>
          <button className="btn btn-outline" onClick={() => setPaso('datos')}><ArrowLeft /> Atrás</button>
          <button className="btn btn-verde grow" onClick={confirmar} disabled={enviando}>{enviando ? 'Enviando...' : 'Confirmar pedido'}</button>
        </>
      )
    }
    return <button className="btn btn-block btn-outline" onClick={() => setPaso('menu')}>Hacer otro pedido</button>
  })()

  return (
    <>
      {hayUltimo && !visible && (
        <button className="verpedido-fab" onClick={verUltimo}>Ver mi pedido</button>
      )}

      {visible && (
        <Sheet title={titulo} onClose={() => setVisible(false)} bodyRef={bodyRef} footer={footer}>
          {paso === 'menu' && (
            <>
              <div className={'cli-estado ' + (abierto ? 'abierto' : 'cerrado')}>
                {abierto ? 'Abierto — estamos recibiendo pedidos' : 'Cerrado — vuelve en nuestro horario'}
              </div>

              {isLoading ? (
                <>
                  <div className="skeleton" style={{ height: 76, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 76, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 76 }} />
                </>
              ) : nombres.length === 0 ? (
                <div className="cli-vacio">Estamos actualizando nuestra carta. Vuelve pronto.</div>
              ) : (
                <>
                  <div className="cli-cat-tabs">
                    {nombres.map((cat) => (
                      <button
                        key={cat}
                        className={'filtro-chip' + (cat === (catActiva || nombres[0]) ? ' active' : '')}
                        onClick={() => irACategoria(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {nombres.map((cat) => (
                    <section
                      key={cat}
                      className="cli-cat"
                      ref={(el) => { sectionRefs.current[cat] = el }}
                    >
                      <div className="seccion-title">{cat}</div>
                      {porCategoria[cat].map(renderPlato)}
                    </section>
                  ))}
                </>
              )}
            </>
          )}

          {paso === 'datos' && (
            <>
              {error && <div className="cli-warn">⚠️ {error}</div>}
              {items.map(({ plato, cantidad }) => (
                <div key={plato.id} className="cli-item">
                  <div>
                    <div className="cli-item-nombre">{plato.nombre}</div>
                    <div className="cli-item-precio">S/ {(plato.precio * cantidad).toFixed(2)}</div>
                  </div>
                  <div className="cant-controller">
                    <button className="cant-btn" aria-label={`Quitar ${plato.nombre}`} onClick={() => setCantidad(plato.id, cantidad - 1)}><Minus /></button>
                    <span className="cli-item-cant">{cantidad}</span>
                    <button className="cant-btn" aria-label={`Agregar ${plato.nombre}`} onClick={() => setCantidad(plato.id, cantidad + 1)} disabled={cantidad >= plato.stock}><Plus /></button>
                    <button className="cli-item-quitar" aria-label={`Eliminar ${plato.nombre}`} onClick={() => quitar(plato.id)}>✕</button>
                  </div>
                </div>
              ))}

              <div className="cli-canal mt-3">
                <button className={'cli-canal-opt' + (canal === 'delivery' ? ' sel' : '')} onClick={() => setCanal('delivery')}>
                  Delivery<small>+ S/ {Number(tarifas.delivery_por_plato).toFixed(2)} por plato</small>
                </button>
                <button className={'cli-canal-opt' + (canal === 'recojo' ? ' sel' : '')} onClick={() => setCanal('recojo')}>
                  Recojo en local<small>+ S/ {Number(tarifas.envase_por_plato).toFixed(2)} por plato</small>
                </button>
              </div>

              <div className="field mt-3"><label htmlFor="c-nombre">Nombre</label><input id="c-nombre" value={form.nombre} onChange={(e) => campo('nombre', e.target.value)} /></div>
              <div className="field"><label htmlFor="c-tel">Teléfono</label><input id="c-tel" value={form.telefono} onChange={(e) => campo('telefono', e.target.value)} inputMode="tel" /></div>
              {canal === 'delivery' && (
                <div className="field"><label htmlFor="c-dir">Dirección</label><input id="c-dir" value={form.direccion} onChange={(e) => campo('direccion', e.target.value)} /></div>
              )}
              <div className="field"><label htmlFor="c-notas">Notas (opcional)</label><textarea id="c-notas" rows={2} value={form.notas} onChange={(e) => campo('notas', e.target.value)} /></div>

              <div className="total-row"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
              {cargoEnvases > 0 && <div className="total-row"><span>Envases</span><span>S/ {cargoEnvases.toFixed(2)}</span></div>}
              {costoDelivery > 0 && <div className="total-row"><span>Delivery</span><span>S/ {costoDelivery.toFixed(2)}</span></div>}
              <div className="total-row final"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
            </>
          )}

          {paso === 'pago' && (
            <>
              {error && <div className="cli-warn">⚠️ {error}</div>}
              <div className="cli-pago-opts">
                <button className={'cli-pago-opt' + (metodo === 'yape' ? ' sel' : '')} onClick={() => setMetodo('yape')}>Yape</button>
                <button className={'cli-pago-opt' + (metodo === 'plin' ? ' sel' : '')} onClick={() => setMetodo('plin')}>Plin</button>
                <button className={'cli-pago-opt' + (metodo === 'efectivo' ? ' sel' : '')} onClick={() => setMetodo('efectivo')}>Efectivo</button>
              </div>
              {(metodo === 'yape' || metodo === 'plin') && (
                <div className="cli-qr">
                  {config?.pagos?.qr_url
                    ? <img src={config.pagos.qr_url} alt="QR" className="cli-qr-img" />
                    : <div className="cli-qr-placeholder">QR de {metodo === 'yape' ? 'Yape' : 'Plin'}</div>}
                  <p className="cli-qr-num">Número: <strong>{metodo === 'yape' ? (config?.pagos?.yape || '—') : (config?.pagos?.plin || '—')}</strong></p>
                  <div className="field"><label htmlFor="c-ref">N.º de operación</label><input id="c-ref" value={referencia} onChange={(e) => setReferencia(e.target.value)} /></div>
                </div>
              )}
              {metodo === 'efectivo' && <p className="cli-efectivo">Pagas en efectivo {canal === 'delivery' ? 'al recibir (contra entrega)' : 'al recoger'}.</p>}
              <div className="total-row final"><span>Total a pagar</span><span>S/ {total.toFixed(2)}</span></div>
            </>
          )}

          {paso === 'seguimiento' && (
            <>
              <div className="cli-codigo">Código: <strong>{codigo}</strong></div>
              {pedido ? (
                <>
                  <div className="cli-pago-chip" style={{ background: 'var(--ink-600)' }}>{PAGO_LABEL[pedido.estado_pago] || 'Pago'}</div>
                  <div className="cli-timeline">
                    {ESTADOS_PEDIDO.map((e, i) => {
                      if (e.key === 'en_camino' && pedido.canal !== 'delivery') return null
                      return (
                        <div key={e.key} className={'cli-paso' + (i <= pasoActual ? ' activo' : '')}>
                          <span className="cli-paso-icon">{e.icon}</span>
                          <span className="cli-paso-label">{e.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3">
                    {pedido.items?.map((it, i) => (<div key={i} className="cli-item-simple">{it.cantidad}× {it.plato}</div>))}
                    <div className="total-row final"><span>Total</span><span>S/ {Number(pedido.total).toFixed(2)}</span></div>
                  </div>
                  <button className="btn btn-block btn-outline mt-3" onClick={() => import('../../lib/boleta.js').then((m) => m.generarBoletaPDF(pedido))}>
                    <Download /> Descargar boleta
                  </button>
                </>
              ) : (
                <div className="centered">Buscando tu pedido...</div>
              )}
            </>
          )}
        </Sheet>
      )}
    </>
  )
}

export default function PedirIsland() {
  return (
    <Proveedores>
      <Contenido />
    </Proveedores>
  )
}
