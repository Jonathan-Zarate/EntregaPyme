# Evidencia fotografica en produccion

Fecha: 2026-10-25 (America/Lima)

## Infraestructura

- Proveedor: Vercel Blob.
- Almacen: `entrega-pyme-evidence`.
- Acceso: privado.
- Region: `gru1`.
- Variable `BLOB_READ_WRITE_TOKEN`: cifrada en Production, Preview y Development.

No se registraron tokens, cookies, contrasenas ni URLs privadas completas en esta evidencia.

## Caso controlado

Se genero una imagen sintetica con el texto `EVIDENCIA DEMO`, sin personas ni datos personales. Se creo el pedido demo `EP-3A3C29DB2E`, se asigno al motorizado aprobado y se avanzo ordenadamente hasta `HEADING_TO_DESTINATION`.

## Verificaciones

- Emision del token temporal para el motorizado asignado: `200`.
- Formato cargado: PNG.
- Ubicacion: Blob privado con path exclusivo del pedido y sufijo aleatorio.
- Registro en PostgreSQL: tipo `PHOTO`.
- Validacion de host privado autorizado: correcta.
- Transicion final luego de registrar la fotografia: `DELIVERED`.
- Evidencias asociadas al pedido: `1`.
- Eventos auditados en la linea de tiempo: `6`.

## Controles implementados

- Solo motorizados aprobados y asignados al pedido pueden solicitar un token.
- El pedido debe estar en un estado operativo activo.
- Solo se permiten JPEG, PNG y WebP de hasta 5 MB.
- La URL debe pertenecer a Vercel Blob y al path exacto del pedido.
- El binario no se almacena en PostgreSQL.

## Resultado

La carga, persistencia, vinculacion y uso de evidencia fotografica quedaron operativos en produccion.
