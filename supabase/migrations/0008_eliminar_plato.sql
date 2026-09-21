-- ============================================================
-- 0008: Eliminar platos (admin) preservando el historial
-- ============================================================

-- 1. Permitir borrar platos sin romper pedidos historicos:
--    pedido_items.plato_id nullable + ON DELETE SET NULL
alter table public.pedido_items drop constraint if exists pedido_items_plato_id_fkey;
alter table public.pedido_items alter column plato_id drop not null;
alter table public.pedido_items
  add constraint pedido_items_plato_id_fkey
  foreign key (plato_id) references public.platos(id) on delete set null;

-- 2. Funcion para eliminar un plato (solo admin)
create or replace function public.eliminar_plato(p_plato_id int)
returns void language plpgsql security definer as $$
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado: solo administracion';
  end if;
  delete from public.platos where id = p_plato_id;
end;
$$;

grant execute on function public.eliminar_plato(int) to authenticated;
