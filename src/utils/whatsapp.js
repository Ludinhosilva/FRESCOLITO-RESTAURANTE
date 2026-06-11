import { WHATSAPP_NUMBER } from '../data/config'

const COMMISSION_PER_ITEM = 2.00

export function generateOrderMessage(cartItems, total, commission, isDelivery, notes = '') {
  let message = 'Hola FRESCOLITO, quiero hacer un pedido:\n\n'

  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`
  })

  message += `\n🧾 Subtotal: S/ ${total.toFixed(2)}`

  if (isDelivery) {
    const totalCommission = commission
    message += `\n📦 Comisión para llevar (S/ ${COMMISSION_PER_ITEM.toFixed(2)} x ${cartItems.reduce((s, i) => s + i.quantity, 0)} platos): S/ ${totalCommission.toFixed(2)}`
    message += `\n💵 Total: S/ ${(total + totalCommission).toFixed(2)}`
  } else {
    message += `\n💵 Total: S/ ${total.toFixed(2)}`
  }

  if (notes.trim()) {
    message += `\n\n📝 Notas: ${notes.trim()}`
  }

  return encodeURIComponent(message)
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
  window.open(url, '_blank')
}

export { COMMISSION_PER_ITEM }
