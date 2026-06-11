import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const initialForm = { name: '', email: '', phone: '', message: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
  if (!form.email.trim()) errors.email = 'El email es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio'
  else if (!/^\d{7,}$/.test(form.phone)) errors.phone = 'Teléfono inválido (mín. 7 dígitos)'
  if (!form.message.trim()) errors.message = 'El mensaje es obligatorio'
  return errors
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current) return
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([-3.7621462, -73.2700371], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.marker([-3.7621462, -73.2700371])
      .addTo(map)
      .bindPopup('<b>FRESCOLITO RESTAURANTE</b><br/>Iquitos, Perú')
      .openPopup()

    mapInstance.current = map
    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitted(true)
    setForm(initialForm)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <main style={{ paddingTop: '70px' }}>
      <section className="section" style={{
        background: `linear-gradient(135deg, var(--color-dark) 0%, #1a0e0a 100%)`,
        textAlign: 'center',
        paddingTop: 'calc(70px + var(--space-xl))',
      }}>
        <div className="container">
          <h1 style={{ color: 'var(--color-primary)' }}>Contacto</h1>
          <p style={{ color: 'var(--color-light)', marginTop: 'var(--space-sm)' }}>
            Estamos ubicados en Iquitos, Perú
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-xl)',
          }}>
            <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '500px' }}>
              <h2 style={{ marginBottom: 'var(--space-lg)' }}>Envíanos un mensaje</h2>

              {submitted && (
                <div style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 'var(--space-md)',
                }}>
                  Mensaje enviado con éxito. Te contactaremos pronto.
                </div>
              )}

              {['name', 'email', 'phone'].map((field) => (
                <div key={field} style={{ marginBottom: 'var(--space-md)' }}>
                  <label htmlFor={field} style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {field === 'name' ? 'Nombre' : field === 'email' ? 'Email' : 'Teléfono'}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${errors[field] ? '#dc3545' : 'var(--color-light)'}`,
                      borderRadius: 'var(--radius)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                  {errors[field] && (
                    <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors[field]}
                    </span>
                  )}
                </div>
              ))}

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label htmlFor="message" style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.message ? '#dc3545' : 'var(--color-light)'}`,
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                />
                {errors.message && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.message}
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn-primary">
                Enviar Mensaje
              </button>
            </form>

            <div>
              <h2 style={{ marginBottom: 'var(--space-lg)' }}>Información</h2>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-mid)' }}>Dirección</h3>
                <p>Iquitos, Perú</p>
              </div>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-mid)' }}>Teléfono</h3>
                <p>(065) 123-456</p>
              </div>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-mid)' }}>Horarios</h3>
                <p>Lunes a Domingo: 11:00 AM - 10:00 PM</p>
              </div>

              <div
                ref={mapRef}
                style={{
                  borderRadius: 'var(--radius)',
                  height: '300px',
                  marginTop: 'var(--space-lg)',
                  zIndex: 1,
                  position: 'relative',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
