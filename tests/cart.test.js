import { describe, it, expect, beforeEach } from 'vitest'

describe('Cart Logic', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function addItem(id, name, price, quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('frescolito-cart') || '[]')
    const existing = cart.find(i => i.id === id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ id, name, price, quantity })
    }
    localStorage.setItem('frescolito-cart', JSON.stringify(cart))
    return cart
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('frescolito-cart') || '[]')
  }

  function removeItem(id) {
    const cart = getCart().filter(i => i.id !== id)
    localStorage.setItem('frescolito-cart', JSON.stringify(cart))
    return cart
  }

  function updateQuantity(id, delta) {
    const cart = getCart()
      .map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    localStorage.setItem('frescolito-cart', JSON.stringify(cart))
    return cart
  }

  it('debe agregar items al carrito', () => {
    addItem('1', 'Ceviche', 10)
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].name).toBe('Ceviche')
    expect(cart[0].quantity).toBe(1)
  })

  it('debe incrementar cantidad si el item ya existe', () => {
    addItem('1', 'Ceviche', 10)
    addItem('1', 'Ceviche', 10)
    const cart = getCart()
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(2)
  })

  it('debe permitir agregar múltiples items diferentes', () => {
    addItem('1', 'Ceviche', 10)
    addItem('2', 'Arroz con Mariscos', 20)
    const cart = getCart()
    expect(cart).toHaveLength(2)
  })

  it('debe eliminar items del carrito', () => {
    addItem('1', 'Ceviche', 10)
    addItem('2', 'Arroz con Mariscos', 20)
    const cart = removeItem('1')
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe('2')
  })

  it('debe actualizar la cantidad correctamente', () => {
    addItem('1', 'Ceviche', 10, 3)
    let cart = updateQuantity('1', -1)
    expect(cart[0].quantity).toBe(2)
  })

  it('debe eliminar item si la cantidad llega a 0', () => {
    addItem('1', 'Ceviche', 10, 1)
    const cart = updateQuantity('1', -1)
    expect(cart).toHaveLength(0)
  })

  it('debe calcular el total correctamente', () => {
    addItem('1', 'Ceviche', 10, 2)
    addItem('2', 'Arroz con Mariscos', 20, 1)
    const cart = getCart()
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    expect(total).toBe(40)
  })

  it('debe persistir en localStorage', () => {
    addItem('1', 'Ceviche', 10)
    const stored = JSON.parse(localStorage.getItem('frescolito-cart'))
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('Ceviche')
  })
})
