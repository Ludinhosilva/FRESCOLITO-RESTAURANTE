import { useState } from 'react'
import Proveedores from './Proveedores.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const DESTINO = { admin: '/admin', cocina: '/cocina', repartidor: '/repartidor', mesera: '/mesera' }

function Form() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { iniciarSesion } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const rol = await iniciarSesion(email, password)
      window.location.href = DESTINO[rol] || '/personal'
    } catch {
      setError('Credenciales incorrectas. Verifica email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src="/logo.png" alt="Frescolito" />
        <h1 className="login-title">Frescolito</h1>
        <p className="login-sub">Acceso del personal</p>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-block" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 14 }}>
          <a href="/" style={{ color: '#8D6E63', fontSize: 13 }}>← Volver al inicio</a>
        </p>
      </form>
    </div>
  )
}

export default function LoginIsland() {
  return (
    <Proveedores>
      <Form />
    </Proveedores>
  )
}