import { WHATSAPP_NUMBER } from '../data/config'

export function generateOrderMessage(cartItems, total, notes = '') {
  let message = 'Hola FRESCOLITO, quiero hacer un pedido:\n\n'

  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`
  })

  message += `\n🧾 TOTAL: S/ ${total.toFixed(2)}`

  if (notes.trim()) {
    message += `\n\n📝 Notas: ${notes.trim()}`
  }

  return encodeURIComponent(message)
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
  window.open(url, '_blank')
}
