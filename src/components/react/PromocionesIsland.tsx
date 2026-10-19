import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import QueryProvider from './ui/QueryProvider.tsx'
import { listarPromociones, type Promocion } from '../../lib/promociones.ts'
import Swiper from 'swiper'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'

function Skeleton() {
  return (
    <div className="promo-track" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div className="promo-card promo-card-skel" key={i}>
          <div className="promo-media sk-img" />
        </div>
      ))}
    </div>
  )
}

function calcRestante(hasta: string) {
  const diff = new Date(hasta).getTime() - Date.now()
  if (diff <= 0) return { terminado: true, dias: 0, horas: 0, mins: 0, segs: 0 }
  const segs = Math.floor(diff / 1000)
  return {
    terminado: false,
    dias: Math.floor(segs / 86400),
    horas: Math.floor((segs % 86400) / 3600),
    mins: Math.floor((segs % 3600) / 60),
    segs: segs % 60,
  }
}

function Countdown({ hasta }: { hasta: string }) {
  const [t, setT] = useState(() => calcRestante(hasta))
  useEffect(() => {
    const id = setInterval(() => setT(calcRestante(hasta)), 1000)
    return () => clearInterval(id)
  }, [hasta])

  if (t.terminado) return <span className="promo-count promo-count-done">¡Terminó!</span>

  const pad = (n: number) => String(n).padStart(2, '0')
  const partes = t.dias > 0
    ? `${t.dias}d ${pad(t.horas)}:${pad(t.mins)}:${pad(t.segs)}`
    : `${pad(t.horas)}:${pad(t.mins)}:${pad(t.segs)}`

  return <span className="promo-count">Termina en {partes}</span>
}

function Tarjeta({ promo }: { promo: Promocion }) {
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`)
  }
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const externo = promo.enlace && /^https?:\/\//.test(promo.enlace)
  const CTA = promo.enlace ? 'a' : 'span'

  return (
    <article className="promo-card" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="promo-media">
        {promo.imagen ? (
          <img src={promo.imagen} alt={promo.titulo} loading="lazy" />
        ) : (
          <div className="promo-ph">Frescolito</div>
        )}
        {promo.badge && <span className="promo-badge">{promo.badge}</span>}
        {promo.fecha_fin && (
          <div className="promo-count-wrap">
            <Countdown hasta={promo.fecha_fin} />
          </div>
        )}
      </div>

      <div className="promo-body">
        <h3 className="promo-titulo">{promo.titulo}</h3>
        {promo.descripcion && <p className="promo-desc">{promo.descripcion}</p>}

        {(promo.precio_oferta || promo.precio_regular) && (
          <div className="promo-prices">
            {promo.precio_oferta && <strong className="promo-precio">{promo.precio_oferta}</strong>}
            {promo.precio_regular && <s className="promo-precio-regular">{promo.precio_regular}</s>}
          </div>
        )}

        <CTA
          className="promo-cta"
          {...(promo.enlace
            ? { href: promo.enlace, ...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
            : {})}
        >
          {promo.cta_label || 'Ver promo'}
        </CTA>
      </div>
    </article>
  )
}

function Contenido({ inicial = [] }: { inicial?: Promocion[] }) {
  const { data, isLoading } = useQuery({
    queryKey: ['promociones'],
    queryFn: listarPromociones,
    initialData: inicial.length > 0 ? inicial : undefined,
  })

  const items: Promocion[] = data ?? []
  const trackRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!trackRef.current || initialized.current) return
    if (items.length === 0) return
    initialized.current = true
    const swiper = new Swiper(trackRef.current, {
      modules: [Autoplay, Pagination],
      slidesPerView: 1,
      spaceBetween: 18,
      loop: items.length > 1,
      autoplay: items.length > 1 ? { delay: 4000, disableOnInteraction: false } : false,
      pagination: items.length > 1 ? { el: '.promo-pagination', clickable: true } : false,
      breakpoints: {
        640: { slidesPerView: 2 },
        960: { slidesPerView: 3 },
      },
      speed: 600,
    })
    return () => {
      swiper.destroy(true, true)
      initialized.current = false
    }
  }, [items.length])

  if (isLoading) return <Skeleton />

  if (items.length === 0) return null

  return (
    <div className="promo-wrap">
      <div className="promo-confetti" aria-hidden="true" />
      <div className="swiper promo-swiper" ref={trackRef}>
        <div className="swiper-wrapper">
          {items.map((p) => (
            <div className="swiper-slide" key={p.id}>
              <Tarjeta promo={p} />
            </div>
          ))}
        </div>
        <div className="promo-pagination"></div>
      </div>
    </div>
  )
}

export default function PromocionesIsland({ inicial = [] }: { inicial?: Promocion[] }) {
  return (
    <QueryProvider>
      <Contenido inicial={inicial} />
    </QueryProvider>
  )
}
