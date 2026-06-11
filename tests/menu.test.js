import { describe, it, expect } from 'vitest'
import { categories, featuredDishes } from '../src/data/menu'

describe('Menu Data', () => {
  it('debe tener 2 categorías: A la Carta y Promo Marino', () => {
    expect(categories).toHaveLength(2)
    expect(categories[0].name).toBe('A la Carta')
    expect(categories[1].name).toBe('Promo Marino')
  })

  it('A la Carta debe tener 9 platos', () => {
    const carta = categories.find((c) => c.id === 'carta')
    expect(carta.items).toHaveLength(9)
  })

  it('Promo Marino debe tener 9 items', () => {
    const promos = categories.find((c) => c.id === 'promos')
    expect(promos.items).toHaveLength(9)
  })

  it('todos los platos deben tener id, name, price', () => {
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('price')
        expect(typeof item.price).toBe('number')
      })
    })
  })

  it('precios deben ser positivos', () => {
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(item.price).toBeGreaterThan(0)
      })
    })
  })

  it('Platos Destacados debe tener 4 items', () => {
    expect(featuredDishes).toHaveLength(4)
  })
})
