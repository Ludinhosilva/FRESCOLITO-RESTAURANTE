import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const RESTAURANTE = {
  nombre: 'FRESCOLITO',
  ruc: '1042274879',
  direccion: 'Calle Jesús de Nazareth A184 - Av. Guardia Civil, Iquitos',
  telefonos: '916 207 362  /  928 104 463',
  logo: '/imagenes/frescolito-logo.jpeg',
}

const CANAL_LABEL = { salon: 'Salón', delivery: 'Delivery', recojo: 'Para llevar / Recojo' }
const PAGO_LABEL = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
  pendiente: 'Pendiente',
  por_verificar: 'Por verificar',
  pagado: 'Pagado',
  contra_entrega: 'Contra entrega',
}

async function cargarLogo() {
  try {
    const res = await fetch(RESTAURANTE.logo)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function fmtFecha(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function normItems(pedido) {
  return (pedido.pedido_items || pedido.items || []).map((i) => ({
    nombre: i.plato_nombre || i.plato || '',
    cantidad: Number(i.cantidad) || 0,
    precio: Number(i.precio_unitario ?? i.precio ?? 0),
  }))
}

export async function generarBoletaPDF(pedido) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const logo = await cargarLogo()

  let y = 14
  if (logo) {
    try {
      doc.addImage(logo, 'JPEG', 14, y, 26, 26)
    } catch {
      /* noop */
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(RESTAURANTE.nombre, ancho / 2, y + 6, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`RUC: ${RESTAURANTE.ruc}`, ancho / 2, y + 12, { align: 'center' })
  doc.text(RESTAURANTE.direccion, ancho / 2, y + 17, { align: 'center' })
  doc.text(`Pedidos: ${RESTAURANTE.telefonos}`, ancho / 2, y + 22, { align: 'center' })

  y += 30
  doc.setDrawColor(200)
  doc.line(14, y, ancho - 14, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('COMPROBANTE DE PEDIDO', ancho / 2, y, { align: 'center' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`N.º de orden: ${pedido.numero_orden ?? '—'}`, 14, y)
  doc.text(`Fecha: ${fmtFecha(pedido.creado_en)}`, ancho - 14, y, { align: 'right' })
  y += 6
  doc.text(`Tipo: ${CANAL_LABEL[pedido.canal] || '—'}`, 14, y)
  y += 6
  const clienteTxt = pedido.cliente_nombre
    ? pedido.cliente_nombre
    : (pedido.mesas ? `Mesa ${pedido.mesas.numero}` : '—')
  doc.text(`Cliente: ${clienteTxt}`, 14, y)
  if (pedido.cliente_telefono) {
    y += 6
    doc.text(`Teléfono: ${pedido.cliente_telefono}`, 14, y)
  }
  if (pedido.cliente_direccion) {
    y += 6
    doc.text(`Dirección: ${pedido.cliente_direccion}`, 14, y, { maxWidth: ancho - 28 })
  }
  y += 6

  const items = normItems(pedido)
  autoTable(doc, {
    startY: y + 2,
    head: [['Cant.', 'Descripción', 'P. Unit.', 'Importe']],
    body: items.map((i) => [
      i.cantidad,
      i.nombre,
      `S/ ${i.precio.toFixed(2)}`,
      `S/ ${(i.precio * i.cantidad).toFixed(2)}`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [62, 39, 35], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  let ty = doc.lastAutoTable.finalY + 8
  const rightX = ancho - 14
  const linea = (label, val, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(label, 120, ty)
    doc.text(`S/ ${Number(val || 0).toFixed(2)}`, rightX, ty, { align: 'right' })
    ty += 6
  }

  linea('Subtotal', pedido.subtotal)
  if (Number(pedido.cargo_envases) > 0) linea('Envases', pedido.cargo_envases)
  if (Number(pedido.costo_delivery) > 0) linea('Delivery', pedido.costo_delivery)
  if (Number(pedido.comision_llevar) > 0) linea('Para llevar', pedido.comision_llevar)
  if (Number(pedido.ajuste) !== 0) linea('Ajuste/Descuento', pedido.ajuste)
  doc.setDrawColor(200)
  doc.line(120, ty - 3, rightX, ty - 3)
  linea('TOTAL', pedido.total, true)

  ty += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Método de pago: ${PAGO_LABEL[pedido.metodo_pago] || 'Por definir'}`, 14, ty)
  ty += 6
  doc.text(`Estado de pago: ${PAGO_LABEL[pedido.estado_pago] || '—'}`, 14, ty)
  if (pedido.codigo_seguimiento) {
    ty += 6
    doc.text(`Código de seguimiento: ${pedido.codigo_seguimiento}`, 14, ty)
  }
  if (pedido.notas) {
    ty += 6
    doc.text(`Notas: ${pedido.notas}`, 14, ty, { maxWidth: ancho - 28 })
  }

  const finalY = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text('Documento informativo — sin valor tributario.', ancho / 2, finalY, { align: 'center' })
  doc.text('¡Gracias por su preferencia!', ancho / 2, finalY + 5, { align: 'center' })

  const nombreArchivo = `boleta-${pedido.numero_orden ?? 'pedido'}-${pedido.codigo_seguimiento || pedido.id?.slice(0, 6) || ''}.pdf`
  doc.save(nombreArchivo)
  return nombreArchivo
}
