import { describe, it, expect } from 'vitest'
import { generateOrderMessage, COMMISSION_PER_ITEM } from '../src/utils/whatsapp'

describe('WhatsApp Message Generator', () => {
  const items = [
    { id: '1', name: 'Ceviche Simple', price: 10.00, quantity: 2 },
    { id: '2', name: 'Arroz con Mariscos', price: 20.00, quantity: 1 },
  ]

  it('debe generar un mensaje con los items del pedido', () => {
    const msg = generateOrderMessage(items, 40, 0, false)
    expect(typeof msg).toBe('string')
    const decoded = decodeURIComponent(msg)
    expect(decoded).toContain('Ceviche Simple')
    expect(decoded).toContain('Arroz con Mariscos')
    expect(decoded).toContain('Total: S/ 40.00')
  })

  it('debe incluir las cantidades correctas', () => {
    const msg = decodeURIComponent(generateOrderMessage(items, 40, 0, false))
    expect(msg).toContain('2x Ceviche Simple')
    expect(msg).toContain('1x Arroz con Mariscos')
  })

  it('debe incluir notas si se proporcionan', () => {
    const msg = decodeURIComponent(generateOrderMessage(items, 40, 0, false, 'Sin cebolla'))
    expect(msg).toContain('Sin cebolla')
  })

  it('debe codificar el mensaje para URL', () => {
    const msg = generateOrderMessage(items, 40, 0, false)
    expect(msg).not.toContain(' ')
    expect(msg).not.toContain('\n')
  })

  it('debe calcular el subtotal correctamente', () => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    expect(subtotal).toBe(40)
  })

  it('debe escapar caracteres especiales correctamente', () => {
    const specialItems = [{ id: 'x', name: 'Item con & y $', price: 10, quantity: 1 }]
    const msg = generateOrderMessage(specialItems, 10, 0, false)
    const decoded = decodeURIComponent(msg)
    expect(decoded).toContain('Item con & y $')
  })

  it('debe incluir comisión si es para llevar', () => {
    const msg = decodeURIComponent(generateOrderMessage(items, 40, 6, true))
    expect(msg).toContain('Comisión para llevar')
    expect(msg).toContain('S/ 2.00 x 3 platos')
  })

  it('debe mostrar el total con comisión si es para llevar', () => {
    const msg = decodeURIComponent(generateOrderMessage(items, 40, 6, true))
    expect(msg).toContain('Total: S/ 46.00')
  })

  it('no debe incluir comisión si no es para llevar', () => {
    const msg = decodeURIComponent(generateOrderMessage(items, 40, 0, false))
    expect(msg).not.toContain('Comisión')
  })

  it('COMMISSION_PER_ITEM debe ser 2.00', () => {
    expect(COMMISSION_PER_ITEM).toBe(2.00)
  })
})
