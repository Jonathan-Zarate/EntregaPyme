# Evidencia: consulta y asignacion administrativa

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `9e08218`

## Caso probado

- Pedido: `EP-BC29E58631`.
- Busqueda exacta paginada: un resultado, pagina `1`, limite `1`.
- Detalle antes de asignar: un evento de confirmacion.
- Motorizado asignado: `Motorizado Demo`.
- Estado despues de asignar: `ACCEPTED`.
- Rol responsable del nuevo evento: `ADMIN`.
- Comentario: `Asignacion manual de prueba por falta de aceptacion.`
- Limpieza final: pedido `CANCELLED` y reserva devuelta.

La asignacion utilizo una transaccion serializable y una actualizacion condicional sobre un pedido pendiente sin motorizado.
