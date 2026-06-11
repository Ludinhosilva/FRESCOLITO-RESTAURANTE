import { Link } from 'react-router-dom'
import { asset } from '../utils/paths'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <img
          src={asset('imagenes/frescolito.jpeg')}
          alt="FRESCOLITO RESTAURANTE"
          className="hero-logo"
        />
        <h1 className="hero-title">FRESCOLITO</h1>
        <p className="hero-subtitle">
          Cocina regional peruana en el corazón de Iquitos
        </p>
        <div className="hero-actions">
          <Link to="/menu" className="btn btn-primary hero-btn">
            Ver Menú
          </Link>
          <Link to="/reservas" className="btn btn-outline hero-btn-outline">
            Reserva Ahora
          </Link>
        </div>
      </div>
      <style>{`
        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 50%, var(--color-dark) 100%);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 40%, rgba(253, 185, 19, 0.08) 0%, transparent 60%);
        }
        .hero-content {
          text-align: center;
          position: relative;
          z-index: 1;
          padding: 0 var(--space-md);
        }
        .hero-logo {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto var(--space-lg);
          border: 4px solid var(--color-primary);
          box-shadow: 0 0 40px rgba(253, 185, 19, 0.3);
        }
        .hero-title {
          color: var(--color-primary);
          font-size: clamp(2.5rem, 6vw, 5rem);
          margin-bottom: var(--space-md);
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .hero-subtitle {
          color: var(--color-light);
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          font-family: var(--font-body);
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto var(--space-lg);
        }
        .hero-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-btn {
          font-size: 1.1rem;
          padding: 1rem 2.5rem;
        }
        .hero-btn-outline {
          font-size: 1.1rem;
          padding: 1rem 2.5rem;
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .hero-btn-outline:hover {
          background: var(--color-primary);
          color: var(--color-dark);
        }
      `}</style>
    </section>
  )
}
