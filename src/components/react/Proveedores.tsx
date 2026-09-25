import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../context/AuthContext.tsx'
import { CarritoClienteProvider } from '../../context/CarritoClienteContext.tsx'
import { desbloquearAudio } from '../../lib/sonido.ts'
import '../../styles/panel.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 10000 },
  },
})

export default function Proveedores({ children }) {
  useEffect(() => {
    const h = () => desbloquearAudio()
    window.addEventListener('pointerdown', h, { once: true })
    window.addEventListener('touchstart', h, { once: true })
    window.addEventListener('keydown', h, { once: true })
    return () => {
      window.removeEventListener('pointerdown', h)
      window.removeEventListener('touchstart', h)
      window.removeEventListener('keydown', h)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CarritoClienteProvider>
          <div className="panel-root">{children}</div>
        </CarritoClienteProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}