import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

const COLORES = ["#b6ff3a", "#7fe02a", "#e8ff6a"];
const CANTIDAD = 12;

// Cada vez que `disparo` aumenta, salen orbes de experiencia hacia arriba
export default function OrbesXP({ disparo }: { disparo: number }) {
  const { width, height } = useWindowDimensions();
  const valores = useRef(Array.from({ length: CANTIDAD }, () => new Animated.Value(0))).current;

  // Trayectoria fija por orbe (se sortea una sola vez)
  const orbes = useMemo(
    () =>
      Array.from({ length: CANTIDAD }, (_, i) => ({
        dx: (Math.random() - 0.5) * 220,
        color: COLORES[i % COLORES.length],
        lado: 8 + Math.floor(Math.random() * 6),
        duracion: 900 + Math.floor(Math.random() * 500),
      })),
    []
  );

  useEffect(() => {
    if (disparo === 0) return;
    const animaciones = valores.map((v, i) => {
      v.setValue(0);
      return Animated.timing(v, {
        toValue: 1,
        duration: orbes[i].duracion,
        delay: i * 40,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });
    const a = Animated.parallel(animaciones);
    a.start();
    return () => a.stop();
  }, [disparo, valores, orbes]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orbes.map((o, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: width / 2 - o.lado / 2,
            bottom: 110,
            width: o.lado,
            height: o.lado,
            backgroundColor: o.color,
            opacity: valores[i].interpolate({ inputRange: [0, 0.08, 0.8, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: valores[i].interpolate({ inputRange: [0, 1], outputRange: [0, o.dx] }) },
              { translateY: valores[i].interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.55] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
