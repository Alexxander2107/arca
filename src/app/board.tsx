import { useCallback, useEffect, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth";
import {
  actualizarEstado,
  crearEtiqueta,
  crearTablero,
  crearTarea,
  editarTarea,
  eliminarTarea,
  listarEtiquetas,
  listarPersonas,
  listarTableros,
  listarTareas,
} from "../db";
import Filtros, { FILTRO_VACIO, FiltroTareas } from "../components/Filtros";
import TareaCard from "../components/TareaCard";
import TareaModal from "../components/TareaModal";
import { colors } from "../theme";
import { Estado, Etiqueta, Persona, ROL_LABEL, Tablero, Tarea, TareaForm, Usuario } from "../types";

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
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [tableroId, setTableroId] = useState<number | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activa, setActiva] = useState<Estado>("espera");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroTareas>(FILTRO_VACIO);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);

  const [creandoTablero, setCreandoTablero] = useState(false);
  const [nombreTablero, setNombreTablero] = useState("");

  const puedeCrear = usuario.rol !== "ESTUDIANTE";
  const puedeEliminar = usuario.rol === "ADMINISTRADOR";

  // Datos generales (tableros, etiquetas, personas)
  const cargarBase = useCallback(async () => {
    const [tabs, etq, pers] = await Promise.all([
      listarTableros(usuario.id),
      listarEtiquetas(),
      listarPersonas(),
    ]);
    setTableros(tabs);
    setEtiquetas(etq);
    setPersonas(pers);
    setTableroId((prev) => (prev !== null && tabs.some((t) => t.id === prev) ? prev : tabs[0].id));
  }, [usuario.id]);

  const cargarTareas = useCallback(async () => {
    if (tableroId === null) return;
    setTareas(await listarTareas(tableroId));
  }, [tableroId]);

  useEffect(() => {
    cargarBase();
  }, [cargarBase]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  // ---------- Acciones ----------
  const abrirNueva = () => {
    setEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (t: Tarea) => {
    setEditando(t);
    setModalAbierto(true);
  };

  const guardar = async (f: TareaForm) => {
    if (editando) await editarTarea(editando.id, f);
    else if (tableroId !== null) {
      await crearTarea(usuario.id, tableroId, f);
      setActiva("espera");
    }
    setModalAbierto(false);
    await cargarTareas();
  };

  const nuevaEtiqueta = async (nombre: string) => {
    const e = await crearEtiqueta(nombre);
    setEtiquetas(await listarEtiquetas());
    return e;
  };

  const desplazar = async (t: Tarea, dir: -1 | 1) => {
    const i = ORDEN.indexOf(t.estado) + dir;
    if (i < 0 || i >= ORDEN.length) return;
    await actualizarEstado(t.id, ORDEN[i]);
    await cargarTareas();
  };

  const eliminar = (t: Tarea) =>
    Alert.alert("Eliminar tarea", `¿Eliminar "${t.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarTarea(t.id);
          await cargarTareas();
        },
      },
    ]);

  const guardarTablero = async () => {
    const n = nombreTablero.trim();
    if (!n) return;
    const id = await crearTablero(usuario.id, n);
    setNombreTablero("");
    setCreandoTablero(false);
    await cargarBase();
    setTableroId(id);
    setBusqueda("");
    setFiltro(FILTRO_VACIO);
  };

  // ---------- Filtros (en memoria) ----------
  const q = busqueda.trim().toLowerCase();
  const visibles = tareas.filter((t) => {
    if (q && !`${t.titulo} ${t.descripcion}`.toLowerCase().includes(q)) return false;
    if (filtro.prioridad && t.prioridad !== filtro.prioridad) return false;
    if (filtro.etiquetaId !== null && !t.etiquetas.some((e) => e.id === filtro.etiquetaId)) return false;
    if (filtro.soloMias && !t.responsables.some((r) => r.id === usuario.id)) return false;
    return true;
  });

  const col = COLUMNAS.find((c) => c.id === activa)!;
  const items = visibles.filter((t) => t.estado === activa);

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

      <View style={s.body}>
        {/* Selector de tableros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tableros}
          style={{ flexGrow: 0 }}
        >
          {tableros.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTableroId(t.id)}
              style={[s.tableroChip, t.id === tableroId && s.tableroOn]}
            >
              <Text style={[s.tableroTexto, t.id === tableroId && { color: colors.blanco }]}>
                {t.nombre}
              </Text>
            </Pressable>
          ))}
          {puedeCrear && (
            <Pressable onPress={() => setCreandoTablero((v) => !v)} style={s.tableroNuevo}>
              <Text style={s.tableroNuevoTexto}>+ Tablero</Text>
            </Pressable>
          )}
        </ScrollView>

        {creandoTablero && (
          <View style={s.nuevoTablero}>
            <TextInput
              style={s.input}
              placeholder="Nombre del tablero"
              value={nombreTablero}
              onChangeText={setNombreTablero}
              autoFocus
            />
            <Pressable style={s.btnCrear} onPress={guardarTablero}>
              <Text style={s.btnCrearTexto}>Crear</Text>
            </Pressable>
          </View>
        )}

        <Filtros
          busqueda={busqueda}
          onBusqueda={setBusqueda}
          filtro={filtro}
          onFiltro={setFiltro}
          etiquetas={etiquetas}
        />

        {/* Pestañas de estado */}
        <View style={s.tabs}>
          {COLUMNAS.map((c) => {
            const n = visibles.filter((t) => t.estado === c.id).length;
            const on = c.id === activa;
            return (
              <Pressable
                key={c.id}
                onPress={() => setActiva(c.id)}
                style={[s.tab, on && { borderBottomColor: c.color }]}
              >
                <Text style={[s.tabText, on && { color: colors.abismo }]}>{c.titulo}</Text>
                <Text style={[s.count, on && { backgroundColor: c.color, color: "#fff" }]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={items}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 90, flexGrow: 1 }}
          ListEmptyComponent={<Text style={s.empty}>{col.vacio}</Text>}
          renderItem={({ item }) => (
            <TareaCard
              tarea={item}
              borde={col.color}
              puedeEditar={puedeCrear}
              puedeEliminar={puedeEliminar}
              onEditar={() => abrirEdicion(item)}
              onMover={(dir) => desplazar(item, dir)}
              onEliminar={() => eliminar(item)}
            />
          )}
        />

        {puedeCrear && (
          <Pressable style={s.fab} onPress={abrirNueva}>
            <Text style={s.fabTexto}>+ Nueva tarea</Text>
          </Pressable>
        )}
      </View>

      <TareaModal
        visible={modalAbierto}
        inicial={editando}
        etiquetas={etiquetas}
        personas={personas}
        onClose={() => setModalAbierto(false)}
        onGuardar={guardar}
        onCrearEtiqueta={nuevaEtiqueta}
      />
    </SafeAreaView>
  );
}

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
  salir: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.4)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  salirText: { color: colors.blanco, fontWeight: "600" },
  body: { flex: 1, backgroundColor: colors.espuma },
  tableros: { gap: 8, paddingHorizontal: 16, paddingTop: 12, alignItems: "center" },
  tableroChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.blanco,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tableroOn: { backgroundColor: colors.abismo, borderColor: colors.abismo },
  tableroTexto: { color: colors.texto, fontWeight: "700" },
  tableroNuevo: { paddingHorizontal: 10, paddingVertical: 8 },
  tableroNuevoTexto: { color: colors.laguna, fontWeight: "700" },
  nuevoTablero: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    color: colors.texto,
  },
  btnCrear: { backgroundColor: colors.laguna, borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  btnCrearTexto: { color: colors.blanco, fontWeight: "700" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.borde },
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    backgroundColor: colors.laguna,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabTexto: { color: colors.blanco, fontWeight: "700", fontSize: 15 },
});
