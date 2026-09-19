import { describe, it, expect } from 'vitest'
import { calcularTotales, construirItems, COMISION_PARA_LLEVAR } from '../src/lib/carrito.js'

const platos = [
  { id: 1, nombre: 'Ceviche Simple 1', precio: 10 },
  { id: 2, nombre: 'Arroz con Mariscos', precio: 20 },
  { id: 3, nombre: 'Lomo Saltado', precio: 15 },
]

describe('calcularTotales', () => {
  it('calcula subtotal sin comision en local', () => {
    const items = [
      { plato: platos[0], cantidad: 2 },
      { plato: platos[1], cantidad: 1 },
    ]
    const r = calcularTotales(items, false)
    expect(r.subtotal).toBe(40)
    expect(r.comision).toBe(0)
    expect(r.total).toBe(40)
    expect(r.totalItems).toBe(3)
  })

  it('agrega comision de S/ 2 por plato si es para llevar', () => {
    const items = [{ plato: platos[0], cantidad: 3 }]
    const r = calcularTotales(items, true)
    expect(r.subtotal).toBe(30)
    expect(r.comision).toBe(3 * COMISION_PARA_LLEVAR) // 6
    expect(r.total).toBe(36)
  })

  it('no agrega comision si no es para llevar aunque haya items', () => {
    const items = [{ plato: platos[2], cantidad: 4 }]
    const r = calcularTotales(items, false)
    expect(r.comision).toBe(0)
    expect(r.total).toBe(60)
  })

  it('comision cero con carrito vacio', () => {
    const r = calcularTotales([], true)
    expect(r.totalItems).toBe(0)
    expect(r.subtotal).toBe(0)
    expect(r.comision).toBe(0)
    expect(r.total).toBe(0)
  })

  it('COMISION_PARA_LLEVAR es S/ 2.00', () => {
    expect(COMISION_PARA_LLEVAR).toBe(2.0)
  })
})

describe('construirItems', () => {
  it('omite platos inexistentes', () => {
    const r = construirItems({ 1: 2, 999: 3 }, platos)
    expect(r).toHaveLength(1)
    expect(r[0].plato.id).toBe(1)
    expect(r[0].cantidad).toBe(2)
  })

  it('omite cantidades invalidas', () => {
    const r = construirItems({ 1: 0, 2: -1 }, platos)
    expect(r).toHaveLength(0)
  })

  it('respeta cantidades positivas', () => {
    const r = construirItems({ 1: 5 }, platos)
    expect(r[0].cantidad).toBe(5)
  })
})