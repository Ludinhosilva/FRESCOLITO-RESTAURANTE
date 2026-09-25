import { useEffect, useState } from 'react'

// Inspirado en ReactBits "Count Up": anima el numero al aparecer.
export default function AnimatedCounter({ value = 0, duration = 900, decimals = 0, prefix = '', suffix = '' }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const target = Number(value) || 0
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setN(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  )
}
