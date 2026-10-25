# Evidencia de reportes en produccion

Fecha: 2026-10-25 18:18 (America/Lima)

## Alcance

Se verifico el despliegue del commit `dd143ae` en Vercel contra la base administrada en Neon.

## Seguridad

- `GET /api/admin/reports/summary` sin sesion: `401`.
- Inicio de sesion con el usuario administrador demo: `200`.
- No se registraron correos, contrasenas, cookies ni tokens en esta evidencia.

## Resumen anual 2026

- Pedidos entregados: `1`.
- Ingresos capturados: `S/ 15.00`.
- Pago a motorizados: `S/ 12.00`.
- Margen bruto: `S/ 3.00`.
- Recargas aprobadas: `S/ 100.00`.
- Empresas activas: `1`.
- Motorizados aprobados: `1`.

Las cifras financieras consideran exclusivamente pedidos `DELIVERED` y coinciden con el flujo productivo ejecutado previamente.

## Exportacion

- `GET /api/admin/reports/orders.csv`: `200`.
- Tipo: `text/csv; charset=utf-8`.
- Disposicion: archivo adjunto `pedidos-2026-10-25.csv`.
- Contenido: cabecera y tres pedidos dentro del rango solicitado.

## Resultado

El reporte administrativo, la autorizacion y la exportacion CSV quedaron operativos en produccion.
