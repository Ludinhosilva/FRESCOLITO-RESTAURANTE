import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import { featuredDishes } from '../data/menu'
import useScrollReveal from '../hooks/useScrollReveal'
import { asset } from '../utils/paths'

function DishCard({ dish }) {
  return (
    <div style={{
      background: 'var(--color-bg)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    }}>
      <img
        src={asset(dish.image)}
        alt={dish.name}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
        }}
        loading="lazy"
      />
      <div style={{ padding: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{dish.name}</h3>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-primary-hover)',
        }}>
          S/ {dish.price.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default function Home() {
  const revealRef = useScrollReveal()

  return (
    <>
      <Hero />

      <section ref={revealRef} className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <h2 data-reveal style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            Platos Destacados
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {featuredDishes.map((dish) => (
              <div key={dish.id} data-reveal><DishCard dish={dish} /></div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
            <Link to="/menu" className="btn btn-primary">
              Ver Menú Completo
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{
        background: `linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 100%)`,
        color: 'var(--color-bg)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 data-reveal style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            Nuestra Historia
          </h2>
          <p data-reveal style={{
            color: 'var(--color-light)',
            maxWidth: '700px',
            margin: '0 auto var(--space-lg)',
            fontSize: '1.1rem',
            lineHeight: 1.8,
          }}>
            En FRESCOLITO traemos los sabores auténticos de la Amazonía peruana a tu mesa.
            Desde Iquitos, preparamos cada plato con ingredientes frescos y recetas tradicionales
            que capturan la esencia de nuestra tierra.
          </p>
          <Link to="/nosotros" className="btn btn-primary" data-reveal>
            Conócenos
          </Link>
        </div>
      </section>

      <section className="section" style={{
        background: 'var(--color-light)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 data-reveal style={{ marginBottom: 'var(--space-md)' }}>Promo Marino</h2>
          <p data-reveal style={{
            color: 'var(--color-mid)',
            marginBottom: 'var(--space-lg)',
            fontSize: '1.1rem',
          }}>
            Combina tus platos favoritos desde S/ 25.00
          </p>
          <Link to="/menu" className="btn btn-primary" data-reveal>
            Ver Promociones
          </Link>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 data-reveal style={{ marginBottom: 'var(--space-lg)' }}>Galería</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}>
            {[
              'imagenes/WhatsApp Image 2026-03-26 at 11.19.05 AM.jpeg',
              'imagenes/WhatsApp Image 2026-03-26 at 11.19.52 AM.jpeg',
              'imagenes/WhatsApp Image 2026-03-27 at 10.31.09 AM.jpeg',
              'imagenes/WhatsApp Image 2026-03-27 at 10.34.41 AM.jpeg',
            ].map((src, i) => (
              <div key={i} data-reveal>
                <img
                  src={asset(src)}
                  alt={`Plato FRESCOLITO ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <Link to="/galeria" className="btn btn-primary" data-reveal>
            Ver Más Fotos
          </Link>
        </div>
      </section>
    </>
  )
}
