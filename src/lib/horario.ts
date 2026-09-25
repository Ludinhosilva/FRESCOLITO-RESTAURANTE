// Horario de atencion: horas FIJAS, solo los dias son configurables.

export const HORA_APERTURA = '11:00'
export const HORA_CIERRE = '15:30'

export const DIAS_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Construye un horario a partir de los dias, usando las horas fijas. */
export function horarioConDias(dias: number[]) {
  return { dias: dias || [], apertura: HORA_APERTURA, cierre: HORA_CIERRE }
}

/** true si el horario incluye un dia/hora dados (dow 0=Dom, hhmm en minutos). */
export function horarioIncluye(horario, dow, hhmm) {
  if (!horario) return true
  const dias = horario.dias || []
  const [ah, am] = (horario.apertura || '00:00').split(':').map(Number)
  const [ch, cm] = (horario.cierre || '23:59').split(':').map(Number)
  const apertura = ah * 60 + am
  const cierre = ch * 60 + cm

  // Abierto 24 horas los dias seleccionados.
  if (cierre === apertura) return dias.includes(dow)

  // Horario normal: abre y cierra el mismo dia.
  if (cierre > apertura) return dias.includes(dow) && hhmm >= apertura && hhmm <= cierre

  // Cruza medianoche: el turno empieza hoy y termina de madrugada al dia siguiente.
  if (hhmm >= apertura) return dias.includes(dow)
  if (hhmm <= cierre) return dias.includes((dow + 6) % 7)
  return false
}

/** true si el horario configurado incluye el momento actual (hora Lima). */
export function estaAbierto(horario, ahora = new Date()) {
  const lima = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))
  return horarioIncluye(horario, lima.getDay(), lima.getHours() * 60 + lima.getMinutes())
}

/** Formatea una hora "HH:MM" a "h:MM AM/PM". */
function fmtHora(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ap = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

/** Texto del horario fijo, ej. "11:00 AM – 3:30 PM". */
export function formatearHoras() {
  return `${fmtHora(HORA_APERTURA)} – ${fmtHora(HORA_CIERRE)}`
}

/** Etiqueta legible de los dias, ej. "Lunes a Viernes" o "Lun, Mié, Vie". */
export function etiquetaDias(dias: number[]) {
  if (!dias || dias.length === 0) return 'Cerrado'
  const s = [...dias].sort((a, b) => a - b)
  if (s.length === 7) return 'Todos los días'
  const consecutivos = s.every((d, i) => i === 0 || d === s[i - 1] + 1)
  if (consecutivos && s.length >= 3) return `${DIAS_LARGO[s[0]]} a ${DIAS_LARGO[s[s.length - 1]]}`
  return s.map((d) => DIAS_LABEL[d]).join(', ')
}
