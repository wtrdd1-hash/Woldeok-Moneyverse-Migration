# Woldeok Moneyverse — Guía en Español

[← README principal](../README.md) · [Cambios](../docs/changelog/CHANGELOG.es.md) · [Índice](../docs/INDEX.md)

Woldeok Moneyverse es una plataforma de economía virtual comunitaria construida con **Next.js, NestJS y PostgreSQL**. WLD, acciones, casino y recompensas son datos virtuales dentro del servicio; no son dinero real ni productos de inversión o apuestas reales.

## Funciones
- Profesiones, tareas repetibles y EXP
- Misiones y progresión
- Monedero WLD y libro contable
- Tienda e inventario
- Acciones y negocios virtuales
- Banco, intereses, crédito y bonos virtuales
- Minijuegos de casino con resultados decididos por el servidor
- Herramientas administrativas

Las operaciones económicas críticas pasan por funciones PostgreSQL `SECURITY DEFINER`, con validación de actor, políticas, idempotencia y coherencia del libro contable.

WLD viaja por la API como cadena de entero exacta para evitar pérdida de precisión de JavaScript.

Casino actual: RTP base 95%, 10–200 WLD por jugada, 2.000 WLD de apuesta diaria y 1.000 WLD de pérdida diaria realizada. Los límites personales pueden ser más estrictos.

Consulta el [índice de documentación](../docs/INDEX.md).
