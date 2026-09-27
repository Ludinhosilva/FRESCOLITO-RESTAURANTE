export function descargarCSV(nombre, filas) {
  if (!filas || filas.length === 0) return
  const headers = Object.keys(filas[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [
    headers.join(','),
    ...filas.map((f) => headers.map((h) => esc(f[h])).join(',')),
  ].join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
