import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import MobVagabundo from "./MobVagabundo";
import { MOBS, Mob } from "./mobs";

const ALTO = 250;
const BLOQUE = 14;
const FILAS = 3;
const SUELO_H = BLOQUE * FILAS;
const CELDA = 7; // mobs más grandes que en el resto de la app
const ESTANQUE_H = 130;
const CANTIDAD = 3;

const PASTO = ["#5da130", "#4f8f27", "#6bb23a"];
const ARENA = ["#d8c27a", "#cdb66b", "#e2cf8a"];
const TIERRA = ["#7a5230", "#6a4526", "#8a5c36"];
const tono = (x: number, y: number, paleta: string[]) =>
  paleta[(((x * 73856093) ^ (y * 19349663)) >>> 0) % paleta.length];

interface Elegido {
  mob: Mob;
  altura: number;
}

// Pradera con estanque: caminan, saltan, vuelan y nadan criaturas al azar
export default function EscenaMobs() {
  const { width } = useWindowDimensions();
  const estanqueW = Math.round(width * 0.42);
  const tierraW = width - estanqueW;

  const elegidos = useMemo<Elegido[]>(() => {
    const barajados = [...MOBS];
    for (let i = barajados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [barajados[i], barajados[j]] = [barajados[j], barajados[i]];
    }
    return barajados.slice(0, CANTIDAD).map((mob) => {
      const alto = mob.alto * CELDA;
      let altura = 0;
      if (mob.modo === "vuela") {
        const max = Math.max(60, ALTO - SUELO_H - alto - 10);
        altura = 60 + Math.random() * (max - 60);
      } else if (mob.modo === "nada") {
        altura = Math.random() * Math.max(0, ESTANQUE_H - alto - 16);
      }
      return { mob, altura };
    });
  }, []);

  const suelo = useMemo(() => {
    const cols = Math.ceil(width / BLOQUE);
    return Array.from({ length: FILAS }, (_, y) =>
      Array.from({ length: cols }, (_, c) => {
        if (y === 0) return tono(c, y, c * BLOQUE >= tierraW ? ARENA : PASTO);
        return tono(c, y, TIERRA);
      })
    );
  }, [width, tierraW]);

  return (
    <View style={s.escena}>
      <View pointerEvents="none" style={s.suelo}>
        {suelo.map((fila, y) => (
          <View key={y} style={{ flexDirection: "row" }}>
            {fila.map((c, i) => (
              <View key={i} style={{ width: BLOQUE, height: BLOQUE, backgroundColor: c }} />
            ))}
          </View>
        ))}
      </View>

      <View pointerEvents="none" style={[s.estanque, { left: tierraW, width: estanqueW }]}>
        <View style={s.superficie} />
      </View>

      {elegidos.map(({ mob, altura }) => {
        if (mob.modo === "nada") {
          return (
            <MobVagabundo
              key={mob.nombre}
              mob={mob}
              celda={CELDA}
              izq={tierraW + 4}
              ancho={estanqueW - 8}
              suelo={SUELO_H + 8}
              altura={altura}
            />
          );
        }
        if (mob.modo === "vuela") {
          return (
            <MobVagabundo key={mob.nombre} mob={mob} celda={CELDA} izq={0} ancho={width} suelo={SUELO_H} altura={altura} />
          );
        }
        return (
          <MobVagabundo key={mob.nombre} mob={mob} celda={CELDA} izq={0} ancho={tierraW} suelo={SUELO_H} />
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  escena: { height: ALTO, width: "100%", marginTop: 8, overflow: "hidden" },
  suelo: { position: "absolute", left: 0, right: 0, bottom: 0 },
  estanque: {
    position: "absolute",
    bottom: SUELO_H,
    height: ESTANQUE_H,
    backgroundColor: "rgba(44,120,235,0.45)",
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.35)",
  },
  superficie: { height: 6, backgroundColor: "rgba(255,255,255,0.4)" },
});
