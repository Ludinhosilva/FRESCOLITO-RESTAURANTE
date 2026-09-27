import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [tipo, setTipo] = useState('ok')
  const timer = useRef(null)

  const show = useCallback((m, t = 'ok') => {
    setMsg(m)
    setTipo(t)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(''), 2600)
  }, [])

  useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  const esError = tipo === 'error' || /^error/i.test(msg)

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className="toast" role="status" aria-live="polite">
          {esError ? <AlertTriangle /> : <Check />}
          <span>{msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastCtx) || (() => {})
}
