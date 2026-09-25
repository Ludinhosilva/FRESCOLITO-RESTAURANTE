import { useQuery } from '@tanstack/react-query'
import { obtenerMonitoreo } from '../../lib/pedidos.ts'
import AnimatedCounter from './bits/AnimatedCounter.tsx'
import BarChart from './bits/BarChart.tsx'
import Gauge from './bits/Gauge.tsx'

const LIMITE_MB = 500

export default function UsoPanel() {
  const { data, isLoading } = useQuery({ queryKey: ['monitoreo'], queryFn: obtenerMonitoreo })

  if (isLoading) return <div className="card centered">Calculando uso...</div>
  if (!data) return <div className="card centered">Sin datos</div>

  const porMes = (data.por_mes || []).map((m) => ({ label: m.mes, value: m.pedidos }))
  const dbBytes = Number(data.db_bytes || 0)
  const pct = Math.min(100, (dbBytes / (LIMITE_MB * 1024 * 1024)) * 100)
  const libreMb = Math.max(0, LIMITE_MB - Math.round(dbBytes / 1024 / 1024))

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Pedidos este mes</div>
          <div className="kpi-value"><AnimatedCounter value={data.pedidos_mes ?? 0} /></div>
        </div>
        <div className="kpi small">
          <div className="kpi-label">Pedidos totales</div>
          <div className="kpi-value" style={{ fontSize: 18 }}><AnimatedCounter value={data.pedidos_total ?? 0} /></div>
        </div>
        <div className="kpi small">
          <div className="kpi-label">Ítems registrados</div>
          <div className="kpi-value" style={{ fontSize: 18 }}><AnimatedCounter value={data.items_total ?? 0} /></div>
        </div>
        <div className="kpi small">
          <div className="kpi-label">Tamaño de BD</div>
          <div className="kpi-value" style={{ fontSize: 18 }}>{data.db_pretty}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Pedidos por mes</div>
        {porMes.length > 0 ? (
          <BarChart data={porMes} height={260} />
        ) : (
          <div className="centered">Aún no hay pedidos registrados</div>
        )}
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="card-title">Uso del plan gratuito</div>
        <Gauge value={pct} label="de 500 MB" />
        <p className="cli-legal">
          {data.db_pretty} de {LIMITE_MB} MB · te queda ~{libreMb} MB libres
        </p>
      </div>
    </div>
  )
}
