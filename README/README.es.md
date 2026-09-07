# Woldeok Moneyverse — Español

Woldeok Moneyverse es una **plataforma comunitaria de economía virtual y progresión**.

- Producción: **https://easy-scraping.com**
- Pruebas: **https://test.easy-scraping.com**
- Stack: Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD, acciones virtuales, minijuegos de casino, trabajos y recompensas son datos virtuales internos. No son dinero real, valores ni productos de apuestas.

## Funciones

- Ocho profesiones, tareas repetibles, WLD y EXP de competencia
- Eventos diarios, misiones, colecciones y progresión
- Billetera y libro mayor auditable
- Tienda, inventario y colecciones con precios del servidor
- Acciones virtuales, negocios, banco, crédito y bonos
- Minijuegos de moneda/dado con resultado del servidor, límites personales y autoexclusión

## Equilibrio

Política base del casino: mínimo 10 WLD, máximo 200 WLD por partida, 2.000 WLD apostados al día, 1.000 WLD de pérdida realizada diaria y RTP base del 95%.

## Seguridad

```text
Browser → Cloudflare → nginx → Next.js → NestJS → PostgreSQL SECURITY DEFINER → tables
```

El rol de aplicación no puede modificar directamente las tablas principales de saldos, libro mayor o juegos. Las escrituras económicas pasan por funciones de base de datos revisadas y claves de idempotencia.

## Interfaz adaptable

La visibilidad del logotipo y la navegación se controla con breakpoints CSS (`display:none` y utilidades de display). Los elementos permanecen en el DOM y vuelven a mostrarse automáticamente al ampliar la ventana.

El desarrollo usa Node.js 24+ y pnpm 10. La fuente de verdad del esquema son las migraciones SQL ordenadas de `packages/database/migrations/`.
