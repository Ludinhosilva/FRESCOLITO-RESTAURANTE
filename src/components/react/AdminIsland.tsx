import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import BarraPersonal from './BarraPersonal.tsx'
import EditarPedido from './EditarPedido.tsx'

const UsoPanel = lazy(() => import('./UsoPanel.jsx'))
import { useState, lazy, Suspense } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarConfig,
  actualizarPlato,
  cancelarPedido,
  crearPlato,
  eliminarPlato,
  fechaHoyLima,
  inicioMesLima,
  listarPedidosDiaAdmin,
  listarPlatos,
  listarPlatosTodos,
  obtenerConfiguracion,
  subirImagenPlato,
  ventasDelDia,
  ventasRango,
  verificarPagoPedido,
} from '../../lib/pedidos.ts'
import { estaAbierto } from '../../lib/pedidosCliente.ts'
import { useRealtime } from '../../hooks/useRealtime.ts'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const CANAL_LABEL = { salon: 'Salón', delivery: 'Delivery', recojo: 'Recojo' }
const CANAL_CLASS = { salon: 'canal-salon', delivery: 'canal-delivery', recojo: 'canal-recojo' }
const PAGO_LABEL = {
  pendiente: 'Pendiente',
  por_verificar: 'Por verificar',
  pagado: 'Pagado',
  contra_entrega: 'Contra entrega',
}
const PAGO_CLASS = {
  pendiente: 'pago-pendiente',
  por_verificar: 'pago-porverificar',
  pagado: 'pago-pagado',
  contra_entrega: 'pago-contraentrega',
}

function descargarCSV(nombre, filas) {
  if (!filas || filas.length === 0) return
  const headers = Object.keys(filas[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [
    headers.join(','),
    ...filas.map((f) => headers.map((h) => esc(f[h])).join(',')),
  ].join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

const hoy = fechaHoyLima
const inicioMes = inicioMesLima

function AdminContenido() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('dia')
  const [fecha, setFecha] = useState(hoy)
  const [desde, setDesde] = useState(inicioMes)
  const [hasta, setHasta] = useState(hoy)
  const [toast, setToast] = useState('')
  const [editando, setEditando] = useState(null)

  const mostrarToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 2500)
  }

  useRealtime('pedidos', () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
    queryClient.invalidateQueries({ queryKey: ['ventas'] })
  })

  const { data: ventas, isLoading: cargandoVentas, isError: errorVentas } = useQuery({ queryKey: ['ventas', fecha], queryFn: () => ventasDelDia(fecha) })
  const { data: mes, isLoading: cargandoMes } = useQuery({
    queryKey: ['ventas-rango', desde, hasta],
    queryFn: () => ventasRango(desde, hasta),
    enabled: tab === 'mes',
  })
  const { data: pedidos = [], isLoading: cargandoPedidos, isError: errorPedidos } = useQuery({
    queryKey: ['pedidos-admin', fecha],
    queryFn: () => listarPedidosDiaAdmin(fecha),
  })
  const { data: platos = [] } = useQuery({ queryKey: ['platos-admin'], queryFn: listarPlatos })
  const { data: config } = useQuery({ queryKey: ['config-admin'], queryFn: obtenerConfiguracion })

  const pm = ventas?.por_metodo || {}
  const totalDigital = (pm.yape ?? 0) + (pm.plin ?? 0)
  const porVerificar = pedidos.filter((p) => p.estado_pago === 'por_verificar' && p.estado !== 'cancelado')

  const handleVerificar = async (pedidoId, estado) => {
    try {
      await verificarPagoPedido(pedidoId, estado, null)
      queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
      mostrarToast(estado === 'pagado' ? 'Pago confirmado' : 'Pago marcado')
    } catch (e) {
      mostrarToast('Error: ' + (e.message || 'no se pudo'))
    }
  }

  const handleCancelar = async (pedidoId) => {
    try {
      await cancelarPedido(pedidoId)
      queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
      mostrarToast('Pedido cancelado')
    } catch (e) {
      mostrarToast('Error: ' + (e.message || 'no se pudo'))
    }
  }

  const TABS = [
    { id: 'dia', label: 'Resumen' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'mes', label: 'Mes' },
    { id: 'uso', label: 'Uso' },
    { id: 'platos', label: 'Platos' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'horario', label: 'Horario' },
  ]

  return (
    <div>
      <div className="page-title">Administración</div>

      <div className="tabs-scroll">
        {TABS.map((t) => (
          <button key={t.id} className={'filtro-chip' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dia' && (
        <div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          {cargandoVentas && <div className="card centered">Cargando ventas…</div>}
          {errorVentas && <div className="card centered" style={{ color: '#C62828' }}>No se pudieron cargar las ventas. Revisa tu conexión.</div>}

          {!cargandoVentas && !errorVentas && (
          <>
          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Cobrado</div>
              <div className="kpi-value">S/ {Number(ventas?.cobrado ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Cuentas abiertas</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(ventas?.cuentas_abiertas ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Total del día</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(ventas?.total_vendido ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Pedidos</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>{ventas?.num_pedidos ?? 0}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Efectivo</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(pm.efectivo ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Yape + Plin</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(totalDigital).toFixed(2)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Caja (cobrado) por método</div>
            <div className="total-row"><span>💵 Efectivo</span><span>S/ {Number(pm.efectivo ?? 0).toFixed(2)}</span></div>
            <div className="total-row"><span>📱 Yape</span><span>S/ {Number(pm.yape ?? 0).toFixed(2)}</span></div>
            <div className="total-row"><span>📱 Plin</span><span>S/ {Number(pm.plin ?? 0).toFixed(2)}</span></div>
            <div className="total-row final"><span>Cobrado</span><span>S/ {Number(ventas?.cobrado ?? 0).toFixed(2)}</span></div>
            <div className="total-row" style={{ color: '#EF6C00' }}><span>Cuentas abiertas (salón)</span><span>S/ {Number(ventas?.cuentas_abiertas ?? 0).toFixed(2)}</span></div>
          </div>

          <div className="card">
            <div className="card-title">Vendido por plato</div>
            {(ventas?.por_plato ?? []).map((p) => (
              <div key={p.plato_nombre} className="total-row">
                <span>{p.plato_nombre} × {p.cantidad}</span>
                <span>S/ {Number(p.total).toFixed(2)}</span>
              </div>
            ))}
            {(ventas?.por_plato ?? []).length === 0 && (
              <div className="centered" style={{ minHeight: 40 }}>Aún no hay ventas este día</div>
            )}
          </div>

          <button
            className="btn btn-outline btn-block"
            onClick={() =>
              descargarCSV(`ventas_${fecha}.csv`, (ventas?.por_plato ?? []).map((p) => ({
                dia: fecha, plato: p.plato_nombre, cantidad: p.cantidad, total: p.total,
              })))
            }
          >
            ⬇️ Exportar día a Excel (CSV)
          </button>
          </>
          )}
        </div>
      )}

      {tab === 'pedidos' && (
        <div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          {cargandoPedidos && <div className="card centered">Cargando pedidos…</div>}
          {errorPedidos && <div className="card centered" style={{ color: '#C62828' }}>No se pudieron cargar los pedidos. Revisa tu conexión.</div>}

          {porVerificar.length > 0 && (
            <div className="verificar-block">
              <div className="verificar-title">Pagos por verificar ({porVerificar.length})</div>
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

          {pedidos.length === 0 && <div className="card centered">No hay pedidos</div>}

          {pedidos.map((p) => {
            const items = p.pedido_items || []
            return (
              <div key={p.id} className="card">
                <div className="orden-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="orden-numero">#{p.numero_orden}</span>
                    <span className={'canal-chip ' + (CANAL_CLASS[p.canal] || 'canal-salon')}>{CANAL_LABEL[p.canal]}</span>
                    <span className={'pago-chip ' + (PAGO_CLASS[p.estado_pago] || '')}>{PAGO_LABEL[p.estado_pago]}</span>
                    {p.estado === 'cancelado' && <span className="pago-chip pago-cancelado">Cancelado</span>}
                  </div>
                  <span className="orden-tiempo">S/ {Number(p.total).toFixed(2)}</span>
                </div>

                {(p.cliente_nombre || p.mesas) && (
                  <div style={{ fontSize: 13, color: '#8D6E63', marginBottom: 6 }}>
                    {p.mesas ? `Mesa ${p.mesas.numero}` : p.cliente_nombre} {p.cliente_telefono ? `· ${p.cliente_telefono}` : ''}
                    {p.cliente_direccion ? ` · 📍 ${p.cliente_direccion}` : ''}
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#8D6E63', marginBottom: 8 }}>
                  {p.metodo_pago || 'Sin método'} · {p.referencia_pago ? `Op. ${p.referencia_pago}` : 'sin n.º op.'} · {p.estado.replace('_', ' ')}
                  {Number(p.ajuste) !== 0 ? ` · ajuste S/ ${Number(p.ajuste).toFixed(2)}` : ''}
                </div>

                {items.map((it) => (
                  <div key={it.id} className="item-row">
                    <span>{it.cantidad}x {it.plato_nombre}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {p.estado_pago === 'por_verificar' && (
                    <button className="btn btn-sm btn-verde" onClick={() => handleVerificar(p.id, 'pagado')}>
                      ✓ Confirmar pago
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline" onClick={() => setEditando(p)}>Editar</button>
                  <button className="btn btn-sm btn-outline" onClick={() => import('../../lib/boleta.js').then((m) => m.generarBoletaPDF(p))}>Boleta</button>
                  {p.estado !== 'cancelado' && (
                    <button className="btn btn-sm btn-rojo" onClick={() => handleCancelar(p.id)}>
                      Cancelar pedido
                    </button>
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
                mostrarToast('Pedido actualizado')
              }}
            />
          )}
        </div>
      )}

      {tab === 'mes' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field"><label>Desde</label><input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
            <div className="field"><label>Hasta</label><input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
          </div>

          {cargandoMes && <div className="card centered">Cargando reporte…</div>}

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Cobrado</div>
              <div className="kpi-value">S/ {Number(mes?.cobrado ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Cuentas abiertas</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(mes?.cuentas_abiertas ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Total del periodo</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>S/ {Number(mes?.total_vendido ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label">Pedidos</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>{mes?.num_pedidos ?? 0}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Por método (cobrado)</div>
            {Object.entries(mes?.por_metodo || {}).map(([k, v]) => (
              <div key={k} className="total-row"><span>{k}</span><span>S/ {Number(v).toFixed(2)}</span></div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Por canal</div>
            {Object.entries(mes?.por_canal || {}).map(([k, v]) => (
              <div key={k} className="total-row"><span>{CANAL_LABEL[k] || k}</span><span>S/ {Number(v).toFixed(2)}</span></div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Por día</div>
            {(mes?.por_dia ?? []).map((d) => (
              <div key={d.dia} className="total-row"><span>{d.dia} ({d.pedidos})</span><span>S/ {Number(d.total).toFixed(2)}</span></div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Por plato</div>
            {(mes?.por_plato ?? []).map((p) => (
              <div key={p.plato_nombre} className="total-row"><span>{p.plato_nombre} × {p.cantidad}</span><span>S/ {Number(p.total).toFixed(2)}</span></div>
            ))}
          </div>

          <button
            className="btn btn-outline btn-block"
            onClick={() =>
              descargarCSV(`ventas_${desde}_a_${hasta}.csv`, (mes?.por_dia ?? []).map((d) => ({
                dia: d.dia, pedidos: d.pedidos, total: d.total,
              })))
            }
          >
            ⬇️ Exportar mes a Excel (CSV)
          </button>
        </div>
      )}

      {tab === 'uso' && (
        <Suspense fallback={<div className="card centered">Cargando monitoreo...</div>}>
          <UsoPanel />
        </Suspense>
      )}

      {tab === 'platos' && <PlatosEditor />}

      {tab === 'inventario' && (
        <div className="card">
          <div className="card-title">Inventario de platos y stock</div>
          {platos.map((p) => (
            <div key={p.id} className="item-row">
              <div>
                <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: '#8D6E63' }}>{p.categoria} · S/ {p.precio.toFixed(2)}</div>
              </div>
              <span className={'plato-stock' + (p.stock <= 0 ? ' sin' : '')}>
                {p.stock <= 0 ? 'Sin stock' : `${p.stock} disp.`}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'horario' && <HorarioEditor config={config} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['config-admin'] }); mostrarToast('Horario guardado') }} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function HorarioEditor({ config, onSaved }) {
  const h = config?.horario || { dias: [1, 2, 3, 4, 5], apertura: '11:30', cierre: '15:15' }
  const [dias, setDias] = useState(h.dias || [])
  const [apertura, setApertura] = useState(h.apertura || '11:30')
  const [cierre, setCierre] = useState(h.cierre || '15:15')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const toggleDia = (i) => setDias((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()))

  const aMin = (t) => {
    const [hh, mm] = (t || '0:0').split(':').map(Number)
    return hh * 60 + mm
  }
  const cruzaMedianoche = aMin(cierre) < aMin(apertura)
  const es24h = aMin(cierre) === aMin(apertura)
  const abiertoAhora = estaAbierto({ dias, apertura, cierre })

  const guardar = async () => {
    if (dias.length === 0) { setError('Selecciona al menos un día.'); return }
    setError('')
    setGuardando(true)
    try {
      await actualizarConfig('horario', { dias, apertura, cierre })
      onSaved()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">Horario de atención</div>
      <p style={{ fontSize: 13, color: '#8D6E63', marginBottom: 10 }}>
        Los pedidos de clientes solo se aceptan dentro de este horario.
      </p>
      <div className="dias-grid">
        {DIAS.map((d, i) => (
          <button key={i} className={'dia-btn' + (dias.includes(i) ? ' active' : '')} onClick={() => toggleDia(i)}>
            {d}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        <div className="field"><label>Apertura</label><input type="time" value={apertura} onChange={(e) => setApertura(e.target.value)} /></div>
        <div className="field"><label>Cierre</label><input type="time" value={cierre} onChange={(e) => setCierre(e.target.value)} /></div>
      </div>

      {es24h && <p style={{ fontSize: 12, color: '#2E7D32', marginTop: 8 }}>Abierto 24 horas los días seleccionados.</p>}
      {cruzaMedianoche && !es24h && <p style={{ fontSize: 12, color: '#EF6C00', marginTop: 8 }}>Cierra de madrugada: el cierre corresponde al día siguiente (ej. abre 11:30 y cierra 04:15 del día siguiente).</p>}
      {error && <p style={{ fontSize: 12, color: '#C62828', marginTop: 8 }}>{error}</p>}

      <p style={{ fontSize: 12, color: '#8D6E63', marginTop: 8 }}>
        Ahora mismo: <strong style={{ color: abiertoAhora ? '#2E7D32' : '#C62828' }}>{abiertoAhora ? 'Abierto' : 'Cerrado'}</strong>
      </p>

      <button className="btn btn-block" onClick={guardar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar horario'}
      </button>
    </div>
  )
}
export default function AdminIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['admin']}>
        <BarraPersonal>
          <AdminContenido />
        </BarraPersonal>
      </GuardPersonal>
    </Proveedores>
  )
}

function PlatosEditor() {
  const queryClient = useQueryClient()
  const { data: platos = [] } = useQuery({ queryKey: ['platos-todos'], queryFn: listarPlatosTodos })
  const vacio = { id: null, nombre: '', categoria: 'Platos Marinos', precio: '', stock: '', descripcion: '', imagen: '', activo: true, incluye_refresco: false }
  const [form, setForm] = useState(vacio)
  const [subiendo, setSubiendo] = useState(false)
  const [toast, setToast] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const reset = () => setForm(vacio)
  const editar = (p) => setForm({
    id: p.id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, stock: p.stock,
    descripcion: p.descripcion || '', imagen: p.imagen || '', activo: p.activo, incluye_refresco: p.incluye_refresco,
  })

  const subir = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagenPlato(file)
      set('imagen', url)
    } catch (err) {
      setToast('Error al subir imagen: ' + err.message)
    } finally {
      setSubiendo(false)
    }
  }

  const guardar = async () => {
    if (!form.nombre || form.precio === '') return setToast('Nombre y precio son obligatorios')
    const precio = Number(form.precio)
    const stock = Number(form.stock) || 0
    if (isNaN(precio) || precio < 0 || precio > 999.99) return setToast('El precio debe estar entre 0 y 999.99')
    if (isNaN(stock) || stock < 0 || stock > 99) return setToast('El stock debe estar entre 0 y 99')
    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precio,
      stock,
      descripcion: form.descripcion.trim() || null,
      imagen: form.imagen || null,
      activo: form.activo,
      incluye_refresco: form.incluye_refresco,
      stock_disponible: stock > 0,
    }
    try {
      if (form.id) await actualizarPlato(form.id, payload)
      else await crearPlato(payload)
      queryClient.invalidateQueries({ queryKey: ['platos-todos'] })
      queryClient.invalidateQueries({ queryKey: ['platos-publico'] })
      setToast(form.id ? 'Plato actualizado' : 'Plato agregado')
      reset()
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  const alternarActivo = async (p) => {
    try {
      await actualizarPlato(p.id, { activo: !p.activo })
      queryClient.invalidateQueries({ queryKey: ['platos-todos'] })
      queryClient.invalidateQueries({ queryKey: ['platos-publico'] })
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar definitivamente "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarPlato(p.id)
      queryClient.invalidateQueries({ queryKey: ['platos-todos'] })
      queryClient.invalidateQueries({ queryKey: ['platos-publico'] })
      setToast('Plato eliminado')
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">{form.id ? 'Editar plato' : 'Agregar plato'}</div>
        <div className="field"><label>Nombre</label><input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} /></div>
        <div className="field"><label>Categoría</label>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
            <option>Platos Marinos</option>
            <option>A la Carta</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field"><label>Precio (S/)</label><input type="number" min="0" max="999.99" step="0.10" inputMode="decimal" value={form.precio} onChange={(e) => set('precio', e.target.value)} /></div>
          <div className="field"><label>Stock</label><input type="number" min="0" max="99" step="1" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} /></div>
        </div>
        <div className="field"><label>Descripción</label><textarea rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></div>
        <div className="field"><label>Foto</label><input type="file" accept="image/*" onChange={subir} />{subiendo && <span style={{ marginLeft: 8, fontSize: 12 }}>subiendo...</span>}</div>
        {form.imagen && <img src={form.imagen} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input type="checkbox" checked={form.incluye_refresco} onChange={(e) => set('incluye_refresco', e.target.checked)} /> Incluye refresco
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} /> Activo (visible en el menú)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={guardar}>{form.id ? 'Guardar cambios' : 'Agregar plato'}</button>
          {form.id && <button className="btn btn-outline" onClick={reset}>Cancelar</button>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Platos ({platos.length})</div>
        {platos.map((p) => (
          <div key={p.id} className="item-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {p.imagen
                ? <img src={p.imagen} alt="" style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8 }} />
                : <div style={{ width: 42, height: 42, borderRadius: 8, background: '#eee' }} />}
              <div>
                <div style={{ fontWeight: 700 }}>{p.nombre} {!p.activo && <span style={{ color: '#C62828', fontSize: 11 }}>(inactivo)</span>}</div>
                <div style={{ fontSize: 12, color: '#8D6E63' }}>{p.categoria} · S/ {Number(p.precio).toFixed(2)} · stock {p.stock}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-outline" onClick={() => editar(p)}>Editar</button>
              <button className={'btn btn-sm ' + (p.activo ? 'btn-naranja' : 'btn-verde')} onClick={() => alternarActivo(p)}>{p.activo ? 'Ocultar' : 'Activar'}</button>
              <button className="btn btn-sm btn-rojo" onClick={() => eliminar(p)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
