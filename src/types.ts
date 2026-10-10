// Roles tal como los define la tabla usuarios (CHECK rol IN ...)
export type Rol = "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE";
export type Estado = "espera" | "proceso" | "completado";
export type Prioridad = "Alta" | "Media" | "Baja";

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
}

export interface Persona {
  id: number;
  nombre: string;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
}

export interface Tablero {
  id: number;
  nombre: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: Estado;
  creadaPor: string;
  creadaEn: string;
  vence: string | null; // AAAA-MM-DD
  prioridad: Prioridad;
  etiquetas: Etiqueta[];
  responsables: Persona[];
}

// Datos que edita el formulario de crear/editar tarea
export interface TareaForm {
  titulo: string;
  descripcion: string;
  vence: string | null;
  prioridad: Prioridad;
  etiquetaIds: number[];
  responsableIds: number[];
}

export const ROL_LABEL: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};
