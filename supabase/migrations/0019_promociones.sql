-- ============================================================
-- 0019: Promociones del inicio (editables por admin)
--   - Tabla promociones con imagen, badge, precios, enlace CTA
--     y fecha de fin (para cuenta regresiva).
--   - Publico lee solo activas; admin gestiona todo.
-- ============================================================

create table if not exists public.promociones (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  imagen text,
  badge text,
  precio_oferta text,
  precio_regular text,
  enlace text,
  cta_label text,
  fecha_fin timestamptz,
  activo boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

create index if not exists promociones_activo_orden_idx
  on public.promociones (activo, orden)
  where activo;

alter table public.promociones enable row level security;

drop policy if exists "promociones lectura publica" on public.promociones;
create policy "promociones lectura publica" on public.promociones
  for select using (activo = true);

drop policy if exists "promociones admin" on public.promociones;
create policy "promociones admin" on public.promociones
  for all using (public.es_admin()) with check (public.es_admin());

-- ------------------------------------------------------------
-- Seed inicial con las imagenes de referencia (public/imagenes/promos)
-- ------------------------------------------------------------
insert into public.promociones (titulo, imagen, badge, enlace, cta_label, orden) values
  ('Promo Desayuno', '/imagenes/promos/promo-desayuno-1.jpg', 'Desayuno', '/menu', 'Ver menú', 1),
  ('Carta Desayuno', '/imagenes/promos/promo-desayuno-2.jpg', 'Desayuno', '/menu', 'Ver menú', 2),
  ('Promoción Frescolito', '/imagenes/promos/promo-principal.jpg', 'Promo', '/menu', 'Ver menú', 3)
on conflict do nothing;

-- ============================================================
-- FIN 0019
-- ============================================================
