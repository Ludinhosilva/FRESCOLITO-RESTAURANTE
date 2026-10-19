-- ============================================================
-- 0018: Endurecimiento de seguridad
--   1. search_path seguro ('') en todas las funciones security definer
--      (evita hijacking de search_path por objetos maliciosos en public).
--   2. Codigo de seguimiento mas largo (12 hex = 48 bits) en
--      crear_pedido_cliente (antes 8 hex = 32 bits, factible de forzar).
--   3. Constrains CHECK de longitud en reclamaciones y pedidos
--      (defensa en profundidad contra payloads gigantes; NOT VALID
--       para no bloquear filas existentes).
-- ADITIVO. Aplicar con: supabase db push  (o SQL Editor).
-- ============================================================

-- ------------------------------------------------------------
-- 1. search_path seguro en funciones security definer
--    (pg_catalog siempre se busca de forma implicita; el resto se
--     referencia con esquema explicito public./auth./extensions.)
-- ------------------------------------------------------------
alter function public.siguiente_numero_orden(text) set search_path = '';
alter function public.crear_pedido(int, public.pago_method, boolean, text, jsonb) set search_path = '';
alter function public.ventas_del_dia(text) set search_path = '';
alter function public.es_admin() set search_path = '';
alter function public.mi_rol() set search_path = '';
alter function public.esta_abierto() set search_path = '';
alter function public.consultar_pedido_cliente(text) set search_path = '';
alter function public.adjuntar_referencia(text, text) set search_path = '';
alter function public.verificar_pago(uuid, public.estado_pago, text) set search_path = '';
alter function public.registrar_cobro(uuid, numeric, public.pago_method) set search_path = '';
alter function public.cancelar_pedido(uuid) set search_path = '';
alter function public.ventas_rango(date, date) set search_path = '';
alter function public.cobrar_mesa(uuid, public.pago_method, numeric) set search_path = '';
alter function public.editar_pedido(uuid, jsonb, public.pago_method, public.order_status, public.estado_pago, numeric, text, numeric, text) set search_path = '';
alter function public.eliminar_plato(int) set search_path = '';
alter function public.monitoreo() set search_path = '';
alter function public._recalcular_total(uuid) set search_path = '';
alter function public.mover_items(uuid, int, uuid[]) set search_path = '';
alter function public.unir_mesas(uuid, int[]) set search_path = '';
alter function public.separar_mesa(uuid, int) set search_path = '';
alter function public.mover_mesa(int, int, int) set search_path = '';

-- ------------------------------------------------------------
-- 2. crear_pedido_cliente: codigo de seguimiento 12 hex (48 bits)
--    y search_path seguro. gen_random_uuid() se califica para que
--    siga resolviendo con search_path = ''.
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
language plpgsql
security definer
set search_path = ''
as $$
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
  v_codigo := upper(substr(md5(pg_catalog.gen_random_uuid()::text), 1, 12));

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

grant execute on function public.crear_pedido_cliente(text, text, text, public.canal_pedido, public.pago_method, text, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Constrains CHECK de longitud (defensa en profundidad)
--    NOT VALID: no valida filas existentes, si aplica a las nuevas.
-- ------------------------------------------------------------
alter table public.reclamaciones
  add constraint reclamaciones_nombre_len check (char_length(nombre) between 2 and 100) not valid,
  add constraint reclamaciones_dni_len check (char_length(dni) between 6 and 20) not valid,
  add constraint reclamaciones_email_len check (char_length(email) between 5 and 120) not valid,
  add constraint reclamaciones_telefono_len check (telefono is null or char_length(telefono) <= 20) not valid,
  add constraint reclamaciones_domicilio_len check (domicilio is null or char_length(domicilio) <= 200) not valid,
  add constraint reclamaciones_detalle_len check (char_length(detalle) between 5 and 2000) not valid,
  add constraint reclamaciones_pedido_len check (pedido is null or char_length(pedido) <= 100) not valid;

alter table public.pedidos
  add constraint pedidos_cliente_nombre_len check (cliente_nombre is null or char_length(cliente_nombre) <= 80) not valid,
  add constraint pedidos_cliente_telefono_len check (cliente_telefono is null or char_length(cliente_telefono) <= 20) not valid,
  add constraint pedidos_cliente_direccion_len check (cliente_direccion is null or char_length(cliente_direccion) <= 200) not valid,
  add constraint pedidos_notas_len check (notas is null or char_length(notas) <= 300) not valid,
  add constraint pedidos_referencia_pago_len check (referencia_pago is null or char_length(referencia_pago) <= 100) not valid,
  add constraint pedidos_codigo_seguimiento_len check (codigo_seguimiento is null or char_length(codigo_seguimiento) between 6 and 12) not valid;

-- ============================================================
-- Notas:
-- - Rate limiting a nivel de IP para los endpoints publicos
--   (consultar_pedido_cliente, adjuntar_referencia, reclamaciones)
--   se recomienda implementarlo con una Edge Function / PostgREST
--   o un WAF; el codigo de 12 hex ya hace inviable el brute-force.
-- ============================================================
