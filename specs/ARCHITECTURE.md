# ARCHITECTURE — FRESCOLITO RESTAURANTE

> Actualizado para reflejar la implementación real (Astro + islas React).
> Ver `ADR.md` (ADR-006) para la decisión de migración desde la SPA de React.

## Stack

- **Framework**: Astro 6 (`output: 'static'`) con `@astrojs/react`
- **UI interactiva**: React 19 como *islas* (`client:load`, `client:idle`, `client:visible`)
- **Lenguaje**: TypeScript
- **Backend / datos**: Supabase (`@supabase/supabase-js`) + TanStack Query
- **Animaciones**: Lenis (smooth scroll) + GSAP ScrollTrigger
- **Carruseles**: Swiper.js
- **PDF**: jsPDF + jspdf-autotable (boletas)
- **Testing**: Vitest + @testing-library/react
- **Deploy**: Vercel (principal) + GitHub Pages (`.github/workflows/deploy.yml`)

## Principios

- **Cero JS en páginas estáticas**: Home, Nosotros y Galería se sirven como HTML puro.
- **Islas desacopladas**: cada componente interactivo vive en `src/components/react/`
  y recibe props; no depende de estado global salvo contextos explícitos.
- **File-based routing**: cada archivo en `src/pages/` es una ruta.
- **Fuente única de configuración**: número de WhatsApp en `src/data/config.ts`.
- **Testing first**: cada pieza crítica tiene test en `tests/`.

## Estructura de Carpetas

```
D:\FRESCOLITO\
├── specs/                    # Especificaciones (arquitectura, ADR, tokens, seguridad)
├── Imagenes/                 # Assets fuente (logo, cartas, fotos)
├── public/imagenes/          # Assets servidos (galería optimizada .webp)
├── src/
│   ├── components/           # Componentes Astro (estáticos)
│   │   ├── Navbar.astro, Footer.astro, Hero.astro, MenuSection.astro
│   │   ├── Preloader.astro, WhatsAppFAB.astro
│   │   └── react/            # Islas React
│   │       ├── PedirIsland.tsx        # Pedido online del cliente
│   │       ├── MenuPublicoIsland.tsx  # Carta pública
│   │       ├── ContactForm.tsx        # Formulario de contacto
│   │       ├── AppShell.tsx           # Shell de paneles (tab bar móvil + header)
│   │       ├── AdminIsland.tsx        # Panel administrador
│   │       ├── admin/                 # Secciones del admin (reportes, pedidos, catálogo, config)
│   │       ├── CocinaIsland.tsx       # Panel cocina (KDS)
│   │       ├── MeseraIsland.tsx       # Panel mesera (POS)
│   │       ├── RepartidorIsland.tsx   # Panel repartidor
│   │       ├── ui/                    # Kit de UI (Toast, Sheet, EmptyState, ErrorBoundary, ConfirmDialog)
│   │       ├── EditarPedido.tsx, Proveedores.tsx, UsoPanel.tsx
│   │       ├── ReclamacionForm.tsx, LoginIsland.tsx, GuardPersonal.tsx
│   │       ├── HorarioBadge.tsx, HorarioTexto.tsx
│   │       └── bits/                  # UI reutilizable (charts, contadores)
│   ├── pages/                # Rutas (file-based)
│   ├── layouts/              # BaseLayout.astro, PanelLayout.astro
│   ├── context/              # AuthContext, CarritoClienteContext
│   ├── hooks/                # useHorario, useRealtime, useSound
│   ├── lib/                  # Lógica + acceso a datos
│   │   ├── supabaseClient.ts, supabaseConfig.ts, database.types.ts
│   │   ├── pedidos.ts, pedidosCliente.ts, reclamaciones.ts
│   │   ├── boleta.ts, carrito.ts, horario.ts, sonido.ts, tipos.ts
│   ├── data/                 # config.ts (WhatsApp), menu.ts (carta)
│   ├── utils/                # scrollAnimations, scrollReveal, whatsapp, paths
│   └── styles/               # global.css + estilos por página
├── supabase/migrations/      # 12 migraciones SQL
├── tests/                    # Vitest
├── astro.config.mjs
└── vercel.json
```

## Rutas

### Sitio público

| Ruta | Página | Render | Isla |
|------|--------|--------|------|
| `/` | Home | Estática | — (Hero + reseñas Elfsight) |
| `/menu` | Menú | Estática | `MenuPublicoIsland` (`client:visible`) |
| `/nosotros` | Nosotros | Estática | `HorarioTexto` |
| `/galeria` | Galería | Estática | — |
| `/contacto` | Contacto | Estática | `ContactForm` (`client:load`) |
| `/libro-de-reclamaciones` | Reclamaciones | Estática | `ReclamacionForm` |
| `/politica-de-privacidad` | Privacidad | Estática | — |
| `/404` | No encontrado | Estática | — |

### Panel interno

| Ruta | Rol | Isla principal |
|------|-----|----------------|
| `/personal` | Login | `LoginIsland` + `GuardPersonal` |
| `/admin` | Administrador | `AdminIsland` |
| `/cocina` | Cocina | `CocinaIsland` |
| `/mesera` | Mesera | `MeseraIsland` |
| `/repartidor` | Repartidor | `RepartidorIsland` |

El pedido del cliente se abre como isla flotante (`PedirIsland`) montada en `BaseLayout`.

## Base de Datos (Supabase)

Migraciones en `supabase/migrations/`:

`0001_init`, `0002_add_enums`, `0003_pedidos_clientes`, `0004_ventas_rango`,
`0005_platos_imagen`, `0006_edicion_cobro_auditoria`, `0007_boleta_cliente`,
`0008_eliminar_plato`, `0009_cancelar_mesera`, `0010_monitoreo`,
`0011_limites_numericos`, `0012_reclamaciones`.

## Flujo de un pedido

1. Cliente arma el carrito (`CarritoClienteContext`) y confirma el pedido.
2. `crearPedidoCliente` guarda en Supabase (`pedidos`).
3. Cocina (`CocinaIsland`) recibe en tiempo real (`useRealtime`) y actualiza estado.
4. Repartidor o mesera gestionan entrega y cobro.
5. Se genera boleta PDF (`lib/boleta.ts`).

## Variables de Entorno

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```
