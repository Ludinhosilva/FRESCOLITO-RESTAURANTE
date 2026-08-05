import { describe, it, expect } from 'vitest'
import { orderMessage, openWhatsApp } from '../src/utils/whatsapp'

describe('WhatsApp Order Message', () => {
  it('debe generar un mensaje con el nombre y precio del plato', () => {
    const msg = decodeURIComponent(orderMessage('Ceviche Mixto', 25.00))
    expect(msg).toContain('Ceviche Mixto')
    expect(msg).toContain('S/ 25.00')
  })

  it('debe incluir el saludo Hola FRESCOLITO', () => {
    const msg = decodeURIComponent(orderMessage('Arroz con Mariscos', 20.00))
    expect(msg).toContain('Hola FRESCOLITO, quiero ordenar:')
  })

  it('debe codificar el mensaje para URL', () => {
    const msg = orderMessage('Ceviche Mixto', 25.00)
    expect(msg).not.toContain(' ')
    expect(msg).not.toContain('\n')
  })

  it('debe manejar precios con decimales correctamente', () => {
    const msg = decodeURIComponent(orderMessage('Chicharrón de Pescado', 15.50))
    expect(msg).toContain('S/ 15.50')
  })

  it('debe escapar caracteres especiales', () => {
    const msg = decodeURIComponent(orderMessage('Menú Infantil', 12.00))
    expect(msg).toContain('Menú Infantil')
  })

  it('openWhatsApp debe construir la URL correcta', () => {
    const originalOpen = window.open
    let openedUrl = ''
    window.open = (url) => { openedUrl = url }
    openWhatsApp('test-message')
    window.open = originalOpen
    expect(openedUrl).toContain('https://wa.me/51927367844')
    expect(openedUrl).toContain('test-message')
  })
})
