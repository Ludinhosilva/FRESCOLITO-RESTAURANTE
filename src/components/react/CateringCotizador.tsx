import { useState } from 'react'
import { WHATSAPP_NUMBER } from '../../data/config.ts'
import { CalendarDays, Users, PartyPopper, Send } from 'lucide-react'

const TIPOS = [
  'Cumpleaños',
  'Matrimonio',
  'Bautizo / primera comunión',
  'Evento corporativo',
  'Aniversario',
  'Otro',
]

export default function CateringCotizador() {
  const [tipo, setTipo] = useState(TIPOS[0])
  const [fecha, setFecha] = useState('')
  const [invitados, setInvitados] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    const lineas = [
      'Hola Frescolito, quiero cotizar el servicio de catering para un evento.',
      `• Tipo de evento: ${tipo}`,
      fecha ? `• Fecha: ${fecha}` : null,
      invitados ? `• N.º de invitados: ${invitados}` : null,
    ].filter(Boolean)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <form className="cat-cotizador" onSubmit={enviar}>
      <div className="cat-cot-field">
        <label htmlFor="cat-tipo"><PartyPopper /> Tipo de evento</label>
        <select id="cat-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="cat-cot-field">
        <label htmlFor="cat-fecha"><CalendarDays /> Fecha (opcional)</label>
        <input id="cat-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="cat-cot-field">
        <label htmlFor="cat-inv"><Users /> N.º de invitados (opcional)</label>
        <input id="cat-inv" type="number" min="1" inputMode="numeric" placeholder="Ej: 50" value={invitados} onChange={(e) => setInvitados(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary cat-cot-btn">
        <Send /> Cotizar por WhatsApp
      </button>
    </form>
  )
}
