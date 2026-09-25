import { describe, it, expect } from 'vitest'
import { WHATSAPP_NUMBER, SITE_NAME } from '../src/data/config'
import { HORA_APERTURA, HORA_CIERRE, formatearHoras } from '../src/lib/horario.ts'

describe('Project Config', () => {
  it('WHATSAPP_NUMBER debe ser el número correcto', () => {
    expect(WHATSAPP_NUMBER).toBe('51916207362')
    expect(WHATSAPP_NUMBER).toMatch(/^\d+$/)
  })

  it('HORA_APERTURA debe ser 11:00', () => {
    expect(HORA_APERTURA).toBe('11:00')
  })

  it('HORA_CIERRE debe ser 15:30', () => {
    expect(HORA_CIERRE).toBe('15:30')
  })

  it('formatearHoras debe mostrar 11:00 AM – 3:30 PM', () => {
    expect(formatearHoras()).toBe('11:00 AM – 3:30 PM')
  })

  it('SITE_NAME debe ser correcto', () => {
    expect(SITE_NAME).toBe('FRESCOLITO RESTAURANTE')
  })
})
