# EntregaPyme

MVP web responsive de delivery B2B para negocios en Peru. Permite cotizar envios por distrito, reservar saldo, solicitar un motorizado y auditar el servicio hasta su entrega, sin mapas ni geolocalizacion.

## Estado

MVP funcional desplegado y verificado de extremo a extremo. Incluye operacion por roles, saldo transaccional, tarifas versionadas, concurrencia, evidencia fotografica privada, reportes y pruebas productivas reproducibles.

## Demo

- Aplicacion: https://entrega-pyme.vercel.app
- Base de datos: PostgreSQL administrado en Neon, region AWS South America East 1 (Sao Paulo)
- Despliegue: Vercel conectado a la rama `main` de GitHub

El acceso administrativo se valida con credenciales bootstrap almacenadas solo en el entorno local y nunca dentro del repositorio.

## Stack

- Next.js 16, React 19 y TypeScript
- Tailwind CSS
- Prisma ORM y PostgreSQL administrado en Neon
- Better Auth con sesiones persistidas
- Vercel como plataforma de despliegue
- Vercel Blob privado para evidencias fotograficas
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
- Notificaciones manuales mediante enlaces de WhatsApp

## Comandos

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm test
pnpm smoke:production
pnpm quality:production
```

## Configuracion local

1. Copiar `.env.example` como `.env`.
2. Configurar una URL PostgreSQL compatible con Prisma.
3. Ejecutar las migraciones.
4. Crear el usuario administrador inicial mediante el script de semilla.
5. Crear un Blob Store privado y configurar `BLOB_READ_WRITE_TOKEN` para habilitar fotografias.

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

Nunca se deben versionar credenciales reales.

## Documentacion

- [Alcance y reglas](docs/alcance-mvp.md)
- [Arquitectura](docs/arquitectura.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Contrato HTTP inicial](docs/api.md)
- [Plan de implementacion](docs/plan-implementacion.md)
- [ADR-001: arquitectura y plataforma](docs/adr/001-arquitectura-plataforma.md)
- [Bitacora de desarrollo](docs/bitacora/2026-10-24-inicio.md)
- [Manual por rol](docs/manual-por-rol.md)
- [Checklist de despliegue](docs/checklist-despliegue.md)
- [Evidencias productivas](docs/evidencias)

## Estado de calidad

- 32 pruebas unitarias aprobadas.
- Smoke productivo del flujo financiero.
- Demo web completa Empresa -> Administrador -> Motorizado -> Entrega.
- Autorizacion cruzada, concurrencia y carga moderada automatizadas.
- Ultima linea base: 100 lecturas, concurrencia 10, cero errores y p95 de 2264 ms.

## Limites conocidos

- La verificacion real de correo queda desactivada hasta configurar Resend y un dominio remitente.
- Falta configurar rate limiting distribuido o proteccion equivalente en Vercel antes de trafico comercial.
- Las decisiones sobre cancelacion posterior al recojo, documentos y responsabilidad requieren validacion comercial.

## Principios

- Las reglas financieras se ejecutan dentro de transacciones.
- La interfaz orienta, pero el servidor siempre autoriza.
- Todo cambio de estado deja evidencia inmutable.
- Los importes historicos no cambian si se modifica una tarifa.
- Los commits deben ser pequenos, verificables y explicar las decisiones.
