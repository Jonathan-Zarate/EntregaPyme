# Contrato HTTP inicial

Los errores usaran una forma estable:

```json
{
  "error": {
    "code": "SALDO_INSUFICIENTE",
    "message": "El saldo disponible no cubre el pedido.",
    "requestId": "..."
  }
}
```

## Autenticacion

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/auth/get-session`

## Empresa y finanzas

- `GET|POST|PATCH /api/companies/current`
- `GET /api/wallet`
- `GET /api/wallet/transactions`
- `POST /api/top-ups`

## Cotizacion y pedidos

- `POST /api/quotes`
- `GET|POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders/:id/confirm`
- `POST /api/orders/:id/cancel`

## Motorizado

- `GET|PATCH /api/courier/profile`
- `POST /api/courier/profile` convierte de forma segura una cuenta nueva sin negocio en una postulacion `PENDING`.
- `GET /api/courier/available-orders`
- `POST /api/orders/:id/accept`
- `POST /api/orders/:id/reject`
- `POST /api/orders/:id/status`
- `POST /api/orders/:id/evidence`
- `GET /api/courier/services`
- `GET /api/courier/earnings`

## Administracion

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/couriers`
- `POST /api/admin/couriers/:id/approve`
- `POST /api/admin/couriers/:id/block`
- `GET|POST /api/admin/rates`
- `PATCH /api/admin/rates/:id`
- `GET /api/admin/top-ups`
- `POST /api/admin/top-ups/:id/approve`
- `POST /api/admin/top-ups/:id/reject`
- `POST /api/admin/orders/:id/assign`
- `GET /api/admin/orders` acepta `status`, `search`, `page` y `limit`.
- `GET /api/admin/orders/:id` devuelve datos, evidencias y linea de tiempo.
- `GET /api/admin/reports/summary`

Las operaciones financieras, de asignacion y cambio de estado aceptaran idempotencia cuando corresponda.

La aceptacion de un pedido usa una transaccion serializable y una actualizacion condicional. Si dos motorizados intentan aceptar el mismo pedido, uno obtiene `200` y el otro recibe `409 PEDIDO_YA_ASIGNADO` o `409 CONCURRENCIA_DETECTADA`.

Los estados operativos avanzan en orden, sin saltos. `DELIVERED` requiere evidencia previa e `Idempotency-Key`; al completarse, el saldo reservado se captura definitivamente dentro de la misma transaccion.

La empresa puede cancelar hasta `HEADING_TO_PICKUP`. Los pedidos confirmados liberan la reserva a saldo disponible de forma atomica; desde `PICKED_UP`, la cancelacion ordinaria se rechaza.

Aprobar un motorizado habilita su cuenta y perfil. Bloquearlo exige motivo, bloquea ambos registros, revoca todas sus sesiones y deja auditoria del administrador responsable.

Las tarifas se versionan: actualizar cierra la version activa y crea otra. Los pedidos mantienen la referencia e importes originales. PostgreSQL impide dos tarifas activas para una misma ruta.

La asignacion manual usa la misma condicion atomica que la aceptacion: solo opera sobre `PENDING_ASSIGNMENT` sin motorizado. Registra al administrador en `assignedById`, el evento de estado y la auditoria.
