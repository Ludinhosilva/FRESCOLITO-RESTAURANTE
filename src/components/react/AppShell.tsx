import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.tsx'
import ShinyText from './bits/ShinyText.tsx'
import { BarChart3, ChefHat, Truck, Utensils, Boxes, LogOut } from 'lucide-react'

const NAV = {
  admin: [
    { href: '/admin', label: 'Ventas', icon: BarChart3 },
    { href: '/cocina', label: 'Cocina', icon: ChefHat },
    { href: '/repartidor', label: 'Reparto', icon: Truck },
    { href: '/mesera', label: 'Pedido', icon: Utensils },
  ],
  cocina: [
    { href: '/cocina', label: 'Pedidos', icon: ChefHat },
    { href: '/cocina#stock', label: 'Stock', icon: Boxes },
  ],
  mesera: [
    { href: '/mesera', label: 'Pedido', icon: Utensils },
    { href: '/cocina', label: 'Cola', icon: ChefHat },
  ],
  repartidor: [{ href: '/repartidor', label: 'Entregas', icon: Truck }],
}

const ROL_LABEL = {
  admin: 'Administrador',
  cocina: 'Cocina',
  mesera: 'Mesera',
  repartidor: 'Repartidor',
}

function esActivo(href) {
  if (typeof window === 'undefined') return false
  const [ruta, frag] = href.split('#')
  if (ruta !== window.location.pathname) return false
  if (frag) return window.location.hash === '#' + frag
  return window.location.hash === ''
}

export default function AppShell({ children }) {
  const { perfil, rol, cerrarSesion } = useAuth()
  const nav = NAV[rol] || []
  const [, setTick] = useState(0)

  useEffect(() => {
    const h = () => setTick((n) => n + 1)
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  const salir = async () => {
    await cerrarSesion()
    window.location.href = '/personal'
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="topbar-brand" href="/">
          <img className="logo-dot" src="/imagenes/frescolito.jpeg" alt="Frescolito" />
          <ShinyText className="topbar-title">Frescolito</ShinyText>
        </a>
        <div className="topbar-right">
          <span className="badge-rol">{ROL_LABEL[rol] || rol}</span>
          <span className="topbar-user">{perfil?.nombre}</span>
          <button className="icon-btn sm" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut />
          </button>
        </div>
      </header>

      {nav.length > 1 && (
        <nav className="tabbar" aria-label="Navegación del panel">
          {nav.map((n) => {
            const Icon = n.icon
            return (
              <a
                key={n.href}
                href={n.href}
                className={'tabbar-item' + (esActivo(n.href) ? ' active' : '')}
                aria-current={esActivo(n.href) ? 'page' : undefined}
              >
                <Icon />
                <span>{n.label}</span>
              </a>
            )
          })}
        </nav>
      )}

      <main className="app-main">{children}</main>
    </div>
  )
}
