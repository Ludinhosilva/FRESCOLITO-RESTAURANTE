# SECURITY CHECKLIST — FRESCOLITO RESTAURANTE

> Estado actualizado. `[x]` cumplido, `[ ]` pendiente.
> Revision: RLS activa en todas las tablas, funciones `security definer`
> con control de rol, `search_path` seguro (migracion 0018), sin claves
> hardcodeadas (branch `chore/entornos-seguros`).

## Formularios (Contacto + Reservas)

- [x] Sanitizar inputs (via Supabase-js/RPC parametrizado; no se concatena SQL)
- [x] Validar email con regex en frontend y backend
- [x] Validar teléfono: solo dígitos, longitud mínima/máxima
- [x] Prevenir XSS: no se usa `dangerouslySetInnerHTML` con datos del usuario
- [x] Prevenir inyección: no se construyen strings SQL/URL con inputs directos
- [x] Rate limiting visual: botón deshabilitado durante el submit
- [x] Errores específicos sin revelar información interna

## API / Envío de datos

- [x] HTTPS en producción (Vercel)
- [x] No exponer API keys: solo la anon key (pública por diseño), sin `service_role`
- [x] Validar en servidor: funciones `security definer` validan rol y datos (`0003`, `0006`, `0017`)
- [x] Credenciales solo por variables de entorno (sin fallback hardcodeado)
- [ ] CORS restrictivos (los gestiona Supabase; revisar dominios permitidos)

## Base de datos (Supabase / Postgres)

- [x] RLS habilitada en todas las tablas (usuarios, mesas, platos, pedidos, items, reservas, config, logs, galería, reclamaciones, pedido_mesas)
- [x] Políticas por rol (`es_admin()`, `mi_rol()`): mesera/cocina/admin/repartidor
- [x] Escritura de Storage solo admin (`bucket_id = 'galeria'/'platos' and es_admin()`)
- [x] `search_path = ''` en funciones `security definer` (migración `0018`)
- [x] Código de seguimiento 48 bits (12 hex) en pedidos de cliente (`0018`)
- [x] `CHECK` de longitud en `reclamaciones` y `pedidos` (`0018`)
- [ ] Rate limiting por IP en endpoints públicos (`consultar_pedido_cliente`, `adjuntar_referencia`, `reclamaciones`) — requiere Edge Function / WAF

## Assets externos

- [ ] Leaflet.js: cargar con integridad SRI (si se usa CDN)
- [x] Swiper.js: empaquetado vía npm (sin CDN)
- [x] Google Fonts: cargar con `display=swap` (o auto-hospedadas)

## General

- [x] No hardcodear tokens ni credenciales en el código
- [x] No registrar contraseñas ni datos sensibles en `console.log`
- [x] Autocomplete correcto en campos de login (`email` / `current-password`)
- [ ] Content Security Policy (CSP) básica en producción
