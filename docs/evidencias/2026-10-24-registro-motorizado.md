# Evidencia: registro seguro de motorizado

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `c6fecae`

## Caso probado

- Cuenta: `postulante.175933@entregapyme.demo`.
- Se intento enviar `role: ADMIN` directamente al endpoint de registro.
- Better Auth ignoro el campo protegido.
- La operacion autenticada de perfil asigno exclusivamente el rol `COURIER`.
- Estado inicial del perfil: `PENDING`.
- Acceso a pedidos antes de aprobacion: rechazado con HTTP `403`.
- Visibilidad en el panel administrativo: correcta.

La postulación se conserva pendiente para demostrar el flujo de revisión desde el panel administrativo. La contraseña de prueba no fue almacenada ni documentada.
