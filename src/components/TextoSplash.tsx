import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { colors, fuente } from "../theme";

const FRASES = [
  "¡Hecho por AppForge!",
  "¡Organiza tu día!",
  "¡100% bloques!",
  "¡Ahora con etiquetas!",
  "¡Sin conexión, sin problema!",
  "¡Completa tus tareas!",
  "¡Sube de nivel!",
];

// Frase amarilla inclinada que "late", como en el menú principal
export default function TextoSplash() {
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [pulso]);

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        s.texto,
        {
          transform: [
            { rotate: "-12deg" },
            { scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
          ],
        },
      ]}
    >
      {frase}
    </Animated.Text>
  );
}

const s = StyleSheet.create({
  texto: {
    position: "absolute",
    right: 4,
    top: 76,
    fontFamily: fuente,
    fontSize: 26,
    color: colors.amarillo,
    textShadowColor: "#3f3f00",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
