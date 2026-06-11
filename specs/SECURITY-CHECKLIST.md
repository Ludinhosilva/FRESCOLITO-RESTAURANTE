# SECURITY CHECKLIST — FRESCOLITO RESTAURANTE

## Formularios (Contacto + Reservas)

- [ ] Sanitizar inputs (eliminar HTML tags, escape de caracteres)
- [ ] Validar email con regex en frontend y backend
- [ ] Validar teléfono: solo dígitos, longitud mínima/máxima
- [ ] Prevenir XSS: no usar `dangerouslySetInnerHTML` con datos del usuario
- [ ] Prevenir inyección: no construir strings SQL/URL con inputs directos
- [ ] Rate limiting visual: deshabilitar botón de envío por 2s tras submit
- [ ] Mostrar errores específicos pero sin revelar información interna

## API / Envío de datos

- [ ] Usar HTTPS en producción
- [ ] No exponer API keys en frontend
- [ ] Validar datos en servidor aunque ya se validaron en cliente
- [ ] Headers CORS restrictivos

## Assets externos

- [ ] Leaflet.js: cargar desde CDN con integridad SRI
- [ ] Swiper.js: cargar desde CDN con integridad SRI
- [ ] Google Fonts: cargar con `display=swap`

## General

- [ ] No hardcodear tokens ni credenciales en el código
- [ ] No registrar contraseñas ni datos sensibles en console.log
- [ ] Deshabilitar autocomplete en campos críticos si aplica
- [ ] Content Security Policy (CSP) básica en producción
