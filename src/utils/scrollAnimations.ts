import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScrollAnimations() {
  ScrollTrigger.getAll().forEach(t => t.kill())

  const path = window.location.pathname

  if (path === '/' || path === '') animateHome()
  if (path === '/menu' || path.startsWith('/menu')) animateMenu()
  if (path === '/nosotros') animateNosotros()
  if (path === '/galeria') animateGaleria()
  if (path === '/contacto') animateContacto()
}

function animateHome() {
  const hero = document.getElementById('hero')
  if (!hero) return

  const heroContent = hero.querySelector('.hero-content')
  const heroScroll = hero.querySelector('.hero-scroll')

  if (heroContent) {
    gsap.to(heroContent, {
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      opacity: 0,
      y: 60,
      scale: 0.95,
    })
  }

  if (heroScroll) {
    gsap.to(heroScroll, {
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'center top',
        scrub: true,
      },
      opacity: 0,
    })
  }
}

function animateMenu() {
  const pills = gsap.utils.toArray('.menu-pill')
  if (pills.length) {
    gsap.from(pills, {
      scrollTrigger: {
        trigger: '.menu-pills',
        start: 'top bottom-=40px',
      },
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
    })
  }

  const frame = document.querySelector('.pm-frame')
  if (frame) {
    gsap.from(frame, {
      scrollTrigger: { trigger: frame, start: 'top bottom-=60px' },
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: 'power3.out',
    })
  }

  const items = gsap.utils.toArray<HTMLElement>('.menu-item')
  items.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=40px',
      },
      opacity: 0,
      y: 40,
      scale: 0.92,
      duration: 0.6,
      delay: (i % 6) * 0.07,
      ease: 'power3.out',
    })
  })
}

function animateNosotros() {
  // Parallax suave en las imagenes.
  gsap.utils.toArray<HTMLElement>('.nst-parallax').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
  })

  // Stagger en las tarjetas de Mision / Vision.
  const cards = gsap.utils.toArray<HTMLElement>('.nst-mv-card')
  if (cards.length) {
    gsap.from(cards, {
      scrollTrigger: { trigger: '.nst-mv', start: 'top bottom-=60px' },
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
    })
  }

  // Stagger en la linea de tiempo.
  const items = gsap.utils.toArray<HTMLElement>('.nst-tl-item')
  if (items.length) {
    gsap.from(items, {
      scrollTrigger: { trigger: '.nst-timeline', start: 'top bottom-=60px' },
      opacity: 0,
      x: 40,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out',
    })
  }

  // Blur-in.
  gsap.utils.toArray<HTMLElement>('.nst-blur').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top bottom-=60px' },
      opacity: 0,
      filter: 'blur(12px)',
      y: 24,
      duration: 0.9,
      ease: 'power2.out',
    })
  })
}

function animateGaleria() {
  const galleryItems = gsap.utils.toArray<HTMLElement>('.gal-item')
  galleryItems.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=30px',
      },
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.5,
      delay: (i % 6) * 0.06,
      ease: 'power3.out',
    })
  })
}

function animateContacto() {
  const header = document.querySelector('.pc-header')
  if (header) {
    gsap.from(header, {
      scrollTrigger: { trigger: header, start: 'top bottom-=40px' },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    })
  }

  const form = document.querySelector('.contact-form')
  const info = document.querySelector('.contact-info')

  if (form) {
    gsap.from(form, {
      scrollTrigger: { trigger: form, start: 'top bottom-=60px' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    })
  }

  if (info) {
    gsap.from(info, {
      scrollTrigger: { trigger: info, start: 'top bottom-=60px' },
      opacity: 0,
      x: 40,
      duration: 0.8,
      delay: 0.15,
      ease: 'power3.out',
    })
  }
}
