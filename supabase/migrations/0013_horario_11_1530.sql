-- ============================================================
-- 0013: Alinear el horario de la BD con el sitio (11:00 - 15:30)
-- ------------------------------------------------------------
-- El frontend muestra/valida 11:00 AM - 3:30 PM (horas fijas,
-- solo los dias son configurables). El seed original de 0003
-- quedo en 11:30 - 15:20, causando que el sitio dijera "Abierto"
-- mientras crear_pedido_cliente rechazaba el pedido.
-- Aqui se actualizan solo apertura/cierre, conservando los dias.
-- ============================================================

update public.configuracion
set valor = jsonb_set(
      jsonb_set(valor, '{apertura}', '"11:00"'),
      '{cierre}', '"15:30"'
    ),
    actualizado_en = now()
where clave = 'horario';

-- Si por alguna razon no existiera la fila, se crea con valores por defecto.
insert into public.configuracion (clave, valor)
values ('horario', '{"dias":[1,2,3,4,5],"apertura":"11:00","cierre":"15:30"}')
on conflict (clave) do nothing;

-- ============================================================
-- FIN 0013
-- ============================================================
