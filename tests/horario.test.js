import { describe, it, expect } from 'vitest'
import { horarioIncluye } from '../src/lib/pedidosCliente.ts'

const horario = { dias: [3, 4], apertura: '11:30', cierre: '15:20' }

describe('horarioIncluye', () => {
  it('true dentro del horario (miercoles 12:00)', () => {
    expect(horarioIncluye(horario, 3, 12 * 60)).toBe(true)
  })

  it('true en el limite de apertura (miercoles 11:30)', () => {
    expect(horarioIncluye(horario, 3, 11 * 60 + 30)).toBe(true)
  })

  it('true en el limite de cierre (jueves 15:20)', () => {
    expect(horarioIncluye(horario, 4, 15 * 60 + 20)).toBe(true)
  })

  it('false antes de abrir (miercoles 11:00)', () => {
    expect(horarioIncluye(horario, 3, 11 * 60)).toBe(false)
  })

  it('false despues de cerrar (jueves 16:00)', () => {
    expect(horarioIncluye(horario, 4, 16 * 60)).toBe(false)
  })

  it('false un dia no habilitado (viernes 12:00)', () => {
    expect(horarioIncluye(horario, 5, 12 * 60)).toBe(false)
  })

  it('true si no hay horario configurado (siempre abierto)', () => {
    expect(horarioIncluye(null, 0, 0)).toBe(true)
  })
})