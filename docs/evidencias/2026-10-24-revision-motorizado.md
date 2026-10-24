# Evidencia: revision administrativa de motorizado

Fecha: 2026-10-24  
Entorno: produccion (`https://entrega-pyme.vercel.app`)  
Commit funcional: `4ff51a5`

## Secuencia probada

1. El motorizado demo inicio sesion estando aprobado.
2. El administrador bloqueo el perfil con un motivo auditable.
3. La sesion que ya estaba abierta dejo de autorizar peticiones.
4. Un nuevo inicio de sesion fue rechazado.
5. El administrador aprobo nuevamente el perfil.
6. El motorizado pudo iniciar sesion y consultar su bandeja otra vez.

## Resultado

- Estado intermedio: `BLOCKED`.
- Sesiones anteriores revocadas: si.
- Nuevo login durante el bloqueo: rechazado.
- Estado final restaurado: `APPROVED`.
- Login y endpoint final: correctos.

La cuenta demo quedo aprobada y operativa al terminar la prueba.
