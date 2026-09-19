import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Suscripcion en tiempo real a una tabla.
 * @param {string} tabla  - nombre de la tabla
 * @param {(payload) => void} onEvent - callback cuando ocurre un cambio
 * @param {string[]} [eventos] - eventos a escuchar ('INSERT','UPDATE','DELETE')
 */
export function useRealtime(tabla, onEvent, eventos = ['INSERT', 'UPDATE', 'DELETE']) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${tabla}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabla },
        (payload) => {
          if (eventos.includes(payload.eventType)) {
            onEvent(payload)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabla])
}