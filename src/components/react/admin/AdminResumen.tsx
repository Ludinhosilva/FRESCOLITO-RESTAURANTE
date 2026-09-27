import { useQuery } from '@tanstack/react-query'
import { Banknote, Wallet, TrendingUp, Receipt, Smartphone } from 'lucide-react'
import { ventasDelDia } from '../../../lib/pedidos.ts'
import { descargarCSV } from './utils.ts'

export default function AdminResumen({ fecha, setFecha }) {
  const { data: ventas, isLoading, isError } = useQuery({ queryKey: ['ventas', fecha], queryFn: () => ventasDelDia(fecha) })

  const pm = ventas?.por_metodo || {}
  const totalDigital = (pm.yape ?? 0) + (pm.plin ?? 0)

  return (
    <div>
      <div className="field">
        <label htmlFor="fecha-dia">Fecha</label>
        <input id="fecha-dia" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      {isLoading && <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />}
      {isError && <div className="empty" role="alert">No se pudieron cargar las ventas. Revisa tu conexión.</div>}

      {!isLoading && !isError && (
        <>
          <div className="kpi-grid">
            <div className="kpi primary">
              <div className="kpi-label"><Banknote /> Cobrado</div>
              <div className="kpi-value">S/ {Number(ventas?.cobrado ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label"><Wallet /> Cuentas abiertas</div>
              <div className="kpi-value">S/ {Number(ventas?.cuentas_abiertas ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label"><TrendingUp /> Total del día</div>
              <div className="kpi-value">S/ {Number(ventas?.total_vendido ?? 0).toFixed(2)}</div>
            </div>
            <div className="kpi small">
              <div className="kpi-label"><Receipt /> Pedidos</div>
              <div className="kpi-value">{ventas?.num_pedidos ?? 0}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Caja (cobrado) por método</div>
            <div className="total-row"><span>💵 Efectivo</span><span>S/ {Number(pm.efectivo ?? 0).toFixed(2)}</span></div>
            <div className="total-row"><span>📱 Yape</span><span>S/ {Number(pm.yape ?? 0).toFixed(2)}</span></div>
            <div className="total-row"><span>📱 Plin</span><span>S/ {Number(pm.plin ?? 0).toFixed(2)}</span></div>
            <div className="total-row final"><span>Cobrado</span><span>S/ {Number(ventas?.cobrado ?? 0).toFixed(2)}</span></div>
            <div className="total-row" style={{ color: 'var(--warning)' }}>
              <span><Smartphone /> Yape + Plin</span><span>S/ {Number(totalDigital).toFixed(2)}</span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Vendido por plato</div>
            {(ventas?.por_plato ?? []).map((p) => (
              <div key={p.plato_nombre} className="total-row">
                <span>{p.plato_nombre} × {p.cantidad}</span>
                <span>S/ {Number(p.total).toFixed(2)}</span>
              </div>
            ))}
            {(ventas?.por_plato ?? []).length === 0 && <div className="text-sm muted">Aún no hay ventas este día</div>}
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
  )
}
