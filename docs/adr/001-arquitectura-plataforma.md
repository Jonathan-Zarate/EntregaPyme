# ADR-001: arquitectura y plataforma

- Estado: aceptado
- Fecha: 2026-10-24

## Contexto

El MVP debe ser economico, responsive y seguro para manejar saldos y asignaciones concurrentes.

## Alternativas

### Monolito Next.js vs. frontend y API separados

Separar servicios duplica configuracion, despliegues y observabilidad. Se elige un monolito modular para reducir costo y tiempo sin mezclar dominios internamente.

### Neon vs. Supabase vs. PostgreSQL autogestionado

Supabase agrega servicios que el MVP no necesita todavia. Autogestionar PostgreSQL exige operaciones y copias de seguridad. Se elige Neon por PostgreSQL administrado, pooling, branching y nivel gratuito.

### Better Auth vs. autenticacion propia

La autenticacion propia aumenta el riesgo de errores de contrasenas, cookies y sesiones. Se elige Better Auth con Prisma y sesiones persistidas. La autorizacion del dominio permanece en nuestra capa de acceso a datos.

### Sesion persistida vs. JWT con rol embebido

Un JWT con rol puede mantener permisos obsoletos hasta expirar. La sesion persistida permite aplicar bloqueos y cambios desde el servidor de forma inmediata.

## Decision

Next.js App Router, TypeScript, Tailwind, Prisma, Better Auth, Neon y Vercel dentro de un monolito modular.

## Consecuencias

- Menor costo y una sola unidad de despliegue.
- Transacciones financieras y de asignacion en PostgreSQL.
- Dependencia inicial del runtime serverless de Vercel.
- Un modulo podra extraerse cuando exista una necesidad medida.
