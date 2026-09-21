-- ============================================================
-- 0006: Pedidos editables, cobro de mesa (salon), auditoria
--       y ventas separadas (cobrado / cuentas abiertas)
-- ADITIVO (no rompe lo existente)
-- ============================================================

-- ------------------------------------------------------------
-- 1. metodo_pago nullable (salon queda sin metodo hasta cobrar)
-- ------------------------------------------------------------
alter table public.pedidos alter column metodo_pago drop not null;
alter table public.pedidos alter column metodo_pago drop default;

-- ------------------------------------------------------------
-- 2. Campos de edicion / ajuste
-- ------------------------------------------------------------
alter table public.pedidos
  add column if not exists ajuste numeric(10,2) not null default 0,
  add column if not exists ajuste_nota text,
  add column if not exists editado_por uuid references public.usuarios(id) on delete set null,
  add column if not exists editado_en timestamptz;

-- ------------------------------------------------------------
-- 3. Tabla de auditoria
-- ------------------------------------------------------------
create table if not exists public.pedido_logs (
  id bigserial primary key,
  pedido_id uuid references public.pedidos(id) on delete cascade,
  accion text not null,
  detalle jsonb,
  usuario_id uuid references public.usuarios(id) on delete set null,
  creado_en timestamptz not null default now()
);

alter table public.pedido_logs enable row level security;

drop policy if exists "admin ve logs" on public.pedido_logs;
create policy "admin ve logs" on public.pedido_logs
  for select using (public.es_admin());

-- ------------------------------------------------------------
-- 4. crear_pedido (mesera): permite sin metodo (salon),
--    canal salon/recojo, envases S/1 para llevar
-- ------------------------------------------------------------
create or replace function public.crear_pedido(
  p_mesa_id int,
  p_metodo_pago public.pago_method,
  p_para_llevar boolean,
  p_notas text,
  p_items jsonb
) returns public.pedidos
language plpgsql security definer as $$
declare
  v_pedido public.pedidos;
  v_item jsonb;
  v_plato public.platos;
  v_subtotal numeric(10,2) := 0;
  v_cargo_envases numeric(10,2) := 0;
  v_dia text := to_char((now() at time zone 'America/Lima'), 'YYYY-MM-DD');
  v_num int;
  v_total_items int := 0;
  v_canal public.canal_pedido;
  v_estado_pago public.estado_pago;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido esta vacio';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato from public.platos where id = (v_item->>'plato_id')::int;
    if not found then
      raise exception 'Plato % no existe', (v_item->>'plato_id')::int;
    end if;
    if not v_plato.stock_disponible or v_plato.stock < (v_item->>'cantidad')::int then
      raise exception 'Stock insuficiente para %', v_plato.nombre;
    end if;
    v_subtotal := v_subtotal + (v_plato.precio * (v_item->>'cantidad')::int);
    v_total_items := v_total_items + (v_item->>'cantidad')::int;
  end loop;

  if p_para_llevar then
    v_canal := 'recojo';
    v_cargo_envases := v_total_items * 1.00;
  else
    v_canal := 'salon';
  end if;

  -- Si hay metodo => ya pagado (mesera cobra en el momento);
  -- si no => queda pendiente (cuenta abierta del salon)
  v_estado_pago := case when p_metodo_pago is null then 'pendiente' else 'pagado' end;

  v_num := public.siguiente_numero_orden(v_dia);

  insert into public.pedidos (
    numero_orden, dia, canal, mesa_id, mesera_id, estado, metodo_pago,
    estado_pago, para_llevar, cargo_envases, subtotal, total, notas
  )
  values (
    v_num, v_dia, v_canal, p_mesa_id, auth.uid(), 'pendiente', p_metodo_pago,
    v_estado_pago, p_para_llevar, v_cargo_envases, v_subtotal, v_subtotal + v_cargo_envases,
    nullif(trim(coalesce(p_notas, '')), '')
  )
  returning * into v_pedido;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato from public.platos where id = (v_item->>'plato_id')::int;
    insert into public.pedido_items (pedido_id, plato_id, plato_nombre, cantidad, precio_unitario)
    values (v_pedido.id, v_plato.id, v_plato.nombre, (v_item->>'cantidad')::int, v_plato.precio);
    update public.platos
    set stock = stock - (v_item->>'cantidad')::int,
        stock_disponible = (stock - (v_item->>'cantidad')::int) > 0
    where id = v_plato.id;
  end loop;

  insert into public.pedido_logs (pedido_id, accion, detalle, usuario_id)
  values (v_pedido.id, 'crear', jsonb_build_object('total', v_pedido.total, 'canal', v_canal), auth.uid());

  return v_pedido;
end;
$$;

-- ------------------------------------------------------------
-- 5. cobrar_mesa (mesera / admin)
-- ------------------------------------------------------------
create or replace function public.cobrar_mesa(
  p_pedido_id uuid,
  p_metodo public.pago_method,
  p_monto numeric
) returns void language plpgsql security definer as $$
declare
  v_rol public.user_role := public.mi_rol();
begin
  if v_rol not in ('mesera', 'admin') then
    raise exception 'Acceso denegado';
  end if;
  update public.pedidos
  set metodo_pago = p_metodo,
      monto_cobrado = coalesce(p_monto, total),
      cobrado_por = auth.uid(),
      estado_pago = 'pagado',
      estado = case when estado = 'pendiente' then 'entregado'::public.order_status else estado end
  where id = p_pedido_id;

  insert into public.pedido_logs (pedido_id, accion, detalle, usuario_id)
  values (p_pedido_id, 'cobrar', jsonb_build_object('metodo', p_metodo, 'monto', p_monto), auth.uid());
end;
$$;

-- ------------------------------------------------------------
-- 6. editar_pedido (solo admin) + ajuste manual
-- ------------------------------------------------------------
create or replace function public.editar_pedido(
  p_pedido_id uuid,
  p_items jsonb,
  p_metodo_pago public.pago_method,
  p_estado public.order_status,
  p_estado_pago public.estado_pago,
  p_ajuste numeric,
  p_ajuste_nota text,
  p_monto_cobrado numeric,
  p_notas text
) returns void language plpgsql security definer as $$
declare
  v_pedido public.pedidos;
  v_item jsonb;
  v_plato public.platos;
  v_subtotal numeric(10,2) := 0;
  v_total_items int := 0;
  v_cargo_envases numeric(10,2) := 0;
  v_costo_delivery numeric(10,2) := 0;
  v_ajuste numeric(10,2) := coalesce(p_ajuste, 0);
  v_old jsonb;
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe tener al menos un plato';
  end if;

  select * into v_pedido from public.pedidos where id = p_pedido_id;
  if not found then raise exception 'Pedido no encontrado'; end if;

  -- guardar detalle previo (auditoria)
  select jsonb_agg(jsonb_build_object('plato', plato_nombre, 'cantidad', cantidad, 'precio', precio_unitario))
    into v_old
  from public.pedido_items where pedido_id = p_pedido_id;

  -- restaurar stock de items actuales
  for v_item in select jsonb_build_object('plato_id', plato_id, 'cantidad', cantidad)
                from public.pedido_items where pedido_id = p_pedido_id
  loop
    update public.platos
    set stock = stock + (v_item->>'cantidad')::int, stock_disponible = true
    where id = (v_item->>'plato_id')::int;
  end loop;

  delete from public.pedido_items where pedido_id = p_pedido_id;

  -- insertar nuevos items + descontar stock + recalcular
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato from public.platos where id = (v_item->>'plato_id')::int;
    if not found then raise exception 'Plato no existe'; end if;
    insert into public.pedido_items (pedido_id, plato_id, plato_nombre, cantidad, precio_unitario)
    values (p_pedido_id, v_plato.id, v_plato.nombre, (v_item->>'cantidad')::int, v_plato.precio);
    update public.platos
    set stock = stock - (v_item->>'cantidad')::int,
        stock_disponible = (stock - (v_item->>'cantidad')::int) > 0
    where id = v_plato.id;
    v_subtotal := v_subtotal + (v_plato.precio * (v_item->>'cantidad')::int);
    v_total_items := v_total_items + (v_item->>'cantidad')::int;
  end loop;

  -- recalcular recargos segun canal
  if v_pedido.canal = 'delivery' then
    v_costo_delivery := v_total_items * 2.00;
  elsif v_pedido.canal = 'recojo' then
    v_cargo_envases := v_total_items * 1.00;
  end if;

  update public.pedidos set
    subtotal = v_subtotal,
    cargo_envases = v_cargo_envases,
    costo_delivery = v_costo_delivery,
    comision_llevar = 0,
    ajuste = v_ajuste,
    ajuste_nota = nullif(trim(coalesce(p_ajuste_nota, '')), ''),
    total = v_subtotal + v_cargo_envases + v_costo_delivery + v_ajuste,
    metodo_pago = p_metodo_pago,
    estado = p_estado,
    estado_pago = p_estado_pago,
    monto_cobrado = p_monto_cobrado,
    notas = nullif(trim(coalesce(p_notas, '')), ''),
    editado_por = auth.uid(),
    editado_en = now()
  where id = p_pedido_id;

  insert into public.pedido_logs (pedido_id, accion, detalle, usuario_id)
  values (p_pedido_id, 'editar', jsonb_build_object('antes', v_old, 'items', p_items, 'ajuste', v_ajuste), auth.uid());
end;
$$;

-- ------------------------------------------------------------
-- 7. Ventas del dia (cobrado vs cuentas abiertas)
-- ------------------------------------------------------------
create or replace function public.ventas_del_dia(p_dia text default to_char((now() at time zone 'America/Lima'), 'YYYY-MM-DD'))
returns jsonb
language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  select jsonb_build_object(
    'dia', p_dia,
    'total_vendido', (select coalesce(sum(total), 0) from public.pedidos where dia = p_dia and estado <> 'cancelado'),
    'cobrado', (select coalesce(sum(total), 0) from public.pedidos where dia = p_dia and estado <> 'cancelado' and estado_pago = 'pagado'),
    'cuentas_abiertas', (select coalesce(sum(total), 0) from public.pedidos where dia = p_dia and estado <> 'cancelado' and estado_pago <> 'pagado'),
    'num_pedidos', (select count(*) from public.pedidos where dia = p_dia and estado <> 'cancelado'),
    'por_metodo', (
      select coalesce(jsonb_object_agg(metodo, total), '{}'::jsonb)
      from (
        select metodo_pago as metodo, sum(total) as total
        from public.pedidos
        where dia = p_dia and estado <> 'cancelado' and estado_pago = 'pagado' and metodo_pago is not null
        group by metodo_pago
      ) t
    ),
    'por_plato', (
      select coalesce(jsonb_agg(row_to_json(x)), '[]'::jsonb)
      from (
        select pi.plato_nombre, sum(pi.cantidad) as cantidad,
               sum(pi.cantidad * pi.precio_unitario) as total
        from public.pedido_items pi
        join public.pedidos p on p.id = pi.pedido_id
        where p.dia = p_dia and p.estado <> 'cancelado'
        group by pi.plato_nombre
        order by total desc
      ) x
    ),
    'por_canal', (
      select coalesce(jsonb_object_agg(canal, total), '{}'::jsonb)
      from (
        select canal::text as canal, sum(total) as total
        from public.pedidos
        where dia = p_dia and estado <> 'cancelado'
        group by canal
      ) t
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- 8. Ventas por rango
-- ------------------------------------------------------------
create or replace function public.ventas_rango(p_desde date, p_hasta date)
returns jsonb
language plpgsql security definer as $$
declare
  v_result jsonb;
  v_desde text := to_char(p_desde, 'YYYY-MM-DD');
  v_hasta text := to_char(p_hasta, 'YYYY-MM-DD');
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  select jsonb_build_object(
    'desde', p_desde,
    'hasta', p_hasta,
    'total_vendido', (select coalesce(sum(total), 0) from public.pedidos where dia between v_desde and v_hasta and estado <> 'cancelado'),
    'cobrado', (select coalesce(sum(total), 0) from public.pedidos where dia between v_desde and v_hasta and estado <> 'cancelado' and estado_pago = 'pagado'),
    'cuentas_abiertas', (select coalesce(sum(total), 0) from public.pedidos where dia between v_desde and v_hasta and estado <> 'cancelado' and estado_pago <> 'pagado'),
    'num_pedidos', (select count(*) from public.pedidos where dia between v_desde and v_hasta and estado <> 'cancelado'),
    'por_metodo', (
      select coalesce(jsonb_object_agg(metodo, total), '{}'::jsonb)
      from (
        select metodo_pago as metodo, sum(total) as total
        from public.pedidos
        where dia between v_desde and v_hasta and estado <> 'cancelado' and estado_pago = 'pagado' and metodo_pago is not null
        group by metodo_pago
      ) t
    ),
    'por_canal', (
      select coalesce(jsonb_object_agg(canal, total), '{}'::jsonb)
      from (
        select canal::text as canal, sum(total) as total
        from public.pedidos
        where dia between v_desde and v_hasta and estado <> 'cancelado'
        group by canal
      ) t
    ),
    'por_plato', (
      select coalesce(jsonb_agg(row_to_json(x)), '[]'::jsonb)
      from (
        select pi.plato_nombre, sum(pi.cantidad) as cantidad,
               sum(pi.cantidad * pi.precio_unitario) as total
        from public.pedido_items pi
        join public.pedidos p on p.id = pi.pedido_id
        where p.dia between v_desde and v_hasta and p.estado <> 'cancelado'
        group by pi.plato_nombre
        order by total desc
      ) x
    ),
    'por_dia', (
      select coalesce(jsonb_agg(row_to_json(x) order by x.dia), '[]'::jsonb)
      from (
        select dia, count(*) as pedidos, sum(total) as total
        from public.pedidos
        where dia between v_desde and v_hasta and estado <> 'cancelado'
        group by dia
      ) x
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- 9. Permisos
-- ------------------------------------------------------------
grant execute on function public.crear_pedido(int, public.pago_method, boolean, text, jsonb) to authenticated;
grant execute on function public.cobrar_mesa(uuid, public.pago_method, numeric) to authenticated;
grant execute on function public.editar_pedido(uuid, jsonb, public.pago_method, public.order_status, public.estado_pago, numeric, text, numeric, text) to authenticated;
grant execute on function public.ventas_del_dia(text) to authenticated;
grant execute on function public.ventas_rango(date, date) to authenticated;
