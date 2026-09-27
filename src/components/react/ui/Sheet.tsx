import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Sheet({ title, onClose, children, footer, maxWidth = null }) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
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
          <button className="icon-btn sm" onClick={onClose} aria-label="Cerrar">
            <X />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}
