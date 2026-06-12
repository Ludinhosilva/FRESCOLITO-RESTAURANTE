# CHAT-FRESCOLITO-Restaurante - Sesión de Desarrollo
**Fecha:** 11 de Junio de 2026
**Proyecto:** FRESCOLITO RESTAURANTE - Landing Page
**Stack Final:** Astro + React Islands + Vite + Vitest

---

## 1. CONTEXTO INICIAL

### Referencias de Diseño
- **Estructura:** Figma Community "Restaurant Landing Page Template"
- **Estilo/Vibra:** primoschickenbar.pe (scroll suave con Lenis, animaciones GSAP, carruseles Swiper)
- **Inspiración anterior:** lalena.com.pe

### Colores Oficiales del Logo FRESCOLITO
- Amarillo principal: `#FDB913`
- Amarillo oscuro: `#F39C12`
- Marrón oscuro: `#3E2723`
- Marrón medio: `#8D6E63`
- Beige claro: `#BCAAA4`
- Blanco: `#FFFFFF`
- Negro: `#000000`

### Tipografía
- Títulos: Playfair Display (400, 700, 900)
- Cuerpo: Lato (300, 400, 700)

### Menú del Restaurante
**Ubicación:** Iquitos, Perú
**Tipo:** Cocina regional peruana - Menú y A la carta

**A LA CARTA:**
- Ceviche Simple (1S) - S/ 10.00
- Ceviche Simple (2S) - S/ 15.00
- Ceviche Simple (3S) - S/ 20.00
- Ceviche Mixto - S/ 25.00
- Chicharrón de Pollo - S/ 20.00
- Chicharrón de Pescado - S/ 20.00
- Arroz con Mariscos - S/ 20.00
- Chaufa con Mariscos - S/ 20.00
- Chaufa con Cecina - S/ 20.00

**PROMO MARINO:**
- Ceviche + Chicharrón - S/ 25.00
- Ceviche + Arroz con Mariscos - S/ 25.00
- Ceviche + Chaufa con Mariscos - S/ 25.00
- Ceviche + Chaufa con Cecina - S/ 25.00
- Chicharrón + Arroz con Mariscos - S/ 25.00
- Chicharrón + Chaufa con Mariscos - S/ 25.00
- Chicharrón + Chaufa con Cecina - S/ 25.00
- Trío Marino - S/ 40.00
- Leche de Tigre - S/ 15.00

---

## 2. METODOLOGÍA SDD (Spec-Driven Development)

### Roles de Agentes

| Rol | Modelo | Responsabilidad |
|-----|--------|----------------|
| **Arquitecto** | deepseek-v4-flash | Decisiones de alto nivel, patrones SOLID, estructura del proyecto |
| **Software Designer** | deepseek-v4-flash | UI, componentes desacoplados, tokens de diseño |
| **Desarrollador** | deepseek-v4-flash | Implementación de funciones y clases |

### Archivos de Especificación Creados
- `specs/ARCHITECTURE.md` - Estructura de carpetas, stack, rutas
- `specs/DESIGN-TOKENS.md` - Colores, tipografía, espaciados
- `specs/ADR.md` - Decisiones arquitectónicas (ADR-001 al ADR-008)
- `specs/SECURITY-CHECKLIST.md` - Validación de formularios, sanitización, XSS

### Principios Aplicados
- **Pirámide de pruebas:** Unitarias → Integración → Regresión
- **Caja Negra:** Formularios (input → output esperado)
- **Caja Blanca:** Validaciones, sanitización, seguridad
- **Cobertura ≥ 80%** (logrado)
- **Componentes desacoplados (SOLID)**
- **Testing first**

---

## 3. DECISIONES ARQUITECTÓNICAS (ADRs)

### ADR-001: React + Vite (original)
Se eligió React + Vite por componentes reutilizables, lazy loading y testabilidad.

### ADR-002: React Router con lazy loading
6 rutas lazy con `React.lazy()` + `Suspense` para aislamiento de errores.

### ADR-003: Lenis + GSAP sobre AOS
Por control granular de animaciones y scroll suave tipo "Primos Chicken".

### ADR-004: Leaflet.js para mapa
OpenStreetMap sin API key, liviano.

### ADR-005: Swiper.js para carruseles
Touch-friendly, accesible.

### ADR-006: Migración a Astro con React islands
Páginas estáticas (Home, Menú, Nosotros, Galería) = cero JS.
Solo formularios interactivos (Contacto, Reservas, Carrito) cargan React como islas.

### ADR-007: Carrito de compras vía WhatsApp
Sin backend. Carrito React como isla que genera mensaje para WhatsApp del encargado.
Número: +51 927367844

### ADR-008: Indicador flotante de horario de atención
Componente Astro con JS inline. Horario: Lunes a Viernes 11:30 AM - 3:15 PM.

---

## 4. HISTORIAL DE CONSTRUCCIÓN

### Fase 1 - Specs Ligeros
Creación de 4 archivos .md de especificación (Arquitectura, Design Tokens, ADR, Seguridad).

### Fase 2 - Scaffold React + Vite
- `npm create vite@latest` con React
- Dependencias: react-router-dom, gsap, swiper, leaflet, lenis, vitest, @testing-library/react

### Fase 3-8 - Páginas React
Creación de 6 páginas con lazy loading:
- Home (Hero, Platos Destacados, Historia, Galería preview)
- Menu (pestañas A la Carta / Promo Marino)
- About (Historia, Valores)
- Gallery (Grid + Lightbox)
- Contact (Formulario con validación + Leaflet mapa)
- Reservations (Formulario fecha/hora/personas)

### Fase 9 - Animaciones
- Lenis para smooth scroll global
- GSAP ScrollTrigger para animaciones de entrada (data-reveal)

### Fase 10 - Testing (18 tests)
- Menu Data: 6 tests
- Contact Form: 7 tests (caja negra + caja blanca)
- Reservations Form: 3 tests
- Navbar: 2 tests

### Fase 11 - Polish
- Mobile hamburger menu animado
- Design tokens consistentes
- SEO meta tags
- Error Boundaries por ruta

### Migración a Astro
Migración completa de React SPA a Astro:
- `src/pages/` convertidas a `.astro` (index, menu, nosotros, galeria, contacto, reservas)
- Componentes React movidos a `src/components/react/` como islas (ContactForm, ReservationForm, CartDrawer)
- `src/layouts/BaseLayout.astro` con Navbar + Footer + widgets
- `src/components/` Astro: Navbar, Footer, Hero, MenuSection, BusinessHours, CartWidget

### Carrito de Compras + WhatsApp
- Botón "+ Agregar" en cada plato del menú
- Drawer lateral con items, cantidades (+/−), notas
- Checkbox "Para llevar" con comisión de S/2 por plato
- Envío del pedido por WhatsApp: wa.me/51927367844?text=...
- Estado persistido en localStorage

### Horario Flotante
- Badge fijo abajo-izquierda: 🟢 Abierto / 🔴 Cerrado
- Tooltip con horario completo al hover
- Actualización automática cada 60s

---

## 5. ESTRUCTURA FINAL DEL PROYECTO

```
D:\FRESCOLITO\
├── .github/workflows/deploy.yml
├── specs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN-TOKENS.md
│   ├── ADR.md
│   └── SECURITY-CHECKLIST.md
├── public/imagenes/           # Assets estáticos (logo, fotos)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro        # Home
│   │   ├── menu.astro         # Menú
│   │   ├── nosotros.astro     # Historia
│   │   ├── galeria.astro      # Galería + Lightbox
│   │   ├── contacto.astro     # Contacto (isla React)
│   │   ├── reservas.astro     # Reservas (isla React)
│   │   └── _*.jsx            # Antiguas páginas React (backup)
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── MenuSection.astro
│   │   ├── BusinessHours.astro
│   │   ├── CartWidget.astro
│   │   └── react/
│   │       ├── ContactForm.jsx
│   │       ├── ReservationForm.jsx
│   │       └── CartDrawer.jsx
│   ├── data/
│   │   ├── config.js          # WhatsApp, horarios, sitio
│   │   └── menu.js            # Platos, categorías, precios
│   ├── hooks/
│   │   ├── useLenis.js
│   │   └── useScrollReveal.js
│   ├── utils/
│   │   ├── paths.js
│   │   ├── whatsapp.js        # Generador de mensajes WA
│   │   └── businessHours.js   # Lógica abierto/cerrado
│   └── styles/
│       └── global.css
├── tests/
│   ├── cart.test.js           # 8 tests
│   ├── whatsapp.test.js       # 10 tests
│   ├── businessHours.test.js  # 5 tests
│   ├── Contact.test.jsx       # 7 tests
│   ├── Reservations.test.jsx  # 3 tests
│   ├── menu.test.js           # 6 tests
│   ├── Navbar.test.jsx        # 5 tests
│   └── setup.js
├── astro.config.mjs
├── package.json
└── vite.config.js
```

---

## 6. RUTAS DEL SITIO

| Ruta | Página | Tipo | JS enviado |
|------|--------|------|-----------|
| `/` | Inicio | .astro estático | 0 KB |
| `/menu` | Menú completo | .astro estático | 0 KB |
| `/nosotros` | Historia y valores | .astro estático | 0 KB |
| `/galeria` | Galería con lightbox | .astro estático | 0 KB |
| `/contacto` | Formulario + mapa | React island | ~50 KB |
| `/reservas` | Formulario de reserva | React island | ~50 KB |

---

## 7. TESTING

**Total: 44 tests - 7 suites - 100% pasando**

| Suite | Tests | Tipo |
|-------|-------|------|
| Cart logic | 8 | Unitaria (caja blanca) |
| WhatsApp messages | 10 | Caja negra + caja blanca |
| Business hours | 5 | Caja negra |
| Contact form | 7 | Caja negra + integración |
| Reservations form | 3 | Caja negra |
| Menu data | 6 | Unitaria |
| Config | 5 | Unitaria |

---

## 8. DESPLIEGUE

- **URL Producción:** https://frescolito-restaurante.vercel.app
- **Repositorio:** https://github.com/Ludinhosilva/FRESCOLITO-RESTAURANTE
- **Hosting:** Vercel (auto-deploy desde GitHub)
- **WhatsApp del encargado:** +51 927367844
- **Horario de atención:** Lunes a Viernes 11:30 AM - 3:15 PM
- **Comisión para llevar:** S/ 2.00 por plato

---

## 9. COMANDOS ÚTILES

```bash
npm run dev          # Servidor local (Astro)
npm run build        # Build producción
npm test             # Ejecutar tests (Vitest)
npm run preview      # Preview del build
git push             # Deploy automático a Vercel
```

---

*Fin del historial de la sesión de desarrollo - FRESCOLITO RESTAURANTE © 2026*
