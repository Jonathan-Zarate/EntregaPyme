# Manual por rol

Aplicacion: https://entrega-pyme.vercel.app

## Empresa

1. Inicia sesion y completa el perfil del negocio si es la primera vez.
2. Registra una recarga con su codigo de operacion y espera aprobacion administrativa.
3. Completa recojo, entrega, destinatario y paquete; selecciona `Cotizar delivery`.
4. Revisa la tarifa fija y confirma. El importe pasa de saldo disponible a reservado.
5. Consulta responsables, evidencias y linea de tiempo en `Pedidos`.
6. Usa `Notificaciones` para abrir un mensaje preparado; el envio por WhatsApp siempre requiere confirmacion humana.
7. Puede cancelar antes de `PICKED_UP`; el saldo reservado se libera automaticamente.

## Motorizado

1. Registra su postulacion y espera aprobacion administrativa.
2. Revisa pago, recojo, entrega y paquete antes de aceptar un servicio disponible.
3. Avanza sin saltos: aceptado, camino al recojo, recogido y camino al destino.
4. Antes de finalizar, registra un comentario o una fotografia JPEG/PNG/WebP de hasta 5 MB.
5. Finaliza la entrega y consulta servicios y ganancias en `Historial y ganancias`.

## Administrador

1. Revisa, aprueba o bloquea motorizados.
2. Mantiene tarifas por distrito; cada cambio crea una version historica.
3. Aprueba o rechaza recargas manuales.
4. Consulta pedidos y asigna manualmente los pendientes.
5. Accede a `/admin/reportes`, filtra por fecha y exporta CSV.

## Reglas operativas visibles

- El motorizado nunca modifica la tarifa.
- Solo una aceptacion o asignacion puede ganar una carrera concurrente.
- `DELIVERED` exige evidencia.
- Los roles y la propiedad del recurso se validan en el servidor.
- Las direcciones y evidencias no se publican en enlaces abiertos.
