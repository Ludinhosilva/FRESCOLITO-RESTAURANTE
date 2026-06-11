import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../src/components/Navbar'

describe('Navbar', () => {
  it('debe mostrar el logo FRESCOLITO', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('FRESCOLITO')).toBeInTheDocument()
  })

  it('debe mostrar todos los enlaces de navegación', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    const links = ['Inicio', 'Menú', 'Nosotros', 'Galería', 'Contacto', 'Reservas']
    links.forEach((link) => {
      const elements = screen.getAllByText(link)
      expect(elements.length).toBe(2)
      elements.forEach((el) => expect(el).toBeInTheDocument())
    })
  })
})
