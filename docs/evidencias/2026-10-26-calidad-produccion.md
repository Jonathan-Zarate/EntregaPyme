# Calidad, seguridad y concurrencia en produccion

Fecha: 2026-10-26 (America/Lima)

Comando reproducible:

```bash
pnpm quality:production
```

El comando utiliza credenciales demo locales ignoradas por Git. No imprime correos, contrasenas, cookies ni tokens.

## Autorizacion

- Acceso anonimo a reporte administrativo: `401`.
- Empresa intentando consultar reporte administrativo: `403`.
- Motorizado intentando consultar billetera empresarial: `403`.
- Administrador intentando consultar billetera empresarial: `403`.
- Paginacion con `limit=101`: `422`.

## Concurrencia

Se creo y confirmo el pedido reversible `EP-44F0D8AC56`. La aceptacion del motorizado y la asignacion del administrador se ejecutaron simultaneamente:

- Operacion ganadora: `200`.
- Operacion perdedora: `409`.
- Asignaciones duplicadas: `0`.
- Estado final de limpieza: `CANCELLED`.
- Reserva devuelta a saldo disponible: correcta.

La prueba confirma la condicion atomica sobre `PENDING_ASSIGNMENT` y no depende solamente de comprobaciones previas en la aplicacion.

## Carga moderada

Endpoint: `GET /api/courier/earnings` autenticado.

- Solicitudes: `100`.
- Concurrencia: `10`.
- Errores: `0`.
- p50: `725 ms`.
- p95: `2264 ms`.
- Maximo: `2633 ms`.
- Umbral p95: menor a `3000 ms`.
- Umbral maximo: menor a `5000 ms`.

Esta medicion es una linea base controlada, no una prueba de saturacion ni una afirmacion sobre capacidad maxima.

## Riesgo pendiente

La aplicacion valida roles, estado del usuario, limites de entrada e idempotencia, pero no tiene un rate limiter distribuido propio. Antes de exponer registro y autenticacion a trafico comercial se debe configurar proteccion de bots/rate limiting en Vercel o incorporar un contador distribuido. Un limite en memoria no seria confiable en funciones serverless.

## Resultado

Autorizacion cruzada, limites, concurrencia y carga moderada quedaron automatizados y comprobados contra produccion.
