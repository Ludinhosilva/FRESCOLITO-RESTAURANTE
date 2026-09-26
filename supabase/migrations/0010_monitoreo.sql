-- ============================================================
-- 0010: Funcion de monitoreo de uso (solo admin)
-- ============================================================

create or replace function public.monitoreo()
returns jsonb
language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;

  select jsonb_build_object(
    'pedidos_mes', (
      select count(*) from public.pedidos
      where dia like to_char((now() at time zone 'America/Lima'), 'YYYY-MM') || '%'
        and estado <> 'cancelado'
    ),
    'pedidos_total', (select count(*) from public.pedidos),
    'items_total', (select count(*) from public.pedido_items),
    'db_bytes', pg_database_size(current_database()),
    'db_pretty', pg_size_pretty(pg_database_size(current_database())),
    'por_mes', (
      select coalesce(jsonb_agg(jsonb_build_object('mes', mes, 'pedidos', pedidos) order by mes), '[]'::jsonb)
      from (
        select to_char(to_date(dia, 'YYYY-MM-DD'), 'YYYY-MM') as mes, count(*) as pedidos
        from public.pedidos
        where estado <> 'cancelado'
        group by 1
      ) x
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.monitoreo() to authenticated;
