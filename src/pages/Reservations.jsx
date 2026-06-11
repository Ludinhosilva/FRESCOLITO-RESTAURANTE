import { useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: '1',
  notes: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
  if (!form.email.trim()) errors.email = 'El email es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio'
  else if (!/^\d{7,}$/.test(form.phone)) errors.phone = 'Teléfono inválido (mín. 7 dígitos)'
  if (!form.date) errors.date = 'Selecciona una fecha'
  if (!form.time) errors.time = 'Selecciona una hora'
  return errors
}

export default function Reservations() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

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
          <h1 style={{ color: 'var(--color-primary)' }}>Reservas</h1>
          <p style={{ color: 'var(--color-light)', marginTop: 'var(--space-sm)' }}>
            Reserva tu mesa en FRESCOLITO
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} noValidate>
            {submitted && (
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius)',
                marginBottom: 'var(--space-md)',
              }}>
                Reserva enviada con éxito. Te confirmaremos pronto.
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-md)',
            }}>
              <div>
                <label htmlFor="date" style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Fecha
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.date ? '#dc3545' : 'var(--color-light)'}`,
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                  }}
                />
                {errors.date && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.date}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="time" style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Hora
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.time ? '#dc3545' : 'var(--color-light)'}`,
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                  }}
                />
                {errors.time && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.time}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="guests" style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                Número de Personas
              </label>
              <select
                id="guests"
                name="guests"
                value={form.guests}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid var(--color-light)`,
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label htmlFor="notes" style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid var(--color-light)`,
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Reservar Mesa
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
