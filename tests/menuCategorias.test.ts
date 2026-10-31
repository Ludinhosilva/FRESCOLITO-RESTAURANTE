import { describe, it, expect } from 'vitest'
import { getCategoriaMeta } from '../src/data/menuCategorias.ts'

describe('getCategoriaMeta', () => {
  it('normaliza mayúsculas y acentos', () => {
    const meta = getCategoriaMeta('CEVICHES')
    expect(meta.label).toBe('Ceviches')
    expect(meta.Icon).toBeTruthy()
  })

  it('mapea chicharrón con tilde', () => {
    expect(getCategoriaMeta('chicharrón').label).toBe('Chicharrones')
  })

  it('mapea platos marinos', () => {
    expect(getCategoriaMeta('Platos Marinos').label).toBe('Platos Marinos')
  })

  it('usa el fallback para categorías desconocidas', () => {
    const meta = getCategoriaMeta('  Especiales  ')
    expect(meta.label).toBe('Especiales')
    expect(meta.descripcion).toBe('Sabores de la casa')
  })

  it('usa "Otros" cuando no hay categoría', () => {
    expect(getCategoriaMeta(null).label).toBe('Otros')
  })
})
