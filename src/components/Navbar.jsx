import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { asset } from '../utils/paths'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/menu', label: 'Menú' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/galeria', label: 'Galería' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/reservas', label: 'Reservas' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            <img
              src={asset('imagenes/frescolito.jpeg')}
              alt="FRESCOLITO"
              className="nav-logo-img"
            />
            FRESCOLITO
          </Link>

          <button
            className="hamburger-btn"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {open && <div className="mobile-overlay" onClick={() => setOpen(false)} />}

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <div className="container" style={{ paddingTop: '90px' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--color-bg);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 70px;
          position: relative;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--color-dark);
          position: absolute;
          left: var(--space-md);
        }
        .nav-logo-img {
          height: 45px;
          width: 45px;
          border-radius: 50%;
          object-fit: cover;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-link {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-dark);
          transition: color 0.3s ease;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }
        .nav-link.active {
          color: var(--color-primary-hover);
        }

        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1001;
          position: absolute;
          right: var(--space-md);
        }
        .hamburger-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--color-dark);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .hamburger-btn[aria-expanded="true"] span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger-btn[aria-expanded="true"] span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-btn[aria-expanded="true"] span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 998;
        }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: var(--color-bg);
          z-index: 999;
          transform: translateY(-110%);
          transition: transform 0.35s ease;
          box-shadow: var(--shadow-lg);
          max-height: calc(100vh - 70px);
          overflow-y: auto;
        }
        .mobile-menu.open {
          transform: translateY(0);
        }
        .mobile-link {
          display: block;
          padding: 1rem 0;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-dark);
          border-bottom: 1px solid var(--color-light);
          transition: color 0.3s ease;
        }
        .mobile-link.active {
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex;
          }
          .nav-links {
            display: none !important;
          }
          .mobile-overlay {
            display: block;
          }
          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </>
  )
}
