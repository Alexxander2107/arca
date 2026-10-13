import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import MobVagabundo from "./MobVagabundo";
import { MOBS } from "./mobs";

const CELDA = 4;
const BLOQUE = 10;
const FILAS = 2;
const SUELO_H = BLOQUE * FILAS;

const PASTO = ["#5da130", "#4f8f27", "#6bb23a"];
const TIERRA = ["#7a5230", "#6a4526", "#8a5c36"];
const tono = (x: number, y: number, paleta: string[]) =>
  paleta[(((x * 73856093) ^ (y * 19349663)) >>> 0) % paleta.length];

// Mascota aleatoria del tablero: camina, salta o vuela (no hay agua aquí)
export default function MobSuelo() {
  const { width } = useWindowDimensions();
  const mob = useMemo(() => {
    const posibles = MOBS.filter((m) => m.modo !== "nada");
    return posibles[Math.floor(Math.random() * posibles.length)];
  }, []);
  const altura = useMemo(() => (mob.modo === "vuela" ? 30 + Math.random() * 40 : 0), [mob]);

  const suelo = useMemo(() => {
    const cols = Math.ceil(width / BLOQUE);
    return Array.from({ length: FILAS }, (_, y) =>
      Array.from({ length: cols }, (_, c) => tono(c, y, y === 0 ? PASTO : TIERRA))
    );
  }, [width]);

  return (
    <View pointerEvents="box-none" style={s.caja}>
      <MobVagabundo mob={mob} celda={CELDA} izq={8} ancho={width - 16} suelo={SUELO_H} altura={altura} />
      <View pointerEvents="none" style={s.suelo}>
        {suelo.map((fila, y) => (
          <View key={y} style={{ flexDirection: "row" }}>
            {fila.map((c, i) => (
              <View key={i} style={{ width: BLOQUE, height: BLOQUE, backgroundColor: c }} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  caja: { position: "absolute", left: 0, right: 0, bottom: 0, height: 130 },
  suelo: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
