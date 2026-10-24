# Evidencia: aceptacion de pedido por motorizado

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `e3ed2dc`

## Objetivo

Comprobar que un motorizado aprobado puede consultar pedidos pendientes, aceptar uno y que este deja de estar disponible para otros.

## Resultado

- Inicio de sesion del motorizado demo: correcto.
- Pedidos disponibles antes: `1`.
- Pedido aceptado: `EP-91C6C9D88F`.
- Estado final: `ACCEPTED`.
- Pago fijo al motorizado: `S/ 12.00`.
- El pedido desaparecio de la bandeja disponible: si.
- Pedidos disponibles despues: `0`.
- Reintento del mismo motorizado: `200`, mismo pedido y estado, sin duplicar la asignacion.

## Proteccion de concurrencia

La API ejecuta la asignacion en una transaccion serializable y actualiza solamente cuando el pedido sigue en `PENDING_ASSIGNMENT` y no tiene motorizado. Un competidor tardio recibe conflicto y debe actualizar su bandeja.
