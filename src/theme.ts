import { Prioridad } from "./types";

export const colors = {
  abismo: "#0a2a3b",
  laguna: "#11808f",
  espuma: "#eef6f6",
  coral: "#e5604b",
  ambar: "#c98a12",
  texto: "#14303d",
  suave: "#5a7681",
  borde: "#cfe0e2",
  blanco: "#ffffff",
  error: "#b3261e",
};

export const prioridadColor: Record<Prioridad, string> = {
  Alta: colors.coral,
  Media: colors.ambar,
  Baja: colors.laguna,
};

export const PALETA_ETIQUETAS = ["#11808f", "#e5604b", "#c98a12", "#6a5acd", "#2e8b57", "#c2185b"];
