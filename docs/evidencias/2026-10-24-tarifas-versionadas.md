# Evidencia: tarifas versionadas

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `cd7336c`

## Ruta probada

`El Porvenir -> El Porvenir`

## Resultado

- Crear una segunda tarifa activa para la ruta: rechazado con HTTP `409`.
- Precio original: `S/ 10.00`.
- Nueva version temporal: `S/ 11.00`.
- Cotizacion durante la prueba: `S/ 11.00`.
- Precio restaurado mediante otra version: `S/ 10.00`.
- Versiones anteriores: conservadas e inactivas.

La restriccion parcial `DeliveryRate_one_active_per_route` fue aplicada en Neon. La semilla se ejecuto despues y respeto las versiones administradas, sin reactivar tarifas historicas.
