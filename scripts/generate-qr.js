import QRCode from 'qrcode'
import { writeFileSync } from 'fs'
import { existsSync, mkdirSync } from 'fs'

const URL = 'https://frescolito-restaurante.vercel.app'
const OUT = 'public/qr-frescolito.png'

if (!existsSync('public')) mkdirSync('public', { recursive: true })

QRCode.toFile(OUT, URL, {
  width: 512,
  margin: 2,
  color: { dark: '#3E2723', light: '#FFFFFF' },
}, (err) => {
  if (err) {
    console.error('Error al generar QR:', err)
    process.exit(1)
  }
  console.log(`QR generado: ${OUT}`)
  console.log(`URL: ${URL}`)
})
