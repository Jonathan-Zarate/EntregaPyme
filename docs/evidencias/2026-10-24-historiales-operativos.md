# Evidencia: historiales, movimientos y ganancias

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `8294e37`

## Empresa

- Saldo disponible: `S/ 85.00`.
- Saldo reservado: `S/ 0.00`.
- Movimientos registrados: `7`.
- Paginacion solicitada: limite `2`; elementos devueltos: `2`.
- Detalle de `EP-91C6C9D88F`: `6` eventos en la linea de tiempo.

## Motorizado

- Entregas pagadas: `1`.
- Ganancia acumulada: `S/ 12.00`.
- Servicios finalizados visibles: `2` (una entrega y una cancelacion asignada).
- La cancelacion aparece con ganancia cero y no incrementa el acumulado.

## Aislamiento

- El motorizado pudo consultar el pedido entregado que le fue asignado.
- Consultar un pedido cancelado que nunca le fue asignado respondio HTTP `404`.

Durante la primera ejecucion un login devolvio HTTP `500` de forma transitoria; el diagnostico inmediato obtuvo `200` para ambas cuentas y la repeticion completa termino correctamente. Se conserva como insumo para las pruebas posteriores de resiliencia.
