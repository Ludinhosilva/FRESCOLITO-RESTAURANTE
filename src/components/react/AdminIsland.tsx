import { lazy, Suspense, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Proveedores from './Proveedores.tsx'
import GuardPersonal from './GuardPersonal.tsx'
import AppShell from './AppShell.tsx'
import { listarPlatos, obtenerConfiguracion, fechaHoyLima } from '../../lib/pedidos.ts'
import { useRealtime } from '../../hooks/useRealtime.ts'
import AdminResumen from './admin/AdminResumen.tsx'
import AdminPedidos from './admin/AdminPedidos.tsx'
import AdminMes from './admin/AdminMes.tsx'
import AdminCatalogo from './admin/AdminCatalogo.tsx'
import AdminConfig from './admin/AdminConfig.tsx'

const UsoPanel = lazy(() => import('./UsoPanel.tsx'))

const TABS = [
  { id: 'dia', label: 'Resumen' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'mes', label: 'Mes' },
  { id: 'uso', label: 'Uso' },
  { id: 'platos', label: 'Platos' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'horario', label: 'Horario' },
]

function AdminContenido() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('dia')
  const [fecha, setFecha] = useState(fechaHoyLima)

  useRealtime('pedidos', () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos-admin'] })
    queryClient.invalidateQueries({ queryKey: ['ventas'] })
    queryClient.invalidateQueries({ queryKey: ['ventas-rango'] })
  })

  const { data: platos = [] } = useQuery({ queryKey: ['platos-admin'], queryFn: listarPlatos })
  const { data: config } = useQuery({ queryKey: ['config-admin'], queryFn: obtenerConfiguracion })

  return (
    <div>
      <div className="page-title">Administración</div>

      <div className="tabs-scroll">
        {TABS.map((t) => (
          <button key={t.id} className={'filtro-chip' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dia' && <AdminResumen fecha={fecha} setFecha={setFecha} />}
      {tab === 'pedidos' && <AdminPedidos fecha={fecha} setFecha={setFecha} platos={platos} />}
      {tab === 'mes' && <AdminMes />}
      {tab === 'uso' && (
        <Suspense fallback={<div className="skeleton" style={{ height: 120 }} />}>
          <UsoPanel />
        </Suspense>
      )}
      {tab === 'platos' && <AdminCatalogo vista="platos" />}
      {tab === 'inventario' && <AdminCatalogo vista="inventario" />}
      {tab === 'horario' && <AdminConfig config={config} />}
    </div>
  )
}

export default function AdminIsland() {
  return (
    <Proveedores>
      <GuardPersonal roles={['admin']}>
        <AppShell>
          <AdminContenido />
        </AppShell>
      </GuardPersonal>
    </Proveedores>
  )
}
