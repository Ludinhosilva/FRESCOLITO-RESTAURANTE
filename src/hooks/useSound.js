import { useCallback } from 'react'
import { beep } from '../lib/sonido.js'

/** Hook de sonido (usa el AudioContext compartido). */
export function useSound() {
  return useCallback((opts) => beep(opts), [])
}
