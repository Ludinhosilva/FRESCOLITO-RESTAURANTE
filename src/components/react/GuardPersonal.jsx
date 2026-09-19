import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function GuardPersonal({ roles, children }) {
  const { session, rol, loading } = useAuth()

  const sinAcceso = !loading && (!session || (roles && !roles.includes(rol)))

  useEffect(() => {
    if (sinAcceso) window.location.href = '/personal'
  }, [sinAcceso])

  if (loading) return <div className="centered">Cargando...</div>
  if (sinAcceso) return <div className="centered">Redirigiendo...</div>
  return children
}