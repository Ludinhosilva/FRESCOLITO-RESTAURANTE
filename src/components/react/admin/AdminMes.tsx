import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Banknote, Wallet, TrendingUp, Receipt } from 'lucide-react'
import { ventasRango, fechaHoyLima, inicioMesLima } from '../../../lib/pedidos.ts'
import { CANAL_LABEL } from '../../../lib/dominio.ts'
import { descargarCSV } from './utils.ts'

export default function AdminMes() {
  const [desde, setDesde] = useState(inicioMesLima)
  const [hasta, setHasta] = useState(fechaHoyLima)

  const { data: mes, isLoading } = useQuery({
    queryKey: ['ventas-rango', desde, hasta],
    queryFn: () => ventasRango(desde, hasta),
  })

  return (
    <div>
      <div className="grid-2">
        <div className="field"><label htmlFor="desde">Desde</label><input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
        <div className="field"><label htmlFor="hasta">Hasta</label><input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
      </div>

      {isLoading && <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />}

      <div className="kpi-grid">
        <div className="kpi primary">
          <div className="kpi-label"><Banknote /> Cobrado</div>
          <div className="kpi-value">S/ {Number(mes?.cobrado ?? 0).toFixed(2)}</div>
        </div>
        <div className="kpi small">
          <div className="kpi-label"><Wallet /> Cuentas abiertas</div>
          <div className="kpi-value">S/ {Number(mes?.cuentas_abiertas ?? 0).toFixed(2)}</div>
        </div>
        <div className="kpi small">
          <div className="kpi-label"><TrendingUp /> Total del periodo</div>
          <div className="kpi-value">S/ {Number(mes?.total_vendido ?? 0).toFixed(2)}</div>
        </div>
        <div className="kpi small">
          <div className="kpi-label"><Receipt /> Pedidos</div>
          <div className="kpi-value">{mes?.num_pedidos ?? 0}</div>
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
  )
}
