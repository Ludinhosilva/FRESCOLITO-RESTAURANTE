import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('Error en panel:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="empty" role="alert">
          <AlertTriangle />
          <div className="empty-title">Algo salió mal</div>
          <div className="empty-sub">Recarga la página para continuar.</div>
          <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
