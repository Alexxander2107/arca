// Esquema tomado de arca.sqbpro (DB Browser for SQLite).
// Es idempotente: se puede ejecutar en cada arranque de la app.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
    idUsuario           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre              TEXT NOT NULL,
    apellido            TEXT NOT NULL,
    correo              TEXT NOT NULL UNIQUE,
    contrasenaHash      TEXT NOT NULL,
    fechaRegistro       TEXT NOT NULL DEFAULT (datetime('now')),
    estado              TEXT NOT NULL DEFAULT 'activo'
                         CHECK (estado IN ('activo','inactivo','suspendido')),
    rol                 TEXT NOT NULL
                         CHECK (rol IN ('ADMINISTRADOR','DOCENTE','ESTUDIANTE')),
    nivelAcceso         INTEGER,
    biometriaHabilitada INTEGER NOT NULL DEFAULT 0,
    syncEstado          TEXT NOT NULL DEFAULT 'sincronizado'
                         CHECK (syncEstado IN ('sincronizado','pendiente','conflicto')),
    fechaActualizacion  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE TABLE IF NOT EXISTS tableros (
    idTablero           INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuarioCreador     INTEGER NOT NULL,
    nombre              TEXT NOT NULL,
    asignatura          TEXT,
    seccion             TEXT,
    proyectoEducativo    TEXT,
    fechaCreacion       TEXT NOT NULL DEFAULT (datetime('now')),
    activo              INTEGER NOT NULL DEFAULT 1,
    syncEstado          TEXT NOT NULL DEFAULT 'sincronizado'
                         CHECK (syncEstado IN ('sincronizado','pendiente','conflicto')),
    fechaActualizacion  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (idUsuarioCreador) REFERENCES usuarios(idUsuario)
);
CREATE TABLE IF NOT EXISTS columnas (
    idColumna           INTEGER PRIMARY KEY AUTOINCREMENT,
    idTablero           INTEGER NOT NULL,
    nombre              TEXT NOT NULL,
    orden               INTEGER NOT NULL,
    FOREIGN KEY (idTablero) REFERENCES tableros(idTablero) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_columnas_tablero ON columnas(idTablero);
CREATE TABLE IF NOT EXISTS actividades (
    idActividad         INTEGER PRIMARY KEY AUTOINCREMENT,
    idColumna           INTEGER NOT NULL,
    idUsuarioCreador     INTEGER NOT NULL,
    titulo              TEXT NOT NULL,
    descripcion         TEXT,
    fechaCreacion       TEXT NOT NULL DEFAULT (datetime('now')),
    fechaVencimiento     TEXT,
    estado              TEXT NOT NULL DEFAULT 'Pendiente'
                         CHECK (estado IN ('Pendiente','En Proceso','En Revision','Completada')),
    ponderacionNota      REAL,
    orden               INTEGER NOT NULL DEFAULT 0,
    syncEstado          TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (syncEstado IN ('sincronizado','pendiente','conflicto')),
    fechaActualizacion  TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (idColumna) REFERENCES columnas(idColumna) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioCreador) REFERENCES usuarios(idUsuario)
);
CREATE INDEX IF NOT EXISTS idx_actividades_columna ON actividades(idColumna);
CREATE INDEX IF NOT EXISTS idx_actividades_vencimiento ON actividades(fechaVencimiento);
CREATE TABLE IF NOT EXISTS actividad_estudiantes (
    idActividad         INTEGER NOT NULL,
    idUsuarioEstudiante  INTEGER NOT NULL,
    notaObtenida         REAL,
    PRIMARY KEY (idActividad, idUsuarioEstudiante),
    FOREIGN KEY (idActividad) REFERENCES actividades(idActividad) ON DELETE CASCADE,
    FOREIGN KEY (idUsuarioEstudiante) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS etiquetas (
    idEtiqueta          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre              TEXT NOT NULL UNIQUE,
    colorHex            TEXT
);
CREATE TABLE IF NOT EXISTS actividad_etiquetas (
    idActividad         INTEGER NOT NULL,
    idEtiqueta          INTEGER NOT NULL,
    PRIMARY KEY (idActividad, idEtiqueta),
    FOREIGN KEY (idActividad) REFERENCES actividades(idActividad) ON DELETE CASCADE,
    FOREIGN KEY (idEtiqueta) REFERENCES etiquetas(idEtiqueta) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS adjuntos (
    idAdjunto           INTEGER PRIMARY KEY AUTOINCREMENT,
    idActividad         INTEGER NOT NULL,
    rutaLocal           TEXT,
    urlRemota           TEXT,
    tipoArchivo         TEXT,
    fechaCarga          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (idActividad) REFERENCES actividades(idActividad) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS asistencia (
    idAsistencia         INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuarioEstudiante  INTEGER NOT NULL,
    idActividad          INTEGER,
    fecha                TEXT NOT NULL DEFAULT (date('now')),
    estado               TEXT NOT NULL
                          CHECK (estado IN ('Presente','Ausente','Tardanza','Justificado')),
    syncEstado           TEXT NOT NULL DEFAULT 'pendiente'
                          CHECK (syncEstado IN ('sincronizado','pendiente','conflicto')),
    FOREIGN KEY (idUsuarioEstudiante) REFERENCES usuarios(idUsuario),
    FOREIGN KEY (idActividad) REFERENCES actividades(idActividad) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_asistencia_estudiante_fecha ON asistencia(idUsuarioEstudiante, fecha);
CREATE TABLE IF NOT EXISTS notificaciones (
    idNotificacion       INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario            INTEGER NOT NULL,
    idActividad          INTEGER,
    mensaje              TEXT NOT NULL,
    fechaProgramada       TEXT NOT NULL,
    leida                INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idActividad) REFERENCES actividades(idActividad) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reportes (
    idReporte            INTEGER PRIMARY KEY AUTOINCREMENT,
    idAdministrador       INTEGER NOT NULL,
    tipoReporte           TEXT NOT NULL,
    fechaGeneracion       TEXT NOT NULL DEFAULT (datetime('now')),
    parametrosJson        TEXT,
    rutaArchivoExportado   TEXT,
    FOREIGN KEY (idAdministrador) REFERENCES usuarios(idUsuario)
);
CREATE TABLE IF NOT EXISTS cola_sincronizacion (
    idSync               INTEGER PRIMARY KEY AUTOINCREMENT,
    tablaAfectada         TEXT NOT NULL,
    idRegistroAfectado     INTEGER NOT NULL,
    operacion             TEXT NOT NULL
                          CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
    payloadJson           TEXT NOT NULL,
    fechaCreacion         TEXT NOT NULL DEFAULT (datetime('now')),
    intentos              INTEGER NOT NULL DEFAULT 0,
    estado                TEXT NOT NULL DEFAULT 'pendiente'
                          CHECK (estado IN ('pendiente','enviado','error'))
);
CREATE INDEX IF NOT EXISTS idx_cola_estado ON cola_sincronizacion(estado);
CREATE TRIGGER IF NOT EXISTS trg_actividades_update
AFTER UPDATE ON actividades
FOR EACH ROW
BEGIN
    UPDATE actividades
    SET fechaActualizacion = datetime('now'),
        syncEstado = 'pendiente'
    WHERE idActividad = NEW.idActividad;
END;
`;
