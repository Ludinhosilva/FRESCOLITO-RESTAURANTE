import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [tipo, setTipo] = useState('ok')
  const [saliendo, setSaliendo] = useState(false)
  const timer = useRef(null)
  const salida = useRef(null)

  const show = useCallback((m, t = 'ok') => {
    if (salida.current) clearTimeout(salida.current)
    setSaliendo(false)
    setMsg(m)
    setTipo(t)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setSaliendo(true)
      salida.current = setTimeout(() => setMsg(''), 300)
    }, 2600)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
    if (salida.current) clearTimeout(salida.current)
  }, [])

  const esError = tipo === 'error' || /^error/i.test(msg)

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className={'toast' + (saliendo ? ' saliendo' : '')} role="status" aria-live="polite">
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
