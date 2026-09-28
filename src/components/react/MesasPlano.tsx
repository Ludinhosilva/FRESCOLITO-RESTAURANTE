import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Mesa = { id: number; numero: number; x: number; y: number; activa?: boolean }
type Estado = { tone: 'libre' | 'ocupada' | 'cobrar'; total?: number; numero_orden?: number }

type Props = {
  mesas: Mesa[]
  estados?: Record<number, Estado>
  selectedId?: number | null
  onSelect?: (id: number) => void
  editable?: boolean
  onMove?: (id: number, x: number, y: number) => void
}

export default function MesasPlano({ mesas, estados = {}, selectedId = null, onSelect, editable = false, onMove }: Props) {
  const contRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null)

  const visibles = mesas.filter((m) => editable || m.activa !== false)

  const iniciarDrag = (e: ReactPointerEvent, m: Mesa) => {
    if (!editable || !contRef.current) return
    e.preventDefault()
    const rect = contRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const x0 = m.x
    const y0 = m.y
    setDrag({ id: m.id, x: x0, y: y0 })

    const clamp = (v: number) => Math.max(4, Math.min(96, v))

    const move = (ev: PointerEvent) => {
      const nx = clamp(x0 + ((ev.clientX - startX) / rect.width) * 100)
      const ny = clamp(y0 + ((ev.clientY - startY) / rect.height) * 100)
      setDrag({ id: m.id, x: nx, y: ny })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const nx = Math.round(clamp(x0 + ((ev.clientX - startX) / rect.width) * 100))
      const ny = Math.round(clamp(y0 + ((ev.clientY - startY) / rect.height) * 100))
      setDrag(null)
      onMove?.(m.id, nx, ny)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="plano" ref={contRef}>
      {visibles.map((m) => {
        const pos = drag && drag.id === m.id ? drag : m
        const estado = estados[m.id]
        const tone = estado?.tone || 'libre'
        const inactiva = m.activa === false
        return (
          <div
            key={m.id}
            className={
              'plano-mesa tone-' + tone +
              (selectedId === m.id ? ' selected' : '') +
              (inactiva ? ' inactiva' : '') +
              (editable ? ' editable' : '')
            }
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onPointerDown={(e) => iniciarDrag(e, m)}
            onClick={() => { if (!editable) onSelect?.(m.id) }}
            role={editable ? undefined : 'button'}
            tabIndex={editable ? undefined : 0}
            aria-label={`Mesa ${m.numero}`}
            onKeyDown={(e) => { if (!editable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect?.(m.id) } }}
          >
            <span className="mesa-silla top" />
            <span className="mesa-silla bottom" />
            <span className="mesa-silla left" />
            <span className="mesa-silla right" />
            <span className="mesa-tablero">{m.numero}</span>
            {estado && tone !== 'libre' && (
              <span className="plano-mesa-info">
                S/ {Number(estado.total ?? 0).toFixed(0)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
