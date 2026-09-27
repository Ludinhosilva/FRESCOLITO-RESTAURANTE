import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { actualizarConfig } from '../../../lib/pedidos.ts'
import { estaAbierto, horarioConDias, HORA_APERTURA, HORA_CIERRE } from '../../../lib/horario.ts'
import { useToast } from '../ui/Toast.tsx'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function AdminConfig({ config }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [dias, setDias] = useState(config?.horario?.dias || [])
  const [configRef, setConfigRef] = useState(config)
  const [guardando, setGuardando] = useState(false)

  if (config !== configRef) {
    setConfigRef(config)
    if (config?.horario?.dias) setDias(config.horario.dias)
  }

  const toggleDia = (i) => setDias((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()))
  const abiertoAhora = estaAbierto(horarioConDias(dias))

  const guardar = async () => {
    if (dias.length === 0) return toast('Selecciona al menos un día', 'error')
    setGuardando(true)
    try {
      await actualizarConfig('horario', { dias, apertura: HORA_APERTURA, cierre: HORA_CIERRE })
      queryClient.invalidateQueries({ queryKey: ['config-admin'] })
      toast('Horario guardado')
    } catch (e) {
      toast('Error: ' + (e.message || 'no se pudo guardar'), 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title"><Clock style={{ width: 16, height: 16 }} /> Días de atención</div>
      <p className="text-sm muted mb-3">
        El horario es fijo: <strong>11:00 AM – 3:30 PM</strong>. Aquí solo eliges qué días abrimos.
      </p>
      <div className="dias-grid">
        {DIAS.map((d, i) => (
          <button key={i} className={'dia-btn' + (dias.includes(i) ? ' active' : '')} aria-pressed={dias.includes(i)} onClick={() => toggleDia(i)}>
            {d}
          </button>
        ))}
      </div>
      <p className="text-xs muted mt-3">
        Ahora mismo: <strong style={{ color: abiertoAhora ? 'var(--success)' : 'var(--danger)' }}>{abiertoAhora ? 'Abierto' : 'Cerrado'}</strong>
      </p>
      <button className="btn btn-block mt-2" onClick={guardar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar días'}
      </button>
    </div>
  )
}
