-- ============================================================
-- 0005: Descripcion e imagen de platos + Storage de fotos
-- ============================================================

-- 1. Campos nuevos en platos (aditivo)
alter table public.platos
  add column if not exists descripcion text,
  add column if not exists imagen text;

-- 2. Bucket publico para las fotos de los platos
insert into storage.buckets (id, name, public)
values ('platos', 'platos', true)
on conflict (id) do nothing;

-- 3. Politicas del bucket
drop policy if exists "lectura publica platos" on storage.objects;
create policy "lectura publica platos" on storage.objects
  for select using (bucket_id = 'platos');

drop policy if exists "admin sube platos" on storage.objects;
create policy "admin sube platos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'platos' and public.es_admin());

drop policy if exists "admin actualiza platos" on storage.objects;
create policy "admin actualiza platos" on storage.objects
  for update to authenticated
  using (bucket_id = 'platos' and public.es_admin());

drop policy if exists "admin borra platos" on storage.objects;
create policy "admin borra platos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'platos' and public.es_admin());
