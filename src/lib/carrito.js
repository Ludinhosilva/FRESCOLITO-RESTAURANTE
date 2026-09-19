export const COMISION_PARA_LLEVAR = 2.0

/**
 * Calcula los totales de un pedido a partir de sus items.
 * @param {Array} items - [{ plato: { precio }, cantidad }]
 * @param {boolean} paraLlevar
 * @returns {{ subtotal:number, comision:number, total:number, totalItems:number }}
 */
export function calcularTotales(items, paraLlevar) {
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
export function construirItems(seleccion, platos) {
  return Object.entries(seleccion)
    .map(([platoId, cantidad]) => {
      const plato = platos.find((p) => p.id === Number(platoId))
      return plato && cantidad > 0 ? { plato, cantidad } : null
    })
    .filter(Boolean)
}