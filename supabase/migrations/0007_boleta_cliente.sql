-- ============================================================
-- 0007: consultar_pedido_cliente incluye precios por item
--       y metodo de pago (para el comprobante del cliente)
-- ============================================================

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
    'metodo_pago', p.metodo_pago,
    'cliente_nombre', p.cliente_nombre,
    'cliente_telefono', p.cliente_telefono,
    'cliente_direccion', p.cliente_direccion,
    'subtotal', p.subtotal,
    'cargo_envases', p.cargo_envases,
    'costo_delivery', p.costo_delivery,
    'total', p.total,
    'creado_en', p.creado_en,
    'items', (
      select coalesce(
        jsonb_agg(jsonb_build_object(
          'plato', i.plato_nombre,
          'cantidad', i.cantidad,
          'precio', i.precio_unitario
        )),
        '[]'::jsonb
      )
      from public.pedido_items i
      where i.pedido_id = p.id
    )
  ) into v_result
  from public.pedidos p
  where p.codigo_seguimiento = upper(trim(p_codigo));

  return v_result;
end;
$$;

grant execute on function public.consultar_pedido_cliente(text) to anon, authenticated;
