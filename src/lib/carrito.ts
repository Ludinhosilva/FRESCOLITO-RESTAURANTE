export const COMISION_PARA_LLEVAR = 2.0

export interface ItemCarrito {
  plato: { precio: number; [k: string]: any }
  cantidad: number
}

/**
 * Calcula los totales de un pedido a partir de sus items.
 */
export function calcularTotales(items: ItemCarrito[], paraLlevar: boolean) {
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)
  const subtotal = items.reduce((acc, i) => acc + i.plato.precio * i.cantidad, 0)
  const comision = paraLlevar ? totalItems * COMISION_PARA_LLEVAR : 0
  const total = subtotal + comision
  return { subtotal, comision, total, totalItems }
}

/**
 * Normaliza una seleccion { platoId: cantidad } a la lista de items con sus platos.
 * Omite platos inexistentes o cantidades invalidas.
 */
export function construirItems(seleccion: Record<string, number>, platos: any[]): ItemCarrito[] {
  return Object.entries(seleccion)
    .map(([platoId, cantidad]) => {
      const plato = platos.find((p) => p.id === Number(platoId))
      return plato && cantidad > 0 ? { plato, cantidad } : null
    })
    .filter((x): x is ItemCarrito => Boolean(x))
}
