import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const CERRANDO_MS = 200
const FOCUSEABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Sheet({ title, onClose, children, footer, maxWidth = null, bodyRef = null, side = null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const lastFocused = useRef(null)

  const cerrar = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      if (lastFocused.current && typeof lastFocused.current.focus === 'function') {
        lastFocused.current.focus()
      }
      onClose?.()
    }, CERRANDO_MS)
  }, [closing, onClose])

  useEffect(() => {
    lastFocused.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (closing) return
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar()
        return
      }
      if (e.key !== 'Tab') return
      const root = ref.current
      if (!root) return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSEABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cerrar, closing])

  const overlayClass = `sheet-overlay${side === 'right' ? ' side-right' : ''}${closing ? ' closing' : ''}`

  return (
    <div
      className={overlayClass}
      onMouseDown={(e) => e.target === e.currentTarget && cerrar()}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <div className="sheet-head">
          <strong>{title}</strong>
          <button className="icon-btn sm" onClick={cerrar} aria-label="Cerrar panel">
            <X />
          </button>
        </div>
        <div className="sheet-body" ref={bodyRef}>{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}
