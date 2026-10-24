# Arquitectura

## Estilo

Monolito modular desplegado como una aplicacion Next.js. Reduce costo operativo y conserva limites internos que permiten extraer servicios cuando exista una necesidad medida.

```text
Navegador responsive
        |
        v
Next.js App Router
  |-- UI y Server Components
  |-- Route Handlers / Server Actions
  |-- autenticacion y autorizacion
  |-- casos de uso por modulo
        |
        v
Prisma ORM
        |
        v
PostgreSQL administrado (Neon)
```

## Capas

- `app`: composicion HTTP y paginas.
- `modules`: casos de uso, validaciones y repositorios por dominio.
- `lib`: infraestructura compartida, autenticacion, base de datos y utilidades.
- `components`: componentes visuales reutilizables.
- `prisma`: esquema, migraciones y semilla.

Las rutas no contienen reglas financieras. Invocan casos de uso que ejecutan transacciones y verifican permisos.

## Seguridad

- Sesiones opacas persistidas y cookies seguras.
- Autorizacion consultada en servidor cerca del acceso a datos.
- Roles iniciales: `ADMIN`, `COMPANY`, `COURIER`.
- Bloqueo efectivo en servidor, no solo en la interfaz.
- Validacion de entrada y auditoria.
- Rate limiting antes de produccion para autenticacion, cotizacion y aceptacion.

## Concurrencia

La aceptacion de un pedido y los movimientos de saldo se ejecutan en transacciones. Las actualizaciones condicionales, restricciones unicas e idempotencia evitan doble asignacion y doble reserva.
