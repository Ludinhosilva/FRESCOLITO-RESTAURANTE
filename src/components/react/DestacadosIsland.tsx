import { useQuery } from '@tanstack/react-query'
import QueryProvider from './ui/QueryProvider.tsx'
import { listarDestacados } from '../../lib/pedidosCliente.ts'
import { featuredDishes } from '../../data/menu.ts'

const FALLBACK = featuredDishes.map((d) => ({
  id: d.id,
  nombre: d.name,
  precio: d.price,
  imagen: d.image,
  descripcion: '',
}))

function Contenido() {
  const { data } = useQuery({ queryKey: ['destacados'], queryFn: listarDestacados })
  const items = data && data.length > 0 ? data : FALLBACK

  return (
    <div className="home-dishes">
      {items.map((p) => (
        <article className="home-dish" key={p.id}>
          <div className="home-dish-img">
            {p.imagen
              ? <img src={p.imagen} alt={p.nombre} loading="lazy" />
              : <div className="home-dish-ph">🍽️</div>}
          </div>
          <div className="home-dish-body">
            <h3>{p.nombre}</h3>
            {p.descripcion && <p className="home-dish-desc">{p.descripcion}</p>}
            <div className="home-dish-foot">
              <span className="home-dish-price">S/ {Number(p.precio).toFixed(2)}</span>
              <button className="btn btn-primary home-dish-btn" data-pedir>Ordenar</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function DestacadosIsland() {
  return (
    <QueryProvider>
      <Contenido />
    </QueryProvider>
  )
}
