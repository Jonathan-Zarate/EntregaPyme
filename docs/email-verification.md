# Verificacion de correo

EntregaPyme utiliza el flujo de tokens de Better Auth y el proveedor transaccional Resend.

## Comportamiento

- El enlace se envia al registrarse y vence en una hora.
- Una cuenta sin verificar no puede iniciar sesion cuando la verificacion esta activada.
- Las APIs operativas tambien comprueban `emailVerified`; la interfaz no es la unica barrera.
- El usuario puede solicitar un nuevo enlace desde `/verificar-correo`.
- Administradores bootstrap y usuarios demo se marcan verificados explicitamente durante la semilla.

## Activacion en produccion

1. Verificar un dominio remitente en Resend.
2. Configurar `RESEND_API_KEY` y `EMAIL_FROM` en Vercel.
3. Configurar `EMAIL_VERIFICATION_REQUIRED=true`.
4. Redesplegar y probar registro, reenvio, expiracion y enlace invalido.

La bandera permanece desactivada hasta que el proveedor este configurado para no crear cuentas que no puedan recibir su enlace.
