-- ============================================================
-- 0009: cancelar_pedido tambien para la mesera
-- ============================================================

create or replace function public.cancelar_pedido(p_pedido_id uuid)
returns void language plpgsql security definer as $$
declare
  v_item record;
  v_rol public.user_role := public.mi_rol();
begin
  if v_rol not in ('admin', 'cocina', 'mesera') then
    raise exception 'Acceso denegado';
  end if;

  if exists (select 1 from public.pedidos where id = p_pedido_id and estado = 'cancelado') then
    return;
  end if;

  -- devolver stock
  for v_item in select plato_id, cantidad from public.pedido_items where pedido_id = p_pedido_id
  loop
    if v_item.plato_id is not null then
      update public.platos
      set stock = stock + v_item.cantidad, stock_disponible = true
      where id = v_item.plato_id;
    end if;
  end loop;

  update public.pedidos set estado = 'cancelado' where id = p_pedido_id;

  insert into public.pedido_logs (pedido_id, accion, usuario_id)
  values (p_pedido_id, 'cancelar', auth.uid());
end;
$$;

grant execute on function public.cancelar_pedido(uuid) to authenticated;
