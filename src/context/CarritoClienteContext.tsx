import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'frescolito_carrito_cliente'
const Ctx = createContext(null)

export function CarritoClienteProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* noop */
    }
  }, [items])

  const agregar = (plato, cantidad = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.plato.id === plato.id)
      const max = plato.stock ?? 99
      if (existe) {
        return prev.map((i) =>
          i.plato.id === plato.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, max) }
            : i,
        )
      }
      return [...prev, { plato, cantidad: Math.min(cantidad, max) }]
    })
  }

  const setCantidad = (platoId, cantidad) => {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.plato.id !== platoId)
        : prev.map((i) => (i.plato.id === platoId ? { ...i, cantidad } : i)),
    )
  }

  const quitar = (platoId) => setItems((prev) => prev.filter((i) => i.plato.id !== platoId))
  const limpiar = () => setItems([])

  const subtotal = items.reduce((a, i) => a + i.plato.precio * i.cantidad, 0)
  const unidades = items.reduce((a, i) => a + i.cantidad, 0)

  return (
    <Ctx.Provider value={{ items, agregar, setCantidad, quitar, limpiar, subtotal, unidades }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCarritoCliente() {
  return useContext(Ctx)
}