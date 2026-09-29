import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, EyeOff, Trash2, Move } from 'lucide-react'
import { listarMesas, crearMesa, actualizarMesa, eliminarMesa } from '../../../lib/mesas.ts'
import { useToast } from '../ui/Toast.tsx'
import ConfirmDialog from '../ConfirmDialog.tsx'
import Sheet from '../ui/Sheet.tsx'
import MesasPlano from '../MesasPlano.tsx'

export default function AdminMesas() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: mesas = [], isLoading } = useQuery({ queryKey: ['mesas-admin'], queryFn: listarMesas })
  const [nueva, setNueva] = useState(false)
  const [form, setForm] = useState({ numero: '', nombre: '', capacidad: '4' })
  const [eliminando, setEliminando] = useState(null)
  const [busy, setBusy] = useState(false)

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['mesas-admin'] })
    queryClient.invalidateQueries({ queryKey: ['mesas'] })
  }

  const mover = async (id, x, y) => {
    try {
      await actualizarMesa(id, { x, y })
      invalidar()
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo mover'), 'error')
    }
  }

  const crear = async () => {
    const numero = Number(form.numero)
    if (!numero || numero < 1) return toast('Ingresa un número de mesa válido', 'error')
    setBusy(true)
    try {
      await crearMesa({ numero, nombre: form.nombre.trim(), capacidad: Number(form.capacidad) || 4 })
      invalidar()
      toast('Mesa agregada')
      setNueva(false)
      setForm({ numero: '', nombre: '', capacidad: '4' })
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo crear'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const alternarActiva = async (m) => {
    try {
      await actualizarMesa(m.id, { activa: !m.activa })
      invalidar()
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error')
    }
  }

  const eliminar = async () => {
    setBusy(true)
    try {
      await eliminarMesa(eliminando.id)
      invalidar()
      toast('Mesa eliminada')
      setEliminando(null)
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo eliminar'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button className="btn btn-block mb-3" onClick={() => setNueva(true)}>
        <Plus /> Agregar mesa
      </button>

      <div className="card">
        <div className="card-title"><Move style={{ width: 16, height: 16 }} /> Plano del local (arrastra para ubicar)</div>
        {isLoading ? (
          <div className="skeleton" style={{ height: 260 }} />
        ) : mesas.length === 0 ? (
          <div className="empty">Sin mesas todavía</div>
        ) : (
          <>
            <MesasPlano mesas={mesas} dragMode="move" onMove={mover} />
            <div className="plano-leyenda">
              <span><i className="libre" /> Disponible</span>
              <span><i className="ocupada" /> Ocupada</span>
              <span><i className="cobrar" /> Por cobrar</span>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">Mesas ({mesas.length})</div>
        {mesas.map((m) => (
          <div key={m.id} className="item-row">
            <div>
              <div style={{ fontWeight: 700 }}>Mesa {m.numero} {!m.activa && <span style={{ color: 'var(--danger)', fontSize: 11 }}>(inactiva)</span>}</div>
              <div className="text-xs muted">{m.capacidad || 4} sillas · x {m.x}% · y {m.y}%</div>
            </div>
            <div className="row-wrap">
              <button className={'btn btn-sm ' + (m.activa ? 'btn-naranja' : 'btn-verde')} aria-label={m.activa ? `Desactivar mesa ${m.numero}` : `Activar mesa ${m.numero}`} onClick={() => alternarActiva(m)}>
                {m.activa ? <EyeOff /> : <Eye />}
              </button>
              <button className="btn btn-sm btn-rojo" aria-label={`Eliminar mesa ${m.numero}`} onClick={() => setEliminando(m)}><Trash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {nueva && (
        <Sheet
          title="Agregar mesa"
          onClose={() => setNueva(false)}
          footer={
            <>
              <button className="btn btn-outline grow" onClick={() => setNueva(false)}>Cancelar</button>
              <button className="btn grow" onClick={crear} disabled={busy}>{busy ? 'Guardando...' : 'Agregar'}</button>
            </>
          }
        >
          <div className="field"><label htmlFor="m-num">Número</label><input id="m-num" type="number" min="1" inputMode="numeric" value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} /></div>
          <div className="field"><label htmlFor="m-nombre">Nombre (opcional)</label><input id="m-nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Mesa 11" /></div>
          <div className="field"><label htmlFor="m-cap">Capacidad (sillas)</label><input id="m-cap" type="number" min="1" max="20" inputMode="numeric" value={form.capacidad} onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))} /></div>
        </Sheet>
      )}

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar mesa"
          peligro
          confirmLabel="Sí, eliminar"
          ocupado={busy}
          onCancel={() => setEliminando(null)}
          onConfirm={eliminar}
        >
          <p>¿Eliminar la <strong>Mesa {eliminando.numero}</strong>?</p>
          <p className="cli-legal">Los pedidos ya registrados no se borran.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
