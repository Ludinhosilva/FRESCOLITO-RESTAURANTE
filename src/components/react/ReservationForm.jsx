import { useState } from 'react'

const initialForm = { name: '', email: '', phone: '', date: '', time: '', guests: '1', notes: '' }

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

export default function ReservationForm() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

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
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} noValidate>
          {submitted && (
            <div className="reserv-success">
              Reserva enviada con éxito. Te confirmaremos pronto.
            </div>
          )}

          {['name', 'email', 'phone'].map((field) => (
            <div key={field} className="reserv-field">
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

          <div className="reserv-row">
            <div className="reserv-field">
              <label htmlFor="date">Fecha</label>
              <input id="date" name="date" type="date"
                value={form.date} onChange={handleChange}
                className={errors.date ? 'input-error' : ''}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
            <div className="reserv-field">
              <label htmlFor="time">Hora</label>
              <input id="time" name="time" type="time"
                value={form.time} onChange={handleChange}
                className={errors.time ? 'input-error' : ''}
              />
              {errors.time && <span className="field-error">{errors.time}</span>}
            </div>
          </div>

          <div className="reserv-field">
            <label htmlFor="guests">Número de Personas</label>
            <select id="guests" name="guests" value={form.guests} onChange={handleChange}>
              {[1,2,3,4,5,6,7,8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>

          <div className="reserv-field">
            <label htmlFor="notes">Notas (opcional)</label>
            <textarea id="notes" name="notes" rows={3}
              value={form.notes} onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Reservar Mesa
          </button>
        </form>
      </div>

      <style>{`
        .reserv-success {
          background: #d4edda; color: #155724;
          padding: var(--space-md); border-radius: var(--radius);
          margin-bottom: var(--space-md);
        }
        .reserv-field { margin-bottom: var(--space-md); }
        .reserv-field label {
          display: block; font-weight: 700; margin-bottom: 0.25rem;
        }
        .reserv-field input, .reserv-field select, .reserv-field textarea {
          width: 100%; padding: 0.75rem;
          border: 1px solid var(--color-light);
          border-radius: var(--radius);
          font-family: var(--font-body); font-size: 1rem;
        }
        .reserv-field input.input-error { border-color: #dc3545; }
        .field-error {
          color: #dc3545; font-size: 0.85rem;
          margin-top: 0.25rem; display: block;
        }
        .reserv-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }
      `}</style>
    </section>
  )
}
