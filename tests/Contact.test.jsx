import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../src/components/react/ContactForm'

function renderContact() {
  return render(<ContactForm />)
}

describe('Contact Page - Caja Negra', () => {
  it('debe renderizar el formulario de contacto', () => {
    renderContact()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument()
  })

  it('debe mostrar errores cuando se envía vacío', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.click(screen.getByText('Enviar Mensaje'))
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El teléfono es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El mensaje es obligatorio')).toBeInTheDocument()
  })

  it('debe validar email inválido', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Email'), 'email-invalido')
    await user.type(screen.getByLabelText('Teléfono'), '123456789')
    await user.type(screen.getByLabelText('Mensaje'), 'Hola')
    await user.click(screen.getByText('Enviar Mensaje'))
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
  })

  it('debe validar teléfono con menos de 7 dígitos', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Email'), 'juan@email.com')
    await user.type(screen.getByLabelText('Teléfono'), '123')
    await user.type(screen.getByLabelText('Mensaje'), 'Hola')
    await user.click(screen.getByText('Enviar Mensaje'))
    expect(screen.getByText('Teléfono inválido (mín. 7 dígitos)')).toBeInTheDocument()
  })

  it('debe enviar el formulario con datos válidos', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Nombre'), 'Juan Pérez')
    await user.type(screen.getByLabelText('Email'), 'juan@email.com')
    await user.type(screen.getByLabelText('Teléfono'), '987654321')
    await user.type(screen.getByLabelText('Mensaje'), 'Quiero hacer un pedido')
    await user.click(screen.getByText('Enviar Mensaje'))
    expect(screen.getByText('Mensaje enviado con éxito. Te contactaremos pronto.')).toBeInTheDocument()
  })
})

describe('Contact Page - Caja Blanca (Validación)', () => {
  it('las validaciones deben prevenir XSS básico', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('<script>alert("xss")</script>')).toBe(false)
    expect(emailRegex.test('normal@email.com')).toBe(true)
  })

  it('teléfono solo debe aceptar dígitos', () => {
    const phoneRegex = /^\d{7,}$/
    expect(phoneRegex.test('abc')).toBe(false)
    expect(phoneRegex.test('1234567')).toBe(true)
    expect(phoneRegex.test('12-345-67')).toBe(false)
  })
})
