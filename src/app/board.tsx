import { useCallback, useEffect, useRef, useState } from "react";
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
import { colors, bisel, fuente, sombraTexto } from "../theme";
import { Estado, Etiqueta, Persona, ROL_LABEL, Tablero, Tarea, TareaForm, Usuario } from "../types";
import Aparecer from "../components/Aparecer";
import BarraExperiencia from "../components/BarraExperiencia";
import FondoBloques from "../components/FondoBloques";
import LogroToast, { Logro } from "../components/LogroToast";
import MobSuelo from "../components/MobSuelo";
import OrbesXP from "../components/OrbesXP";

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

  // ---------- Efectos visuales (solo observan, no cambian los datos) ----------
  const [logro, setLogro] = useState<Logro | null>(null);
  const [disparo, setDisparo] = useState(0);
  const estadosPrevios = useRef<Map<number, Estado> | null>(null);

  useEffect(() => {
    const actuales = new Map<number, Estado>(tareas.map((t) => [t.id, t.estado]));
    const antes = estadosPrevios.current;
    estadosPrevios.current = actuales;
    if (!antes) return; // primera carga: no celebrar

    // Tarea que ya existía y acaba de pasar a "Completado"
    const nueva = tareas.find((t) => {
      const previo = antes.get(t.id);
      return t.estado === "completado" && previo !== undefined && previo !== "completado";
    });
    if (nueva) {
      setLogro({ texto: nueva.titulo, clave: Date.now() });
      setDisparo((d) => d + 1);
    }
  }, [tareas]);

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
        <FondoBloques variante="piedra" />
        <BarraExperiencia
          completadas={tareas.filter((t) => t.estado === "completado").length}
          total={tareas.length}
        />
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
          renderItem={({ item, index }) => (
            <Aparecer delay={Math.min(index, 6) * 70} desde={16}>
            <TareaCard
              tarea={item}
              borde={col.color}
              puedeEditar={puedeCrear}
              puedeEliminar={puedeEliminar}
              onEditar={() => abrirEdicion(item)}
              onMover={(dir) => desplazar(item, dir)}
              onEliminar={() => eliminar(item)}
            />
            </Aparecer>
          )}
        />

        <MobSuelo />

        {puedeCrear && (
          <Pressable style={s.fab} onPress={abrirNueva}>
            <Text style={s.fabTexto}>+ Nueva tarea</Text>
          </Pressable>
        )}

        <OrbesXP disparo={disparo} />
        <LogroToast logro={logro} />
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
  safe: { flex: 1, backgroundColor: "#2b2b2b" },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#3b2a1a",
    borderBottomWidth: 4,
    borderBottomColor: "#5da130",
  },
  brand: { fontFamily: fuente, fontSize: 40, color: colors.amarillo, letterSpacing: 3, ...sombraTexto },
  user: { fontFamily: fuente, fontSize: 20, color: "#e0e0e0" },
  salir: { ...bisel.boton, paddingHorizontal: 14, paddingVertical: 6 },
  salirText: { fontFamily: fuente, fontSize: 22, color: "#ffffff", ...sombraTexto },
  body: { flex: 1, backgroundColor: "#2b2b2b" },
  tableros: { gap: 8, paddingHorizontal: 16, paddingTop: 12, alignItems: "center" },
  tableroChip: { ...bisel.boton, paddingHorizontal: 12, paddingVertical: 4 },
  tableroOn: { ...bisel.botonVerde },
  tableroTexto: { fontFamily: fuente, fontSize: 22, color: "#ffffff", ...sombraTexto },
  tableroNuevo: { paddingHorizontal: 10, paddingVertical: 6 },
  tableroNuevoTexto: { fontFamily: fuente, fontSize: 22, color: colors.amarillo, ...sombraTexto },
  nuevoTablero: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10 },
  input: {
    flex: 1,
    ...bisel.hueco,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: fuente,
    fontSize: 24,
    color: "#ffffff",
  },
  btnCrear: { ...bisel.botonVerde, paddingHorizontal: 16, justifyContent: "center" },
  btnCrearTexto: { fontFamily: fuente, fontSize: 24, color: "#ffffff", ...sombraTexto },
  tabs: { flexDirection: "row", ...bisel.panel, marginHorizontal: 16, marginTop: 4 },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 4,
    borderBottomColor: "transparent",
  },
  tabText: { fontFamily: fuente, fontSize: 21, color: "#555555" },
  count: {
    fontFamily: fuente,
    backgroundColor: "#8b8b8b",
    color: "#ffffff",
    overflow: "hidden",
    paddingHorizontal: 6,
    fontSize: 19,
  },
  empty: { fontFamily: fuente, fontSize: 24, color: "#ffffff", textAlign: "center", marginTop: 32, ...sombraTexto },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    ...bisel.botonVerde,
    paddingHorizontal: 18,
    paddingVertical: 10,
    elevation: 4,
  },
  fabTexto: { fontFamily: fuente, fontSize: 28, color: "#ffffff", ...sombraTexto },
});
