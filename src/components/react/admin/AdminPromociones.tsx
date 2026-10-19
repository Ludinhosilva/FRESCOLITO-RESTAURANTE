import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUp, ArrowDown, Eye, EyeOff, Trash2, Pencil, Plus, ImagePlus, X } from 'lucide-react'
import {
  listarPromocionesAdmin,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
  siguienteOrdenPromocion,
} from '../../../lib/promociones.ts'
import { subirImagenGaleria } from '../../../lib/galeria.ts'
import { useToast } from '../ui/Toast.tsx'
import ConfirmDialog from '../ConfirmDialog.tsx'

const VACIO = {
  titulo: '',
  descripcion: '',
  imagen: '',
  badge: '',
  precio_oferta: '',
  precio_regular: '',
  enlace: '',
  cta_label: '',
  fecha_fin: '',
}

function isoALocal(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function AdminPromociones() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState(VACIO)
  const [editId, setEditId] = useState<number | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [eliminando, setEliminando] = useState<any>(null)
  const [eliminandoBusy, setEliminandoBusy] = useState(false)

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['promociones-admin'],
    queryFn: listarPromocionesAdmin,
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['promociones-admin'] })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const editar = (p: any) => {
    setEditId(p.id)
    setForm({
      titulo: p.titulo || '',
      descripcion: p.descripcion || '',
      imagen: p.imagen || '',
      badge: p.badge || '',
      precio_oferta: p.precio_oferta || '',
      precio_regular: p.precio_regular || '',
      enlace: p.enlace || '',
      cta_label: p.cta_label || '',
      fecha_fin: isoALocal(p.fecha_fin),
    })
  }

  const reset = () => {
    setEditId(null)
    setForm(VACIO)
  }

  const subirImagen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagenGaleria(file)
      set('imagen', url)
      toast('Imagen lista')
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const guardar = async () => {
    if (!form.titulo.trim()) {
      toast('El título es obligatorio', 'error')
      return
    }
    const datos = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      imagen: form.imagen || null,
      badge: form.badge.trim() || null,
      precio_oferta: form.precio_oferta.trim() || null,
      precio_regular: form.precio_regular.trim() || null,
      enlace: form.enlace.trim() || null,
      cta_label: form.cta_label.trim() || null,
      fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
    }
    try {
      if (editId) {
        await actualizarPromocion(editId, datos)
        toast('Promoción actualizada')
      } else {
        const orden = await siguienteOrdenPromocion()
        await crearPromocion({ ...datos, orden })
        toast('Promoción creada')
      }
      invalidar()
      reset()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const mover = async (p: any, dir: 'up' | 'down') => {
    const i = promos.findIndex((x) => x.id === p.id)
    const j = dir === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= promos.length) return
    try {
      await actualizarPromocion(promos[i].id, { orden: promos[j].orden })
      await actualizarPromocion(promos[j].id, { orden: promos[i].orden })
      invalidar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const alternar = async (p: any) => {
    try {
      await actualizarPromocion(p.id, { activo: !p.activo })
      invalidar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const eliminar = async () => {
    setEliminandoBusy(true)
    try {
      await eliminarPromocion(eliminando.id)
      invalidar()
      toast('Promoción eliminada')
      setEliminando(null)
      if (editId === eliminando.id) reset()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setEliminandoBusy(false)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          {editId ? <Pencil style={{ width: 16, height: 16 }} /> : <Plus style={{ width: 16, height: 16 }} />}
          {editId ? 'Editar promoción' : 'Nueva promoción'}
          {editId && (
            <button className="icon-btn sm" style={{ marginLeft: 'auto' }} onClick={reset} aria-label="Cancelar edición">
              <X />
            </button>
          )}
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="promo-titulo">Título *</label>
            <input id="promo-titulo" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ej: 2x1 en Ceviches" />
          </div>
          <div className="field">
            <label htmlFor="promo-badge">Badge</label>
            <input id="promo-badge" value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Ej: 2x1, -30%, Desayuno" />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="promo-oferta">Precio oferta</label>
            <input id="promo-oferta" value={form.precio_oferta} onChange={(e) => set('precio_oferta', e.target.value)} placeholder="Ej: S/ 15" />
          </div>
          <div className="field">
            <label htmlFor="promo-regular">Precio regular</label>
            <input id="promo-regular" value={form.precio_regular} onChange={(e) => set('precio_regular', e.target.value)} placeholder="Ej: S/ 25" />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="promo-enlace">Enlace del botón</label>
            <input id="promo-enlace" value={form.enlace} onChange={(e) => set('enlace', e.target.value)} placeholder="/menu, https://wa.me/..., etc." />
          </div>
          <div className="field">
            <label htmlFor="promo-cta">Texto del botón</label>
            <input id="promo-cta" value={form.cta_label} onChange={(e) => set('cta_label', e.target.value)} placeholder="Ej: Pedir ahora" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="promo-desc">Descripción</label>
          <textarea id="promo-desc" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2} placeholder="Detalle de la promoción (opcional)" />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="promo-fin">Fecha fin (cuenta regresiva)</label>
            <input id="promo-fin" type="datetime-local" value={form.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} />
          </div>
          <div className="field">
            <label>Imagen</label>
            <label className="btn btn-block" style={{ cursor: 'pointer' }}>
              <ImagePlus /> {subiendo ? 'Subiendo...' : 'Elegir imagen'}
              <input type="file" accept="image/*" onChange={subirImagen} disabled={subiendo} style={{ display: 'none' }} />
            </label>
            {form.imagen && <img src={form.imagen} alt="" style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
          </div>
        </div>

        <button className="btn btn-block" onClick={guardar}>{editId ? 'Guardar cambios' : 'Crear promoción'}</button>
      </div>

      <div className="card">
        <div className="card-title">Promociones ({promos.length})</div>
        {isLoading && <div className="skeleton" style={{ height: 80 }} />}
        {!isLoading && promos.length === 0 && <div className="empty">Sin promociones todavía</div>}
        <div className="gal-admin-grid">
          {promos.map((p, i) => (
            <div key={p.id} className={'gal-admin-item' + (p.activo ? '' : ' off')}>
              {p.imagen ? <img src={p.imagen} alt={p.titulo} loading="lazy" /> : <div className="promo-ph">{p.titulo.slice(0, 1)}</div>}
              <span className="gal-admin-cat">{p.badge || p.titulo}</span>
              {p.fecha_fin && <span className="text-xs muted">vence {new Date(p.fecha_fin).toLocaleDateString()}</span>}
              <div className="gal-admin-actions">
                <button className="icon-btn sm" aria-label="Subir" disabled={i === 0} onClick={() => mover(p, 'up')}><ArrowUp /></button>
                <button className="icon-btn sm" aria-label="Bajar" disabled={i === promos.length - 1} onClick={() => mover(p, 'down')}><ArrowDown /></button>
                <button className="icon-btn sm" aria-label="Editar" onClick={() => editar(p)}><Pencil /></button>
                <button className="icon-btn sm" aria-label={p.activo ? 'Ocultar' : 'Mostrar'} onClick={() => alternar(p)}>{p.activo ? <EyeOff /> : <Eye />}</button>
                <button className="icon-btn sm" aria-label="Eliminar" onClick={() => setEliminando(p)}><Trash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar promoción"
          peligro
          confirmLabel="Sí, eliminar"
          ocupado={eliminandoBusy}
          onCancel={() => setEliminando(null)}
          onConfirm={eliminar}
        >
          <p>¿Eliminar «{eliminando.titulo}»?</p>
          <p className="cli-legal">Esta acción no se puede deshacer.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
