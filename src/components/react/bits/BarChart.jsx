// Grafico de barras animado (SVG/CSS, sin librerias pesadas)
export default function BarChart({ data = [], height = 240 }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  if (!data.length) return null

  return (
    <div className="barchart" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="barchart-col" title={`${d.label}: ${d.value}`}>
          <div className="barchart-value">{d.value}</div>
          <div className="barchart-track">
            <div
              className="barchart-bar"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, animationDelay: `${i * 70}ms` }}
            />
          </div>
          <div className="barchart-label">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
