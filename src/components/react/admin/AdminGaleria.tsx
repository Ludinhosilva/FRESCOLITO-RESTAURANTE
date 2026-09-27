import { useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload, ArrowUp, ArrowDown, Eye, EyeOff, Trash2, ImagePlus } from 'lucide-react'
import {
  listarGaleriaAdmin,
  subirImagenGaleria,
  crearFoto,
  actualizarFoto,
  eliminarFoto,
  siguienteOrden,
  type GaleriaTabla,
} from '../../../lib/galeria.ts'
import { useToast } from '../ui/Toast.tsx'
import ConfirmDialog from '../ConfirmDialog.tsx'

const CATS: Record<GaleriaTabla, { id: string; label: string }[]> = {
  galeria: [
    { id: 'platos', label: 'Platos' },
    { id: 'ambiente', label: 'Ambiente' },
    { id: 'mesa', label: 'Mesa y Presentación' },
  ],
  eventos_fotos: [
    { id: 'bodas', label: 'Bodas' },
    { id: 'corporativos', label: 'Corporativos' },
    { id: 'cumpleanos', label: 'Cumpleaños' },
    { id: 'bautizos', label: 'Bautizos' },
    { id: 'aniversarios', label: 'Aniversarios' },
    { id: 'otros', label: 'Otros' },
  ],
}

const TABS: { id: GaleriaTabla; label: string }[] = [
  { id: 'galeria', label: 'Galería' },
  { id: 'eventos_fotos', label: 'Eventos' },
]

export default function AdminGaleria() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [tabla, setTabla] = useState<GaleriaTabla>('galeria')
  const [categoria, setCategoria] = useState('platos')
  const [alt, setAlt] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [eliminandoBusy, setEliminandoBusy] = useState(false)

  const { data: fotos = [], isLoading } = useQuery({
    queryKey: ['galeria-admin', tabla],
    queryFn: () => listarGaleriaAdmin(tabla),
  })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['galeria-admin', tabla] })
    queryClient.invalidateQueries({ queryKey: ['galeria-public'] })
  }

  const cambiarTabla = (t) => {
    setTabla(t)
    setCategoria(CATS[t][0].id)
  }

  const subir = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length === 0) return
    setSubiendo(true)
    try {
      let orden = await siguienteOrden(tabla)
      for (const file of files) {
        const url = await subirImagenGaleria(file)
        await crearFoto(tabla, { categoria, url, alt: alt.trim() || null, orden })
        orden += 1
      }
      invalidar()
      toast(files.length > 1 ? `${files.length} fotos agregadas` : 'Foto agregada')
      setAlt('')
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const mover = async (foto, dir) => {
    const i = fotos.findIndex((f) => f.id === foto.id)
    const j = dir === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= fotos.length) return
    const a = fotos[i]
    const b = fotos[j]
    try {
      await actualizarFoto(tabla, a.id, { orden: j + 1 })
      await actualizarFoto(tabla, b.id, { orden: i + 1 })
      invalidar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const alternarActivo = async (foto) => {
    try {
      await actualizarFoto(tabla, foto.id, { activo: !foto.activo })
      invalidar()
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const eliminar = async () => {
    setEliminandoBusy(true)
    try {
      await eliminarFoto(tabla, eliminando.id)
      invalidar()
      toast('Foto eliminada')
      setEliminando(null)
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    } finally {
      setEliminandoBusy(false)
    }
  }

  return (
    <div>
      <div className="tabs-scroll">
        {TABS.map((t) => (
          <button key={t.id} className={'filtro-chip' + (tabla === t.id ? ' active' : '')} onClick={() => cambiarTabla(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><Upload style={{ width: 16, height: 16 }} /> Agregar fotos</div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="gal-cat">Categoría</label>
            <select id="gal-cat" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {CATS[tabla].map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gal-alt">Descripción (opcional)</label>
            <input id="gal-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ej: Boda en el salón" />
          </div>
        </div>
        <label className="btn btn-block" style={{ cursor: 'pointer' }}>
          <ImagePlus /> {subiendo ? 'Subiendo...' : 'Elegir fotos (varias)'}
          <input type="file" accept="image/*" multiple onChange={subir} disabled={subiendo} style={{ display: 'none' }} />
        </label>
        <p className="text-xs muted mt-2">Se optimizan automáticamente (máx. 5 MB por foto).</p>
      </div>

      <div className="card">
        <div className="card-title">Fotos ({fotos.length})</div>
        {isLoading && <div className="skeleton" style={{ height: 80 }} />}
        {!isLoading && fotos.length === 0 && <div className="empty">Sin fotos todavía</div>}
        <div className="gal-admin-grid">
          {fotos.map((f, i) => (
            <div key={f.id} className={'gal-admin-item' + (f.activo ? '' : ' off')}>
              <img src={f.url} alt={f.alt || ''} loading="lazy" />
              <span className="gal-admin-cat">{CATS[tabla].find((c) => c.id === f.categoria)?.label || f.categoria}</span>
              <div className="gal-admin-actions">
                <button className="icon-btn sm" aria-label="Subir" disabled={i === 0} onClick={() => mover(f, 'up')}><ArrowUp /></button>
                <button className="icon-btn sm" aria-label="Bajar" disabled={i === fotos.length - 1} onClick={() => mover(f, 'down')}><ArrowDown /></button>
                <button className="icon-btn sm" aria-label={f.activo ? 'Ocultar' : 'Mostrar'} onClick={() => alternarActivo(f)}>{f.activo ? <EyeOff /> : <Eye />}</button>
                <button className="icon-btn sm" aria-label="Eliminar" onClick={() => setEliminando(f)}><Trash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar foto"
          peligro
          confirmLabel="Sí, eliminar"
          ocupado={eliminandoBusy}
          onCancel={() => setEliminando(null)}
          onConfirm={eliminar}
        >
          <p>¿Eliminar esta foto de la galería?</p>
          <p className="cli-legal">Esta acción no se puede deshacer.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
