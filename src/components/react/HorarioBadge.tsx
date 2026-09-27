import { useHorario } from '../../hooks/useHorario.ts'
import '../../styles/horario.css'

export default function HorarioBadge() {
  const { cargando, abierto, horas, diasLabel, proxima } = useHorario()
  const estado = cargando ? 'Consultando...' : abierto ? 'Abierto ahora' : 'Cerrado'
  const dot = cargando ? 'loading' : abierto ? 'open' : 'closed'

  return (
    <div className="bh-wrapper">
      <div className="bh-indicator">
        <span className={`bh-dot ${dot}`} />
        <span className="bh-status">{estado}</span>
      </div>
      <div className="bh-tooltip" role="tooltip">
        <strong>Horario de atención</strong>
        <span className="bh-tooltip-line">{cargando ? horas : `${diasLabel} · ${horas}`}</span>
        {!cargando && !abierto && proxima && (
          <span className="bh-tooltip-next">Abrimos {proxima}</span>
        )}
      </div>
    </div>
  )
}
