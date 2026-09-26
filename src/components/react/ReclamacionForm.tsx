import { useState } from 'react'
import { crearReclamacion } from '../../lib/reclamaciones.ts'

const initial = { nombre: '', dni: '', domicilio: '', telefono: '', email: '', tipo: 'reclamo', detalle: '', pedido: '' }

function validar(f) {
  const e: Record<string, string> = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresa tu nombre'
  if (!/^\d{8}$/.test(f.dni.trim())) e.dni = 'DNI de 8 dígitos'
  if (!f.email.trim()) e.email = 'Ingresa tu correo'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Correo inválido'
  if (!f.detalle.trim()) e.detalle = 'Describe el detalle'
  return e
}

export default function ReclamacionForm() {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [constancia, setConstancia] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validar(form)
    if (Object.keys(v).length) { setErrors(v); return }
    setError('')
    setEnviando(true)
    try {
      await crearReclamacion(form)
      const ref = 'FR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000)
      setConstancia(ref)
      setForm(initial)
    } catch {
      setError('No se pudo registrar. Inténtalo de nuevo o escríbenos a contacto@frescolito.com')
    } finally {
      setEnviando(false)
    }
  }

  if (constancia) {
    return (
      <div className="rec-ok">
        <h3>Reclamo registrado</h3>
        <p>Guarda tu número de constancia:</p>
        <p className="rec-ref">{constancia}</p>
        <p className="rec-ok-sub">Te responderemos al correo indicado en un plazo máximo de 30 días calendario.</p>
        <button className="btn btn-primary" onClick={() => setConstancia('')}>Registrar otro</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rec-form">
      {error && <div className="rec-error">{error}</div>}

      <div className="rec-row">
        <div className="rec-field">
          <label>Nombre completo *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className={errors.nombre ? 'input-error' : ''} />
          {errors.nombre && <span className="field-error">{errors.nombre}</span>}
        </div>
        <div className="rec-field">
          <label>DNI *</label>
          <input name="dni" value={form.dni} onChange={handleChange} maxLength={8} className={errors.dni ? 'input-error' : ''} />
          {errors.dni && <span className="field-error">{errors.dni}</span>}
        </div>
      </div>

      <div className="rec-row">
        <div className="rec-field">
          <label>Domicilio</label>
          <input name="domicilio" value={form.domicilio} onChange={handleChange} />
        </div>
        <div className="rec-field">
          <label>Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
      </div>

      <div className="rec-row">
        <div className="rec-field">
          <label>Correo electrónico *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'input-error' : ''} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="rec-field">
          <label>Tipo *</label>
          <select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="reclamo">Reclamo</option>
            <option value="queja">Queja</option>
          </select>
        </div>
      </div>

      <div className="rec-field">
        <label>Detalle *</label>
        <textarea name="detalle" rows={4} value={form.detalle} onChange={handleChange} className={errors.detalle ? 'input-error' : ''} />
        {errors.detalle && <span className="field-error">{errors.detalle}</span>}
      </div>

      <div className="rec-field">
        <label>Pedido / comprobante (opcional)</label>
        <input name="pedido" value={form.pedido} onChange={handleChange} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar reclamo'}
      </button>
      <p className="rec-nota">Los campos con * son obligatorios.</p>

      <style>{`
        .rec-form { max-width: 720px; }
        .rec-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .rec-field { margin-bottom: var(--space-md); }
        .rec-field label { display: block; font-weight: 700; margin-bottom: 0.25rem; }
        .rec-field input, .rec-field textarea, .rec-field select {
          width: 100%; padding: 0.75rem; border: 1px solid var(--color-light);
          border-radius: var(--radius); font-family: var(--font-body); font-size: 1rem;
          background: var(--color-bg);
        }
        .rec-field input.input-error, .rec-field textarea.input-error { border-color: #dc3545; }
        .field-error { color: #dc3545; font-size: 0.85rem; margin-top: 0.25rem; display: block; }
        .rec-error {
          background: #fdecea; color: #b71c1c; padding: var(--space-md);
          border-radius: var(--radius); margin-bottom: var(--space-md);
        }
        .rec-nota { font-size: 0.8rem; color: var(--color-mid); margin-top: var(--space-sm); }
        .rec-ok {
          background: #FBF6EE; border: 1px solid var(--color-light);
          border-radius: var(--radius); padding: var(--space-xl); text-align: center; max-width: 720px;
        }
        .rec-ok h3 { font-family: var(--font-script); font-weight: 400; font-size: 2rem; color: var(--color-dark); margin-bottom: var(--space-sm); }
        .rec-ref {
          font-family: var(--font-heading); font-weight: 700; font-size: 1.5rem;
          color: var(--color-primary-hover); letter-spacing: 1px; margin: var(--space-sm) 0;
        }
        .rec-ok-sub { color: var(--color-mid); margin-bottom: var(--space-lg); }
        @media (max-width: 560px) { .rec-row { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  )
}
