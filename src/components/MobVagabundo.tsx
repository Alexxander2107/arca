import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text } from "react-native";
import { fuente, sombraTexto } from "../theme";
import MobCorredor from "./MobCorredor";
import { Mob } from "./mobs";

interface Props {
  mob: Mob;
  celda: number;
  izq: number; // borde izquierdo de su zona (px)
  ancho: number; // ancho de su zona (px)
  suelo: number; // altura del suelo desde el borde inferior (px)
  altura?: number; // elevación extra: vuelo o profundidad en el agua (px)
}

// Camina, salta, vuela o nada según su modo; al tocarlo salta y "habla"
export default function MobVagabundo({ mob, celda, izq, ancho, suelo, altura = 0 }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(1)).current;
  const y = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const [habla, setHabla] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anchoMob = mob.ancho * celda;
  const recorrido = Math.max(0, ancho - anchoMob);
  const enAire = mob.modo === "vuela" || mob.modo === "nada";
  const pasoPatas =
    mob.modo === "vuela" ? 110 : mob.modo === "nada" ? 240 : mob.modo === "salta" ? 220 : 240 / (mob.velocidad ?? 1);

  useEffect(() => {
    const vel = mob.velocidad ?? 1;
    const msPorPx = (mob.modo === "vuela" ? 11 : mob.modo === "nada" ? 15 : 22) / vel;
    const pausa = enAire ? 250 : 1200;

    const mover = (a: number) =>
      Animated.timing(x, {
        toValue: a,
        duration: Math.max(1, recorrido) * msPorPx,
        easing: Easing.linear,
        useNativeDriver: false,
      });
    const girar = (a: number) => Animated.timing(flip, { toValue: a, duration: 1, useNativeDriver: false });

    // Cada criatura empieza en un punto y con un retraso distinto
    x.setValue(Math.random() * recorrido);
    const paseo = Animated.sequence([
      Animated.delay(Math.random() * 1200),
      Animated.loop(
        Animated.sequence([mover(recorrido), Animated.delay(pausa), girar(-1), mover(0), Animated.delay(pausa), girar(1)])
      ),
    ]);

    // Movimiento vertical: saltitos, aleteo o flotar
    const amp = mob.modo === "salta" ? 3 * celda : mob.modo === "vuela" ? 2 * celda : mob.modo === "nada" ? 1.2 * celda : 0;
    const dur = mob.modo === "salta" ? 260 : mob.modo === "vuela" ? 600 : 800;
    const suave = enAire ? Easing.inOut(Easing.sin) : null;
    const vertical =
      amp > 0
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(y, { toValue: -amp, duration: dur, easing: suave ?? Easing.out(Easing.quad), useNativeDriver: false }),
              Animated.timing(y, { toValue: 0, duration: dur, easing: suave ?? Easing.in(Easing.quad), useNativeDriver: false }),
            ])
          )
        : null;

    paseo.start();
    vertical?.start();
    return () => {
      paseo.stop();
      vertical?.stop();
      if (temporizador.current) clearTimeout(temporizador.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorrido, celda]);

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
    <Animated.View
      style={[
        s.base,
        {
          left: izq,
          bottom: suelo + altura,
          transform: [
            { translateX: x },
            { translateY: Animated.add(y, hop.interpolate({ inputRange: [0, 1], outputRange: [0, -18] })) },
          ],
        },
      ]}
    >
      {habla && (
        <Text style={s.globo} numberOfLines={1}>
          {mob.grito}
        </Text>
      )}
      <Animated.View style={{ transform: [{ scaleX: flip }] }}>
        <Pressable onPress={tocar} hitSlop={8}>
          <MobCorredor mob={mob} celda={celda} paso={pasoPatas} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: { position: "absolute" },
  globo: {
    position: "absolute",
    top: -28,
    left: 0,
    fontFamily: fuente,
    fontSize: 22,
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    ...sombraTexto,
  },
});
