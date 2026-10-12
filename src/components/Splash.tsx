import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, fuente } from "../theme";
import MobCorredor from "./MobCorredor";
import { MOBS } from "./mobs";

// Para usar tu logo real: reemplaza src/assets/appforge-logo.png por un PNG
// transparente. Si ese PNG ya incluye la palabra "AppForge", pon esto en false.
const MOSTRAR_TEXTO = true;
const LOGO = require("../assets/appforge-logo.png");

const SEGMENTOS = 20;
const DURACION = 3200; // ms que tarda en llenarse la barra
const CARRERA = 3400; // ms que tarda el mob en cruzar la pantalla
const BLOQUE = 16; // tamaño de cada bloque del suelo
const FILAS = 4;
const SUELO_H = BLOQUE * FILAS;
const CELDA = 6; // tamaño de cada "píxel" del mob

const CONSEJOS = [
  "Toca una tarea para editarla",
  "Usa etiquetas para ordenar tus tareas",
  "Filtra por \"Mis tareas\" para ver lo tuyo",
  "Funciona incluso sin conexión",
  "Crea varios tableros para separar proyectos",
];

const PASTO = ["#5da130", "#4f8f27", "#6bb23a"];
const TIERRA = ["#7a5230", "#6a4526", "#8a5c36"];
const color = (x: number, y: number, paleta: string[]) =>
  paleta[(((x * 73856093) ^ (y * 19349663)) >>> 0) % paleta.length];

export default function Splash({ onFinish }: { onFinish: () => void }) {
  const { width } = useWindowDimensions();
  const logo = useRef(new Animated.Value(0)).current;
  const progreso = useRef(new Animated.Value(0)).current;
  const corre = useRef(new Animated.Value(0)).current;
  const salto = useRef(new Animated.Value(0)).current;
  const [llenos, setLlenos] = useState(0);

  // Mob y sentido de la carrera totalmente aleatorios (hostil o no)
  const mob = useMemo(() => MOBS[Math.floor(Math.random() * MOBS.length)], []);
  const haciaDerecha = useMemo(() => Math.random() < 0.5, []);
  const consejo = useMemo(() => CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)], []);
  const anchoMob = mob.ancho * CELDA;

  const columnas = Math.ceil(width / BLOQUE);
  const suelo = useMemo(
    () =>
      Array.from({ length: FILAS }, (_, y) =>
        Array.from({ length: columnas }, (_, x) => color(x, y, y === 0 ? PASTO : TIERRA))
      ),
    [columnas]
  );

  useEffect(() => {
    const id = progreso.addListener(({ value }) => setLlenos(Math.floor(value * SEGMENTOS)));
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const entradaLogo = Animated.timing(logo, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    });

    const barra = Animated.timing(progreso, {
      toValue: 1,
      duration: DURACION,
      delay: 400,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    });

    // El mob cruza la pantalla una y otra vez mientras carga
    const carrera = Animated.loop(
      Animated.timing(corre, {
        toValue: 1,
        duration: CARRERA,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pequeño rebote al correr (más alto si el mob salta)
    const paso = mob.salta ? 380 : 150;
    const rebote = Animated.loop(
      Animated.sequence([
        Animated.timing(salto, { toValue: 1, duration: paso, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(salto, { toValue: 0, duration: paso, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );

    entradaLogo.start();
    carrera.start();
    rebote.start();
    barra.start(({ finished }) => {
      if (finished) temporizador = setTimeout(onFinish, 250);
    });

    return () => {
      progreso.removeListener(id);
      if (temporizador) clearTimeout(temporizador);
      entradaLogo.stop();
      carrera.stop();
      rebote.stop();
      barra.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const desde = haciaDerecha ? -anchoMob : width;
  const hasta = haciaDerecha ? width : -anchoMob;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* El mob se dibuja primero: corre POR DETRÁS del logo y la barra */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.mob,
          {
            transform: [
              { translateX: corre.interpolate({ inputRange: [0, 1], outputRange: [desde, hasta] }) },
              { translateY: salto.interpolate({ inputRange: [0, 1], outputRange: [0, mob.salta ? -26 : -4] }) },
              { scaleX: haciaDerecha ? 1 : -1 },
            ],
          },
        ]}
      >
        <MobCorredor mob={mob} celda={CELDA} />
      </Animated.View>

      <View style={s.centro}>
        <Animated.View
          style={{
            alignItems: "center",
            opacity: logo,
            transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          }}
        >
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
          {MOSTRAR_TEXTO && <Text style={s.marca}>AppForge</Text>}
        </Animated.View>
      </View>

      {/* Barra de carga por bloques */}
      <View style={s.zonaBarra}>
        <Text style={s.cargando}>Cargando...</Text>
        <View style={s.barra}>
          {Array.from({ length: SEGMENTOS }, (_, i) => (
            <View key={i} style={[s.segmento, i < llenos && s.segmentoLleno]} />
          ))}
        </View>
        <Text style={s.consejo}>Consejo: {consejo}</Text>
      </View>

      <View style={s.suelo}>
        {suelo.map((fila, y) => (
          <View key={y} style={{ flexDirection: "row" }}>
            {fila.map((c, x) => (
              <View key={x} style={{ width: BLOQUE, height: BLOQUE, backgroundColor: c }} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.amarillo, overflow: "hidden" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: SUELO_H + 90 },
  logo: { width: 190, height: 162 },
  marca: { fontSize: 38, fontWeight: "800", color: "#111", letterSpacing: 1, marginTop: 4 },
  zonaBarra: { position: "absolute", left: 0, right: 0, bottom: SUELO_H + 70, alignItems: "center" },
  cargando: { fontFamily: fuente, color: "#111", fontSize: 24, marginBottom: 6 },
  barra: {
    width: "76%",
    height: 22,
    borderWidth: 3,
    borderColor: "#111",
    backgroundColor: "#e0b000",
    flexDirection: "row",
    padding: 2,
  },
  segmento: { flex: 1, marginHorizontal: 1, backgroundColor: "transparent" },
  segmentoLleno: { backgroundColor: "#111" },
  consejo: { fontFamily: fuente, color: "#3a2f00", fontSize: 19, marginTop: 8, textAlign: "center", paddingHorizontal: 24 },
  mob: { position: "absolute", left: 0, bottom: SUELO_H },
  suelo: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
