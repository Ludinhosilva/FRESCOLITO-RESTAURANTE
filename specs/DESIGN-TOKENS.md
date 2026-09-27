# DESIGN TOKENS — FRESCOLITO RESTAURANTE

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
