import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import QueryProvider from './ui/QueryProvider.tsx'
import { listarGaleria, listarEventosFotos } from '../../lib/galeria.ts'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type Foto = { src: string; alt: string; cat: string }

function Contenido({ tabla = 'galeria', categorias = [], fallback = [] }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['galeria-public', tabla],
    queryFn: () => (tabla === 'galeria' ? listarGaleria() : listarEventosFotos()),
  })

  const fotos: Foto[] = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((f) => ({ src: f.url, alt: f.alt || '', cat: f.categoria }))
    }
    return fallback
  }, [data, fallback])

  const [cat, setCat] = useState('todas')
  const visibles = cat === 'todas' ? fotos : fotos.filter((f) => f.cat === cat)

  const [idx, setIdx] = useState(null)
  const lastFocused = useRef(null)
  const closeRef = useRef(null)

  const abrir = (i) => {
    lastFocused.current = document.activeElement
    setIdx(i)
  }
  const cerrar = () => {
    setIdx(null)
    if (lastFocused.current && typeof lastFocused.current.focus === 'function') lastFocused.current.focus()
  }

  useEffect(() => {
    if (idx === null) return
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIdx(null)
        if (lastFocused.current && typeof lastFocused.current.focus === 'function') lastFocused.current.focus()
      } else if (e.key === 'ArrowLeft') {
        setIdx((i) => (i - 1 + visibles.length) % visibles.length)
      } else if (e.key === 'ArrowRight') {
        setIdx((i) => (i + 1) % visibles.length)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [idx, visibles.length])

  if (isLoading) return <div className="gal-estado">Cargando galería...</div>
  if (isError && fallback.length === 0) return <div className="gal-estado">No pudimos cargar la galería.</div>
  if (fotos.length === 0) return <div className="gal-estado">Aún no hay fotos.</div>

  const foto = idx !== null ? visibles[idx] : null

  return (
    <>
      {categorias.length > 1 && (
        <div className="gal-filters">
          {categorias.map((c) => (
            <button
              key={c.id}
              className={'gal-filter' + (cat === c.id ? ' active' : '')}
              aria-pressed={cat === c.id}
              onClick={() => { setCat(c.id); setIdx(null) }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="gal-estado">No hay fotos en esta categoría.</div>
      ) : (
        <div className="gal-masonry">
          {visibles.map((f, i) => (
            <div
              key={f.src + i}
              className="gal-item"
              role="button"
              tabIndex={0}
              aria-label={`Ver ${f.alt || 'foto'}`}
              onClick={() => abrir(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i) }
              }}
            >
              <img src={f.src} alt={f.alt} className="gal-img" loading={i < 6 ? 'eager' : 'lazy'} />
              <div className="gal-item-overlay">
                <span className="gal-item-name">{f.alt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {foto && (
        <div
          className="gal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imágenes"
          onClick={(e) => { if (e.target === e.currentTarget) cerrar() }}
        >
          <button ref={closeRef} className="gal-lb-close" aria-label="Cerrar visor" onClick={cerrar}><X /></button>
          <button className="gal-lb-nav gal-lb-prev" aria-label="Imagen anterior" onClick={() => setIdx((i) => (i - 1 + visibles.length) % visibles.length)}><ChevronLeft /></button>
          <button className="gal-lb-nav gal-lb-next" aria-label="Imagen siguiente" onClick={() => setIdx((i) => (i + 1) % visibles.length)}><ChevronRight /></button>
          <div className="gal-lb-content">
            <img src={foto.src} alt={foto.alt} className="gal-lb-img" />
            {foto.alt && <span className="gal-lb-caption">{foto.alt}</span>}
          </div>
        </div>
      )}
    </>
  )
}

export default function GaleriaIsland({ tabla = 'galeria', categorias = [], fallback = [] }) {
  return (
    <QueryProvider>
      <Contenido tabla={tabla} categorias={categorias} fallback={fallback} />
    </QueryProvider>
  )
}
