# ARCA

*Administrador de Registro, Control y Actividades* — aplicación móvil para organizar y dar seguimiento a tareas con un tablero tipo kanban. Desarrollada por AppForge para Acuatica Flypper.

![Versión](https://img.shields.io/badge/versión-1.1.0-11808f)
![Estado](https://img.shields.io/badge/estado-beta-e5604b)
![Expo](https://img.shields.io/badge/Expo-React%20Native-0a2a3b)

> *Versión beta.* Funciona sin conexión y guarda los datos en el propio dispositivo. Aún no se sincroniza con un servidor.

## Características

- *Cuentas de usuario:* registro e inicio de sesión, con la sesión guardada en el dispositivo.
- *Tablero de tres columnas:* En espera, En proceso y Completado. Las tareas se mueven con los botones ← →.
- *Varios tableros:* se cambia de tablero desde la fila superior o se crea uno nuevo con sus 3 columnas.
- *Tareas completas:* título, descripción, fecha límite y prioridad (Alta, Media o Baja).
- *Responsables:* se pueden asignar varias personas a cada tarea.
- *Etiquetas:* se eligen las existentes o se crean nuevas desde el mismo formulario.
- *Búsqueda y filtros:* por texto, "Mis tareas", prioridad y etiqueta.
- *Alertas de vencimiento:* las tareas vencidas o próximas a vencer se resaltan en la tarjeta.
- *Funciona sin internet:* todo se guarda en una base de datos SQLite local.

## Roles y permisos

| Rol | Ver y mover tareas | Crear y editar | Eliminar |
|---|---|---|---|
| Administrador | ✅ | ✅ | ✅ |
| Docente | ✅ | ✅ | ❌ |
| Estudiante | ✅ | ❌ | ❌ |

## Tecnologías

- React Native con [Expo](https://expo.dev) y expo-router
- TypeScript
- SQLite con expo-sqlite
- expo-crypto y @react-native-async-storage/async-storage

## Instalación

Requisitos: [Node.js](https://nodejs.org) y la app *Expo Go* en tu celular.

bash
git clone https://github.com/Alexxander2107/arca.git
cd arca
npm install
npx expo start


Escanea el código QR con Expo Go. El celular y la computadora deben estar en la misma red Wi-Fi; si no conecta, usa npx expo start --tunnel.

## Estructura del proyecto


src/
├── app/            Pantallas (login, tablero)
├── components/     Tarjeta de tarea, formulario y filtros
├── utils/          Utilidades de fechas
├── db.ts           Consultas a SQLite
├── schema.ts       Esquema de la base de datos
├── auth.tsx        Manejo de la sesión
├── storage.ts      Sesión y hash de contraseñas
├── theme.ts        Colores
└── types.ts        Tipos de TypeScript
database/           Scripts SQL para DB Browser for SQLite


## Base de datos

La app crea automáticamente su base arca.db en el dispositivo la primera vez que se abre. En la carpeta database/ hay scripts para trabajar con una copia en tu computadora:

- arca_esquema.sql: crea las tablas.
- arca_datos_ejemplo.sql: usuarios y tareas de prueba.
- arca_migracion_prioridad.sql: solo para bases creadas antes de la versión 1.1.0.

## Novedades de la versión 1.1.0

- Edición de tareas desde un formulario al tocar la tarjeta.
- Fecha límite (AAAA-MM-DD, con atajos "Mañana", "+7 días" y "Sin fecha") y prioridad con insignias de color.
- Asignación de responsables y etiquetas.
- Búsqueda de texto y filtros con botón "Limpiar".
- Soporte para varios tableros.

## Limitaciones de la beta

- Los datos viven en el dispositivo y no se comparten entre celulares.
- La contraseña se guarda con hash SHA-256, suficiente para pruebas pero no para producción.
- No incluye arrastrar y soltar entre columnas.

## Próximos pasos

- Sincronización con servidor mediante API REST y token JWT.
- Notificaciones push de tareas por vencer.
- Sesión cifrada con expo-secure-store.
- Panel de métricas para el administrador.
- Adjuntos y comentarios en las tareas.

## Equipo

AppForge — Líder técnico, analista de interfaz y administrador de infraestructura.
