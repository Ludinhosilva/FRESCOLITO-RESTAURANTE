import { useState } from 'react'
import { asset } from '../utils/paths'

const images = [
  'imagenes/WhatsApp Image 2026-03-26 at 11.19.05 AM.jpeg',
  'imagenes/WhatsApp Image 2026-03-26 at 11.19.52 AM.jpeg',
  'imagenes/WhatsApp Image 2026-03-27 at 10.31.09 AM.jpeg',
  'imagenes/WhatsApp Image 2026-03-27 at 10.34.41 AM.jpeg',
]

export default function Gallery() {
  const [selected, setSelected] = useState(null)

  return (
    <main style={{ paddingTop: '70px' }}>
      <section className="section" style={{
        background: `linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 100%)`,
        textAlign: 'center',
        paddingTop: 'calc(70px + var(--space-xl))',
      }}>
        <div className="container">
          <h1 style={{ color: 'var(--color-primary)' }}>Galería</h1>
          <p style={{ color: 'var(--color-light)', marginTop: 'var(--space-sm)' }}>
            Nuestros platos y momentos
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-md)',
          }}>
            {images.map((src, i) => (
              <img
                key={i}
                src={asset(src)}
                alt={`Galería FRESCOLITO ${i + 1}`}
                onClick={() => setSelected(i)}
                style={{
                  width: '100%',
                  height: '280px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'pointer',
            padding: 'var(--space-lg)',
          }}
        >
          <img
            src={asset(images[selected])}
            alt={`Galería FRESCOLITO ${selected + 1}`}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>
      )}
    </main>
  )
}
