import Sheet from './ui/Sheet.tsx'

export default function ConfirmDialog({
  titulo,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  peligro = false,
  ocupado = false,
}) {
  return (
    <Sheet
      title={titulo}
      onClose={onCancel}
      maxWidth={440}
      footer={
        <>
          <button className="btn btn-outline grow" onClick={onCancel} disabled={ocupado}>
            Cancelar
          </button>
          <button
            className={'btn grow ' + (peligro ? 'btn-rojo' : 'btn-verde')}
            onClick={onConfirm}
            disabled={ocupado}
          >
            {ocupado ? 'Procesando...' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Sheet>
  )
}
