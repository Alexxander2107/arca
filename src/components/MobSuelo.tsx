import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { fuente, sombraTexto } from "../theme";
import MobCorredor from "./MobCorredor";
import { MOBS } from "./mobs";

const CELDA = 4;
const BLOQUE = 10;
const FILAS = 2;
const SUELO_H = BLOQUE * FILAS;

const GRITOS: Record<string, string> = {
  Cerdo: "¡Oinc!",
  Gallina: "¡Cloc!",
  Oveja: "¡Beee!",
  Vaca: "¡Muuu!",
  Zombi: "¡Uhhh!",
  Esqueleto: "¡Clac!",
  Araña: "¡Tsss!",
  Limo: "¡Boing!",
};

const PASTO = ["#5da130", "#4f8f27", "#6bb23a"];
const TIERRA = ["#7a5230", "#6a4526", "#8a5c36"];
const tono = (x: number, y: number, paleta: string[]) =>
  paleta[(((x * 73856093) ^ (y * 19349663)) >>> 0) % paleta.length];

// Mascota aleatoria que pasea por el suelo; al tocarla salta y "habla"
export default function MobSuelo() {
  const { width } = useWindowDimensions();
  const mob = useMemo(() => MOBS[Math.floor(Math.random() * MOBS.length)], []);
  const x = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(1)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const [habla, setHabla] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anchoMob = mob.ancho * CELDA;
  const recorrido = Math.max(0, width - anchoMob - 16);

  const suelo = useMemo(() => {
    const cols = Math.ceil(width / BLOQUE);
    return Array.from({ length: FILAS }, (_, y) =>
      Array.from({ length: cols }, (_, c) => tono(c, y, y === 0 ? PASTO : TIERRA))
    );
  }, [width]);

  useEffect(() => {
    const caminar = (hasta: number) =>
      Animated.timing(x, { toValue: hasta, duration: recorrido * 22, easing: Easing.linear, useNativeDriver: false });
    const girar = (a: number) => Animated.timing(flip, { toValue: a, duration: 1, useNativeDriver: false });

    const paseo = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        caminar(recorrido),
        Animated.delay(1200),
        girar(-1),
        caminar(0),
        Animated.delay(1200),
        girar(1),
      ])
    );
    paseo.start();
    return () => {
      paseo.stop();
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [recorrido, x, flip]);

  const tocar = () => {
    setHabla(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setHabla(false), 1100);
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(hop, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]).start();
  };

  return (
    <View pointerEvents="box-none" style={s.caja}>
      <Animated.View
        style={[
          s.mob,
          { transform: [{ translateX: x }, { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }] },
        ]}
      >
        {habla && (
          <Text style={s.globo} numberOfLines={1}>
            {GRITOS[mob.nombre] ?? "¡Hola!"}
          </Text>
        )}
        <Animated.View style={{ transform: [{ scaleX: flip }] }}>
          <Pressable onPress={tocar} hitSlop={8}>
            <MobCorredor mob={mob} celda={CELDA} paso={260} />
          </Pressable>
        </Animated.View>
      </Animated.View>

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
  caja: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  mob: { position: "absolute", left: 8, bottom: SUELO_H },
  globo: {
    position: "absolute",
    top: -26,
    left: 0,
    fontFamily: fuente,
    fontSize: 22,
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    ...sombraTexto,
  },
  suelo: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
