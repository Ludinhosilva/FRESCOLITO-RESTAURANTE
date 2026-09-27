import { useState } from 'react'
import { Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react'
import Proveedores from './Proveedores.tsx'
import { useAuth } from '../../context/AuthContext.tsx'

const DESTINO = { admin: '/admin', cocina: '/cocina', repartidor: '/repartidor', mesera: '/mesera' }

function Form() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
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
    } catch (err) {
      setError(err?.message || 'Credenciales incorrectas. Verifica email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src="/imagenes/frescolito.jpeg" alt="Frescolito" />
        <h1 className="login-title">Frescolito</h1>
        <p className="login-sub">Acceso del personal</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={verPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ paddingRight: 46 }}
            />
            <button
              type="button"
              className="icon-btn sm"
              onClick={() => setVerPass((v) => !v)}
              aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{ position: 'absolute', right: 4, top: 4, border: 'none', background: 'transparent' }}
            >
              {verPass ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {error && (
          <div className="cli-warn" role="alert">
            <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} /> {error}
          </div>
        )}

        <button className="btn btn-block btn-lg" type="submit" disabled={loading}>
          <LogIn /> {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 14 }}>
          <a href="/" style={{ color: 'var(--ink-600)', fontSize: 13 }}>← Volver al inicio</a>
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
