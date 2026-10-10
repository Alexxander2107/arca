import * as SQLite from "expo-sqlite";
import { SCHEMA } from "./schema";
import { PALETA_ETIQUETAS } from "./theme";
import { Estado, Etiqueta, Persona, Prioridad, Rol, Tablero, Tarea, TareaForm, Usuario } from "./types";

// ---------- Conexión (se abre una sola vez) ----------
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("arca.db");
      await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
      await db.execAsync(SCHEMA); // crea las tablas si no existen

      // Migración: bases creadas antes de añadir la prioridad
      const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(actividades)");
      if (!cols.some((c) => c.name === "prioridad")) {
        await db.execAsync(
          "ALTER TABLE actividades ADD COLUMN prioridad TEXT NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Alta','Media','Baja'))"
        );
      }
      return db;
    })().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

// ---------- Correspondencia tablero (pantalla) <-> base de datos ----------
const ORDEN: Estado[] = ["espera", "proceso", "completado"];
const COLUMNA: Record<Estado, string> = {
  espera: "En espera",
  proceso: "En proceso",
  completado: "Completado",
};
const ESTADO_DB: Record<Estado, string> = {
  espera: "Pendiente",
  proceso: "En Proceso",
  completado: "Completada",
};
const ESTADO_UI: Record<string, Estado> = {
  Pendiente: "espera",
  "En Proceso": "proceso",
  "En Revision": "proceso",
  Completada: "completado",
};

// ---------- Cola de sincronización offline-first ----------
async function encolar(
  db: SQLite.SQLiteDatabase,
  tabla: string,
  id: number,
  operacion: "INSERT" | "UPDATE" | "DELETE",
  payload: object
) {
  await db.runAsync(
    "INSERT INTO cola_sincronizacion (tablaAfectada, idRegistroAfectado, operacion, payloadJson) VALUES (?, ?, ?, ?)",
    tabla,
    id,
    operacion,
    JSON.stringify(payload)
  );
}

// ---------- Usuarios ----------
interface FilaUsuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
}

const aUsuario = (r: FilaUsuario): Usuario => ({
  id: r.idUsuario,
  nombre: r.nombre,
  apellido: r.apellido,
  correo: r.correo,
  rol: r.rol,
});

export async function crearUsuario(d: {
  nombre: string;
  apellido: string;
  correo: string;
  hash: string;
  rol: Rol;
}): Promise<Usuario> {
  const db = await getDb();
  const existe = await db.getFirstAsync("SELECT 1 FROM usuarios WHERE correo = ?", d.correo);
  if (existe) throw new Error("CORREO_DUPLICADO");

  const r = await db.runAsync(
    "INSERT INTO usuarios (nombre, apellido, correo, contrasenaHash, rol) VALUES (?, ?, ?, ?, ?)",
    d.nombre,
    d.apellido,
    d.correo,
    d.hash,
    d.rol
  );
  return { id: r.lastInsertRowId, nombre: d.nombre, apellido: d.apellido, correo: d.correo, rol: d.rol };
}

export async function buscarUsuario(correo: string, hash: string): Promise<Usuario | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<FilaUsuario>(
    "SELECT idUsuario, nombre, apellido, correo, rol FROM usuarios WHERE correo = ? AND contrasenaHash = ? AND estado = 'activo'",
    correo,
    hash
  );
  return r ? aUsuario(r) : null;
}

export async function usuarioPorId(id: number): Promise<Usuario | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<FilaUsuario>(
    "SELECT idUsuario, nombre, apellido, correo, rol FROM usuarios WHERE idUsuario = ?",
    id
  );
  return r ? aUsuario(r) : null;
}

// Personas a las que se puede asignar una tarea
export async function listarPersonas(): Promise<Persona[]> {
  const db = await getDb();
  return db.getAllAsync<Persona>(
    "SELECT idUsuario AS id, nombre || ' ' || apellido AS nombre FROM usuarios WHERE estado = 'activo' ORDER BY nombre"
  );
}

// ---------- Tableros ----------
async function crearTableroConColumnas(
  db: SQLite.SQLiteDatabase,
  idUsuario: number,
  nombre: string
): Promise<number> {
  let id = 0;
  await db.withTransactionAsync(async () => {
    const r = await db.runAsync(
      "INSERT INTO tableros (idUsuarioCreador, nombre) VALUES (?, ?)",
      idUsuario,
      nombre
    );
    id = r.lastInsertRowId;
    for (let i = 0; i < ORDEN.length; i++) {
      await db.runAsync(
        "INSERT INTO columnas (idTablero, nombre, orden) VALUES (?, ?, ?)",
        id,
        COLUMNA[ORDEN[i]],
        i
      );
    }
    await encolar(db, "tableros", id, "INSERT", { nombre });
  });
  return id;
}

// Devuelve los tableros activos; si no hay ninguno, crea "Tablero principal"
export async function listarTableros(idUsuario: number): Promise<Tablero[]> {
  const db = await getDb();
  const consulta = () =>
    db.getAllAsync<Tablero>(
      "SELECT idTablero AS id, nombre FROM tableros WHERE activo = 1 ORDER BY idTablero"
    );
  let filas = await consulta();
  if (filas.length === 0) {
    await crearTableroConColumnas(db, idUsuario, "Tablero principal");
    filas = await consulta();
  }
  return filas;
}

export async function crearTablero(idUsuario: number, nombre: string): Promise<number> {
  const db = await getDb();
  return crearTableroConColumnas(db, idUsuario, nombre);
}

async function columnaId(db: SQLite.SQLiteDatabase, idTablero: number, estado: Estado) {
  const c = await db.getFirstAsync<{ idColumna: number }>(
    "SELECT idColumna FROM columnas WHERE idTablero = ? AND nombre = ?",
    idTablero,
    COLUMNA[estado]
  );
  if (!c) throw new Error("COLUMNA_NO_ENCONTRADA");
  return c.idColumna;
}

// ---------- Etiquetas ----------
export async function listarEtiquetas(): Promise<Etiqueta[]> {
  const db = await getDb();
  const f = await db.getAllAsync<{ id: number; nombre: string; colorHex: string | null }>(
    "SELECT idEtiqueta AS id, nombre, colorHex FROM etiquetas ORDER BY nombre"
  );
  return f.map((e) => ({ id: e.id, nombre: e.nombre, color: e.colorHex ?? PALETA_ETIQUETAS[0] }));
}

export async function crearEtiqueta(nombre: string): Promise<Etiqueta> {
  const db = await getDb();
  const ya = await db.getFirstAsync<{ id: number; nombre: string; colorHex: string | null }>(
    "SELECT idEtiqueta AS id, nombre, colorHex FROM etiquetas WHERE nombre = ? COLLATE NOCASE",
    nombre
  );
  if (ya) return { id: ya.id, nombre: ya.nombre, color: ya.colorHex ?? PALETA_ETIQUETAS[0] };

  const n = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM etiquetas");
  const color = PALETA_ETIQUETAS[(n?.n ?? 0) % PALETA_ETIQUETAS.length];
  const r = await db.runAsync("INSERT INTO etiquetas (nombre, colorHex) VALUES (?, ?)", nombre, color);
  return { id: r.lastInsertRowId, nombre, color };
}

// ---------- Actividades (tarjetas) ----------
export async function listarTareas(idTablero: number): Promise<Tarea[]> {
  const db = await getDb();

  const filas = await db.getAllAsync<{
    id: number;
    titulo: string;
    descripcion: string | null;
    estado: string;
    fechaCreacion: string;
    vence: string | null;
    prioridad: Prioridad;
    creadaPor: string;
  }>(
    `SELECT a.idActividad AS id, a.titulo, a.descripcion, a.estado, a.fechaCreacion,
            a.fechaVencimiento AS vence, a.prioridad,
            u.nombre || ' ' || u.apellido AS creadaPor
       FROM actividades a
       JOIN columnas c ON c.idColumna = a.idColumna
       JOIN usuarios u ON u.idUsuario = a.idUsuarioCreador
      WHERE c.idTablero = ?
      ORDER BY a.idActividad DESC`,
    idTablero
  );

  const etq = await db.getAllAsync<{ idActividad: number; id: number; nombre: string; colorHex: string | null }>(
    `SELECT ae.idActividad, e.idEtiqueta AS id, e.nombre, e.colorHex
       FROM actividad_etiquetas ae
       JOIN etiquetas e ON e.idEtiqueta = ae.idEtiqueta
       JOIN actividades a ON a.idActividad = ae.idActividad
       JOIN columnas c ON c.idColumna = a.idColumna
      WHERE c.idTablero = ?`,
    idTablero
  );

  const resp = await db.getAllAsync<{ idActividad: number; id: number; nombre: string }>(
    `SELECT r.idActividad, u.idUsuario AS id, u.nombre || ' ' || u.apellido AS nombre
       FROM actividad_estudiantes r
       JOIN usuarios u ON u.idUsuario = r.idUsuarioEstudiante
       JOIN actividades a ON a.idActividad = r.idActividad
       JOIN columnas c ON c.idColumna = a.idColumna
      WHERE c.idTablero = ?`,
    idTablero
  );

  const etqPor = new Map<number, Etiqueta[]>();
  for (const e of etq) {
    const lista = etqPor.get(e.idActividad) ?? [];
    lista.push({ id: e.id, nombre: e.nombre, color: e.colorHex ?? PALETA_ETIQUETAS[0] });
    etqPor.set(e.idActividad, lista);
  }
  const respPor = new Map<number, Persona[]>();
  for (const r of resp) {
    const lista = respPor.get(r.idActividad) ?? [];
    lista.push({ id: r.id, nombre: r.nombre });
    respPor.set(r.idActividad, lista);
  }

  return filas.map((f) => ({
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion ?? "",
    estado: ESTADO_UI[f.estado] ?? "espera",
    creadaPor: f.creadaPor,
    creadaEn: f.fechaCreacion,
    vence: f.vence,
    prioridad: f.prioridad,
    etiquetas: etqPor.get(f.id) ?? [],
    responsables: respPor.get(f.id) ?? [],
  }));
}

async function guardarRelaciones(db: SQLite.SQLiteDatabase, idActividad: number, f: TareaForm) {
  await db.runAsync("DELETE FROM actividad_etiquetas WHERE idActividad = ?", idActividad);
  for (const idEtiqueta of f.etiquetaIds) {
    await db.runAsync(
      "INSERT OR IGNORE INTO actividad_etiquetas (idActividad, idEtiqueta) VALUES (?, ?)",
      idActividad,
      idEtiqueta
    );
  }
  await db.runAsync("DELETE FROM actividad_estudiantes WHERE idActividad = ?", idActividad);
  for (const idUsuario of f.responsableIds) {
    await db.runAsync(
      "INSERT OR IGNORE INTO actividad_estudiantes (idActividad, idUsuarioEstudiante) VALUES (?, ?)",
      idActividad,
      idUsuario
    );
  }
}

export async function crearTarea(idUsuario: number, idTablero: number, f: TareaForm) {
  const db = await getDb();
  const columna = await columnaId(db, idTablero, "espera");

  await db.withTransactionAsync(async () => {
    const r = await db.runAsync(
      `INSERT INTO actividades (idColumna, idUsuarioCreador, titulo, descripcion, fechaVencimiento, estado, prioridad)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      columna,
      idUsuario,
      f.titulo,
      f.descripcion || null,
      f.vence,
      ESTADO_DB.espera,
      f.prioridad
    );
    await guardarRelaciones(db, r.lastInsertRowId, f);
    await encolar(db, "actividades", r.lastInsertRowId, "INSERT", { ...f, estado: ESTADO_DB.espera });
  });
}

export async function editarTarea(idActividad: number, f: TareaForm) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE actividades
          SET titulo = ?, descripcion = ?, fechaVencimiento = ?, prioridad = ?
        WHERE idActividad = ?`,
      f.titulo,
      f.descripcion || null,
      f.vence,
      f.prioridad,
      idActividad
    );
    await guardarRelaciones(db, idActividad, f);
    await encolar(db, "actividades", idActividad, "UPDATE", { ...f });
  });
}

export async function actualizarEstado(idActividad: number, estado: Estado) {
  const db = await getDb();
  const t = await db.getFirstAsync<{ idTablero: number }>(
    `SELECT c.idTablero FROM actividades a
       JOIN columnas c ON c.idColumna = a.idColumna
      WHERE a.idActividad = ?`,
    idActividad
  );
  if (!t) return;
  const columna = await columnaId(db, t.idTablero, estado);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE actividades SET idColumna = ?, estado = ? WHERE idActividad = ?",
      columna,
      ESTADO_DB[estado],
      idActividad
    );
    await encolar(db, "actividades", idActividad, "UPDATE", { estado: ESTADO_DB[estado] });
  });
}

export async function eliminarTarea(idActividad: number) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await encolar(db, "actividades", idActividad, "DELETE", {});
    await db.runAsync("DELETE FROM actividades WHERE idActividad = ?", idActividad);
  });
}
