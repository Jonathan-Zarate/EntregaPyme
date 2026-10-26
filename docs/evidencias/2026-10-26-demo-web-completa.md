# Demo web completa por roles

Fecha: 2026-10-26 (America/Lima)

## Recorrido ejecutado

La demostracion se realizo desde la interfaz productiva de Vercel usando exclusivamente cuentas y datos demo.

1. Empresa: inicio de sesion, cotizacion de `S/ 15.00` y confirmacion del pedido `EP-D43AA13218`.
2. Administrador: consulta del pedido pendiente y asignacion manual a `Motorizado Demo`.
3. Motorizado: avance ordenado por `ACCEPTED`, `HEADING_TO_PICKUP`, `PICKED_UP` y `HEADING_TO_DESTINATION`.
4. Evidencia: carga desde la interfaz de una fotografia sintetica `EVIDENCIA DEMO` en Vercel Blob privado.
5. Entrega: transicion final a `DELIVERED` luego de comprobar una evidencia asociada.
6. Historial: el servicio aparece con ganancia de `S/ 12.00`; el acumulado demo paso a `S/ 36.00` y tres entregas completadas.

No se envio ningun mensaje real de WhatsApp. El sistema solo preparo el enlace para confirmacion humana.

## Hallazgo durante la demo

La primera ejecucion revelo que Next.js reiniciaba los campos del formulario despues de cotizar. La tarifa permanecia visible, pero la confirmacion usaba campos vacios y la validacion HTML bloqueaba el segundo envio.

Correcciones aplicadas:

- `71a0f9b`: conserva una copia inmutable del borrador cotizado.
- `316f265`: permite confirmar ese borrador ya validado sin que los campos reiniciados bloqueen el envio.

Ambas correcciones pasaron 32 pruebas, TypeScript, ESLint y build de produccion antes de desplegarse.

## Resultado

El recorrido Empresa -> Administrador -> Motorizado -> Evidencia -> Entrega quedo comprobado desde la web productiva.
