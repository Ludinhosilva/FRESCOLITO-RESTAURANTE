import { useCallback, useRef } from 'react'

/**
 * Reproduce un sonido (beep) usando Web Audio API.
 * Sin necesidad de archivo de audio.
 */
export function useSound() {
  const ctxRef = useRef(null)

  const play = useCallback(({ frecuencia = 880, duracion = 0.15 } = {}) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      ctxRef.current = ctxRef.current || new AudioCtx()
      const ctx = ctxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = frecuencia
      gain.gain.setValueAtTime(0.5, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duracion)
    } catch {
      /* audio no disponible */
    }
  }, [])

  return play
}