import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Utensils, XCircle } from 'lucide-react'
import Proveedores from './Proveedores.tsx'
import { PromoBannerContenido } from './PromoBanner.tsx'
import { listarPlatosPublico } from '../../lib/pedidosCliente.ts'
import type { Promocion } from '../../lib/promociones.ts'
import { getCategoriaMeta } from '../../data/menuCategorias.ts'

type Plato = {
  id: number | string
  nombre: string
  categoria: string
  precio: number | string
  stock?: number | null
  stock_disponible?: boolean | null
  descripcion?: string | null
  imagen?: string | null
}

function MenuSkeleton() {
  return (
    <div className="menu-grid" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <article className="menu-item menu-item-skel" key={i}>
          <div className="menu-item-img-wrap sk-img" />
          <div className="menu-item-body">
            <span className="sk-line" style={{ width: '72%' }} />
            <span className="sk-line" style={{ width: '94%' }} />
            <span className="sk-line" style={{ width: '58%' }} />
          </div>
          <div className="menu-item-footer">
            <span className="sk-line" style={{ width: 68 }} />
            <span className="sk-line" style={{ width: 96, height: 34, borderRadius: 999 }} />
          </div>
        </article>
      ))}
    </div>
  )
}

function MenuState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="menu-section" id="menu-section">
      <div className="container">
        <div className="menu-state glass">
          <span className="menu-state-icon">{icon}</span>
          <h2>{title}</h2>
          <p>{text}</p>
          {action}
        </div>
      </div>
    </div>
  )
}

function PlatoImagen({ src, alt }: { src?: string | null; alt: string }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className="menu-item-img-ph" aria-hidden="true">
        <Utensils size={54} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="menu-item-img"
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  )
}

function Contenido({ promocionesIniciales = [] }: { promocionesIniciales?: Promocion[] }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['platos-publico'],
    queryFn: listarPlatosPublico,
  })
  const platos = useMemo(() => (data ?? []) as Plato[], [data])
  const [activa, setActiva] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const categorias = useMemo(() => {
    const map: Record<string, Plato[]> = {}
    for (const p of platos) {
      const cat = (p.categoria || 'Otros').trim()
      if (!map[cat]) map[cat] = []
      map[cat].push(p)
    }
    return map
  }, [platos])

  const nombres = Object.keys(categorias)

  useEffect(() => {
    if (nombres.length === 0) return
    const onScroll = () => {
      let current = nombres[0]
      for (const cat of nombres) {
        const el = sectionRefs.current[cat]
        if (el && el.getBoundingClientRect().top <= 150) current = cat
      }
      setActiva(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombres.join('|')])

  const irACategoria = (cat: string) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiva(cat)
  }

  if (isLoading) {
    return (
      <div className="menu-section" id="menu-section">
        <div className="container">
          <MenuSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <MenuState
        icon={<XCircle size={30} />}
        title="No pudimos cargar el menú"
        text="Revisa tu conexión e inténtalo de nuevo."
        action={<button type="button" className="btn btn-primary" onClick={() => refetch()}>Reintentar</button>}
      />
    )
  }

  if (nombres.length === 0) {
    return (
      <MenuState
        icon={<Utensils size={30} />}
        title="Estamos actualizando nuestra carta"
        text="Vuelve pronto para descubrir nuestros platos."
      />
    )
  }

  const catActiva = activa || nombres[0]

  return (
    <div className="menu-section" id="menu-section">
      <div className="container">
        <nav className="menu-cat-nav" aria-label="Categorías del menú">
          {nombres.map((cat) => {
            const meta = getCategoriaMeta(cat)
            const Icon = meta.Icon
            return (
              <button
                key={cat}
                type="button"
                className={'menu-cat-tab' + (cat === catActiva ? ' active' : '')}
                aria-current={cat === catActiva ? 'true' : undefined}
                onClick={() => irACategoria(cat)}
              >
                <span className="menu-cat-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <span className="menu-cat-label">{meta.label}</span>
                <span className="menu-cat-count">{categorias[cat].length}</span>
              </button>
            )
          })}
        </nav>

        <div className="menu-leyenda">
          <span><i className="menu-dot verde" /> Disponible</span>
          <span><i className="menu-dot rojo" /> Agotado</span>
        </div>

        {nombres.map((cat, catIndex) => {
          const meta = getCategoriaMeta(cat)
          const catId = `menu-cat-${catIndex}`
          return (
            <Fragment key={cat}>
              <section
                className="menu-cat"
                ref={(el) => { sectionRefs.current[cat] = el }}
                aria-labelledby={catId}
              >
              <div className="menu-cat-head">
                <h2 className="menu-cat-title" id={catId}>{meta.label}</h2>
                <span className="menu-cat-sub">{categorias[cat].length} platos</span>
              </div>
              <div className="menu-grid">
                {categorias[cat].map((p, index) => {
                  const sinStock = !p.stock_disponible || Number(p.stock ?? 0) <= 0
                  return (
                    <article
                      key={p.id}
                      className={'menu-item' + (sinStock ? ' agotado' : '')}
                      style={{ '--i': index } as CSSProperties}
                    >
                      <div className="menu-item-img-wrap">
                        <PlatoImagen src={p.imagen} alt={p.nombre} />
                        <span className="menu-item-cat">{meta.label}</span>
                        {sinStock && <span className="menu-item-badge">Agotado</span>}
                      </div>
                      <div className="menu-item-body">
                        <div className="menu-item-top">
                          <h3 className="menu-item-name">{p.nombre}</h3>
                          <span
                            className={'menu-item-dot ' + (sinStock ? 'off' : 'on')}
                            aria-hidden="true"
                            title={sinStock ? 'Agotado' : 'Disponible'}
                          />
                        </div>
                        {p.descripcion && <p className="menu-item-desc">{p.descripcion}</p>}
                      </div>
                      <div className="menu-item-footer">
                        <div className="menu-price-block">
                          <span className="menu-item-price">S/ {Number(p.precio).toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary menu-order-btn"
                          data-pedir
                          disabled={sinStock}
                          aria-label={sinStock ? `${p.nombre} agotado` : `Ordenar ${p.nombre}`}
                        >
                          <Plus size={16} strokeWidth={2.6} />
                          {sinStock ? 'Agotado' : 'Ordenar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
              </section>
              {catIndex === 0 && <PromoBannerContenido inicial={promocionesIniciales} />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default function MenuPublicoIsland({ promocionesIniciales = [] }: { promocionesIniciales?: Promocion[] }) {
  return (
    <Proveedores>
      <Contenido promocionesIniciales={promocionesIniciales} />
    </Proveedores>
  )
}
