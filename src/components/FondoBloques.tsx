import { memo, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

const PALETAS = {
  tierra: ["#5b3f26", "#523720", "#654630", "#4c331d"],
  piedra: ["#6e6e6e", "#666666", "#777777", "#5f5f5f"],
};

const tono = (x: number, y: number, n: number) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % n;

interface Props {
  variante?: keyof typeof PALETAS;
  bloque?: number;
}

// Fondo decorativo de bloques; no recibe toques ni afecta al resto de la pantalla
function FondoBloques({ variante = "tierra", bloque = 36 }: Props) {
  const { width, height } = useWindowDimensions();
  const filas = useMemo(() => {
    const paleta = PALETAS[variante];
    const cols = Math.ceil(width / bloque);
    const rows = Math.ceil(height / bloque);
    return Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => paleta[tono(x, y, paleta.length)])
    );
  }, [width, height, bloque, variante]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {filas.map((fila, y) => (
        <View key={y} style={{ flexDirection: "row" }}>
          {fila.map((c, x) => (
            <View key={x} style={{ width: bloque, height: bloque, backgroundColor: c }} />
          ))}
        </View>
      ))}
      {/* Oscurece el fondo, como en los menús de bloques */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.42)" }]} />
    </View>
  );
}

export default memo(FondoBloques);
