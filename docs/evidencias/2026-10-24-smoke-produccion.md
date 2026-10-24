# Smoke test de produccion — 2026-10-24

## Objetivo

Comprobar el recorrido financiero real del MVP desplegado en Vercel contra PostgreSQL en Neon, utilizando exclusivamente cuentas y valores demo.

## Recorrido ejecutado

1. Inicio de sesion de una empresa demo.
2. Registro idempotente del negocio `Comercial Demo Trujillo SAC`.
3. Solicitud de recarga ficticia por S/ 100.00.
4. Inicio de sesion administrativo y aprobacion de la recarga.
5. Cotizacion entre dos distritos activos por S/ 15.00.
6. Creacion y confirmacion del pedido `EP-91C6C9D88F`.
7. Verificacion del movimiento de saldo.

## Resultado

- Estado del pedido: `PENDING_ASSIGNMENT`.
- Saldo disponible: S/ 85.00.
- Saldo reservado: S/ 15.00.
- Acceso de empresa: correcto.
- Acceso administrativo: correcto.
- Resultado general: aprobado.

Las credenciales utilizadas se mantienen en archivos locales ignorados por Git.
