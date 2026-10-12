import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, fuente } from "../theme";

export interface Logro {
  texto: string;
  clave: number;
}

// Aviso que baja desde arriba, estilo "¡Logro conseguido!"
export default function LogroToast({ logro }: { logro: Logro | null }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!logro) return;
    v.setValue(0);
    const secuencia = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    secuencia.start();
    return () => secuencia.stop();
  }, [logro, v]);

  if (!logro) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.caja,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-110, 0] }) }],
        },
      ]}
    >
      <View style={s.icono}>
        <View style={s.iconoInterior} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.titulo}>¡Logro conseguido!</Text>
        <Text style={s.texto} numberOfLines={1}>
          Tarea completada: {logro.texto}
        </Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  caja: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 20,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    backgroundColor: "#1d1d1d",
    borderWidth: 3,
    borderTopColor: "#6b6b6b",
    borderLeftColor: "#6b6b6b",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
  icono: { width: 40, height: 40, backgroundColor: "#c98a12", alignItems: "center", justifyContent: "center" },
  iconoInterior: { width: 24, height: 24, backgroundColor: colors.amarillo },
  titulo: { fontFamily: fuente, fontSize: 24, color: colors.amarillo },
  texto: { fontFamily: fuente, fontSize: 20, color: "#ffffff" },
});
