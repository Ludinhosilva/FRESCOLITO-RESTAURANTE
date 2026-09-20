import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Proveedores from './Proveedores.jsx'
import { useCarritoCliente } from '../../context/CarritoClienteContext.jsx'
import {
  adjuntarReferencia,
  consultarPedidoCliente,
  crearPedidoCliente,
  estaAbierto,
  guardarUltimoPedido,
  listarPlatosPublico,
  obtenerConfig,
  obtenerUltimoPedido,
} from '../../lib/pedidosCliente.js'

const ESTADOS = [
  { key: 'pendiente', label: 'Recibido', icon: '📥' },
  { key: 'en_preparacion', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'listo', label: 'Listo', icon: '✅' },
  { key: 'en_camino', label: 'En camino', icon: '🛵' },
  { key: 'entregado', label: 'Entregado', icon: '🎉' },
]
const PAGO_LABEL = {
  por_verificar: 'Pago por verificar',
  pagado: 'Pagado',
  contra_entrega: 'Contra entrega',
  pendiente: 'Pago pendiente',
}

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

  const { data: platos = [] } = useQuery({ queryKey: ['platos-publico'], queryFn: listarPlatosPublico })
  const { data: config } = useQuery({ queryKey: ['config-publica'], queryFn: obtenerConfig })
  const tarifas = config?.tarifas || { delivery_por_plato: 2, envase_por_plato: 1 }
  const abierto = estaAbierto(config?.horario)

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
    const map = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

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

  const pasoActual = pedido ? ESTADOS.findIndex((e) => e.key === pedido.estado) : -1

  return (
    <>
      {hayUltimo && !visible && (
        <button className="verpedido-fab" onClick={verUltimo}>Ver mi pedido</button>
      )}

      {visible && (
        <div className="pedir-overlay" onClick={(e) => e.target === e.currentTarget && setVisible(false)}>
          <div className="pedir-panel">
            <div className="pedir-head">
              <strong>
                {paso === 'menu' && 'Nuestro menú'}
                {paso === 'datos' && 'Tu pedido'}
                {paso === 'pago' && 'Pago'}
                {paso === 'seguimiento' && 'Tu pedido'}
              </strong>
              <button className="pedir-close" onClick={() => setVisible(false)}>✕</button>
            </div>

            <div className="pedir-body">
              {paso === 'menu' && (
                <>
                  <div className={'cli-estado ' + (abierto ? 'abierto' : 'cerrado')}>
                    {abierto ? 'Abierto — estamos recibiendo pedidos' : 'Cerrado — vuelve en nuestro horario'}
                  </div>
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
                              {p.imagen
                                ? <img src={p.imagen} alt="" className="cli-plato-img" />
                                : <div className="cli-plato-img ph" />}
                              <div>
                                <div className="cli-plato-nombre">
                                  <i className={'cli-dot ' + (sinStock ? 'rojo' : 'verde')} />
                                  {p.nombre}
                                </div>
                                <div className="cli-plato-precio">S/ {Number(p.precio).toFixed(2)}</div>
                              </div>
                            </div>
                            {sinStock ? (
                              <span className="cli-plato-agotado">Agotado</span>
                            ) : (
                              <div className="cli-stepper">
                                <button className="cli-step-btn" onClick={() => setCantidad(p.id, c - 1)} disabled={c <= 0}>−</button>
                                <span className="cli-step-num">{c}</span>
                                <button
                                  className="cli-step-btn"
                                  onClick={() => (c === 0 ? agregar(p) : setCantidad(p.id, c + 1))}
                                  disabled={c >= p.stock}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
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
                        <button className="cant-btn" onClick={() => setCantidad(plato.id, cantidad - 1)}>−</button>
                        <span className="cli-item-cant">{cantidad}</span>
                        <button className="cant-btn" onClick={() => setCantidad(plato.id, cantidad + 1)} disabled={cantidad >= plato.stock}>+</button>
                        <button className="cli-item-quitar" onClick={() => quitar(plato.id)}>✕</button>
                      </div>
                    </div>
                  ))}

                  <div className="cli-canal" style={{ marginTop: 12 }}>
                    <button className={'cli-canal-opt' + (canal === 'delivery' ? ' sel' : '')} onClick={() => setCanal('delivery')}>
                      Delivery<small>+ S/ {Number(tarifas.delivery_por_plato).toFixed(2)} por plato</small>
                    </button>
                    <button className={'cli-canal-opt' + (canal === 'recojo' ? ' sel' : '')} onClick={() => setCanal('recojo')}>
                      Recojo en local<small>+ S/ {Number(tarifas.envase_por_plato).toFixed(2)} por plato</small>
                    </button>
                  </div>

                  <div className="field" style={{ marginTop: 10 }}><label>Nombre</label><input value={form.nombre} onChange={(e) => campo('nombre', e.target.value)} /></div>
                  <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={(e) => campo('telefono', e.target.value)} inputMode="tel" /></div>
                  {canal === 'delivery' && (
                    <div className="field"><label>Dirección</label><input value={form.direccion} onChange={(e) => campo('direccion', e.target.value)} /></div>
                  )}
                  <div className="field"><label>Notas (opcional)</label><textarea rows={2} value={form.notas} onChange={(e) => campo('notas', e.target.value)} /></div>

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
                      <div className="field"><label>N.º de operación</label><input value={referencia} onChange={(e) => setReferencia(e.target.value)} /></div>
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
                      <div className="cli-pago-chip" style={{ background: '#8D6E63', display: 'inline-block', marginBottom: 10 }}>{PAGO_LABEL[pedido.estado_pago] || 'Pago'}</div>
                      <div className="cli-timeline">
                        {ESTADOS.map((e, i) => {
                          if (e.key === 'en_camino' && pedido.canal !== 'delivery') return null
                          return (
                            <div key={e.key} className={'cli-paso' + (i <= pasoActual ? ' activo' : '')}>
                              <span className="cli-paso-icon">{e.icon}</span>
                              <span className="cli-paso-label">{e.label}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {pedido.items?.map((it, i) => (<div key={i} className="cli-item-simple">{it.cantidad}× {it.plato}</div>))}
                        <div className="total-row final"><span>Total</span><span>S/ {Number(pedido.total).toFixed(2)}</span></div>
                      </div>
                      <button className="btn btn-block btn-outline" style={{ marginTop: 12 }} onClick={() => import('../../lib/boleta.js').then((m) => m.generarBoletaPDF(pedido))}>
                        Descargar boleta
                      </button>
                    </>
                  ) : (
                    <div className="centered">Buscando tu pedido...</div>
                  )}
                </>
              )}
            </div>

            <div className="pedir-foot">
              {paso === 'menu' && (
                <>
                  <div className="pedir-foot-info"><small>{unidades} plato(s)</small><strong>S/ {subtotal.toFixed(2)}</strong></div>
                  <button className="btn" disabled={unidades === 0 || !abierto} onClick={irADatos}>Continuar →</button>
                </>
              )}
              {paso === 'datos' && (
                <>
                  <button className="btn btn-outline" onClick={() => setPaso('menu')}>← Menú</button>
                  <button className="btn" onClick={irAPago}>Ir a pagar →</button>
                </>
              )}
              {paso === 'pago' && (
                <>
                  <button className="btn btn-outline" onClick={() => setPaso('datos')}>← Atrás</button>
                  <button className="btn btn-verde" onClick={confirmar} disabled={enviando}>{enviando ? 'Enviando...' : 'Confirmar pedido'}</button>
                </>
              )}
              {paso === 'seguimiento' && (
                <button className="btn btn-block btn-outline" onClick={() => setPaso('menu')}>Hacer otro pedido</button>
              )}
            </div>
          </div>
        </div>
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