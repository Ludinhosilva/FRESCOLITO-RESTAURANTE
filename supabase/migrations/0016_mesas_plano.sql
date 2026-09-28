-- ============================================================
-- 0016: Mesas con plano (posiciones) y mover items entre mesas
--   - mesas: capacidad, forma, x, y (porcentaje 0-100), activa
--   - _recalcular_total(pedido): recalcula subtotal/total
--   - mover_items(origen, mesa_destino, item_ids): mueve items
--     entre pedidos (crea el pedido destino si hace falta) sin
--     tocar stock; si el origen queda vacio, se cancela.
-- ============================================================

alter table public.mesas
  add column if not exists capacidad int not null default 4,
  add column if not exists forma text not null default 'cuadrada',
  add column if not exists x int not null default 0,
  add column if not exists y int not null default 0,
  add column if not exists activa boolean not null default true;

-- Posiciones iniciales en grilla (porcentajes) para las mesas sin ubicar.
update public.mesas
set x = 8 + ((numero - 1) % 5) * 19,
    y = case when numero <= 5 then 22 else 66 end
where x = 0 and y = 0;

-- ------------------------------------------------------------
-- Recalcular subtotal y total de un pedido a partir de sus items
-- ------------------------------------------------------------
create or replace function public._recalcular_total(p_pedido uuid)
returns void language plpgsql security definer as $$
declare
  v_sub numeric(10,2);
begin
  select coalesce(sum(cantidad * precio_unitario), 0) into v_sub
  from public.pedido_items where pedido_id = p_pedido;

  update public.pedidos
  set subtotal = v_sub,
      total = v_sub + cargo_envases + costo_delivery + coalesce(ajuste, 0),
      actualizado_en = now()
  where id = p_pedido;
end;
$$;

-- ------------------------------------------------------------
-- Mover items de un pedido a una mesa destino.
-- Si la mesa destino tiene un pedido abierto, se usa; si no,
-- se crea uno nuevo (sin tocar stock, los items ya existen).
-- Devuelve el id del pedido destino.
-- ------------------------------------------------------------
create or replace function public.mover_items(
  p_origen uuid,
  p_mesa_destino int,
  p_item_ids uuid[]
) returns uuid
language plpgsql security definer as $$
declare
  v_rol public.user_role := public.mi_rol();
  v_destino uuid;
  v_dia text := to_char((now() at time zone 'America/Lima'), 'YYYY-MM-DD');
  v_num int;
begin
  if v_rol not in ('mesera', 'admin') then
    raise exception 'Acceso denegado';
  end if;
  if p_item_ids is null or array_length(p_item_ids, 1) is null then
    raise exception 'Sin items para mover';
  end if;

  -- Pedido abierto en la mesa destino (salon, no cerrado)
  select id into v_destino
  from public.pedidos
  where mesa_id = p_mesa_destino
    and canal = 'salon'
    and estado not in ('cancelado', 'entregado')
  order by creado_en desc
  limit 1;

  if v_destino is null then
    v_num := public.siguiente_numero_orden(v_dia);
    insert into public.pedidos (
      numero_orden, dia, canal, mesa_id, mesera_id, estado, metodo_pago,
      para_llevar, subtotal, total, estado_pago
    ) values (
      v_num, v_dia, 'salon', p_mesa_destino, auth.uid(), 'pendiente', 'efectivo',
      false, 0, 0, 'pendiente'
    ) returning id into v_destino;
  end if;

  -- Mover los items seleccionados que pertenezcan al origen
  update public.pedido_items
  set pedido_id = v_destino
  where id = any(p_item_ids) and pedido_id = p_origen;

  perform public._recalcular_total(v_destino);

  if exists (select 1 from public.pedido_items where pedido_id = p_origen) then
    perform public._recalcular_total(p_origen);
  else
    update public.pedidos set estado = 'cancelado', actualizado_en = now() where id = p_origen;
  end if;

  return v_destino;
end;
$$;

grant execute on function public.mover_items(uuid, int, uuid[]) to authenticated;

-- ============================================================
-- FIN 0016
-- ============================================================
