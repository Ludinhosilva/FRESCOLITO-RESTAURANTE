-- ============================================================
-- 0015: Platos destacados en el inicio (editables por admin)
--   - Flag y orden en la tabla platos
--   - El inicio lee los platos con destacado = true
-- ============================================================

alter table public.platos
  add column if not exists destacado boolean not null default false,
  add column if not exists destacado_orden int not null default 0;

create index if not exists platos_destacado_idx
  on public.platos (destacado, destacado_orden)
  where destacado;

-- ============================================================
-- FIN 0015
-- ============================================================
