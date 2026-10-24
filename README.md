# EntregaPyme

MVP web responsive de delivery B2B para negocios en Peru. Permite cotizar envios por distrito, reservar saldo, solicitar un motorizado y auditar el servicio hasta su entrega, sin mapas ni geolocalizacion.

## Estado

En construccion. La primera etapa cubre fundamentos, PostgreSQL, Prisma, autenticacion y gestion inicial de usuarios.

## Stack

- Next.js 16, React 19 y TypeScript
- Tailwind CSS
- Prisma ORM y PostgreSQL administrado en Neon
- Better Auth con sesiones persistidas
- Vercel como plataforma de despliegue
- pnpm como gestor de paquetes

## Modulos

- Autenticacion y autorizacion
- Empresas y miembros
- Motorizados
- Distritos y tarifas
- Billeteras, recargas y movimientos
- Pedidos e historial de estados
- Evidencias de entrega
- Reportes y auditoria

## Comandos

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm test
```

## Configuracion local

1. Copiar `.env.example` como `.env`.
2. Configurar una URL PostgreSQL compatible con Prisma.
3. Ejecutar las migraciones.
4. Crear el usuario administrador inicial mediante el script de semilla.

Nunca se deben versionar credenciales reales.

## Documentacion

- [Alcance y reglas](docs/alcance-mvp.md)
- [Arquitectura](docs/arquitectura.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Contrato HTTP inicial](docs/api.md)
- [Plan de implementacion](docs/plan-implementacion.md)
- [ADR-001: arquitectura y plataforma](docs/adr/001-arquitectura-plataforma.md)
- [Bitacora de desarrollo](docs/bitacora/2026-10-24-inicio.md)

## Principios

- Las reglas financieras se ejecutan dentro de transacciones.
- La interfaz orienta, pero el servidor siempre autoriza.
- Todo cambio de estado deja evidencia inmutable.
- Los importes historicos no cambian si se modifica una tarifa.
- Los commits deben ser pequenos, verificables y explicar las decisiones.
