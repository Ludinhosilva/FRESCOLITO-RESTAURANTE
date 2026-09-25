// Sonido compartido (Web Audio). Confiable en Android tras el primer toque.
let ctx = null

export function audioCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      const A = window.AudioContext || (window as any).webkitAudioContext
      if (A) ctx = new A()
    } catch {
      ctx = null
    }
  }
  return ctx
}

/** Desbloquea/reanuda el audio. Llamar en el primer toque del usuario. */
export function desbloquearAudio() {
  const c = audioCtx()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
}

/** Reproduce un beep. */
export function beep({ frecuencia = 880, duracion = 0.15, tipo = 'sine' } = {}) {
  const c = audioCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = tipo
    osc.frequency.value = frecuencia
    gain.gain.setValueAtTime(0.45, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duracion)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + duracion)
  } catch {
    /* noop */
  }
}

/** Patrón de aviso (nuevo pedido). */
export function sonidoNuevoPedido() {
  beep({ frecuencia: 880, duracion: 0.15 })
  setTimeout(() => beep({ frecuencia: 1320, duracion: 0.2 }), 160)
}

/** Patrón de aviso (pedido listo para servir). */
export function sonidoListo() {
  beep({ frecuencia: 660, duracion: 0.15 })
  setTimeout(() => beep({ frecuencia: 990, duracion: 0.2 }), 170)
}
