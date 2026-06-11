import { describe, it, expect } from 'vitest'
import { getBusinessStatus } from '../src/utils/businessHours'

describe('Business Hours', () => {
  it('debe devolver isOpen como booleano', () => {
    const result = getBusinessStatus()
    expect(typeof result.isOpen).toBe('boolean')
  })

  it('debe tener el label correcto', () => {
    const result = getBusinessStatus()
    expect(result.label).toBe('Lunes a Viernes')
  })

  it('debe tener formato de hora correcto', () => {
    const result = getBusinessStatus()
    expect(result.openTime).toMatch(/^\d{2}:\d{2}$/)
    expect(result.closeTime).toMatch(/^\d{2}:\d{2}$/)
  })

  it('debe abrir a las 11:30', () => {
    const result = getBusinessStatus()
    expect(result.openTime).toBe('11:30')
  })

  it('debe cerrar a las 15:15', () => {
    const result = getBusinessStatus()
    expect(result.closeTime).toBe('15:15')
  })
})
