# Evidencia de notificaciones por WhatsApp

Fecha: 2026-10-25 18:42 (America/Lima)

## Alcance

Se verifico en Vercel el commit `72badb0` contra los pedidos demo almacenados en Neon. La prueba no abrio WhatsApp ni envio mensajes.

## Autenticacion y pantalla

- Inicio de sesion con la empresa demo: `200`.
- `GET /empresa/notificaciones` con su sesion: `200`.
- La interfaz indica que EntregaPyme no envia mensajes automaticamente.

## Enlaces generados

- Pedidos confirmados mostrados: `3`.
- Enlaces `wa.me` generados: `3`.
- Telefonos normalizados al formato peruano `51 + celular`: `3`.
- Mensajes que incluyen el codigo publico `EP-*`: `3`.
- Mensajes que contienen direcciones, referencias o trayectos: `0`.

No se registraron numeros telefonicos, correos, contrasenas, cookies ni tokens en esta evidencia.

## Resultado

La empresa puede preparar una notificacion de estado y decidir manualmente si la envia por WhatsApp. Los enlaces no publican el detalle privado del pedido ni realizan envios automaticos.
