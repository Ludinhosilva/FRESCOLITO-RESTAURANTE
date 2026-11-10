import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScrollAnimations() {
  ScrollTrigger.getAll().forEach((t) => t.kill())

  const path = window.location.pathname

  if (path === '/' || path === '') animateHome()
  if (path === '/nosotros') animateNosotros()
  if (path === '/galeria') animateGaleria()
  if (path === '/contacto') animateContacto()
}

function animateHome() {
  const hero = document.getElementById('hero')
  if (!hero) return

  const heroContent = hero.querySelector('.hero-content')
  if (!heroContent) return

  gsap.to(heroContent, {
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    opacity: 0,
    y: 24,
  })
}

function animateNosotros() {
  const cards = gsap.utils.toArray<HTMLElement>('.nst-mv-card')
  if (cards.length) {
    gsap.from(cards, {
      scrollTrigger: { trigger: '.nst-mv', start: 'top bottom-=60px' },
      opacity: 0,
      y: 14,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
    })
  }

  const items = gsap.utils.toArray<HTMLElement>('.nst-tl-item')
  if (items.length) {
    gsap.from(items, {
      scrollTrigger: { trigger: '.nst-timeline', start: 'top bottom-=60px' },
      opacity: 0,
      y: 12,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
    })
  }
}

function animateGaleria() {
  gsap.utils.toArray<HTMLElement>('.gal-item').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=30px',
      },
      opacity: 0,
      y: 12,
      duration: 0.5,
      ease: 'power2.out',
    })
  })
}

function animateContacto() {
  const header = document.querySelector('.pc-header')
  if (header) {
    gsap.from(header, {
      scrollTrigger: { trigger: header, start: 'top bottom-=40px' },
      opacity: 0,
      y: 12,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  const form = document.querySelector('.contact-form')
  const info = document.querySelector('.contact-info')

  if (form) {
    gsap.from(form, {
      scrollTrigger: { trigger: form, start: 'top bottom-=60px' },
      opacity: 0,
      y: 12,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  if (info) {
    gsap.from(info, {
      scrollTrigger: { trigger: info, start: 'top bottom-=60px' },
      opacity: 0,
      y: 12,
      duration: 0.6,
      delay: 0.1,
      ease: 'power2.out',
    })
  }
}
