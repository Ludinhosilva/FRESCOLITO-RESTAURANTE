# ARCHITECTURE — FRESCOLITO RESTAURANTE

## Stack
- **Framework**: React 18 + Vite
- **Routing**: React Router v6 con lazy loading por ruta
- **Testing**: Vitest + @testing-library/react
- **Animaciones**: Lenis (smooth scroll) + GSAP ScrollTrigger
- **Carruseles**: Swiper.js
- **Mapa**: Leaflet.js (Iquitos)
- **Tipografía**: Playfair Display (títulos) + Lato (cuerpo)

## Estructura de Carpetas

```
D:\FRESCOLITO\
├── specs/                   # Archivos de especificación
├── Imagenes/                # Assets (logo, carta, fotos platos)
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── DishCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/               # 6 rutas lazy
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   ├── About.jsx
│   │   ├── Gallery.jsx
│   │   ├── Contact.jsx
│   │   └── Reservations.jsx
│   ├── data/                # Datos estáticos (menú, platos)
│   │   └── menu.js
│   ├── hooks/               # Custom hooks
│   │   ├── useScrollAnimation.js
│   │   └── useFormValidation.js
│   ├── styles/              # Estilos globales y tokens
│   │   └── global.css
│   ├── App.jsx              # Router + Error Boundaries
│   └── main.jsx             # Entry point
├── tests/                   # Tests
├── index.html
├── package.json
├── vite.config.js
└── vitest.config.js
```

## Rutas

| Ruta | Página | Lazy | Error Boundary |
|------|--------|------|----------------|
| `/` | Home | Sí | Sí |
| `/menu` | Menu | Sí | Sí |
| `/nosotros` | About | Sí | Sí |
| `/galeria` | Gallery | Sí | Sí |
| `/contacto` | Contact | Sí | Sí |
| `/reservas` | Reservations | Sí | Sí |

## Principios de Diseño

- **Componentes desacoplados**: cada componente recibe props, sin dependencias globales
- **Lazy loading**: cada página es un chunk independiente
- **Error Boundaries**: cada ruta envuelta en su propio boundary
- **Testing first**: cada componente con su test unitario
