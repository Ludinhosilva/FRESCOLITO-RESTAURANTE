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

---

## ADR-006: Migración a Astro con React islands

**Contexto**: SPA en React puro vs Astro con islas React.
**Decisión**: Astro con `@astrojs/react` por:
- Páginas estáticas (Home, Menú, Nosotros, Galería) = **cero JS** enviado al cliente
- Solo formularios interactivos (Contacto, Reservas, Carrito) cargan React como islas
- File-based routing, más simple que React Router
- Imágenes optimizadas con `<Image />`
- Mismo ecosistema Vite, misma testabilidad

**Consecuencias**: React Router se elimina, las páginas estánticas migran a `.astro`, los componentes React se mueven a `src/components/react/` como islas.

---

## ADR-007: Carrito de compras vía WhatsApp

**Contexto**: Pasarela de pago (LemonSqueezy, Stripe) vs pedido manual.
**Decisión**: Carrito React como isla `client:load` que genera un mensaje de WhatsApp con el resumen del pedido. Sin backend, sin pasarela de pago. El encargado recibe el pedido directo por WhatsApp.
- Número del encargado: `+51 927367844`
- URL: `https://wa.me/51927367844?text={mensaje_codificado}`
- Mensaje incluye: items, cantidades, subtotal, nota del cliente
- Estado del carrito persistido en localStorage

**Consecuencias**: Sin costos de transacción, sin backend que mantener, implementación en horas.

---

## ADR-008: Indicador flotante de horario de atención

**Contexto**: Los usuarios necesitan saber si el restaurante está abierto sin tener que buscar información.
**Decisión**: Componente Astro con JS inline mínimo, posicionado fixed bottom-right:
- Horario: Lunes a Viernes 11:30 AM - 3:15 PM
- Estado "Abierto" con badge verde / "Cerrado" con badge rojo
- Tooltip con horario completo al hacer hover
- Actualización en tiempo real vía `setInterval` cada 60s

**Consecuencias**: Sin dependencias externas, ~2KB de JS, accesible.
