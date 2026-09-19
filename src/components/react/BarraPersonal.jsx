import { useAuth } from '../../context/AuthContext.jsx'

const NAV = {
  admin: [
    { href: '/admin', label: 'Ventas' },
    { href: '/cocina', label: 'Cocina' },
    { href: '/repartidor', label: 'Reparto' },
    { href: '/mesera', label: 'Pedido' },
  ],
  cocina: [{ href: '/cocina', label: 'Pedidos' }],
  mesera: [
    { href: '/mesera', label: 'Tomar Pedido' },
    { href: '/cocina', label: 'Cola' },
  ],
  repartidor: [{ href: '/repartidor', label: 'Entregas' }],
}

export default function BarraPersonal({ children }) {
  const { perfil, rol, cerrarSesion } = useAuth()
  const nav = NAV[rol] || []

  const salir = async () => {
    await cerrarSesion()
    window.location.href = '/personal'
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="topbar-brand" href="/">
          <img className="logo-dot" src="/logo.png" alt="Frescolito" />
          <span className="topbar-title">Frescolito</span>
        </a>
        <div className="topbar-right">
          <span className="badge-rol">{rol}</span>
          <span className="topbar-user">{perfil?.nombre}</span>
          <button className="btn btn-ghost btn-sm" onClick={salir}>Salir</button>
        </div>
      </header>

      {nav.length > 0 && (
        <nav className="panel-nav">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="panel-nav-item">{n.label}</a>
          ))}
        </nav>
      )}

      <main className="app-main">{children}</main>
    </div>
  )
}