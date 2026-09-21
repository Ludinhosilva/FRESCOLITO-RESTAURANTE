-- ============================================================
-- 0003: Pedidos de clientes (delivery / recojo), configuracion
--       y funciones asociadas. Todo ADITIVO (no rompe lo existente).
-- ============================================================

-- ------------------------------------------------------------
-- 1. TIPOS
-- ------------------------------------------------------------
do $$ begin
  create type public.canal_pedido as enum ('salon', 'delivery', 'recojo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.estado_pago as enum ('pendiente', 'por_verificar', 'pagado', 'contra_entrega');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2. TABLA: configuracion (horario, tarifas)
-- ------------------------------------------------------------
create table if not exists public.configuracion (
  clave text primary key,
  valor jsonb not null,
  actualizado_en timestamptz not null default now()
);

insert into public.configuracion (clave, valor) values
  ('horario', '{"dias":[3,4],"apertura":"11:30","cierre":"15:20"}'),
  ('tarifas', '{"delivery_por_plato":2.00,"envase_por_plato":1.00}'),
  ('pagos', '{"yape":"916207362","plin":"928104463","qr_url":""}')
on conflict (clave) do nothing;

-- ------------------------------------------------------------
-- 3. EXTENDER pedidos (aditivo)
-- ------------------------------------------------------------
alter table public.pedidos
  add column if not exists canal public.canal_pedido not null default 'salon',
  add column if not exists cliente_nombre text,
  add column if not exists cliente_telefono text,
  add column if not exists cliente_direccion text,
  add column if not exists estado_pago public.estado_pago not null default 'pendiente',
  add column if not exists cargo_envases numeric(10,2) not null default 0,
  add column if not exists costo_delivery numeric(10,2) not null default 0,
  add column if not exists codigo_seguimiento text,
  add column if not exists referencia_pago text,
  add column if not exists cobrado_por uuid references public.usuarios(id) on delete set null,
  add column if not exists monto_cobrado numeric(10,2);

create unique index if not exists pedidos_codigo_seguimiento_idx
  on public.pedidos (codigo_seguimiento)
  where codigo_seguimiento is not null;

-- ------------------------------------------------------------
-- 4. FUNCION: esta abierto segun configuracion
-- ------------------------------------------------------------
create or replace function public.esta_abierto()
returns boolean language plpgsql stable security definer as $$
declare
  v_horario jsonb;
  v_now timestamp := (now() at time zone 'America/Lima');
  v_dow int := extract(dow from v_now);
  v_hora time := v_now::time;
begin
  select valor into v_horario from public.configuracion where clave = 'horario';
  if v_horario is null then return true; end if;

  if not exists (
    select 1 from jsonb_array_elements_text(coalesce(v_horario->'dias', '[]'::jsonb)) d
    where d::int = v_dow
  ) then
    return false;
  end if;

  return v_hora >= (v_horario->>'apertura')::time
     and v_hora <= (v_horario->>'cierre')::time;
end;
$$;

-- ------------------------------------------------------------
-- 5. FUNCION: crear pedido de cliente (invitado, publico)
-- ------------------------------------------------------------
create or replace function public.crear_pedido_cliente(
  p_nombre text,
  p_telefono text,
  p_direccion text,
  p_canal public.canal_pedido,
  p_metodo_pago public.pago_method,
  p_notas text,
  p_items jsonb
) returns jsonb
language plpgsql security definer as $$
declare
  v_pedido public.pedidos;
  v_item jsonb;
  v_plato public.platos;
  v_subtotal numeric(10,2) := 0;
  v_total_items int := 0;
  v_cargo_envases numeric(10,2) := 0;
  v_costo_delivery numeric(10,2) := 0;
  v_tarifas jsonb;
  v_delivery_plato numeric(10,2) := 2.00;
  v_envase_plato numeric(10,2) := 1.00;
  v_dia text := to_char((now() at time zone 'America/Lima'), 'YYYY-MM-DD');
  v_num int;
  v_codigo text;
  v_recientes int;
begin
  -- validaciones basicas (anti payloads)
  if p_nombre is null or length(trim(p_nombre)) < 2 or length(p_nombre) > 80 then
    raise exception 'Nombre invalido';
  end if;
  if p_telefono is null or length(regexp_replace(p_telefono, '\D', '', 'g')) < 6 then
    raise exception 'Telefono invalido';
  end if;
  if p_canal not in ('delivery', 'recojo') then
    raise exception 'Tipo de entrega invalido';
  end if;
  if p_canal = 'delivery' and (p_direccion is null or length(trim(p_direccion)) < 5) then
    raise exception 'Direccion requerida para delivery';
  end if;
  if p_notas is not null and length(p_notas) > 300 then
    raise exception 'Notas demasiado largas';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido esta vacio';
  end if;

  -- horario (opcion A)
  if not public.esta_abierto() then
    raise exception 'Estamos cerrados. Vuelve en nuestro horario de atencion.';
  end if;

  -- anti-spam: max 5 pedidos por telefono en 10 minutos
  select count(*) into v_recientes
  from public.pedidos
  where cliente_telefono = p_telefono
    and creado_en > now() - interval '10 minutes';
  if v_recientes >= 5 then
    raise exception 'Demasiados pedidos seguidos. Intenta mas tarde.';
  end if;

  -- validar items y calcular subtotal
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato
    from public.platos
    where id = (v_item->>'plato_id')::int and activo = true;
    if not found then
      raise exception 'Plato no disponible';
    end if;
    if (v_item->>'cantidad')::int < 1 then
      raise exception 'Cantidad invalida';
    end if;
    if not v_plato.stock_disponible or v_plato.stock < (v_item->>'cantidad')::int then
      raise exception 'Stock insuficiente para %', v_plato.nombre;
    end if;
    v_subtotal := v_subtotal + (v_plato.precio * (v_item->>'cantidad')::int);
    v_total_items := v_total_items + (v_item->>'cantidad')::int;
  end loop;

  -- tarifas (desde configuracion, con respaldo)
  select valor into v_tarifas from public.configuracion where clave = 'tarifas';
  if v_tarifas is not null then
    v_delivery_plato := coalesce((v_tarifas->>'delivery_por_plato')::numeric, 2.00);
    v_envase_plato := coalesce((v_tarifas->>'envase_por_plato')::numeric, 1.00);
  end if;

  if p_canal = 'delivery' then
    v_costo_delivery := v_total_items * v_delivery_plato;
  elsif p_canal = 'recojo' then
    v_cargo_envases := v_total_items * v_envase_plato;
  end if;

  v_num := public.siguiente_numero_orden(v_dia);
  v_codigo := upper(substr(md5(gen_random_uuid()::text), 1, 8));

  insert into public.pedidos (
    numero_orden, dia, canal, estado, metodo_pago, para_llevar,
    cliente_nombre, cliente_telefono, cliente_direccion,
    estado_pago, cargo_envases, costo_delivery, codigo_seguimiento,
    subtotal, total, notas
  ) values (
    v_num, v_dia, p_canal, 'pendiente', p_metodo_pago, true,
    trim(p_nombre), trim(p_telefono), nullif(trim(coalesce(p_direccion, '')), ''),
    (case when p_metodo_pago = 'efectivo' then 'contra_entrega' else 'por_verificar' end)::public.estado_pago,
    v_cargo_envases, v_costo_delivery, v_codigo,
    v_subtotal, v_subtotal + v_cargo_envases + v_costo_delivery,
    nullif(trim(coalesce(p_notas, '')), '')
  ) returning * into v_pedido;

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

  return jsonb_build_object(
    'id', v_pedido.id,
    'codigo', v_codigo,
    'numero_orden', v_num,
    'subtotal', v_subtotal,
    'cargo_envases', v_cargo_envases,
    'costo_delivery', v_costo_delivery,
    'total', v_pedido.total
  );
end;
$$;

-- ------------------------------------------------------------
-- 6. FUNCION: consultar pedido del cliente por codigo (publico)
-- ------------------------------------------------------------
create or replace function public.consultar_pedido_cliente(p_codigo text)
returns jsonb language plpgsql stable security definer as $$
declare
  v_result jsonb;
begin
  if p_codigo is null or length(p_codigo) < 6 then
    return null;
  end if;

  select jsonb_build_object(
    'numero_orden', p.numero_orden,
    'canal', p.canal,
    'estado', p.estado,
    'estado_pago', p.estado_pago,
    'cliente_nombre', p.cliente_nombre,
    'cliente_direccion', p.cliente_direccion,
    'subtotal', p.subtotal,
    'cargo_envases', p.cargo_envases,
    'costo_delivery', p.costo_delivery,
    'total', p.total,
    'creado_en', p.creado_en,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object('plato', i.plato_nombre, 'cantidad', i.cantidad)), '[]'::jsonb)
      from public.pedido_items i
      where i.pedido_id = p.id
    )
  ) into v_result
  from public.pedidos p
  where p.codigo_seguimiento = upper(trim(p_codigo));

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- 7. FUNCION: adjuntar N.º de operacion Yape/Plin (publico, por codigo)
-- ------------------------------------------------------------
create or replace function public.adjuntar_referencia(p_codigo text, p_referencia text)
returns void language plpgsql security definer as $$
begin
  if p_codigo is null or p_referencia is null or length(trim(p_referencia)) < 3 then
    return;
  end if;
  update public.pedidos
  set referencia_pago = trim(p_referencia)
  where codigo_seguimiento = upper(trim(p_codigo))
    and estado_pago = 'por_verificar';
end;
$$;

-- ------------------------------------------------------------
-- 8. FUNCION: verificar pago (solo admin)
-- ------------------------------------------------------------
create or replace function public.verificar_pago(
  p_pedido_id uuid,
  p_estado public.estado_pago,
  p_referencia text
) returns void language plpgsql security definer as $$
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;
  update public.pedidos
  set estado_pago = p_estado,
      referencia_pago = coalesce(nullif(trim(coalesce(p_referencia, '')), ''), referencia_pago)
  where id = p_pedido_id;
end;
$$;

-- ------------------------------------------------------------
-- 9. FUNCION: registrar cobro (repartidor / admin)
-- ------------------------------------------------------------
create or replace function public.registrar_cobro(
  p_pedido_id uuid,
  p_monto numeric,
  p_metodo public.pago_method
) returns void language plpgsql security definer as $$
declare
  v_rol public.user_role := public.mi_rol();
begin
  if v_rol not in ('repartidor', 'admin') then
    raise exception 'Acceso denegado';
  end if;
  update public.pedidos
  set monto_cobrado = p_monto,
      cobrado_por = auth.uid(),
      metodo_pago = p_metodo,
      estado_pago = 'pagado'
  where id = p_pedido_id;
end;
$$;

-- ------------------------------------------------------------
-- 9. FUNCION: cancelar pedido y devolver stock (admin / cocina)
-- ------------------------------------------------------------
create or replace function public.cancelar_pedido(p_pedido_id uuid)
returns void language plpgsql security definer as $$
declare
  v_item record;
  v_rol public.user_role := public.mi_rol();
begin
  if v_rol not in ('admin', 'cocina') then
    raise exception 'Acceso denegado';
  end if;

  if exists (select 1 from public.pedidos where id = p_pedido_id and estado = 'cancelado') then
    return;
  end if;

  for v_item in select plato_id, cantidad from public.pedido_items where pedido_id = p_pedido_id
  loop
    update public.platos
    set stock = stock + v_item.cantidad,
        stock_disponible = true
    where id = v_item.plato_id;
  end loop;

  update public.pedidos set estado = 'cancelado' where id = p_pedido_id;
end;
$$;

-- ------------------------------------------------------------
-- 10. RLS
-- ------------------------------------------------------------
alter table public.configuracion enable row level security;

drop policy if exists "leer configuracion" on public.configuracion;
create policy "leer configuracion" on public.configuracion
  for select using (true);

drop policy if exists "admin configuracion" on public.configuracion;
create policy "admin configuracion" on public.configuracion
  for all using (public.es_admin());

-- Mesera ve TODA la cola (ademas de lo suyo)
drop policy if exists "mesera ve cola" on public.pedidos;
create policy "mesera ve cola" on public.pedidos
  for select using (public.mi_rol() = 'mesera');

-- Repartidor ve y actualiza solo pedidos de delivery
drop policy if exists "repartidor ve delivery" on public.pedidos;
create policy "repartidor ve delivery" on public.pedidos
  for select using (public.mi_rol() = 'repartidor' and canal = 'delivery');

drop policy if exists "repartidor actualiza delivery" on public.pedidos;
create policy "repartidor actualiza delivery" on public.pedidos
  for update using (public.mi_rol() = 'repartidor' and canal = 'delivery');

drop policy if exists "repartidor items" on public.pedido_items;
create policy "repartidor items" on public.pedido_items
  for select using (
    public.mi_rol() = 'repartidor'
    and exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.canal = 'delivery'
    )
  );

-- El menu es publico: cualquiera (cliente) puede leer los platos activos
drop policy if exists "publico lee platos" on public.platos;
create policy "publico lee platos" on public.platos
  for select using (true);

-- ------------------------------------------------------------
-- 11. PERMISOS DE EJECUCION
-- ------------------------------------------------------------
grant execute on function public.esta_abierto() to anon, authenticated;
grant execute on function public.crear_pedido_cliente(text, text, text, public.canal_pedido, public.pago_method, text, jsonb) to anon, authenticated;
grant execute on function public.consultar_pedido_cliente(text) to anon, authenticated;
grant execute on function public.adjuntar_referencia(text, text) to anon, authenticated;
grant execute on function public.verificar_pago(uuid, public.estado_pago, text) to authenticated;
grant execute on function public.registrar_cobro(uuid, numeric, public.pago_method) to authenticated;
grant execute on function public.cancelar_pedido(uuid) to authenticated;

-- ============================================================
-- FIN 0003
-- ============================================================
