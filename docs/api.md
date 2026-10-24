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
- `GET /api/admin/reports/summary`

Las operaciones financieras, de asignacion y cambio de estado aceptaran idempotencia cuando corresponda.
