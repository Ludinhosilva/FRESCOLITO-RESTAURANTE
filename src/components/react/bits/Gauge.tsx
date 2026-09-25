// Medidor circular animado (SVG, sin librerias)
export default function Gauge({ value = 0, size = 220, label = '' }) {
  const r = 80
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, Number(value) || 0))
  const dash = (pct / 100) * c

  return (
    <div className="gauge" style={{ width: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDB913" />
            <stop offset="100%" stopColor="#F39C12" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} className="gauge-track" strokeWidth="16" fill="none" />
        <circle
          cx="100"
          cy="100"
          r={r}
          className="gauge-fill"
          strokeWidth="16"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="96" className="gauge-text" textAnchor="middle" dominantBaseline="central">
          {pct.toFixed(1)}%
        </text>
        {label && (
          <text x="100" y="124" className="gauge-sub" textAnchor="middle" dominantBaseline="central">
            {label}
          </text>
        )}
      </svg>
    </div>
  )
}
