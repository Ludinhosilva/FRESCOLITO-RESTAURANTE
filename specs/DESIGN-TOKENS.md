# DESIGN TOKENS — FRESCOLITO RESTAURANTE

> El proyecto tiene **dos sistemas** con la misma identidad de marca:
> 1. **Landing / sitio público** (abajo) — cálido, expresivo, tipografía Playfair/Satisfy.
> 2. **Paneles de personal** (Dirección A "Operativo moderno, cálido") — utilitario,
>    mobile-first, neutro + acento de marca. Tokens en `src/styles/panel.css`.

## Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#FDB913` | Amarillo vibrante — fondo logo, CTAs, acentos |
| `--color-primary-hover` | `#F39C12` | Amarillo oscuro — hover de botones |
| `--color-dark` | `#3E2723` | Marrón chocolate — textos principales, fondos oscuros |
| `--color-mid` | `#8D6E63` | Marrón medio — bordes, fondos secundarios |
| `--color-light` | `#BCAAA4` | Beige claro — fondos de tarjetas, secciones |
| `--color-bg` | `#FFFFFF` | Blanco — fondo general |
| `--color-text` | `#000000` | Negro — texto corporal |

## Tipografía

| Token | Fuente | Uso |
|-------|--------|-----|
| `--font-heading` | Playfair Display (400, 700, 900) | Títulos de sección |
| `--font-body` | Poppins / Work Sans (300, 400, 600, 700) | Cuerpo de texto |
| `--font-script` | Satisfy (400) | Marca "Frescolito" y títulos del landing |

Cargadas vía Google Fonts en `src/layouts/BaseLayout.astro`.

## Espaciados

| Token | Valor |
|-------|-------|
| `--space-xs` | 0.25rem |
| `--space-sm` | 0.5rem |
| `--space-md` | 1rem |
| `--space-lg` | 2rem |
| `--space-xl` | 4rem |

## Bordes y Sombras

- Radio de borde por defecto: `8px`
- Sombras suaves en tarjetas: `0 4px 6px rgba(0,0,0,0.1)`
- Sombras fuertes en modales: `0 10px 25px rgba(0,0,0,0.2)`

## Transiciones

- Duración por defecto: `0.3s`
- Easing: `ease-in-out`

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
