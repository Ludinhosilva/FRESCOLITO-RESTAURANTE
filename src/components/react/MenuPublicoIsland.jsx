import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Proveedores from './Proveedores.jsx'
import { listarPlatosPublico } from '../../lib/pedidosCliente.js'

function Contenido() {
  const { data: platos = [], isLoading } = useQuery({
    queryKey: ['platos-publico'],
    queryFn: listarPlatosPublico,
  })
  const [activa, setActiva] = useState(null)

  const categorias = useMemo(() => {
    const map = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const nombres = Object.keys(categorias)
  const catActiva = activa || nombres[0]

  if (isLoading) {
    return (
      <div className="menu-section">
        <div className="container" style={{ textAlign: 'center' }}>Cargando menú...</div>
      </div>
    )
  }

  return (
    <div className="menu-section">
      <div className="container">
        <div className="menu-pills">
          {nombres.map((cat) => (
            <button
              key={cat}
              className={'menu-pill' + (cat === catActiva ? ' active' : '')}
              onClick={() => setActiva(cat)}
            >
              {cat}
              <span className="pill-count">{categorias[cat].length}</span>
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {(categorias[catActiva] || []).map((p) => {
            const sinStock = !p.stock_disponible || p.stock <= 0
            return (
              <div key={p.id} className="menu-item">
                {p.imagen && (
                  <div className="menu-item-img-wrap">
                    <img src={p.imagen} alt={p.nombre} className="menu-item-img" loading="lazy" />
                  </div>
                )}
                <div className="menu-item-body">
                  <h3 className="menu-item-name">{p.nombre}</h3>
                  {p.descripcion && <p className="menu-item-desc">{p.descripcion}</p>}
                </div>
                <div className="menu-item-footer">
                  <div className="menu-price-block">
                    <span className="menu-item-price">S/ {Number(p.precio).toFixed(2)}</span>
                  </div>
                  <button className="btn btn-primary menu-order-btn" data-pedir disabled={sinStock}>
                    {sinStock ? 'Agotado' : 'Ordenar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MenuPublicoIsland() {
  return (
    <Proveedores>
      <Contenido />
    </Proveedores>
  )
}