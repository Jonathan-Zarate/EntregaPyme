# Checklist de despliegue

## Antes de desplegar

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Migraciones revisadas y sin secretos versionados.

## Variables Vercel

- [ ] `DATABASE_URL`
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `BLOB_READ_WRITE_TOKEN`
- [ ] Resend solo si se activa la verificacion de correo.

## Base de datos y almacenamiento

- [ ] `pnpm db:deploy`
- [ ] Semilla base ejecutada una sola vez cuando corresponda.
- [ ] Blob Store privado conectado a Production, Preview y Development.

## Verificacion posterior

- [ ] Estado de Vercel `success` para el commit entregado.
- [ ] `pnpm smoke:production`
- [ ] `pnpm quality:production`
- [ ] Login y pantalla principal de Empresa, Motorizado y Administrador.
- [ ] Evidencia productiva sin secretos en `docs/evidencias`.

## Antes de trafico comercial

- [ ] Activar rate limiting distribuido/proteccion de bots.
- [ ] Configurar y validar dominio de correo.
- [ ] Definir retencion y eliminacion de fotografias.
- [ ] Acordar cancelaciones posteriores al recojo y responsabilidad por incidencias.
- [ ] Sustituir o rotar todas las credenciales demo.
