import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { CarritoClienteProvider } from '../../context/CarritoClienteContext.jsx'
import '../../styles/panel.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 10000 },
  },
})

export default function Proveedores({ children }) {
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