# SKILL: FrescLito Restaurant — Spec-Driven Development con IA

## 1. Estrategia de Testing y Calidad (Gonzalo/BCP + Artur/Globant)

### Pirámide de Pruebas
- **Unitarias**: funciones aisladas (incluir casos de error)
- **Integración**: flujos completos (UI + lógica + servicios)
- **Regresión**: cada cambio visual o lógico no rompe lo existente

### Caja Negra
- Validar entradas → salidas esperadas (sin mirar código interno)
- Ej: formulario de contacto → mensaje de "Éxito"

### Caja Blanca
- Revisar lógica interna (bucles, condicionales, seguridad)
- Prevenir: SQL Injection, XSS, validaciones de email rotas

### Cobertura
- Mínimo: 80%  |  Meta profesional/bancaria: 90%–100%
- Probar casos de éxito Y casos de error

### Principios SOLID + POO
- Desacoplar clases para poder aislar en tests
- Abstracción para que IA y humano puedan testear fácilmente

---

## 2. Metodología SDD (Spec-Driven Development)

### Roles de Agentes

| Rol | Modelo sugerido | Responsabilidad |
|-----|----------------|-----------------|
| **Arquitecto** | Claude Opus / GPT-4 | Decisiones de alto nivel, patrones de diseño, NO escribe código |
| **Software Designer** | Modelo intermedio | UI, contratos de datos, componentes desacoplados |
| **Desarrollador** | DeepSeek / OpenCode low-cost | Implementar funciones y clases, SIN tomar decisiones arquitectónicas |

### Archivos de Especificación (.md)
- **Sesión de Descubrimiento**: archivo .md con requisitos del proyecto
- **ADR** (Architecture Decision Records): documentar decisiones y herramientas elegidas
- **Tokens de Diseño**: colores, tipografías, espaciados
- **Guía de Seguridad**: lista de vulnerabilidades CWE a evitar (SQLi, XSS, etc.)
- **Estructura de carpetas** definida

### Automatización con Hooks
- Formateador automático post-generación
- Linter / analizador de errores en cada iteración
- Test runner automático al hacer cambios

---

## 3. Optimización de Recursos (OpenCode + Modelos Low-Cost)

- **Gestión de Tokens**: usar modelos locales o low-cost (DeepSeek, Ollama) para tareas repetitivas
- **Modelos premium** solo para el rol de Arquitecto (definición estructural)
- **Investigación/Docs**: Gemini o Google AI Studio para documentación técnica
- **OpenCode** como orquestador low-cost

---

## 4. Rol del Humano

- La IA genera ~90% del código
- **Tú revisas**: seguridad, reglas de negocio complejas, lógica omitida
- El control de calidad final es responsabilidad del desarrollador

---

## 5. Flujo de Trabajo para la Landing Page de FrescLito

### Fase 1 — Arquitecto
1. Crear `specs/ARCHITECTURE.md` con propósito, secciones (hero, servicios, contacto, menú), framework (React/Vite/HTML), estructura de carpetas
2. Decidir ADR: ¿por qué ese framework?, ¿hosting?, ¿API de reservas?

### Fase 2 — Software Designer
1. Definir tokens de diseño en `specs/DESIGN-TOKENS.md`
2. Crear componentes independientes (Button, Card, Navbar, Form) desacoplados

### Fase 3 — Testing (desde el día 1)
- **Unitarias**: validar cada componente aislado
- **Caja Negra**: formulario de contacto (input → output esperado)
- **Caja Blanca**: lógica de validación de email, sanitización de inputs
- **Integración**: que el formulario hable con la API/backend real
- **Regresión**: cambiar un color → ejecutar tests anteriores

### Fase 4 — Hooks y Automatización
- Pre-commit hook: linter + formateador + tests mínimos
- OpenCode con DeepSeek para maquetación repetitiva (HTML/CSS)
- Modelo premium solo para definir arquitectura

---

## 6. Comandos para OpenCode

```json
// Configuración sugerida para .opencode/settings.json
{
  "agents": {
    "architect": {
      "model": "claude-opus-4",
      "description": "Toma decisiones de alto nivel, NO escribe código"
    },
    "developer": {
      "model": "deepseek-v4-flash",
      "description": "Implementa funciones y clases siguiendo las especificaciones del arquitecto"
    },
    "designer": {
      "model": "deepseek-v4-flash",
      "description": "Crea componentes de UI desacoplados y tokens de diseño"
    }
  }
}
```

---

## Checklist por Iteración

- [ ] ¿Los tests unitarios pasan?
- [ ] ¿Los tests de integración pasan?
- [ ] ¿Cobertura >= 80%?
- [ ] ¿Caja negra validada (input → output)?
- [ ] ¿Caja blanca revisada (seguridad, lógica)?
- [ ] ¿Linter y formateador ejecutados?
- [ ] ¿ADR actualizado si cambió alguna decisión?
- [ ] ¿Pruebas de regresión ejecutadas?

---

> "El único sistema perfecto es el que está apagado" — Artur (Globant)
> "La IA automatiza, pero el control de calidad final es del desarrollador" — Gonzalo (BCP)
