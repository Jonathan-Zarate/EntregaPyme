# Evidencia: ciclo completo de entrega

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `f295496`

## Pedido probado

- Codigo: `EP-91C6C9D88F`.
- Secuencia ejecutada: `ACCEPTED -> HEADING_TO_PICKUP -> PICKED_UP -> HEADING_TO_DESTINATION -> DELIVERED`.
- Evidencia registrada: comentario de recepcion conforme.

## Controles comprobados

- El servidor rechazo finalizar sin evidencia con HTTP `409`.
- Despues de registrar la evidencia, la entrega finalizo correctamente.
- Repetir la finalizacion con la misma `Idempotency-Key` devolvio `DELIVERED` sin duplicar el cobro.
- El saldo reservado de la empresa termino en `S/ 0.00`.
- El saldo disponible permanecio en `S/ 85.00`; el importe ya habia sido descontado al reservar el pedido.

La transicion final, la captura de la reserva, el movimiento de billetera y el evento de estado se ejecutaron en una misma transaccion serializable.
