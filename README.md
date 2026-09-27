# FRESCOLITO RESTAURANTE

Sitio web + sistema de pedidos de **Frescolito**, cocina regional peruana en Iquitos.

## Stack

- **Astro 6** (sitio estático) + **islas React 19** (`@astrojs/react`)
- **TypeScript**, **Supabase** (datos), **TanStack Query**
- **Lenis + GSAP** (animaciones), **Swiper** (carruseles), **jsPDF** (boletas)
- **Vitest + Testing Library** (tests)

## Requisitos

- Node.js 20+
- Variables de entorno (copia `.env.example` a `.env`):
  ```
  PUBLIC_SUPABASE_URL=...
  PUBLIC_SUPABASE_ANON_KEY=...
  ```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm test` | Ejecuta los tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con cobertura |
| `npm run lint` | ESLint |
| `npm run check` | TypeScript (`tsc --noEmit`) |
| `npm run types` | Regenera tipos de Supabase |
| `npm run optimize:images` | Optimiza imágenes |
| `npm run qr` | Genera código QR |

## Estructura

- `src/pages/` — rutas (file-based routing de Astro)
- `src/components/react/` — islas interactivas
- `src/lib/` — lógica y acceso a Supabase
- `supabase/migrations/` — migraciones SQL
- `tests/` — pruebas unitarias/integración
- `specs/` — arquitectura, ADR, tokens de diseño y seguridad

## Documentación

- Arquitectura: [`specs/ARCHITECTURE.md`](specs/ARCHITECTURE.md)
- Decisiones: [`specs/ADR.md`](specs/ADR.md)
- Diseño: [`specs/DESIGN-TOKENS.md`](specs/DESIGN-TOKENS.md)
- Seguridad: [`specs/SECURITY-CHECKLIST.md`](specs/SECURITY-CHECKLIST.md)

## Deploy

Despliegue principal en **Vercel** (sitio estático). También existe un workflow
de **GitHub Pages** en `.github/workflows/deploy.yml`.
