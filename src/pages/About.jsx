export default function About() {
  return (
    <main style={{ paddingTop: '70px' }}>
      <section className="section" style={{
        background: `linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 100%)`,
        textAlign: 'center',
        paddingTop: 'calc(70px + var(--space-xl))',
      }}>
        <div className="container">
          <h1 style={{ color: 'var(--color-primary)' }}>Nosotros</h1>
          <p style={{ color: 'var(--color-light)', marginTop: 'var(--space-sm)' }}>
            Conoce la historia detrás de FRESCOLITO
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-xl)',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{ marginBottom: 'var(--space-md)' }}>
                Nuestra Historia
              </h2>
              <p style={{
                color: 'var(--color-mid)',
                lineHeight: 1.8,
                marginBottom: 'var(--space-md)',
              }}>
                FRESCOLITO nació en Iquitos, en el corazón de la Amazonía peruana, con la visión
                de compartir los sabores auténticos de nuestra región. Cada plato es una celebración
                de la riqueza gastronómica de la selva peruana.
              </p>
              <p style={{
                color: 'var(--color-mid)',
                lineHeight: 1.8,
              }}>
                Utilizamos ingredientes frescos y recetas tradicionales transmitidas de generación
                en generación, combinando técnicas clásicas con un toque moderno.
              </p>
            </div>
            <div style={{
              background: 'var(--color-light)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-xl)',
              textAlign: 'center',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{ color: 'var(--color-mid)', fontStyle: 'italic' }}>
                Imagen del restaurante
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--color-light)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            Nuestros Valores
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {[
              { title: 'Tradición', desc: 'Respetamos las recetas ancestrales de la Amazonía peruana.' },
              { title: 'Frescura', desc: 'Seleccionamos los ingredientes más frescos para cada plato.' },
              { title: 'Calidad', desc: 'Cada plato es preparado con los más altos estándares.' },
              { title: 'Pasión', desc: 'Amamos lo que hacemos y se refleja en cada bocado.' },
            ].map((val) => (
              <div key={val.title} style={{
                textAlign: 'center',
                padding: 'var(--space-lg)',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ marginBottom: 'var(--space-sm)' }}>{val.title}</h3>
                <p style={{ color: 'var(--color-mid)' }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
