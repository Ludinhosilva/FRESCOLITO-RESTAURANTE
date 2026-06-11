import { useState } from 'react'
import { categories } from '../data/menu'

export default function Menu() {
  const [activeTab, setActiveTab] = useState(categories[0].id)

  const activeCategory = categories.find((c) => c.id === activeTab)

  return (
    <main style={{ paddingTop: '70px' }}>
      <section className="section" style={{
        background: `linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 100%)`,
        textAlign: 'center',
        paddingTop: 'calc(70px + var(--space-xl))',
      }}>
        <div className="container">
          <h1 style={{ color: 'var(--color-primary)' }}>Nuestro Menú</h1>
          <p style={{ color: 'var(--color-light)', marginTop: 'var(--space-sm)' }}>
            Sabores auténticos de Iquitos para ti
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn ${activeTab === cat.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {activeCategory?.items.map((item) => (
              <div key={item.id} style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-light)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-lg)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
              }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  marginBottom: '0.5rem',
                  color: 'var(--color-dark)',
                }}>
                  {item.name}
                </h3>
                <p style={{
                  color: 'var(--color-mid)',
                  fontSize: '0.9rem',
                  marginBottom: 'var(--space-md)',
                  lineHeight: 1.6,
                }}>
                  {item.description}
                </p>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-hover)',
                }}>
                  S/ {item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
