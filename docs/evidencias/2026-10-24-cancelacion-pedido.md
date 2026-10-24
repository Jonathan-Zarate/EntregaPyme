# Evidencia: cancelacion y liberacion de saldo

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `a55c78a`

## Caso exitoso

- Pedido: `EP-D9BFD9CB16`.
- Estado despues de confirmar: `PENDING_ASSIGNMENT`.
- Saldo antes: disponible `S/ 85.00`, reservado `S/ 0.00`.
- Saldo durante la reserva: disponible `S/ 70.00`, reservado `S/ 15.00`.
- Estado final: `CANCELLED`.
- Saldo final: disponible `S/ 85.00`, reservado `S/ 0.00`.
- Reintento con la misma `Idempotency-Key`: `CANCELLED`, sin segunda devolucion.

## Caso rechazado

Se intento cancelar el pedido entregado `EP-91C6C9D88F`. La API respondio HTTP `409` porque una empresa no puede cancelar ordinariamente desde `PICKED_UP` en adelante.

La cancelacion, liberacion de la reserva, transaccion de billetera y evento de estado se ejecutan atomicamente.
