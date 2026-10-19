import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Mesa = { id: number; numero: number; x: number; y: number; activa?: boolean }
type Estado = { tone: 'libre' | 'ocupada' | 'cobrar'; total?: number; numero_orden?: number; unida?: boolean; grupo?: string }

type Props = {
  mesas: Mesa[]
  estados?: Record<number, Estado>
  selectedId?: number | null
  selectedIds?: number[]
  onSelect?: (id: number) => void
  dragMode?: 'none' | 'move' | 'join'
  onMove?: (id: number, x: number, y: number) => void
  onJoinDrop?: (fromId: number, toId: number) => void
}

const clamp = (v: number) => Math.max(4, Math.min(96, v))

export default function MesasPlano({
  mesas,
  estados = {},
  selectedId = null,
  selectedIds = [],
  onSelect,
  dragMode = 'none',
  onMove,
  onJoinDrop,
}: Props) {
  const contRef = useRef<HTMLDivElement>(null)
  const movedRef = useRef(false)
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null)

  const visibles = mesas.filter((m) => dragMode === 'move' || dragMode === 'join' || m.activa !== false)

  const iniciarDrag = (e: ReactPointerEvent, m: Mesa) => {
    if (dragMode === 'none' || !contRef.current) return
    e.preventDefault()
    const rect = contRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const x0 = m.x ?? 8
    const y0 = m.y ?? 8
    movedRef.current = false
    setDrag({ id: m.id, x: x0, y: y0 })

    const move = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100
      const dy = ((ev.clientY - startY) / rect.height) * 100
      if (Math.abs(dx) + Math.abs(dy) > 1.5) movedRef.current = true
      setDrag({ id: m.id, x: clamp(x0 + dx), y: clamp(y0 + dy) })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const nx = Math.round(clamp(x0 + ((ev.clientX - startX) / rect.width) * 100))
      const ny = Math.round(clamp(y0 + ((ev.clientY - startY) / rect.height) * 100))
      setDrag(null)

      if (dragMode === 'move') {
        if (movedRef.current) onMove?.(m.id, nx, ny)
      } else if (dragMode === 'join' && movedRef.current) {
        // buscar la mesa más cercana al punto de suelte
        let best: Mesa | null = null
        let bestD = Infinity
        for (const o of visibles) {
          if (o.id === m.id) continue
          const d = Math.hypot((o.x ?? 8) - nx, (o.y ?? 8) - ny)
          if (d < bestD) { bestD = d; best = o }
        }
        if (best && bestD <= 16) onJoinDrop?.(m.id, best.id)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const clickMesa = (m: Mesa) => {
    if (movedRef.current) { movedRef.current = false; return }
    if (dragMode === 'move') return
    onSelect?.(m.id)
  }

  return (
    <div className={'plano' + (dragMode !== 'none' ? ' plano-edit' : '')} ref={contRef}>
      {visibles.map((m) => {
        const pos = drag && drag.id === m.id ? drag : { x: m.x ?? 8, y: m.y ?? 8 }
        const estado = estados[m.id]
        const tone = estado?.tone || 'libre'
        const inactiva = m.activa === false
        const selected = selectedId === m.id || selectedIds.includes(m.id)
        return (
          <div
            key={m.id}
            className={
              'plano-mesa tone-' + tone +
              (selected ? ' selected' : '') +
              (estado?.unida ? ' unida' : '') +
              (inactiva ? ' inactiva' : '') +
              (dragMode !== 'none' ? ' draggable' : '')
            }
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onPointerDown={(e) => iniciarDrag(e, m)}
            onClick={() => clickMesa(m)}
            role={dragMode === 'none' ? 'button' : undefined}
            tabIndex={dragMode === 'none' ? 0 : undefined}
            aria-label={`Mesa ${m.numero}`}
            onKeyDown={(e) => { if (dragMode === 'none' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect?.(m.id) } }}
          >
            <span className="mesa-silla top" />
            <span className="mesa-silla bottom" />
            <span className="mesa-silla left" />
            <span className="mesa-silla right" />
            <span className="mesa-tablero">{m.numero}</span>
            {estado?.grupo && <span className="plano-mesa-grupo">{estado.grupo}</span>}
            {estado && tone !== 'libre' && !estado?.grupo && (
              <span className="plano-mesa-info">S/ {Number(estado.total ?? 0).toFixed(0)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
