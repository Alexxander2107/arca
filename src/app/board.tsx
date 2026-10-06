import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth";
import { getTareas, saveTareas, uid } from "../storage";
import { colors } from "../theme";
import { Estado, ROL_LABEL, Tarea, Usuario } from "../types";

const COLUMNAS: { id: Estado; titulo: string; vacio: string; color: string }[] = [
  { id: "espera", titulo: "En espera", vacio: "Sin tareas pendientes.", color: "#8fa3ab" },
  { id: "proceso", titulo: "En proceso", vacio: "Nada en curso por ahora.", color: colors.coral },
  { id: "completado", titulo: "Completado", vacio: "Aún no hay tareas terminadas.", color: colors.laguna },
];
const ORDEN: Estado[] = ["espera", "proceso", "completado"];

interface Props {
  usuario: Usuario;
  onSalir: () => void;
}

function BoardContent({ usuario, onSalir }: Props) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [listo, setListo] = useState(false);
  const [activa, setActiva] = useState<Estado>("espera");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const esDueno = usuario.rol === "dueno";
  const primera = useRef(true);

  useEffect(() => {
    getTareas().then((t) => {
      setTareas(t);
      setListo(true);
    });
  }, []);

  // Guarda cada cambio (después de la carga inicial)
  useEffect(() => {
    if (!listo) return;
    if (primera.current) {
      primera.current = false;
      return;
    }
    saveTareas(tareas);
  }, [tareas, listo]);

  const crear = () => {
    if (!titulo.trim()) return;
    const nueva: Tarea = {
      id: uid(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      estado: "espera",
      creadaPor: usuario.nombre,
      creadaEn: Date.now(),
    };
    setTareas((t) => [nueva, ...t]);
    setTitulo("");
    setDescripcion("");
    setActiva("espera");
  };

  const desplazar = (t: Tarea, dir: -1 | 1) => {
    const i = ORDEN.indexOf(t.estado) + dir;
    if (i < 0 || i >= ORDEN.length) return;
    setTareas((all) => all.map((x) => (x.id === t.id ? { ...x, estado: ORDEN[i] } : x)));
  };

  const eliminar = (t: Tarea) =>
    Alert.alert("Eliminar tarea", `¿Eliminar "${t.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setTareas((all) => all.filter((x) => x.id !== t.id)),
      },
    ]);

  const col = COLUMNAS.find((c) => c.id === activa)!;
  const items = tareas.filter((t) => t.estado === activa);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.topbar}>
        <View>
          <Text style={s.brand}>ARCA</Text>
          <Text style={s.user}>
            {usuario.nombre} · {ROL_LABEL[usuario.rol]}
          </Text>
        </View>
        <Pressable onPress={onSalir} style={s.salir}>
          <Text style={s.salirText}>Salir</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={s.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {esDueno ? (
          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="Nueva tarea"
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              style={s.input}
              placeholder="Detalle (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <Pressable style={s.btn} onPress={crear}>
              <Text style={s.btnText}>Agregar tarea</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={s.hint}>
            Como secretaria puedes actualizar el estado de las tareas. Solo el dueño
            puede crearlas o eliminarlas.
          </Text>
        )}

        <View style={s.tabs}>
          {COLUMNAS.map((c) => {
            const n = tareas.filter((t) => t.estado === c.id).length;
            const on = c.id === activa;
            return (
              <Pressable
                key={c.id}
                onPress={() => setActiva(c.id)}
                style={[s.tab, on && { borderBottomColor: c.color }]}
              >
                <Text style={[s.tabText, on && { color: colors.abismo }]}>{c.titulo}</Text>
                <Text style={[s.count, on && { backgroundColor: c.color, color: "#fff" }]}>
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16, paddingTop: 12, flexGrow: 1 }}
          ListEmptyComponent={<Text style={s.empty}>{col.vacio}</Text>}
          renderItem={({ item }) => (
            <View style={[s.card, { borderLeftColor: col.color }]}>
              <Text style={s.cardTitle}>{item.titulo}</Text>
              {!!item.descripcion && <Text style={s.cardDesc}>{item.descripcion}</Text>}
              <View style={s.cardFoot}>
                <Text style={s.autor}>{item.creadaPor}</Text>
                <View style={s.actions}>
                  <Pressable
                    style={[s.icon, item.estado === "espera" && s.iconOff]}
                    disabled={item.estado === "espera"}
                    onPress={() => desplazar(item, -1)}
                  >
                    <Text style={s.iconText}>←</Text>
                  </Pressable>
                  <Pressable
                    style={[s.icon, item.estado === "completado" && s.iconOff]}
                    disabled={item.estado === "completado"}
                    onPress={() => desplazar(item, 1)}
                  >
                    <Text style={s.iconText}>→</Text>
                  </Pressable>
                  {esDueno && (
                    <Pressable style={s.icon} onPress={() => eliminar(item)}>
                      <Text style={[s.iconText, { color: colors.error }]}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.abismo },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { color: colors.blanco, fontSize: 24, fontWeight: "800", letterSpacing: 2 },
  user: { color: "#b9d3d8", fontSize: 13 },
  salir: { borderWidth: 1, borderColor: "rgba(255,255,255,.4)", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  salirText: { color: colors.blanco, fontWeight: "600" },
  body: { flex: 1, backgroundColor: colors.espuma },
  form: { padding: 16, paddingBottom: 4, gap: 8 },
  hint: { color: colors.suave, padding: 16, paddingBottom: 4 },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.texto,
  },
  btn: { backgroundColor: colors.laguna, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { color: colors.blanco, fontWeight: "700", fontSize: 15 },
  tabs: { flexDirection: "row", marginTop: 8, borderBottomWidth: 1, borderBottomColor: colors.borde },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: { color: colors.suave, fontWeight: "600", fontSize: 13 },
  count: {
    backgroundColor: "#dcecee",
    color: colors.texto,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  empty: { color: colors.suave, textAlign: "center", marginTop: 32 },
  card: {
    backgroundColor: colors.blanco,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.texto },
  cardDesc: { color: "#3f5b67", marginTop: 4 },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  autor: { color: colors.suave, fontSize: 12 },
  actions: { flexDirection: "row", gap: 6 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOff: { opacity: 0.3 },
  iconText: { fontSize: 16, color: colors.texto },
});

// Pantalla de la ruta /board: protege el acceso y entrega el usuario
export default function Board() {
  const { usuario, cargando, salir } = useAuth();
  const router = useRouter();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.abismo }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }
  if (!usuario) return <Redirect href="/login" />;

  return (
    <BoardContent
      usuario={usuario}
      onSalir={async () => {
        await salir();
        router.replace("/login");
      }}
    />
  );
}