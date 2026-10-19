import { useQuery } from '@tanstack/react-query'
import QueryProvider from './ui/QueryProvider.tsx'
import { listarDestacados } from '../../lib/pedidosCliente.ts'

type Plato = {
  id: number | string
  nombre: string
  precio: number | string
  descripcion?: string | null
  imagen?: string | null
}

function Skeleton() {
  return (
    <div className="home-dishes" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <article className="home-dish home-dish-skel" key={i}>
          <div className="home-dish-img sk-img" />
          <div className="home-dish-body">
            <span className="sk-line" style={{ width: '70%' }} />
            <span className="sk-line" style={{ width: '45%' }} />
            <div className="home-dish-foot">
              <span className="sk-line" style={{ width: 60 }} />
              <span className="sk-line" style={{ width: 96, height: 30, borderRadius: 50 }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function Contenido({ inicial = [] }: { inicial?: Plato[] }) {
  // A: `initialData` viene del render en build (index.astro) -> primer pintado con datos reales.
  // B: mientras no haya datos, se muestra skeleton; nunca platos de relleno.
  const { data, isLoading } = useQuery({
    queryKey: ['destacados'],
    queryFn: listarDestacados,
    initialData: inicial.length > 0 ? inicial : undefined,
  })

  if (isLoading) return <Skeleton />

  const items: Plato[] = data ?? []
  if (items.length === 0) {
    return <div className="home-dishes-empty">Muy pronto tendremos platos destacados para ti.</div>
  }

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

export default function DestacadosIsland({ inicial = [] }: { inicial?: Plato[] }) {
  return (
    <QueryProvider>
      <Contenido inicial={inicial} />
    </QueryProvider>
  )
}
