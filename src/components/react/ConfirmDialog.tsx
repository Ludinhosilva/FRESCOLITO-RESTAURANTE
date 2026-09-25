export default function ConfirmDialog({ titulo, children, onConfirm, onCancel, confirmLabel = 'Confirmar', peligro = false, ocupado = false }) {
  return (
    <div className="pedir-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="pedir-panel" style={{ height: 'auto', maxHeight: '86vh' }}>
        <div className="pedir-head">
          <strong>{titulo}</strong>
          <button className="pedir-close" onClick={onCancel}>✕</button>
        </div>
        <div className="pedir-body">{children}</div>
        <div className="pedir-foot">
          <button className="btn btn-outline" onClick={onCancel}>Cancelar</button>
          <button className={'btn ' + (peligro ? 'btn-rojo' : 'btn-verde')} onClick={onConfirm} disabled={ocupado}>
            {ocupado ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
