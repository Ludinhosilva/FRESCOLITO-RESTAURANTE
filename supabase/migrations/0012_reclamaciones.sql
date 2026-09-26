-- ============================================================
-- 0012: Libro de Reclamaciones (virtual)
-- ============================================================

create table if not exists public.reclamaciones (
  id bigint generated always as identity primary key,
  nombre text not null,
  dni text not null,
  domicilio text,
  telefono text,
  email text not null,
  tipo text not null check (tipo in ('reclamo', 'queja')),
  detalle text not null,
  pedido text,
  creado_en timestamptz not null default now()
);

alter table public.reclamaciones enable row level security;

-- Cualquier visitante (anonimo) puede registrar un reclamo o queja.
drop policy if exists "crear reclamaciones" on public.reclamaciones;
create policy "crear reclamaciones" on public.reclamaciones
  for insert with check (true);

-- El personal autenticado puede verlas; admin gestiona todo.
drop policy if exists "personal ve reclamaciones" on public.reclamaciones;
create policy "personal ve reclamaciones" on public.reclamaciones
  for select using (auth.uid() is not null);

drop policy if exists "admin reclamaciones" on public.reclamaciones;
create policy "admin reclamaciones" on public.reclamaciones
  for all using (public.es_admin());
