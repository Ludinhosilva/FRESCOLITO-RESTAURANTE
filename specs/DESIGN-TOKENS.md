# DESIGN TOKENS — FRESCOLITO RESTAURANTE

> El proyecto tiene **dos sistemas** con la misma identidad de marca:
> 1. **Landing / sitio público** (abajo) — editorial cálido, tipografía Playfair/Work Sans.
> 2. **Paneles de personal** (Dirección A "Operativo moderno, cálido") — utilitario,
>    mobile-first, neutro + acento de marca. Tokens en `src/styles/panel.css`.

## Colores

Sistema editorial cálido: marfil, cacao, amarillo medido y verde profundo.

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#E9A900` | Amarillo marca — CTAs y acentos |
| `--color-primary-hover` | `#C98F00` | Hover de marca |
| `--color-dark` | `#332A24` | Cacao — títulos y superficies oscuras |
| `--color-mid` | `#6D6156` | Texto secundario |
| `--color-light` | `#E6DDD0` | Bordes suaves |
| `--color-bg` | `#FBF8F2` | Marfil — fondo general |
| `--color-surface` | `#FFFFFF` | Tarjetas y superficies |
| `--color-surface-alt` | `#F4EEE4` | Secciones alternas |
| `--color-line` | `#E4DACB` | Bordes de 1px |
| `--color-forest` | `#2F5D4A` | Verde profundo — etiquetas y enlaces |
| `--color-text` | `#2B2520` | Texto corporal |

## Tipografía

| Token | Fuente | Uso |
|-------|--------|-----|
| `--font-heading` | Playfair Display (400–700) | Títulos y marca |
| `--font-body` | Work Sans (300–700) | Cuerpo, botones y etiquetas |
| `--font-script` | Playfair Display | Alias heredado para títulos |

Solo estas dos familias se cargan en el sitio público (`src/layouts/BaseLayout.astro`).

## Espaciados

| Token | Valor |
|-------|-------|
| `--space-xs` | 0.25rem |
| `--space-sm` | 0.5rem |
| `--space-md` | 1rem |
| `--space-lg` | 1.75rem |
| `--space-xl` | 3.5rem |
| `--space-2xl` | 5rem |

## Bordes y Sombras

- Radio de borde por defecto: `6px`
- Sombras suaves en tarjetas: `0 1px 2px rgba(51, 42, 36, 0.06)`
- Sombra de modales: `0 18px 50px rgba(51, 42, 36, 0.10)`

## Transiciones

- Duración por defecto: `0.28s`
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

---

# PANELES DE PERSONAL — Dirección A

Utilitario y mobile-first. La marca (amarillo) es **acento**, no fondo. Tipografía
de sistema en paneles: **Poppins** (títulos y números, con `tabular-nums`); Playfair/
Satisfy solo en la marca/login. Definido en `src/styles/panel.css`.

## Colores (semánticos)

| Token | Hex | Uso |
|-------|-----|-----|
| `--brand` | `#F5B301` | CTA / estado activo |
| `--brand-hover` | `#E09E00` | Hover de marca |
| `--brand-soft` | `#FFF6DE` | Fondos suaves de marca |
| `--ink-900` | `#1C1917` | Texto principal / superficies oscuras |
| `--ink-600` | `#57534E` | Texto secundario |
| `--ink-400` | `#A8A29E` | Hints / iconos apagados |
| `--bg` | `#F7F6F3` | Fondo de la app |
| `--surface` | `#FFFFFF` | Tarjetas |
| `--border` | `#E7E5E4` | Bordes 1px |
| `--success` / `--success-soft` | `#16A34A` / `#E7F6EC` | Pagado, listo |
| `--warning` / `--warning-soft` | `#D97706` / `#FEF3E2` | Por verificar, demora |
| `--danger` / `--danger-soft` | `#DC2626` / `#FDECEC` | Cancelado, agotado |
| `--info` / `--info-soft` | `#2563EB` / `#E8F0FE` | Delivery, informativo |

## Formas y elevación

| Token | Valor |
|-------|-------|
| `--r-sm` / `--r-md` / `--r-lg` / `--r-pill` | `8px` / `10px` / `14px` / `999px` |
| `--elev-1` | `0 1px 2px rgba(28,25,23,.06)` |
| `--elev-2` | `0 6px 20px rgba(28,25,23,.10)` |
| `--touch` | `48px` (área táctil mínima) |

## Espaciado (8pt)

`--space-1..7` = `4 / 8 / 12 / 16 / 20 / 24 / 32px`

## Navegación

- **Móvil**: `tab bar` inferior fija (iconos Lucide + label), respeta `safe-area`.
- **Desktop (≥900px)**: la misma barra pasa a fila horizontal estática.

## Componentes (`src/components/react/ui/`)

`ErrorBoundary`, `Toast` (+`useToast`), `EmptyState`, `Sheet`, `ConfirmDialog`.
Iconografía: **lucide-react**.
