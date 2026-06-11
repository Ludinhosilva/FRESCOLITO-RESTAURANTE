import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-dark)',
      color: 'var(--color-bg)',
      padding: 'var(--space-xl) 0 var(--space-lg)',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-lg)',
      }}>
        <div>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            FRESCOLITO
          </h3>
          <p style={{ color: 'var(--color-light)', lineHeight: 1.8 }}>
            Cocina regional peruana en el corazón de Iquitos. Sabores auténticos de la Amazonía peruana.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            Enlaces
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { to: '/', label: 'Inicio' },
              { to: '/menu', label: 'Menú' },
              { to: '/nosotros', label: 'Nosotros' },
              { to: '/contacto', label: 'Contacto' },
              { to: '/reservas', label: 'Reservas' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ color: 'var(--color-light)', transition: 'color 0.3s' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            Horarios
          </h4>
          <p style={{ color: 'var(--color-light)' }}>Lunes a Domingo</p>
          <p style={{ color: 'var(--color-light)' }}>11:00 AM - 10:00 PM</p>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
            Contacto
          </h4>
          <p style={{ color: 'var(--color-light)' }}>Iquitos, Perú</p>
          <p style={{ color: 'var(--color-light)' }}>Tel: (065) 123-456</p>
        </div>
      </div>

      <div className="container" style={{
        marginTop: 'var(--space-lg)',
        paddingTop: 'var(--space-md)',
        borderTop: '1px solid var(--color-mid)',
        textAlign: 'center',
        color: 'var(--color-light)',
        fontSize: '0.875rem',
      }}>
        &copy; {new Date().getFullYear()} FRESCOLITO RESTAURANTE. Todos los derechos reservados.
      </div>
    </footer>
  )
}
