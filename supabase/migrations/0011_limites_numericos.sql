-- ============================================================
-- 0011: Limites numericos (red de seguridad)
-- ============================================================

-- Precio del plato: 0 .. 999.99
alter table public.platos drop constraint if exists platos_precio_check;
alter table public.platos add constraint platos_precio_check check (precio >= 0 and precio <= 999.99);

-- Stock: 0 .. 99
alter table public.platos drop constraint if exists platos_stock_check;
alter table public.platos add constraint platos_stock_check check (stock >= 0 and stock <= 99);

-- Ajuste/descuento del pedido: -999 .. 999
alter table public.pedidos drop constraint if exists pedidos_ajuste_check;
alter table public.pedidos add constraint pedidos_ajuste_check check (ajuste >= -999 and ajuste <= 999);
