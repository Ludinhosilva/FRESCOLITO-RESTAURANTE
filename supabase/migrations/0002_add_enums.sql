-- ============================================================
-- 0002: Nuevos valores de enum
-- Se separa en su propio archivo porque PostgreSQL no permite
-- usar un valor de enum nuevo dentro de la misma transaccion.
-- ============================================================

alter type public.user_role add value if not exists 'repartidor';
alter type public.order_status add value if not exists 'en_camino';
