-- ============================================================
-- REINICIO DE DATOS DE PRUEBA (para la inauguracion de la web)
-- ------------------------------------------------------------
-- EJECUTAR SOLO EN PRODUCCION (Supabase > SQL Editor > Run).
-- NO esta en supabase/migrations/ a proposito: es un borrado
-- destructivo de una sola vez y NO debe re-aplicarse.
--
-- Borra pedidos/ventas y datos de prueba. CONSERVA:
--   usuarios, platos (catalogo), mesas, configuracion y Storage.
-- ============================================================

-- 1. Pedidos (cascada a pedido_items y pedido_logs)
truncate table public.pedidos cascade;

-- 2. Reiniciar la numeracion diaria de ordenes (hoy volvera a #1)
truncate table public.orden_contador;

-- 3. Libro de Reclamaciones y Reservas (tambien de prueba)
truncate table public.reclamaciones restart identity;
truncate table public.reservas;

-- 4. Reiniciar stock (los platos quedan sin disponibilidad hasta cargarlo)
update public.platos set stock = 0, stock_disponible = false;

-- ============================================================
-- FIN
-- ============================================================
