import { Prioridad } from "./types";

export const colors = {
  abismo: "#0a2a3b",
  laguna: "#11808f",
  espuma: "#eef6f6",
  coral: "#e5604b",
  ambar: "#c98a12",
  amarillo: "#FFC800",
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

// ---------- Estilo "bloques" ----------
// Sin anotaciones de tipo a propósito: así estos estilos sirven igual para
// vistas, botones y campos de texto en cualquier versión de React Native.
export const fuente = "VT323_400Regular";

export const sombraTexto = {
  textShadowColor: "#3a3a3a",
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 0,
};

// Borde con relieve: luz arriba-izquierda, sombra abajo-derecha
const caja = (fondo: string, claro: string, oscuro: string, borde = 3) => ({
  backgroundColor: fondo,
  borderWidth: borde,
  borderTopColor: claro,
  borderLeftColor: claro,
  borderBottomColor: oscuro,
  borderRightColor: oscuro,
  borderRadius: 0,
});

export const bisel = {
  panel: caja("#c6c6c6", "#ffffff", "#555555"),
  boton: caja("#8b8b8b", "#c9c9c9", "#3d3d3d"),
  botonVerde: caja("#5da130", "#8fd35a", "#2f5a14"),
  hueco: caja("#000000", "#373737", "#c6c6c6", 2), // campo hundido
};