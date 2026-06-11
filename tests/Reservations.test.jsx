import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Reservations from '../src/pages/Reservations'

function renderReservations() {
  return render(
    <MemoryRouter>
      <Reservations />
    </MemoryRouter>
  )
}

describe('Reservations Page - Caja Negra', () => {
  it('debe renderizar el formulario de reserva', () => {
    renderReservations()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha')).toBeInTheDocument()
    expect(screen.getByLabelText('Hora')).toBeInTheDocument()
    expect(screen.getByLabelText('Número de Personas')).toBeInTheDocument()
  })

  it('debe mostrar errores al enviar vacío', async () => {
    const user = userEvent.setup()
    renderReservations()
    await user.click(screen.getByText('Reservar Mesa'))
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El teléfono es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una fecha')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una hora')).toBeInTheDocument()
  })

  it('debe enviar con datos válidos', async () => {
    const user = userEvent.setup()
    renderReservations()
    await user.type(screen.getByLabelText('Nombre'), 'María García')
    await user.type(screen.getByLabelText('Email'), 'maria@email.com')
    await user.type(screen.getByLabelText('Teléfono'), '912345678')
    await user.type(screen.getByLabelText('Fecha'), '2026-06-15')
    await user.type(screen.getByLabelText('Hora'), '20:00')
    await user.click(screen.getByText('Reservar Mesa'))
    expect(screen.getByText('Reserva enviada con éxito. Te confirmaremos pronto.')).toBeInTheDocument()
  })
})
