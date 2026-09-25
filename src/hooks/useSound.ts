import { useCallback } from 'react'
import { beep } from '../lib/sonido.ts'

/** Hook de sonido (usa el AudioContext compartido). */
export function useSound() {
  return useCallback((opts) => beep(opts), [])
}
