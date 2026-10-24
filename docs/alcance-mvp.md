# Alcance del MVP

## Objetivo

Permitir que un negocio peruano cotice, confirme y siga un delivery entre dos direcciones ingresadas manualmente, y que un motorizado gestione el servicio desde una web responsive.

## Incluido

- Empresa: perfil del negocio, saldo, recargas manuales, cotizacion, pedidos e historial.
- Motorizado: perfil, aprobacion, pedidos disponibles, estados, evidencia, servicios y ganancias.
- Administrador: usuarios, empresas, motorizados, distritos, tarifas, recargas, asignaciones y reportes.

## Fuera del MVP

- Mapas, GPS, geocodificacion y distancia automatica.
- Aplicaciones Android o iOS.
- Pasarelas de pago y recargas automaticas.
- Integracion automatizada con WhatsApp.
- Optimizacion de rutas y multiples paradas.
- Facturacion electronica, promociones y precios dinamicos.

## Reglas resueltas

1. Al confirmar un pedido se mueve dinero de `disponible` a `reservado`.
2. Al entregar se liquida la reserva como cobro definitivo.
3. Una cancelacion anterior a `RECOGIDO` libera la reserva.
4. Despues de `RECOGIDO`, cualquier cierre excepcional requiere intervencion administrativa y motivo auditable.
5. La tarifa contiene precio a la empresa y pago al motorizado. Su diferencia representa el margen bruto.
6. Los valores cotizados se copian al pedido y nunca se recalculan retroactivamente.
7. La aceptacion es atomica: solo un motorizado puede obtener el pedido.
8. Todo cambio de estado registra fecha, actor, rol y observacion.
9. `ENTREGADO` exige al menos una evidencia valida.
10. Las direcciones son texto libre, pero origen y destino deben referenciar distritos activos.

## Pendientes de validacion comercial

- Politica exacta de cancelacion despues del recojo.
- Documentos requeridos para aprobar motorizados.
- Tiempo limite para aceptar pedidos.
- Responsabilidad ante perdida o dano.
- Comprobante tributario aplicable a recargas y servicios.
