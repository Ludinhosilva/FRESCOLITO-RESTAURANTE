import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Eye, EyeOff, Trash2, ImagePlus, Plus, Star } from 'lucide-react'
import { actualizarPlato, crearPlato, eliminarPlato, listarPlatos, listarPlatosTodos, subirImagenPlato } from '../../../lib/pedidos.ts'
import { useToast } from '../ui/Toast.tsx'
import ConfirmDialog from '../ConfirmDialog.tsx'
import Sheet from '../ui/Sheet.tsx'

const VACIO = { id: null, nombre: '', categoria: 'Platos Marinos', precio: '', stock: '', descripcion: '', imagen: '', activo: true, incluye_refresco: false, destacado: false, destacado_orden: 0 }

function PlatosEditor() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: platos = [] } = useQuery({ queryKey: ['platos-todos'], queryFn: listarPlatosTodos })
  const [form, setForm] = useState(VACIO)
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [eliminandoBusy, setEliminandoBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const abrirNuevo = () => {
    setForm(VACIO)
    setSheetAbierto(true)
  }

  const abrirEditar = (p) => {
    setForm({
      id: p.id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, stock: p.stock,
      descripcion: p.descripcion || '', imagen: p.imagen || '', activo: p.activo, incluye_refresco: p.incluye_refresco,
      destacado: !!p.destacado, destacado_orden: p.destacado_orden ?? 0,
    })
    setSheetAbierto(true)
  }

  const cerrar = () => {
    setSheetAbierto(false)
    setForm(VACIO)
  }

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['platos-todos'] })
    queryClient.invalidateQueries({ queryKey: ['platos-publico'] })
    queryClient.invalidateQueries({ queryKey: ['platos-admin'] })
  }

  const subir = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagenPlato(file)
      set('imagen', url)
    } catch (err) {
      toast('Error al subir imagen: ' + err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  const guardar = async () => {
    if (!form.nombre || form.precio === '') return toast('Nombre y precio son obligatorios', 'error')
    const precio = Number(form.precio)
    const stock = Number(form.stock) || 0
    if (isNaN(precio) || precio < 0 || precio > 999.99) return toast('El precio debe estar entre 0 y 999.99', 'error')
    if (isNaN(stock) || stock < 0 || stock > 99) return toast('El stock debe estar entre 0 y 99', 'error')
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
      destacado: form.destacado,
      destacado_orden: Number(form.destacado_orden) || 0,
    }
    try {
      if (form.id) await actualizarPlato(form.id, payload)
      else await crearPlato(payload)
      invalidar()
      toast(form.id ? 'Plato actualizado' : 'Plato agregado')
      cerrar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const alternarActivo = async (p) => {
    try {
      await actualizarPlato(p.id, { activo: !p.activo })
      invalidar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const alternarDestacado = async (p) => {
    try {
      await actualizarPlato(p.id, { destacado: !p.destacado })
      invalidar()
      toast(p.destacado ? 'Quitado de destacados' : 'Agregado a destacados')
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const eliminar = async () => {
    setEliminandoBusy(true)
    try {
      await eliminarPlato(eliminando.id)
      invalidar()
      toast('Plato eliminado')
      setEliminando(null)
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setEliminandoBusy(false)
    }
  }

  return (
    <div>
      <button className="btn btn-block mb-3" onClick={abrirNuevo}>
        <Plus /> Agregar plato
      </button>

      <div className="card">
        <div className="card-title">Platos ({platos.length})</div>
        {platos.map((p) => (
          <div key={p.id} className="item-row">
            <div className="row">
              {p.imagen
                ? <img src={p.imagen} alt="" style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8 }} />
                : <div style={{ width: 42, height: 42, borderRadius: 8, background: '#eee', display: 'grid', placeItems: 'center' }}><ImagePlus style={{ width: 18, height: 18, color: '#aaa' }} /></div>}
              <div>
                <div style={{ fontWeight: 700 }}>{p.nombre} {!p.activo && <span style={{ color: 'var(--danger)', fontSize: 11 }}>(inactivo)</span>}</div>
                <div className="text-xs muted">{p.categoria} · S/ {Number(p.precio).toFixed(2)} · stock {p.stock}</div>
              </div>
            </div>
            <div className="row-wrap">
              <button className={'btn btn-sm ' + (p.destacado ? 'btn-naranja' : 'btn-outline')} aria-label={p.destacado ? `Quitar de destacados: ${p.nombre}` : `Destacar: ${p.nombre}`} onClick={() => alternarDestacado(p)}>
                <Star fill={p.destacado ? 'currentColor' : 'none'} />
              </button>
              <button className="btn btn-sm btn-outline" aria-label={`Editar ${p.nombre}`} onClick={() => abrirEditar(p)}><Pencil /></button>
              <button className={'btn btn-sm ' + (p.activo ? 'btn-naranja' : 'btn-verde')} aria-label={p.activo ? `Ocultar ${p.nombre}` : `Activar ${p.nombre}`} onClick={() => alternarActivo(p)}>
                {p.activo ? <EyeOff /> : <Eye />}
              </button>
              <button className="btn btn-sm btn-rojo" aria-label={`Eliminar ${p.nombre}`} onClick={() => setEliminando(p)}><Trash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {sheetAbierto && (
        <Sheet
          title={form.id ? `Editar: ${form.nombre || 'plato'}` : 'Agregar plato'}
          onClose={cerrar}
          footer={
            <>
              <button className="btn btn-outline grow" onClick={cerrar}>Cancelar</button>
              <button className="btn grow" onClick={guardar}>{form.id ? 'Guardar cambios' : 'Agregar plato'}</button>
            </>
          }
        >
          <div className="field"><label htmlFor="pl-nombre">Nombre</label><input id="pl-nombre" autoFocus value={form.nombre} onChange={(e) => set('nombre', e.target.value)} /></div>
          <div className="field"><label htmlFor="pl-cat">Categoría</label>
            <select id="pl-cat" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
              <option>Platos Marinos</option>
              <option>A la Carta</option>
            </select>
          </div>
          <div className="grid-2">
            <div className="field"><label htmlFor="pl-precio">Precio (S/)</label><input id="pl-precio" type="number" min="0" max="999.99" step="0.10" inputMode="decimal" value={form.precio} onChange={(e) => set('precio', e.target.value)} /></div>
            <div className="field"><label htmlFor="pl-stock">Stock</label><input id="pl-stock" type="number" min="0" max="99" step="1" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} /></div>
          </div>
          <div className="field"><label htmlFor="pl-desc">Descripción</label><textarea id="pl-desc" rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></div>
          <div className="field">
            <label htmlFor="pl-foto">Foto</label>
            <input id="pl-foto" type="file" accept="image/*" onChange={subir} />
            {subiendo && <span className="text-xs muted" style={{ marginLeft: 8 }}>subiendo...</span>}
          </div>
          {form.imagen && <img src={form.imagen} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
          <label className="row mb-2"><input type="checkbox" checked={form.incluye_refresco} onChange={(e) => set('incluye_refresco', e.target.checked)} /> Incluye refresco</label>
          <label className="row mb-2"><input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} /> Activo (visible en el menú)</label>
          <label className="row mb-2"><input type="checkbox" checked={form.destacado} onChange={(e) => set('destacado', e.target.checked)} /> Destacar en el inicio</label>
          {form.destacado && (
            <div className="field">
              <label htmlFor="pl-dest-orden">Orden en destacados (menor = primero)</label>
              <input id="pl-dest-orden" type="number" min="0" step="1" inputMode="numeric" value={form.destacado_orden} onChange={(e) => set('destacado_orden', e.target.value)} />
            </div>
          )}
        </Sheet>
      )}

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar plato"
          peligro
          confirmLabel="Sí, eliminar"
          ocupado={eliminandoBusy}
          onCancel={() => setEliminando(null)}
          onConfirm={eliminar}
        >
          <p>¿Eliminar definitivamente <strong>{eliminando.nombre}</strong>?</p>
          <p className="cli-legal">Esta acción no se puede deshacer.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}

function Inventario() {
  const { data: platos = [], isLoading } = useQuery({ queryKey: ['platos-admin'], queryFn: listarPlatos })
  return (
    <div className="card">
      <div className="card-title">Inventario de platos y stock</div>
      {isLoading && <div className="skeleton" style={{ height: 60 }} />}
      {!isLoading && platos.length === 0 && <div className="empty">Sin platos</div>}
      {platos.map((p) => (
        <div key={p.id} className="item-row">
          <div>
            <div style={{ fontWeight: 700 }}>{p.nombre}</div>
            <div className="text-xs muted">{p.categoria} · S/ {p.precio.toFixed(2)}</div>
          </div>
          <span className={'plato-stock' + (p.stock <= 0 ? ' sin' : '')}>
            {p.stock <= 0 ? 'Sin stock' : `${p.stock} disp.`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminCatalogo({ vista = 'platos' }) {
  return vista === 'inventario' ? <Inventario /> : <PlatosEditor />
}
