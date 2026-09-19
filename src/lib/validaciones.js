/**
 * Valida el formulario de reserva.
 * @returns {string} mensaje de error o '' si es valido
 */
export function validarReserva({ nombre, fecha, hora, personas }, hoy) {
  if (!nombre || !nombre.trim()) return 'Ingresa tu nombre'
  if (!fecha) return 'Selecciona la fecha'
  if (fecha < hoy) return 'La fecha no puede ser pasada'
  if (!hora) return 'Selecciona la hora'
  if (personas < 1) return 'Indica el número de personas'
  return ''
}