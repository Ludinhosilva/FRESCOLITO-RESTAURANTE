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

const nocturno = { dias: [4, 5, 6], apertura: '11:30', cierre: '04:15' }

describe('horarioIncluye - cruza medianoche', () => {
  it('true viernes por la tarde (13:00)', () => {
    expect(horarioIncluye(nocturno, 5, 13 * 60)).toBe(true)
  })

  it('true en la madrugada del dia siguiente (sabado 02:00 = turno del viernes)', () => {
    expect(horarioIncluye(nocturno, 6, 2 * 60)).toBe(true)
  })

  it('true en el limite de cierre de madrugada (sabado 04:15)', () => {
    expect(horarioIncluye(nocturno, 6, 4 * 60 + 15)).toBe(true)
  })

  it('false despues del cierre de madrugada (sabado 05:00)', () => {
    expect(horarioIncluye(nocturno, 6, 5 * 60)).toBe(false)
  })

  it('false antes de abrir (viernes 10:00)', () => {
    expect(horarioIncluye(nocturno, 5, 10 * 60)).toBe(false)
  })

  it('false en madrugada si el dia anterior no abre (lunes 02:00, domingo no habilitado)', () => {
    expect(horarioIncluye(nocturno, 1, 2 * 60)).toBe(false)
  })
})

describe('horarioIncluye - 24 horas', () => {
  const siempre = { dias: [1, 2, 3, 4, 5], apertura: '00:00', cierre: '00:00' }

  it('true a cualquier hora de un dia habilitado', () => {
    expect(horarioIncluye(siempre, 3, 3 * 60)).toBe(true)
    expect(horarioIncluye(siempre, 3, 23 * 60 + 59)).toBe(true)
  })

  it('false en un dia no habilitado', () => {
    expect(horarioIncluye(siempre, 0, 12 * 60)).toBe(false)
  })
})