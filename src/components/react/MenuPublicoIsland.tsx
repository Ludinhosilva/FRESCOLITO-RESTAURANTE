import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Proveedores from './Proveedores.tsx'
import { listarPlatosPublico } from '../../lib/pedidosCliente.ts'

function Contenido() {
  const { data: platos = [], isLoading, isError } = useQuery({
    queryKey: ['platos-publico'],
    queryFn: listarPlatosPublico,
  })

  const categorias = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of platos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria].push(p)
    }
    return map
  }, [platos])

  const nombres = Object.keys(categorias)

  if (isLoading) {
    return (
      <div className="menu-section">
        <div className="container" style={{ textAlign: 'center' }}>Cargando menú...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="menu-section">
        <div className="container" style={{ textAlign: 'center' }}>
          No pudimos cargar el menú. Revisa tu conexión e inténtalo de nuevo.
        </div>
      </div>
    )
  }

  if (nombres.length === 0) {
    return (
      <div className="menu-section">
        <div className="container" style={{ textAlign: 'center' }}>
          Estamos actualizando nuestra carta. Vuelve pronto.
        </div>
      </div>
    )
  }

  return (
    <div className="menu-section">
      <div className="container">
        <div className="menu-leyenda">
          <span><i className="menu-dot verde" /> Disponible</span>
          <span><i className="menu-dot rojo" /> Agotado</span>
        </div>

        {nombres.map((cat) => (
          <section key={cat} className="menu-cat">
            <h2 className="menu-cat-title">{cat}</h2>
            <div className="menu-grid">
              {categorias[cat].map((p) => {
                const sinStock = !p.stock_disponible || p.stock <= 0
                return (
                  <div key={p.id} className={'menu-item' + (sinStock ? ' agotado' : '')}>
                    <div className="menu-item-img-wrap">
                      {p.imagen
                        ? <img src={p.imagen} alt={p.nombre} className="menu-item-img" loading="lazy" />
                        : <div className="menu-item-img-ph">🍽️</div>}
                    </div>
                    <div className="menu-item-body">
                      <h3 className="menu-item-name">
                        <i className={'menu-dot ' + (sinStock ? 'rojo' : 'verde')} />
                        {p.nombre}
                      </h3>
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
          </section>
        ))}
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
