import { useHorario } from '../../hooks/useHorario.ts'

export default function HorarioTexto() {
  const { cargando, horas, diasLabel } = useHorario()
  return <>{cargando ? horas : `${diasLabel}: ${horas}`}</>
}
