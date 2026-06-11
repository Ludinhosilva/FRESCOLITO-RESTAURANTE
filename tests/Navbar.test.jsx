import { describe, it, expect } from 'vitest'
import { WHATSAPP_NUMBER, BUSINESS_HOURS, SITE_NAME } from '../src/data/config'

describe('Project Config', () => {
  it('WHATSAPP_NUMBER debe ser el número correcto', () => {
    expect(WHATSAPP_NUMBER).toBe('51927367844')
    expect(WHATSAPP_NUMBER).toMatch(/^\d+$/)
  })

  it('BUSINESS_HOURS debe tener días laborables', () => {
    expect(BUSINESS_HOURS.days).toEqual([1, 2, 3, 4, 5])
  })

  it('BUSINESS_HOURS debe tener horario de apertura', () => {
    expect(BUSINESS_HOURS.open.h).toBe(11)
    expect(BUSINESS_HOURS.open.m).toBe(30)
  })

  it('BUSINESS_HOURS debe tener horario de cierre', () => {
    expect(BUSINESS_HOURS.close.h).toBe(15)
    expect(BUSINESS_HOURS.close.m).toBe(15)
  })

  it('SITE_NAME debe ser correcto', () => {
    expect(SITE_NAME).toBe('FRESCOLITO RESTAURANTE')
  })
})
