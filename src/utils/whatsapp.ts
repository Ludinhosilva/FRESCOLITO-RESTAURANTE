import { WHATSAPP_NUMBER } from '../data/config'

export function orderMessage(name, price) {
  const msg = `Hola FRESCOLITO, quiero ordenar:\n\n${name} - S/ ${price.toFixed(2)}`
  return encodeURIComponent(msg)
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
  window.open(url, '_blank')
}
