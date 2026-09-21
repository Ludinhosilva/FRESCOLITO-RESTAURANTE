-- ============================================================
-- 0004: Reporte de ventas por rango de fechas (solo admin)
-- ============================================================

create or replace function public.ventas_rango(
  p_desde date,
  p_hasta date
) returns jsonb
language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  select jsonb_build_object(
    'desde', p_desde,
    'hasta', p_hasta,
    'total_vendido', (
      select coalesce(sum(ped.total), 0) from public.pedidos ped
      where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
        and ped.estado <> 'cancelado'
    ),
    'num_pedidos', (
      select count(*) from public.pedidos ped
      where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
        and ped.estado <> 'cancelado'
    ),
    'por_metodo', (
      select coalesce(jsonb_object_agg(metodo, total), '{}'::jsonb)
      from (
        select metodo_pago as metodo, sum(total) as total
        from public.pedidos ped
        where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
          and ped.estado <> 'cancelado'
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
        where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
          and ped.estado <> 'cancelado'
        group by pi.plato_nombre
        order by total desc
      ) x
    ),
    'por_canal', (
      select coalesce(jsonb_object_agg(canal, total), '{}'::jsonb)
      from (
        select ped.canal::text as canal, sum(total) as total
        from public.pedidos ped
        where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
          and ped.estado <> 'cancelado'
        group by ped.canal
      ) t
    ),
    'por_dia', (
      select coalesce(jsonb_agg(row_to_json(x) order by x.dia), '[]'::jsonb)
      from (
        select ped.dia, count(*) as pedidos, sum(ped.total) as total
        from public.pedidos ped
        where ped.dia between to_char(p_desde, 'YYYY-MM-DD') and to_char(p_hasta, 'YYYY-MM-DD')
          and ped.estado <> 'cancelado'
        group by ped.dia
      ) x
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.ventas_rango(date, date) to authenticated;
