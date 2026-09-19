import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargarPerfil = useCallback(async (userId) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let activo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setSession(data.session)
      if (data.session) {
        cargarPerfil(data.session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        cargarPerfil(session.user.id)
      } else {
        setPerfil(null)
        setLoading(false)
      }
    })

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [cargarPerfil])

  const iniciarSesion = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: perfilData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single()
    setPerfil(perfilData)
    return perfilData?.rol ?? null
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  const rol = perfil?.rol ?? null

  return (
    <AuthContext.Provider
      value={{ session, perfil, rol, loading, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}