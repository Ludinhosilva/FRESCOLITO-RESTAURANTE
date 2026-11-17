import { useState } from 'react'
import { useHorario } from '../../hooks/useHorario.ts'
import { WHATSAPP_NUMBER, WHATSAPP_NUMBER_2 } from '../../data/config.ts'
import { MapPin, MessageCircle, Clock, Send } from 'lucide-react'

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
    <section className="ct-section">
      <div className="container ct-grid">
        <form onSubmit={handleSubmit} noValidate className="ct-form">
          <span className="ct-eyebrow">Escríbenos</span>
          <h2 className="ct-title">Envíanos un mensaje</h2>
          <p className="ct-lead">
            Cuéntanos qué necesitas: un pedido, una reserva o una consulta. Te respondemos por WhatsApp.
          </p>

          {submitted && (
            <div className="contact-success" role="status">
              Abriendo WhatsApp para enviar tu mensaje…
            </div>
          )}

          <div className="ct-row">
            {['name', 'email'].map((field) => (
              <div key={field} className="contact-field">
                <label htmlFor={field}>{field === 'name' ? 'Nombre' : 'Email'}</label>
                <input
                  id={field} name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={form[field]} onChange={handleChange}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? `${field}-error` : undefined}
                  className={errors[field] ? 'input-error' : ''}
                />
                {errors[field] && <span id={`${field}-error`} className="field-error" role="alert">{errors[field]}</span>}
              </div>
            ))}
          </div>

          <div className="contact-field">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone" name="phone" type="tel" inputMode="tel"
              value={form.phone} onChange={handleChange}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span id="phone-error" className="field-error" role="alert">{errors.phone}</span>}
          </div>

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

          <button type="submit" className="btn btn-primary ct-submit">
            <Send /> Enviar Mensaje
          </button>
        </form>

        <aside className="ct-panel">
          <span className="ct-eyebrow ct-eyebrow--light">Información</span>
          <h2 className="ct-panel-title">Estamos cerca</h2>
          <p className="ct-panel-lead">Visítanos en Iquitos o escríbenos directamente por WhatsApp.</p>

          <ul className="ct-info">
            <li>
              <span className="ct-info-icon" aria-hidden="true"><MapPin /></span>
              <div>
                <h3>Dirección</h3>
                <p>Iquitos, Perú</p>
              </div>
            </li>
            <li>
              <span className="ct-info-icon" aria-hidden="true"><MessageCircle /></span>
              <div>
                <h3>WhatsApp</h3>
                <p className="ct-phones">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER_2}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY_2}</a>
                </p>
              </div>
            </li>
            <li>
              <span className="ct-info-icon" aria-hidden="true"><Clock /></span>
              <div>
                <h3>Horarios</h3>
                <p>{diasLabel}: {horas}</p>
              </div>
            </li>
          </ul>

          <div className="ct-map">
            <iframe
              src="https://www.google.com/maps?q=-3.7621462,-73.2700371&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación FRESCOLITO Restaurante"
            />
          </div>
        </aside>
      </div>

      <style>{`
        .ct-section { padding: var(--space-lg) 0 var(--space-xl); }
        .ct-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: var(--space-xl);
          align-items: start;
        }
        .ct-eyebrow {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-primary-hover);
          margin-bottom: var(--space-sm);
        }
        .ct-eyebrow--light { color: var(--color-primary); }
        .ct-title {
          font-family: var(--font-script);
          font-weight: 400;
          font-size: clamp(2rem, 4vw, 2.8rem);
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          line-height: 1.1;
        }
        .ct-lead {
          max-width: 46ch;
          margin: 0 0 var(--space-lg);
          color: var(--color-mid);
          line-height: 1.8;
        }
        .ct-form {
          padding: clamp(1.4rem, 3vw, 2.4rem);
          border: 1px solid rgba(62, 39, 35, 0.1);
          border-radius: 26px;
          background:
            radial-gradient(120% 80% at 100% 0%, rgba(253, 185, 19, 0.08), transparent 55%),
            #FFFDF8;
          box-shadow: var(--shadow-lg);
        }
        .ct-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }
        .contact-success {
          background: #EAF6EC;
          color: #1E5B33;
          padding: var(--space-md);
          border-radius: 12px;
          margin-bottom: var(--space-md);
          font-size: 0.9rem;
        }
        .contact-field { margin-bottom: var(--space-md); }
        .contact-field label {
          display: block;
          margin-bottom: 0.35rem;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--color-dark);
        }
        .contact-field input,
        .contact-field textarea {
          width: 100%;
          padding: 0.8rem 0.9rem;
          border: 1px solid rgba(62, 39, 35, 0.16);
          border-radius: 12px;
          background: #fff;
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--color-dark);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .contact-field textarea { resize: vertical; min-height: 120px; }
        .contact-field input:focus,
        .contact-field textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(253, 185, 19, 0.2);
        }
        .contact-field input.input-error,
        .contact-field textarea.input-error { border-color: #dc3545; }
        .field-error {
          display: block;
          margin-top: 0.3rem;
          color: #dc3545;
          font-size: 0.8rem;
        }
        .ct-submit {
          width: 100%;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 999px;
          padding: 0.85rem 1.4rem;
        }
        .ct-submit svg { width: 18px; height: 18px; }

        .ct-panel {
          position: relative;
          overflow: hidden;
          padding: clamp(1.4rem, 3vw, 2.4rem);
          border-radius: 26px;
          background: linear-gradient(155deg, #3E2723 0%, #59382d 100%);
          color: #FFF8EC;
          box-shadow: var(--shadow-lg);
        }
        .ct-panel::before {
          content: '';
          position: absolute;
          top: -90px;
          right: -70px;
          width: 220px;
          height: 220px;
          border: 1px solid rgba(253, 185, 19, 0.24);
          border-radius: 50%;
          pointer-events: none;
        }
        .ct-panel > * { position: relative; z-index: 1; }
        .ct-panel-title {
          font-family: var(--font-script);
          font-weight: 400;
          font-size: clamp(1.9rem, 3.6vw, 2.5rem);
          color: #FFF8EC;
          margin-bottom: var(--space-xs);
          line-height: 1.1;
        }
        .ct-panel-lead {
          color: rgba(255, 248, 236, 0.68);
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: var(--space-lg);
        }
        .ct-info {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin: 0 0 var(--space-lg);
          padding: 0;
        }
        .ct-info li {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
          padding-bottom: var(--space-md);
          border-bottom: 1px solid rgba(255, 248, 236, 0.12);
        }
        .ct-info li:last-child { padding-bottom: 0; border-bottom: 0; }
        .ct-info-icon {
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(253, 185, 19, 0.35);
          border-radius: 12px;
          background: rgba(253, 185, 19, 0.12);
          color: var(--color-primary);
        }
        .ct-info-icon svg { width: 20px; height: 20px; }
        .ct-info h3 {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        .ct-info p {
          margin: 0;
          color: rgba(255, 248, 236, 0.84);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .ct-phones { display: flex; flex-direction: column; gap: 2px; }
        .ct-phones a {
          color: #FFF8EC;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: rgba(253, 185, 19, 0.5);
          text-underline-offset: 3px;
          transition: color 0.2s ease;
        }
        .ct-phones a:hover { color: var(--color-primary); }
        .ct-map {
          height: 210px;
          overflow: hidden;
          border: 1px solid rgba(255, 248, 236, 0.16);
          border-radius: 16px;
        }
        .ct-map iframe { display: block; filter: saturate(0.9); }

        @media (max-width: 900px) {
          .ct-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .ct-row { grid-template-columns: 1fr; gap: 0; }
          .ct-form, .ct-panel { border-radius: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-field input,
          .contact-field textarea,
          .ct-phones a { transition: none; }
        }
      `}</style>
    </section>
  )
}
