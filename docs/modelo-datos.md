# Modelo de datos

## Identidad y actores

- `User`: identidad, rol global, estado y datos basicos.
- `Session`, `Account`, `Verification`: autenticacion administrada por Better Auth.
- `Company`: negocio identificado por RUC.
- `CompanyMember`: relacion de usuarios con empresas.
- `CourierProfile`: datos del motorizado y flujo de aprobacion.

## Configuracion

- `District`: distrito activo dentro de provincia y departamento.
- `DeliveryRate`: par origen-destino, precio empresa y pago motorizado.

## Finanzas

- `Wallet`: una billetera por empresa con saldo disponible y reservado.
- `WalletTransaction`: libro mayor inmutable.
- `TopUp`: solicitud y revision de recarga manual.

Movimientos: `TOP_UP`, `RESERVE`, `RELEASE`, `CAPTURE` y `ADJUSTMENT`. Cada movimiento mutable soporta una clave de idempotencia unica.

## Pedido

- `DeliveryOrder`: direcciones, destinatario, paquete, importes y estado actual.
- `OrderOffer`: oferta o rechazo por motorizado.
- `OrderStatusEvent`: historial inmutable.
- `DeliveryEvidence`: fotografia o comentario de entrega.

```text
PENDING_ASSIGNMENT
        |
        v
ACCEPTED -> HEADING_TO_PICKUP -> PICKED_UP -> HEADING_TO_DESTINATION -> DELIVERED
   |                |
   +---- CANCELLED <-+
```

No existe transicion ordinaria a `CANCELLED` despues de `PICKED_UP`.

## Restricciones esenciales

- RUC unico y una billetera por empresa.
- Importes mayores o iguales a cero.
- `precioEmpresa >= pagoMotorizado` para el MVP.
- Un pedido tiene como maximo un motorizado asignado.
- La entrega requiere evidencia del motorizado asignado.
- No se permite reservar mas saldo del disponible.
