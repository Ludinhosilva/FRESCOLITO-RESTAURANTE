-- ============================================================
-- FRESCOLITO RESTAURANTE - Sistema de Gestion
-- Esquema Supabase (PostgreSQL)
-- Uso: pegar en Supabase > SQL Editor > Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. TIPOS ENUM
-- ------------------------------------------------------------
create type public.user_role as enum ('mesera', 'cocina', 'admin');
create type public.order_status as enum ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado');
create type public.item_status as enum ('en_preparacion', 'listo');
create type public.pago_method as enum ('efectivo', 'yape', 'plin');
create type public.reserva_status as enum ('pendiente', 'confirmada', 'cancelada');

-- ------------------------------------------------------------
-- 2. TABLAS
-- ------------------------------------------------------------

-- Perfil de usuario vinculado a Supabase Auth
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol public.user_role not null default 'mesera',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Mesas del restaurante
create table public.mesas (
  id serial primary key,
  numero int not null unique,
  nombre text default 'Mesa'
);

-- Platos del menu
create table public.platos (
  id serial primary key,
  nombre text not null unique,
  categoria text not null,           -- 'Platos Marinos' | 'A la Carta'
  precio numeric(10,2) not null check (precio >= 0),
  stock int not null default 0 check (stock >= 0),
  stock_disponible boolean not null default true,
  activo boolean not null default true,
  incluye_refresco boolean not null default false,
  creado_en timestamptz not null default now()
);

-- Pedidos (cabecera)
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_orden int not null,          -- reinicia por dia (ver secuencia)
  dia text not null,                  -- 'YYYY-MM-DD' para reinicio diario de numeracion
  mesa_id int references public.mesas(id) on delete set null,
  mesera_id uuid references public.usuarios(id) on delete set null,
  estado public.order_status not null default 'pendiente',
  metodo_pago public.pago_method not null default 'efectivo',
  para_llevar boolean not null default false,
  comision_llevar numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (dia, numero_orden)
);

-- Items de cada pedido
create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  plato_id int not null references public.platos(id),
  plato_nombre text not null,
  cantidad int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  estado public.item_status not null default 'en_preparacion',
  actualizado_en timestamptz not null default now()
);

-- Reservas de mesa
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  telefono text,
  mesa_id int references public.mesas(id) on delete set null,
  fecha date not null,
  hora time not null,
  personas int not null check (personas > 0),
  estado public.reserva_status not null default 'pendiente',
  creado_en timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. FUNCION: numero de orden secuencial que reinicia por dia
--    Usa un contador diario en una tabla auxiliar.
-- ------------------------------------------------------------
create table if not exists public.orden_contador (
  dia text primary key,
  ultimo int not null default 0
);

create or replace function public.siguiente_numero_orden(p_dia text)
returns int language plpgsql security definer as $$
declare
  n int;
begin
  insert into public.orden_contador (dia, ultimo)
  values (p_dia, 1)
  on conflict (dia) do update set ultimo = public.orden_contador.ultimo + 1
  returning ultimo into n;
  return n;
end;
$$;

-- ------------------------------------------------------------
-- 4. FUNCION: crear pedido con items, descuento de stock y calculo total
--    (llamada via RPC desde la app)
-- ------------------------------------------------------------
create or replace function public.crear_pedido(
  p_mesa_id int,
  p_metodo_pago public.pago_method,
  p_para_llevar boolean,
  p_notas text,
  p_items jsonb  -- [{plato_id, cantidad}]
) returns public.pedidos
language plpgsql security definer as $$
declare
  v_pedido public.pedidos;
  v_item jsonb;
  v_plato public.platos;
  v_subtotal numeric(10,2) := 0;
  v_comision numeric(10,2) := 0;
  v_dia text := to_char(now(), 'YYYY-MM-DD');
  v_num int;
  v_total_items int := 0;
begin
  -- Solo usuarios autenticados pueden crear pedidos
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  -- verificar stock de cada plato
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato
    from public.platos
    where id = (v_item->>'plato_id')::int;

    if not found then
      raise exception 'Plato % no existe', (v_item->>'plato_id')::int;
    end if;

    if not v_plato.stock_disponible or v_plato.stock < (v_item->>'cantidad')::int then
      raise exception 'Stock insuficiente para %', v_plato.nombre;
    end if;

    v_subtotal := v_subtotal + (v_plato.precio * (v_item->>'cantidad')::int);
    v_total_items := v_total_items + (v_item->>'cantidad')::int;
  end loop;

  -- comision para llevar (S/ 2.00 por plato)
  if p_para_llevar then
    v_comision := v_total_items * 2.00;
  end if;

  v_num := public.siguiente_numero_orden(v_dia);

  insert into public.pedidos (
    numero_orden, dia, mesa_id, mesera_id, estado, metodo_pago,
    para_llevar, comision_llevar, subtotal, total, notas
  )
  values (
    v_num, v_dia, p_mesa_id, auth.uid(), 'pendiente', p_metodo_pago,
    p_para_llevar, v_comision, v_subtotal, v_subtotal + v_comision, p_notas
  )
  returning * into v_pedido;

  -- insertar items y descontar stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_plato from public.platos where id = (v_item->>'plato_id')::int;

    insert into public.pedido_items (
      pedido_id, plato_id, plato_nombre, cantidad, precio_unitario
    )
    values (
      v_pedido.id, v_plato.id, v_plato.nombre, (v_item->>'cantidad')::int, v_plato.precio
    );

    update public.platos
    set stock = stock - (v_item->>'cantidad')::int,
        stock_disponible = (stock - (v_item->>'cantidad')::int) > 0
    where id = v_plato.id;
  end loop;

  return v_pedido;
end;
$$;

-- ------------------------------------------------------------
-- 5. FUNCION: ventas del dia (solo admin)
--    Devuelve totales y desglose por metodo de pago y por plato
-- ------------------------------------------------------------
create or replace function public.ventas_del_dia(p_dia text default to_char(now(), 'YYYY-MM-DD'))
returns jsonb
language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  -- Solo administracion puede ver ventas
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  select jsonb_build_object(
    'dia', p_dia,
    'total_vendido', (
      select coalesce(sum(ped.total), 0)
      from public.pedidos ped
      where ped.dia = p_dia and ped.estado <> 'cancelado'
    ),
    'num_pedidos', (
      select count(*) from public.pedidos ped
      where ped.dia = p_dia and ped.estado <> 'cancelado'
    ),
    'por_metodo', (
      select coalesce(jsonb_object_agg(metodo, total), '{}'::jsonb)
      from (
        select metodo_pago as metodo, sum(total) as total
        from public.pedidos ped
        where ped.dia = p_dia and ped.estado <> 'cancelado'
        group by metodo_pago
      ) t
    ),
    'por_plato', (
      select coalesce(jsonb_agg(row_to_json(x)), '[]'::jsonb)
      from (
        select pi.plato_nombre, sum(pi.cantidad) as cantidad,
               sum(pi.cantidad * pi.precio_unitario) as total
        from public.pedido_items pi
        join public.pedidos ped on ped.id = pi.pedido_id
        where ped.dia = p_dia and ped.estado <> 'cancelado'
        group by pi.plato_nombre
        order by total desc
      ) x
    ),
    'por_mesa', (
      select coalesce(jsonb_agg(row_to_json(x)), '[]'::jsonb)
      from (
        select ped.mesa_id, count(*) as pedidos, sum(ped.total) as total
        from public.pedidos ped
        where ped.dia = p_dia and ped.estado <> 'cancelado'
        group by ped.mesa_id
      ) x
    ),
    'detalle', (
      select coalesce(jsonb_agg(row_to_json(x)), '[]'::jsonb)
      from (
        select ped.id, ped.numero_orden, ped.mesa_id, ped.estado,
               ped.metodo_pago, ped.para_llevar, ped.comision_llevar,
               ped.subtotal, ped.total, ped.creado_en
        from public.pedidos ped
        where ped.dia = p_dia and ped.estado <> 'cancelado'
        order by ped.numero_orden
      ) x
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- 6. TRIGGERS
-- ------------------------------------------------------------
-- actualizar actualizado_en en pedidos
create or replace function public.touch_pedido()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger trg_pedido_touch before update on public.pedidos
for each row execute function public.touch_pedido();

create or replace function public.touch_pedido_item()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger trg_pedido_item_touch before update on public.pedido_items
for each row execute function public.touch_pedido_item();

-- ------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
alter table public.usuarios enable row level security;
alter table public.mesas enable row level security;
alter table public.platos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.reservas enable row level security;
alter table public.orden_contador enable row level security;

-- Helper: es admin
create or replace function public.es_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and u.rol = 'admin'
  );
$$;

create or replace function public.mi_rol()
returns public.user_role language sql stable security definer as $$
  select u.rol from public.usuarios u where u.id = auth.uid();
$$;

-- USUARIOS: cada uno lee su propio perfil; admin lee todos; cocina ve los nombres
drop policy if exists "leer propio perfil" on public.usuarios;
create policy "leer propio perfil" on public.usuarios
  for select using (auth.uid() = id);

drop policy if exists "admin todo usuarios" on public.usuarios;
create policy "admin todo usuarios" on public.usuarios
  for all using (public.es_admin());

-- MESAS: todos autenticados ven; admin gestiona
drop policy if exists "leer mesas" on public.mesas;
create policy "leer mesas" on public.mesas
  for select using (auth.uid() is not null);

drop policy if exists "admin mesas" on public.mesas;
create policy "admin mesas" on public.mesas
  for all using (public.es_admin());

-- PLATOS: todos autenticados ven; cocina y admin gestionan stock
drop policy if exists "leer platos" on public.platos;
create policy "leer platos" on public.platos
  for select using (auth.uid() is not null);

drop policy if exists "gestionar stock platos" on public.platos;
create policy "gestionar stock platos" on public.platos
  for update using (public.mi_rol() in ('cocina', 'admin'));

drop policy if exists "admin platos" on public.platos;
create policy "admin platos" on public.platos
  for all using (public.es_admin());

-- PEDIDOS
-- select: mesera solo sus propios; cocina/admin todos
drop policy if exists "mesera sus pedidos" on public.pedidos;
create policy "mesera sus pedidos" on public.pedidos
  for select using (public.mi_rol() = 'mesera' and mesera_id = auth.uid());

drop policy if exists "cocina y admin ven pedidos" on public.pedidos;
create policy "cocina y admin ven pedidos" on public.pedidos
  for select using (public.mi_rol() in ('cocina', 'admin'));

-- update: cocina cambia estado de items; admin todo
drop policy if exists "cocina update estado" on public.pedidos;
create policy "cocina update estado" on public.pedidos
  for update using (public.mi_rol() in ('cocina', 'admin'));

drop policy if exists "admin pedidos all" on public.pedidos;
create policy "admin pedidos all" on public.pedidos
  for all using (public.es_admin());

-- PEDIDO_ITEMS (mismas reglas que pedidos)
drop policy if exists "mesera items" on public.pedido_items;
create policy "mesera items" on public.pedido_items
  for select using (
    public.mi_rol() = 'mesera'
    and exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.mesera_id = auth.uid()
    )
  );

drop policy if exists "cocina admin items" on public.pedido_items;
create policy "cocina admin items" on public.pedido_items
  for all using (public.mi_rol() in ('cocina', 'admin'));

-- RESERVAS: todos ven/crean; admin gestiona
drop policy if exists "leer reservas" on public.reservas;
create policy "leer reservas" on public.reservas
  for select using (auth.uid() is not null);

drop policy if exists "crear reservas" on public.reservas;
create policy "crear reservas" on public.reservas
  for insert with check (auth.uid() is not null);

drop policy if exists "admin reservas" on public.reservas;
create policy "admin reservas" on public.reservas
  for all using (public.es_admin());

-- ORDEN_CONTADOR: no accesible directamente por usuarios (solo via funcion)
drop policy if exists "no acceso contador" on public.orden_contador;
create policy "no acceso contador" on public.orden_contador
  for all using (false);

-- ------------------------------------------------------------
-- 8. SEED: MESAS
-- ------------------------------------------------------------
insert into public.mesas (numero, nombre) values
  (1, 'Mesa 1'), (2, 'Mesa 2'), (3, 'Mesa 3'), (4, 'Mesa 4'),
  (5, 'Mesa 5'), (6, 'Mesa 6'), (7, 'Mesa 7'), (8, 'Mesa 8'),
  (9, 'Mesa 9'), (10, 'Mesa 10')
on conflict (numero) do nothing;

-- ------------------------------------------------------------
-- 9. SEED: PLATOS (carta actualizada)
-- ------------------------------------------------------------
insert into public.platos (nombre, categoria, precio, stock, stock_disponible, incluye_refresco) values
  -- PLATOS MARINOS
  ('Ceviche Simple 1', 'Platos Marinos', 10.00, 20, true, false),
  ('Ceviche Simple 2', 'Platos Marinos', 15.00, 20, true, false),
  ('Ceviche Simple 3', 'Platos Marinos', 20.00, 20, true, false),
  ('Ceviche Mixto', 'Platos Marinos', 25.00, 20, true, false),
  ('Chicharron de Pollo', 'Platos Marinos', 20.00, 20, true, false),
  ('Chicharron de Pescado', 'Platos Marinos', 20.00, 20, true, false),
  ('Arroz con Mariscos', 'Platos Marinos', 20.00, 20, true, false),
  ('Chaufa con Mariscos', 'Platos Marinos', 20.00, 20, true, false),
  ('Chaufa con Cecina', 'Platos Marinos', 20.00, 20, true, false),
  ('Ceviche + Chicharron', 'Platos Marinos', 25.00, 20, true, false),
  ('Ceviche + Arroz con Mariscos', 'Platos Marinos', 25.00, 20, true, false),
  ('Ceviche + Chaufa con Mariscos', 'Platos Marinos', 25.00, 20, true, false),
  ('Ceviche + Chaufa con Cecina', 'Platos Marinos', 25.00, 20, true, false),
  ('Chicharron + Arroz con Mariscos', 'Platos Marinos', 25.00, 20, true, false),
  ('Chicharron + Chaufa con Mariscos', 'Platos Marinos', 25.00, 20, true, false),
  ('Chicharron + Chaufa con Cecina', 'Platos Marinos', 25.00, 20, true, false),
  ('Trio Marino', 'Platos Marinos', 40.00, 20, true, false),
  ('Leche de Tigre', 'Platos Marinos', 15.00, 20, true, false),
  -- A LA CARTA (incluye refresco)
  ('Pollo a la Plancha', 'A la Carta', 15.00, 20, true, true),
  ('Pollo a la Plancha a lo Pobre', 'A la Carta', 15.00, 20, true, true),
  ('Tallarin Verde con Bisteck', 'A la Carta', 15.00, 20, true, true),
  ('Bisteck a lo Pobre', 'A la Carta', 15.00, 20, true, true),
  ('Lomo Saltado', 'A la Carta', 15.00, 20, true, true),
  ('Tacacho con Cecina', 'A la Carta', 15.00, 20, true, true),
  ('Causa Acevichada', 'A la Carta', 15.00, 20, true, true)
on conflict (nombre) do nothing;

-- ------------------------------------------------------------
-- 10. PERMISOS DE EJECUCION
-- ------------------------------------------------------------
grant execute on function public.crear_pedido to authenticated;
grant execute on function public.siguiente_numero_orden to authenticated;
-- ventas_del_dia y helpers se controlan via security definer + RLS interno

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================