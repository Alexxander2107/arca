# ARCA

**Administrador de Registro, Control y Actividades** — aplicación móvil para organizar y dar seguimiento a tareas con un tablero tipo kanban, con un estilo visual inspirado en los juegos de bloques. Desarrollada por AppForge para Acuatica Flypper.

![Versión](https://img.shields.io/badge/versión-1.2.0-11808f)
![Estado](https://img.shields.io/badge/estado-beta-e5604b)
![Expo](https://img.shields.io/badge/Expo-React%20Native-0a2a3b)
![Uso](https://img.shields.io/badge/uso-estudiantil-5da130)

> **Versión beta de uso estudiantil.** Funciona sin conexión y guarda los datos en el propio dispositivo. Aún no se sincroniza con un servidor.

## Características

### Tablero y tareas
- **Cuentas de usuario:** registro e inicio de sesión, con la sesión guardada en el dispositivo.
- **Tablero de tres columnas:** En espera, En proceso y Completado. Las tareas se mueven con los botones ← →.
- **Varios tableros:** se cambia de tablero desde la fila superior o se crea uno nuevo con sus 3 columnas.
- **Tareas completas:** título, descripción, fecha límite y prioridad (Alta, Media o Baja).
- **Responsables y etiquetas:** se asignan varias personas y etiquetas a cada tarea.
- **Búsqueda y filtros:** por texto, "Mis tareas", prioridad y etiqueta.
- **Alertas de vencimiento:** las tareas vencidas o próximas a vencer se resaltan.
- **Funciona sin internet:** todo se guarda en una base de datos SQLite local.

### Estilo y animaciones
- **Pantalla de carga:** logo de AppForge, barra de carga por bloques, consejos aleatorios y un mob al azar (hostil o no) que corre por detrás.
- **Barra de experiencia:** el "nivel" es el número de tareas completadas y la barra muestra el porcentaje terminado.
- **Logros:** al completar una tarea aparece el aviso "¡Logro conseguido!".
- **Orbes de experiencia:** salen al completar una tarea.
- **Mascota interactiva:** un mob al azar pasea por el suelo del tablero; al tocarlo salta y emite su sonido.
- **Frase animada en el login:** una frase amarilla inclinada que "late".
- **Interfaz de bloques:** fondos de tierra y piedra, paneles con relieve, botones de piedra, campos hundidos y fuente pixelada.
- **Entradas animadas:** las pantallas y las tarjetas aparecen con fundido y deslizamiento.

## Roles y permisos

| Rol | Ver y mover tareas | Crear y editar | Eliminar |
|---|---|---|---|
| Administrador | ✅ | ✅ | ✅ |
| Docente | ✅ | ✅ | ❌ |
| Estudiante | ✅ | ❌ | ❌ |

## Tecnologías

- React Native con [Expo](https://expo.dev) y `expo-router`
- TypeScript
- SQLite con `expo-sqlite`
- `expo-crypto`, `expo-font` y `@react-native-async-storage/async-storage`
- Fuente VT323 (`@expo-google-fonts/vt323`)
- Animaciones con `Animated` de React Native (sin librerías extra)

## Instalación

Requisitos: [Node.js](https://nodejs.org) y la app **Expo Go** en tu celular.

```bash
git clone https://github.com/Alexxander2107/arca.git
cd arca
npm install
npx expo install expo-font @expo-google-fonts/vt323
npx expo start
```

Escanea el código QR con Expo Go. El celular y la computadora deben estar en la misma red Wi-Fi; si no conecta, usa `npx expo start --tunnel`.

> En Windows, si PowerShell bloquea `npx`, ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` o usa `npx.cmd`.

## Generar el APK

Se compila en la nube con [EAS Build](https://docs.expo.dev/build/introduction/). Necesitas una cuenta gratuita en expo.dev.

1. En `app.json`, comprueba `"version": "1.2.0"` y `"android": { "package": "com.appforge.arca" }`.
2. En `eas.json`, el perfil `preview` debe generar un APK:
   ```json
   "preview": {
     "distribution": "internal",
     "android": { "buildType": "apk" }
   }
   ```
3. Compila:
   ```bash
   npx eas-cli login
   npx eas-cli build -p android --profile preview
   ```
4. Descarga el APK desde el enlace que muestra la terminal o desde expo.dev → *Builds*, y ábrelo en el celular (requiere permitir la instalación desde orígenes desconocidos). Requiere Android 10 o superior.

Cada celular guarda sus propios datos: las tareas de un teléfono no aparecen en otro.

5. La version adecuada para que la app funcione en el dispositivo es: Minimo Androd 7 (API 24), la version obetiva sera Androdi 14 (API 34
)

## Estructura del proyecto

```
src/
├── app/                    Pantallas
│   ├── _layout.tsx           Carga de fuente y navegación
│   ├── index.tsx             Pantalla de carga y redirección
│   ├── login.tsx             Registro e inicio de sesión
│   └── board.tsx             Tablero
├── components/             Piezas de interfaz
│   ├── Splash.tsx            Pantalla de carga
│   ├── mobs.ts               Personajes de bloques
│   ├── MobCorredor.tsx       Dibujo y animación de los personajes
│   ├── MobSuelo.tsx          Mascota del tablero
│   ├── BarraExperiencia.tsx  Nivel y barra de experiencia
│   ├── LogroToast.tsx        Aviso de logro
│   ├── OrbesXP.tsx           Orbes de experiencia
│   ├── TextoSplash.tsx       Frase animada del login
│   ├── FondoBloques.tsx      Fondo de tierra o piedra
│   ├── Aparecer.tsx          Animación de entrada
│   ├── TareaCard.tsx         Tarjeta de tarea
│   ├── TareaModal.tsx        Formulario crear/editar
│   └── Filtros.tsx           Búsqueda y filtros
├── utils/fechas.ts         Validación y formato de fechas
├── assets/                 Logo de AppForge
├── db.ts                   Consultas a SQLite
├── schema.ts               Esquema de la base de datos
├── auth.tsx                Manejo de la sesión
├── storage.ts              Sesión y hash de contraseñas
├── theme.ts                Colores, fuente y relieve
└── types.ts                Tipos de TypeScript
database/                 Scripts SQL para DB Browser for SQLite
```

## Base de datos

La app crea automáticamente su base `arca.db` en el dispositivo la primera vez que se abre. La carpeta `database/` contiene scripts para trabajar con una copia en tu computadora:

- `arca_esquema.sql`: crea las tablas.
- `arca_datos_ejemplo.sql`: usuarios y tareas de prueba.
- `arca_migracion_prioridad.sql`: solo para bases creadas antes de la versión 1.1.0.

## Novedades de la versión 1.2.0

- Nuevo estilo visual de bloques en toda la aplicación: fondos, paneles con relieve, botones, campos de texto y fuente pixelada.
- Pantalla de carga con barra por bloques, consejos y un mob aleatorio que corre por detrás.
- Barra de experiencia con el nivel según las tareas completadas.
- Aviso de logro y orbes de experiencia al completar una tarea.
- Mascota aleatoria e interactiva en el tablero.
- Frase animada en el login y tarjetas que entran de forma escalonada.
- Transiciones suaves entre pantallas.

## Historial de versiones

### 1.1.0
- Edición de tareas desde un formulario al tocar la tarjeta.
- Fecha límite y prioridad con insignias de color.
- Asignación de responsables y etiquetas.
- Búsqueda de texto y filtros con botón "Limpiar".
- Soporte para varios tableros.

### 1.0.0
- Registro e inicio de sesión.
- Tablero de tres columnas con tareas.
- Base de datos SQLite local con el esquema de ARCA.

## Limitaciones de la beta

- Los datos viven en el dispositivo y no se comparten entre celulares.
- La contraseña se guarda con hash SHA-256, suficiente para pruebas pero no para producción.
- No incluye arrastrar y soltar entre columnas.

## Próximos pasos

- Sincronización con servidor mediante API REST y token JWT.
- Notificaciones push de tareas por vencer.
- Sesión cifrada con `expo-secure-store`.
- Panel de métricas para el administrador.
- Adjuntos y comentarios en las tareas.

## Notas

- El estilo visual está inspirado en los juegos de bloques. Los personajes de `mobs.ts` son dibujos originales y no reproducen personajes de ningún juego.
- Proyecto de uso estudiantil, sin publicación en tiendas de aplicaciones.

## Equipo

AppForge — Líder técnico, analista de interfaz y administrador de infraestructura.
