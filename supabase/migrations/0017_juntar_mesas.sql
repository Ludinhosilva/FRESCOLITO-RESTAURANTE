-- ============================================================
-- 0017: Juntar mesas (una sola cuenta) y mover mesas
--   - pedido_mesas: un pedido puede cubrir varias mesas
--   - unir_mesas: fusiona pedidos de las mesas en el principal
--   - separar_mesa: desvincula una mesa del pedido
--   - mover_mesa: mesera/admin pueden acomodar el plano (x,y)
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA pedido_mesas
-- ------------------------------------------------------------
create table if not exists public.pedido_mesas (
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  mesa_id int not null references public.mesas(id) on delete cascade,
  primary key (pedido_id, mesa_id)
);

create index if not exists pedido_mesas_pedido_idx on public.pedido_mesas (pedido_id);
create index if not exists pedido_mesas_mesa_idx on public.pedido_mesas (mesa_id);

alter table public.pedido_mesas enable row level security;

drop policy if exists "personal ve pedido_mesas" on public.pedido_mesas;
create policy "personal ve pedido_mesas" on public.pedido_mesas
  for select using (auth.uid() is not null);

drop policy if exists "admin pedido_mesas" on public.pedido_mesas;
create policy "admin pedido_mesas" on public.pedido_mesas
  for all using (public.es_admin()) with check (public.es_admin());

-- ------------------------------------------------------------
-- 2. unir_mesas: vincula mesas al pedido principal y fusiona
--    los pedidos abiertos de esas mesas en el principal.
-- ------------------------------------------------------------
create or replace function public.unir_mesas(p_pedido_id uuid, p_mesa_ids int[])
returns void language plpgsql security definer as $$
declare
  v_rol public.user_role := public.mi_rol();
  v_mesa int;
  v_otro uuid;
begin
  if v_rol not in ('mesera', 'admin') then
    raise exception 'Acceso denegado';
  end if;
  if p_mesa_ids is null or array_length(p_mesa_ids, 1) is null then
    raise exception 'Sin mesas';
  end if;

  foreach v_mesa in array p_mesa_ids loop
    select id into v_otro
    from public.pedidos
    where mesa_id = v_mesa
      and canal = 'salon'
      and estado not in ('cancelado', 'entregado')
      and id <> p_pedido_id
    order by creado_en desc
    limit 1;

    if v_otro is not null then
      update public.pedido_items set pedido_id = p_pedido_id where pedido_id = v_otro;
      update public.pedidos set estado = 'cancelado', actualizado_en = now() where id = v_otro;
    end if;

    insert into public.pedido_mesas (pedido_id, mesa_id)
    values (p_pedido_id, v_mesa)
    on conflict do nothing;
  end loop;

  perform public._recalcular_total(p_pedido_id);
end;
$$;

grant execute on function public.unir_mesas(uuid, int[]) to authenticated;

-- ------------------------------------------------------------
-- 3. separar_mesa: quita una mesa del grupo (queda libre).
--    Si era la mesa principal, se reasigna a otra del grupo.
-- ------------------------------------------------------------
create or replace function public.separar_mesa(p_pedido_id uuid, p_mesa_id int)
returns void language plpgsql security definer as $$
declare
  v_rol public.user_role := public.mi_rol();
  v_principal int;
  v_otra int;
begin
  if v_rol not in ('mesera', 'admin') then
    raise exception 'Acceso denegado';
  end if;

  delete from public.pedido_mesas where pedido_id = p_pedido_id and mesa_id = p_mesa_id;

  select mesa_id into v_principal from public.pedidos where id = p_pedido_id;
  if v_principal = p_mesa_id then
    select mesa_id into v_otra
    from public.pedido_mesas
    where pedido_id = p_pedido_id
    order by mesa_id
    limit 1;
    if v_otra is not null then
      update public.pedidos set mesa_id = v_otra, actualizado_en = now() where id = p_pedido_id;
    end if;
  end if;
end;
$$;

grant execute on function public.separar_mesa(uuid, int) to authenticated;

-- ------------------------------------------------------------
-- 4. mover_mesa: mesera/admin acomodan el plano (x,y)
-- ------------------------------------------------------------
create or replace function public.mover_mesa(p_id int, p_x int, p_y int)
returns void language plpgsql security definer as $$
begin
  if public.mi_rol() not in ('mesera', 'admin') then
    raise exception 'Acceso denegado';
  end if;
  update public.mesas
  set x = greatest(0, least(100, p_x)),
      y = greatest(0, least(100, p_y))
  where id = p_id;
end;
$$;

grant execute on function public.mover_mesa(int, int, int) to authenticated;

-- ============================================================
-- FIN 0017
-- ============================================================
