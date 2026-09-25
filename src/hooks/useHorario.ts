import { useEffect, useState } from 'react'
import { obtenerConfig } from '../lib/pedidosCliente.ts'
import { horarioConDias, estaAbierto, etiquetaDias, formatearHoras } from '../lib/horario.ts'

/**
 * Lee los dias de atencion desde la configuracion publica y expone
 * el estado (abierto/cerrado) y los textos del horario fijo.
 */
export function useHorario() {
  const [dias, setDias] = useState<number[] | null>(null)

  useEffect(() => {
    let vivo = true
    obtenerConfig()
      .then((cfg) => { if (vivo) setDias(cfg?.horario?.dias || []) })
      .catch(() => { if (vivo) setDias([]) })
    return () => { vivo = false }
  }, [])

  const cargando = dias === null
  const lista = dias || []
  const horario = horarioConDias(lista)

  return {
    cargando,
    dias: lista,
    abierto: estaAbierto(horario),
    horas: formatearHoras(),
    diasLabel: etiquetaDias(lista),
  }
}
