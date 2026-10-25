# Decisiones pendientes

Estas decisiones requieren validacion del responsable del producto antes de implementarse.

## Politica de cancelacion despues del recojo

Alternativas:

1. Cobrar el servicio completo.
2. Cobrar una penalidad configurable.
3. Resolver cada caso manualmente.

Para el MVP se mantiene bloqueada la cancelacion ordinaria despues de `PICKED_UP`; un administrador resolvera la incidencia y dejara auditoria.

## Alcance geografico inicial

Debe definirse la ciudad y lista de distritos iniciales antes de cargar tarifas. El modelo soporta departamento, provincia, distrito y ubigeo.

## Aprobacion de motorizados

Falta confirmar los documentos obligatorios, su vigencia y si se almacenaran archivos o solo datos de verificacion.

## Evidencias

Se eligio Vercel Blob privado por su integracion con el despliegue actual. El navegador carga directamente JPEG, PNG o WebP de hasta 5 MB mediante un token temporal autorizado por pedido; PostgreSQL conserva solo la URL y metadatos, nunca el binario.

## Notificaciones

En el MVP se generaran textos y enlaces para compartir manualmente por WhatsApp. La API oficial y los mensajes automaticos quedan fuera hasta validar volumen y costo.
