-- ============================================================
-- 0014: Galería y Eventos editables por el admin
--   - Bucket publico "galeria" (solo admin sube/borra)
--   - Tabla public.galeria        (pagina /galeria)
--   - Tabla public.eventos_fotos  (pagina /catering, seccion eventos)
--   - RLS: lectura publica de activos; admin gestiona todo
--   - Seed con las fotos actuales (editables luego desde el panel)
-- ============================================================

-- ------------------------------------------------------------
-- 1. BUCKET
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

drop policy if exists "lectura publica galeria" on storage.objects;
create policy "lectura publica galeria" on storage.objects
  for select using (bucket_id = 'galeria');

drop policy if exists "admin sube galeria" on storage.objects;
create policy "admin sube galeria" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'galeria' and public.es_admin());

drop policy if exists "admin actualiza galeria" on storage.objects;
create policy "admin actualiza galeria" on storage.objects
  for update to authenticated
  using (bucket_id = 'galeria' and public.es_admin());

drop policy if exists "admin borra galeria" on storage.objects;
create policy "admin borra galeria" on storage.objects
  for delete to authenticated
  using (bucket_id = 'galeria' and public.es_admin());

-- ------------------------------------------------------------
-- 2. TABLAS
-- ------------------------------------------------------------
create table if not exists public.galeria (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'platos'
    check (categoria in ('platos', 'ambiente', 'mesa')),
  url text not null unique,
  alt text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists public.eventos_fotos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'otros'
    check (categoria in ('bodas', 'corporativos', 'cumpleanos', 'bautizos', 'aniversarios', 'otros')),
  url text not null unique,
  alt text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create index if not exists galeria_orden_idx on public.galeria (activo, orden);
create index if not exists eventos_fotos_orden_idx on public.eventos_fotos (activo, orden);

-- ------------------------------------------------------------
-- 3. RLS
-- ------------------------------------------------------------
alter table public.galeria enable row level security;
alter table public.eventos_fotos enable row level security;

drop policy if exists "galeria lectura publica" on public.galeria;
create policy "galeria lectura publica" on public.galeria
  for select using (activo);

drop policy if exists "galeria admin" on public.galeria;
create policy "galeria admin" on public.galeria
  for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "eventos lectura publica" on public.eventos_fotos;
create policy "eventos lectura publica" on public.eventos_fotos
  for select using (activo);

drop policy if exists "eventos admin" on public.eventos_fotos;
create policy "eventos admin" on public.eventos_fotos
  for all using (public.es_admin()) with check (public.es_admin());

-- ------------------------------------------------------------
-- 4. SEED (fotos actuales, editables)
-- ------------------------------------------------------------
insert into public.galeria (categoria, url, alt, orden) values
  ('platos',   '/imagenes/galeria/ArrozMarisco.webp',      'Arroz con Mariscos', 1),
  ('platos',   '/imagenes/galeria/Ceviche20.webp',         'Ceviche', 2),
  ('platos',   '/imagenes/galeria/ChaufaRegional.webp',    'Chaufa Regional', 3),
  ('platos',   '/imagenes/galeria/Chicharron.webp',        'Chicharrón', 4),
  ('platos',   '/imagenes/galeria/CombinadoCc.webp',       'Combinado', 5),
  ('platos',   '/imagenes/galeria/CombinadoCevChau.webp',  'Ceviche y Chaufa', 6),
  ('platos',   '/imagenes/galeria/Lomo.webp',              'Lomo Saltado', 7),
  ('platos',   '/imagenes/galeria/Pescado.webp',           'Pescado', 8),
  ('platos',   '/imagenes/galeria/RONDA.webp',             'Ronda de Platos', 9),
  ('ambiente', '/imagenes/galeria/Cilindro.webp',          'Cocina FRESCOLITO', 10),
  ('ambiente', '/imagenes/galeria/Comidas.webp',           'Preparación', 11),
  ('ambiente', '/imagenes/galeria/EQUIPO.webp',            'Equipo FRESCOLITO', 12),
  ('ambiente', '/imagenes/galeria/Historia.webp',          'Historia FRESCOLITO', 13),
  ('ambiente', '/imagenes/galeria/Plancha.webp',           'Cocina a la Plancha', 14),
  ('ambiente', '/imagenes/galeria/Presentacion.webp',      'Presentación de Platos', 15),
  ('mesa',     '/imagenes/galeria/Mesacomida.webp',        'Mesa Servida', 16),
  ('mesa',     '/imagenes/galeria/MesaGaleria.webp',       'Galería de Mesa', 17),
  ('mesa',     '/imagenes/galeria/MesaRepresentativa.webp','Mesa Representativa', 18)
on conflict (url) do nothing;

insert into public.eventos_fotos (categoria, url, alt, orden) values
  ('otros', '/imagenes/galeria/MesaRepresentativa.webp', 'Montaje de evento', 1),
  ('otros', '/imagenes/galeria/MesaGaleria.webp',        'Mesa de evento', 2),
  ('otros', '/imagenes/galeria/Mesacomida.webp',         'Mesa servida', 3),
  ('otros', '/imagenes/galeria/RONDA.webp',              'Ronda de platos', 4),
  ('otros', '/imagenes/galeria/Presentacion.webp',       'Presentación', 5),
  ('otros', '/imagenes/galeria/EQUIPO.webp',             'Equipo en evento', 6)
on conflict (url) do nothing;

-- ============================================================
-- FIN 0014
-- ============================================================
