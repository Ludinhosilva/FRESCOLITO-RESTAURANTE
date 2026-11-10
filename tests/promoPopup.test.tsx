import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PromoBanner from '../src/components/react/PromoBanner.tsx'

const promo = {
  id: 1,
  titulo: 'Desayuno Frescolito',
  descripcion: 'Una promoción de prueba.',
  imagen: '/imagenes/promos/promo-desayuno-1.jpg',
  badge: 'Oferta',
  cta_label: '¡Lo quiero!',
  enlace: '/menu',
  fecha_fin: null,
  activo: true,
  orden: 1,
}

describe('popup automático de promociones', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      writable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '')
      },
    })
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      writable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open')
      },
    })
    vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    vi.spyOn(HTMLDialogElement.prototype, 'close')
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('abre el popup del inicio después del retardo', () => {
    const showModal = vi.mocked(HTMLDialogElement.prototype.showModal)

    render(<PromoBanner inicial={[promo]} />)

    act(() => vi.advanceTimersByTime(1199))
    expect(showModal).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(showModal).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /lo quiero/i })).toHaveAttribute('href', '/menu')
  })

  it('permite cerrar el popup con la X', () => {
    render(<PromoBanner inicial={[promo]} />)
    act(() => vi.advanceTimersByTime(1200))

    act(() => {
      screen.getByRole('button', { name: /cerrar promoción/i }).click()
    })

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1)
  })

  it('no vuelve a abrir el popup en la misma sesión', () => {
    const { unmount } = render(<PromoBanner inicial={[promo]} />)
    act(() => vi.advanceTimersByTime(1200))
    act(() => {
      screen.getByRole('button', { name: /cerrar promoción/i }).click()
    })
    unmount()

    const showModal = vi.mocked(HTMLDialogElement.prototype.showModal)
    showModal.mockClear()

    render(<PromoBanner inicial={[promo]} />)
    act(() => vi.advanceTimersByTime(1200))

    expect(showModal).not.toHaveBeenCalled()
  })
})
