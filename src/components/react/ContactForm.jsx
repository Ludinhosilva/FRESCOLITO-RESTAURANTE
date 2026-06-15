import { useState, useEffect, useRef } from 'react'

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

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return
    let cancelled = false
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css')
      if (cancelled) return
      try {
        const map = L.default.map(mapRef.current, { scrollWheelZoom: false })
          .setView([-3.7621462, -73.2700371], 17)
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        L.default.marker([-3.7621462, -73.2700371])
          .addTo(map)
          .bindPopup('<b>FRESCOLITO RESTAURANTE</b><br/>Iquitos, Perú<br/><a href="https://www.google.com/maps/place/Frescolito+Restaurante/@-3.7621462,-73.2700371,17z" target="_blank" style="color:#1B4965;font-weight:700">Ver en Google Maps →</a>')
          .openPopup()
        mapInstance.current = map
      } catch (e) {
        console.warn('Leaflet map could not be initialized:', e.message)
      }
    })
    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
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
    <section className="section">
      <div className="container">
        <div className="contact-grid">
          <form onSubmit={handleSubmit} noValidate className="contact-form">
            <h2 className="contact-form-title">Envíanos un mensaje</h2>

            {submitted && (
              <div className="contact-success">
                Mensaje enviado con éxito. Te contactaremos pronto.
              </div>
            )}

            {['name', 'email', 'phone'].map((field) => (
              <div key={field} className="contact-field">
                <label htmlFor={field}>
                  {field === 'name' ? 'Nombre' : field === 'email' ? 'Email' : 'Teléfono'}
                </label>
                <input
                  id={field} name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={form[field]} onChange={handleChange}
                  className={errors[field] ? 'input-error' : ''}
                />
                {errors[field] && <span className="field-error">{errors[field]}</span>}
              </div>
            ))}

            <div className="contact-field">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" rows={4}
                value={form.message} onChange={handleChange}
                className={errors.message ? 'input-error' : ''}
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary">Enviar Mensaje</button>
          </form>

          <div className="contact-info">
            <h2>Información</h2>
            <div className="info-block">
              <h3>Dirección</h3><p>Iquitos, Perú</p>
            </div>
            <div className="info-block">
              <h3>Teléfono</h3><p>(065) 123-456</p>
            </div>
            <div className="info-block">
              <h3>WhatsApp</h3>
              <p><a href="https://wa.me/51927367844" target="_blank">+51 927 367 844</a></p>
            </div>
            <div className="info-block">
              <h3>Horarios</h3><p>Lunes a Viernes: 11:30 AM - 3:15 PM</p>
            </div>
            <div ref={mapRef} className="contact-map" />
          </div>
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }
        .contact-form { max-width: 500px; }
        .contact-form-title { margin-bottom: var(--space-lg); }
        .contact-success {
          background: #d4edda; color: #155724;
          padding: var(--space-md); border-radius: var(--radius);
          margin-bottom: var(--space-md);
        }
        .contact-field { margin-bottom: var(--space-md); }
        .contact-field label {
          display: block; font-weight: 700; margin-bottom: 0.25rem;
        }
        .contact-field input, .contact-field textarea {
          width: 100%; padding: 0.75rem;
          border: 1px solid var(--color-light);
          border-radius: var(--radius);
          font-family: var(--font-body); font-size: 1rem;
        }
        .contact-field input.input-error, .contact-field textarea.input-error {
          border-color: #dc3545;
        }
        .field-error {
          color: #dc3545; font-size: 0.85rem;
          margin-top: 0.25rem; display: block;
        }
        .contact-info h2 { margin-bottom: var(--space-lg); }
        .info-block { margin-bottom: var(--space-md); }
        .info-block h3 { font-size: 1rem; color: var(--color-mid); }
        .info-block a { color: var(--color-primary-hover); font-weight: 700; }
        .contact-map {
          border-radius: var(--radius); height: 300px;
          margin-top: var(--space-lg); z-index: 1; position: relative;
        }
      `}</style>
    </section>
  )
}
