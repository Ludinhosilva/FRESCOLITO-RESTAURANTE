import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, X } from 'lucide-react'
import QueryProvider from './ui/QueryProvider.tsx'
import { listarPromociones, type Promocion } from '../../lib/promociones.ts'

const SESSION_KEY = 'frescolito_promo_banner_closed'
const POPUP_KEY = 'frescolito_promo_popup_closed'

function calcRestante(hasta: string) {
  const diff = new Date(hasta).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) return { terminado: true, dias: 0, horas: 0, mins: 0, segs: 0 }
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

type PromoMediaVariant = 'banner' | 'modal' | 'popup'
type PromoModalVariant = 'detalle' | 'anuncio'

function PromoMedia({ promo, variant }: { promo: Promocion; variant: PromoMediaVariant }) {
  const [error, setError] = useState(false)
  if (!promo.imagen || error) {
    return (
      <div className={`promo-${variant}-ph`} aria-hidden="true">
        <span>{promo.titulo.charAt(0)}</span>
      </div>
    )
  }
  return (
    <>
      <div
        className={`promo-${variant}-bg`}
        style={{ backgroundImage: `url(${promo.imagen})` }}
        aria-hidden="true"
      />
      <div className={`promo-${variant}-frame`}>
        <img
          src={promo.imagen}
          alt={promo.titulo}
          className={`promo-${variant}-img`}
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
        />
      </div>
    </>
  )
}

function PromoModal({
  promo,
  open,
  variant,
  onClose,
}: {
  promo: Promocion
  open: boolean
  variant: PromoModalVariant
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const enlace = promo.enlace && promo.enlace !== '#' ? promo.enlace : '/menu'
  const externo = /^https?:\/\//.test(enlace)
  const tituloId = `promo-modal-title-${promo.id}`
  const anuncio = variant === 'anuncio'

  return (
    <dialog
      ref={ref}
      className={'promo-modal' + (anuncio ? ' promo-modal--anuncio' : '')}
      aria-labelledby={tituloId}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="promo-modal-card">
        <button
          type="button"
          className={'promo-modal-close' + (anuncio ? ' promo-modal-close--anuncio' : '')}
          onClick={onClose}
          aria-label="Cerrar promoción"
        >
          <X size={20} />
        </button>
        <div className="promo-modal-media">
          <PromoMedia key={`${promo.id}-${variant}`} promo={promo} variant={anuncio ? 'popup' : 'modal'} />
          {promo.badge && <span className={anuncio ? 'promo-popup-badge' : 'promo-banner-badge'}>{promo.badge}</span>}
          {anuncio && promo.fecha_fin && (
            <div className="promo-popup-count">
              <Countdown key={`${promo.id}-${promo.fecha_fin}`} hasta={promo.fecha_fin} />
            </div>
          )}
        </div>
        {anuncio ? (
          <div className="promo-modal-body promo-popup-body">
            <h2 id={tituloId} className="sr-only">{promo.titulo}</h2>
            <a
              className="promo-popup-cta"
              href={enlace}
              {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={onClose}
            >
              {promo.cta_label || '¡Lo quiero!'} <ArrowRight size={17} />
            </a>
          </div>
        ) : (
          <div className="promo-modal-body">
            <span className="promo-banner-label">Promoción</span>
            <h2 id={tituloId}>{promo.titulo}</h2>
            {promo.descripcion && <p>{promo.descripcion}</p>}
            {(promo.precio_oferta || promo.precio_regular) && (
              <div className="promo-banner-prices">
                {promo.precio_oferta && <strong className="promo-banner-price">{promo.precio_oferta}</strong>}
                {promo.precio_regular && <s className="promo-banner-price-regular">{promo.precio_regular}</s>}
              </div>
            )}
            {promo.fecha_fin && <Countdown key={`${promo.id}-${promo.fecha_fin}`} hasta={promo.fecha_fin} />}
            <div className="promo-modal-actions">
              <a
                className="btn btn-primary"
                href={enlace}
                {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={onClose}
              >
                {promo.cta_label || 'Ver menú'} <ArrowRight size={16} />
              </a>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}

export function PromoBannerContenido({ inicial = [], popup = false }: { inicial?: Promocion[]; popup?: boolean }) {
  const { data } = useQuery({
    queryKey: ['promociones'],
    queryFn: listarPromociones,
    initialData: inicial.length > 0 ? inicial : undefined,
  })
  const promos = data ?? []

  const [montado, setMontado] = useState(false)
  const [cerrado, setCerrado] = useState(false)
  const [closing, setClosing] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalVariant, setModalVariant] = useState<PromoModalVariant>('detalle')
  const [popupCerrado, setPopupCerrado] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(POPUP_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!popup || popupCerrado || promos.length === 0 || modalAbierto) return
    const id = window.setTimeout(() => {
      setModalVariant('anuncio')
      setModalAbierto(true)
    }, 1200)
    return () => window.clearTimeout(id)
  }, [popup, popupCerrado, promos.length, modalAbierto])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMontado(true)
      try {
        if (sessionStorage.getItem(SESSION_KEY) === '1') setCerrado(true)
      } catch {
        /* noop */
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  if (!montado || cerrado || promos.length === 0) return null

  const promo = promos[0]

  const cerrarBanner = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setCerrado(true)
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* noop */
      }
    }, 220)
  }

  const cerrarModal = () => {
    if (modalVariant === 'anuncio') {
      setPopupCerrado(true)
      try {
        sessionStorage.setItem(POPUP_KEY, '1')
      } catch {
        /* noop */
      }
    }
    setModalAbierto(false)
  }

  return (
    <>
      <div className="promo-banner-wrap">
        <section
          className={'promo-banner' + (closing ? ' is-closing' : '')}
          aria-label="Promoción"
        >
          <button type="button" className="promo-banner-close" onClick={cerrarBanner} aria-label="Cerrar promociones">
            <X size={18} />
          </button>
          <div className="promo-banner-media">
            <PromoMedia key={promo.id} promo={promo} variant="banner" />
            {promo.badge && <span className="promo-banner-badge">{promo.badge}</span>}
            {promo.fecha_fin && (
              <div className="promo-banner-count">
                <Countdown key={`${promo.id}-${promo.fecha_fin}`} hasta={promo.fecha_fin} />
              </div>
            )}
          </div>
          <div className="promo-banner-body">
            <span className="promo-banner-label">Promoción</span>
            <h2>{promo.titulo}</h2>
            {promo.descripcion && <p>{promo.descripcion}</p>}
            <div className="promo-banner-bottom">
              <div className="promo-banner-prices">
                {promo.precio_oferta && <strong className="promo-banner-price">{promo.precio_oferta}</strong>}
                {promo.precio_regular && <s className="promo-banner-price-regular">{promo.precio_regular}</s>}
              </div>
              <button
                type="button"
                className="promo-banner-cta"
                onClick={() => {
                  setModalVariant('detalle')
                  setModalAbierto(true)
                }}
              >
                Ver promoción <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <PromoModal
        promo={promo}
        open={modalAbierto}
        variant={modalVariant}
        onClose={cerrarModal}
      />
    </>
  )
}

export default function PromoBanner({ inicial = [] }: { inicial?: Promocion[] }) {
  return (
    <QueryProvider>
      <PromoBannerContenido inicial={inicial} popup />
    </QueryProvider>
  )
}
