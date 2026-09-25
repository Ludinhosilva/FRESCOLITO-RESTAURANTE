import { useHorario } from '../../hooks/useHorario.ts'
import '../../styles/horario.css'

export default function HorarioBadge() {
  const { cargando, abierto, horas, diasLabel } = useHorario()
  const estado = cargando ? 'Consultando...' : abierto ? 'Abierto ahora' : 'Cerrado'
  const dot = cargando ? 'loading' : abierto ? 'open' : 'closed'

  return (
    <div className="bh-wrapper">
      <div className="bh-indicator">
        <span className={`bh-dot ${dot}`} />
        <span className="bh-status">{estado}</span>
      </div>
      <div className="bh-tooltip">
        <strong>Horario de Atención</strong><br />
        {cargando ? horas : `${diasLabel}: ${horas}`}
      </div>
    </div>
  )
}
