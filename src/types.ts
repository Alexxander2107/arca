export type Rol = "dueno" | "secretaria";
export type Estado = "espera" | "proceso" | "completado";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: Estado;
  creadaPor: string;
  creadaEn: number;
}

export const ROL_LABEL: Record<Rol, string> = {
  dueno: "Dueño",
  secretaria: "Secretaria",
};
