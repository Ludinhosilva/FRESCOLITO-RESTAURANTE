import { useState } from 'react'
import { useHorario } from '../../hooks/useHorario.ts'
import { WHATSAPP_NUMBER, WHATSAPP_NUMBER_2 } from '../../data/config.ts'

const WHATSAPP_DISPLAY = '+51 916 207 362'
const WHATSAPP_DISPLAY_2 = '+51 928 104 463'

const initialForm = { name: '', email: '', phone: '', message: '' }

function validate(form) {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
  if (!form.email.trim()) errors.email = 'El email es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio'
  else if (!/^\d{7,}$/.test(form.phone)) errors.phone = 'Teléfono inválido (mín. 7 dígitos)'
  if (!form.message.trim()) errors.message = 'El mensaje es obligatorio'
  return errors
}

export default function ContactForm() {
  const { diasLabel, horas } = useHorario()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    const texto =
      `Hola FRESCOLITO, mi nombre es ${form.name}.\n` +
      `Email: ${form.email}\n` +
      `Teléfono: ${form.phone}\n\n` +
      `${form.message}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer')
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
              <div className="contact-success" role="status">
                Abriendo WhatsApp para enviar tu mensaje…
              </div>
            )}

            {['name', 'email', 'phone'].map((field) => (
              <div key={field} className="contact-field">
                <label htmlFor={field}>
                  {field === 'name' ? 'Nombre' : field === 'email' ? 'Email' : 'Teléfono'}
                </label>
                <input
                  id={field} name={field}
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  inputMode={field === 'phone' ? 'tel' : undefined}
                  value={form[field]} onChange={handleChange}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? `${field}-error` : undefined}
                  className={errors[field] ? 'input-error' : ''}
                />
                {errors[field] && <span id={`${field}-error`} className="field-error" role="alert">{errors[field]}</span>}
              </div>
            ))}

            <div className="contact-field">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" rows={4}
                value={form.message} onChange={handleChange}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                className={errors.message ? 'input-error' : ''}
              />
              {errors.message && <span id="message-error" className="field-error" role="alert">{errors.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary">Enviar Mensaje</button>
          </form>

          <div className="contact-info">
            <h2>Información</h2>
            <div className="info-block">
              <h3>Dirección</h3><p>Iquitos, Perú</p>
            </div>
            <div className="info-block">
              <h3>WhatsApp</h3>
              <p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>
                <br />
                <a href={`https://wa.me/${WHATSAPP_NUMBER_2}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY_2}</a>
              </p>
            </div>
            <div className="info-block">
              <h3>Horarios</h3><p>{diasLabel}: {horas}</p>
            </div>
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps?q=-3.7621462,-73.2700371&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: 'var(--radius)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación FRESCOLITO Restaurante"
              />
            </div>
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
        .contact-form-title { font-family: var(--font-script); font-weight: 400; margin-bottom: var(--space-lg); }
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
        .contact-info h2 { font-family: var(--font-script); font-weight: 400; margin-bottom: var(--space-lg); }
        .info-block { margin-bottom: var(--space-md); }
        .info-block h3 { font-size: 1rem; color: var(--color-mid); }
        .info-block a { color: var(--color-primary-hover); font-weight: 700; }
        .contact-map {
          border-radius: var(--radius); height: 300px;
          margin-top: var(--space-lg); overflow: hidden;
        }
        .contact-map iframe { border-radius: var(--radius); }
      `}</style>
    </section>
  )
}
