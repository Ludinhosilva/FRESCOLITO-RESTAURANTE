# ADR — Architecture Decision Records

## ADR-001: React + Vite sobre HTML plano

**Contexto**: Se consideró HTML+Tailwind (plan original) vs React+Vite.
**Decisión**: React + Vite por:
- Componentes reutilizables y desacoplados
- Lazy loading por ruta (chunks independientes)
- Mejor testabilidad con Vitest + Testing Library
- Ecosistema maduro para SPAs

**Consecuencias**: + bundle inicial ligeramente mayor, - mantenibilidad a largo plazo mucho mejor.

---

## ADR-002: React Router con lazy loading

**Contexto**: SPA todo en una página vs rutas separadas.
**Decisión**: 6 rutas lazy con `React.lazy()` + `Suspense`. Cada ruta es un chunk JS independiente.
**Consecuencias**: Un error en /contacto no afecta a /menu ni /. Deploy parcial posible.

---

## ADR-003: Lenis + GSAP sobre AOS

**Contexto**: Se evaluó AOS (simple) vs Lenis + GSAP (más potente).
**Decisión**: Lenis + GSAP ScrollTrigger por:
- Control granular de animaciones
- Scroll suave fluido tipo "Primos Chicken"
- Mayor flexibilidad para animaciones custom

**Consecuencias**: + payload de JS, pero solo se carga en interacción (lazy).

---

## ADR-004: Leaflet.js para mapa

**Contexto**: Google Maps (requiere API key) vs Leaflet (open source).
**Decisión**: Leaflet.js — sin API key, liviano, suficiente para mostrar ubicación Iquitos.

---

## ADR-005: Swiper.js para carruseles

**Contexto**: Carruseles nativos CSS vs librería.
**Decisión**: Swiper.js — touch-friendly, accesible, ampliamente probado en producción.
