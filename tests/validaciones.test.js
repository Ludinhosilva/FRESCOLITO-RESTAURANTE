import { describe, it, expect } from 'vitest'
import { validarReserva } from '../src/lib/validaciones.js'

const hoy = '2026-09-10'

describe('validarReserva', () => {
  it('devuelve vacio para datos validos', () => {
    const err = validarReserva(
      { nombre: 'Ana', fecha: '2026-09-15', hora: '12:30', personas: 2 },
      hoy,
    )
    expect(err).toBe('')
  })

  it('exige nombre', () => {
    const err = validarReserva({ nombre: '  ', fecha: '2026-09-15', hora: '12:00', personas: 1 }, hoy)
    expect(err).toBe('Ingresa tu nombre')
  })

  it('rechaza fecha pasada', () => {
    const err = validarReserva({ nombre: 'Ana', fecha: '2026-09-01', hora: '12:00', personas: 1 }, hoy)
    expect(err).toBe('La fecha no puede ser pasada')
  })

  it('exige fecha', () => {
    const err = validarReserva({ nombre: 'Ana', fecha: '', hora: '12:00', personas: 1 }, hoy)
    expect(err).toBe('Selecciona la fecha')
  })

  it('exige hora', () => {
    const err = validarReserva({ nombre: 'Ana', fecha: '2026-09-15', hora: '', personas: 1 }, hoy)
    expect(err).toBe('Selecciona la hora')
  })

  it('rechaza personas menores a 1', () => {
    const err = validarReserva({ nombre: 'Ana', fecha: '2026-09-15', hora: '12:00', personas: 0 }, hoy)
    expect(err).toBe('Indica el número de personas')
  })
})