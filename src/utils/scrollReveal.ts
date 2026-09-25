export default function initScrollReveal() {
  if (typeof window === 'undefined') return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          if ((entry.target as HTMLElement).dataset.countUp) startCountUp(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  const selectors = ['[data-reveal]', '[data-reveal-left]', '[data-reveal-right]', '[data-reveal-scale]']
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => observer.observe(el))
  })

  function startCountUp(el: HTMLElement) {
    const target = parseInt(el.dataset.countUp)
    if (isNaN(target)) return
    let current = 0
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { current = target; clearInterval(timer) }
      el.textContent = String(current)
    }, 30)
  }

  return () => observer.disconnect()
}
