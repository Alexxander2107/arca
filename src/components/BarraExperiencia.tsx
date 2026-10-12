import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { bisel, fuente, sombraTexto } from "../theme";

interface Props {
  completadas: number;
  total: number;
}

const SEGMENTOS = 20;

// Barra de experiencia: el "nivel" son las tareas completadas
export default function BarraExperiencia({ completadas, total }: Props) {
  const fraccion = total === 0 ? 0 : completadas / total;
  const anim = useRef(new Animated.Value(fraccion)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: fraccion,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fraccion, anim]);

  return (
    <View style={s.fila}>
      <Text style={s.nivel}>Nivel {completadas}</Text>
      <View style={s.barra}>
        <Animated.View
          style={[s.relleno, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]}
        />
        <View style={s.segmentos} pointerEvents="none">
          {Array.from({ length: SEGMENTOS }, (_, i) => (
            <View key={i} style={s.segmento} />
          ))}
        </View>
      </View>
      <Text style={s.conteo}>
        {completadas}/{total}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  nivel: { fontFamily: fuente, fontSize: 24, color: "#7fe02a", ...sombraTexto },
  barra: { flex: 1, height: 16, ...bisel.hueco, borderWidth: 2, overflow: "hidden" },
  relleno: { height: "100%", backgroundColor: "#7fe02a" },
  segmentos: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" },
  segmento: { flex: 1, borderRightWidth: 2, borderRightColor: "rgba(0,0,0,0.55)" },
  conteo: { fontFamily: fuente, fontSize: 20, color: "#ffffff", ...sombraTexto },
});
