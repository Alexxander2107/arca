import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, prioridadColor, bisel, fuente, sombraTexto } from "../theme";
import { Etiqueta, Persona, Prioridad, Tarea, TareaForm } from "../types";
import { fechaValida, sumarDias } from "../utils/fechas";
import FondoBloques from "./FondoBloques";

interface Props {
  visible: boolean;
  inicial: Tarea | null; // null = tarea nueva
  etiquetas: Etiqueta[];
  personas: Persona[];
  onClose: () => void;
  onGuardar: (f: TareaForm) => Promise<void>;
  onCrearEtiqueta: (nombre: string) => Promise<Etiqueta>;
}

const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

export default function TareaModal({
  visible,
  inicial,
  etiquetas,
  personas,
  onClose,
  onGuardar,
  onCrearEtiqueta,
}: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [vence, setVence] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("Media");
  const [etqIds, setEtqIds] = useState<number[]>([]);
  const [respIds, setRespIds] = useState<number[]>([]);
  const [nuevaEtq, setNuevaEtq] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre, carga los datos de la tarea (o vacía si es nueva)
  useEffect(() => {
    if (!visible) return;
    setTitulo(inicial?.titulo ?? "");
    setDescripcion(inicial?.descripcion ?? "");
    setVence(inicial?.vence ?? "");
    setPrioridad(inicial?.prioridad ?? "Media");
    setEtqIds(inicial?.etiquetas.map((e) => e.id) ?? []);
    setRespIds(inicial?.responsables.map((r) => r.id) ?? []);
    setNuevaEtq("");
    setError("");
  }, [visible, inicial]);

  const alternar = (lista: number[], set: (v: number[]) => void, id: number) =>
    set(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

  const agregarEtiqueta = async () => {
    const n = nuevaEtq.trim();
    if (!n) return;
    const e = await onCrearEtiqueta(n);
    setEtqIds((p) => (p.includes(e.id) ? p : [...p, e.id]));
    setNuevaEtq("");
  };

  const guardar = async () => {
    if (!titulo.trim()) return setError("Escribe un título.");
    const v = vence.trim();
    if (v && !fechaValida(v))
      return setError("La fecha debe tener el formato AAAA-MM-DD (ej. 2026-11-30).");

    setGuardando(true);
    try {
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        vence: v || null,
        prioridad,
        etiquetaIds: etqIds,
        responsableIds: respIds,
      });
    } catch {
      setError("No se pudo guardar la tarea.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <FondoBloques variante="tierra" />
        <View style={s.header}>
          <Text style={s.headerTitulo}>{inicial ? "Editar tarea" : "Nueva tarea"}</Text>
          <Pressable onPress={onClose}>
            <Text style={s.cerrar}>Cancelar</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <Text style={s.label}>Título</Text>
            <TextInput style={s.input} value={titulo} onChangeText={setTitulo} />

            <Text style={s.label}>Descripción</Text>
            <TextInput
              style={[s.input, { minHeight: 70, textAlignVertical: "top" }]}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />

            <Text style={s.label}>Fecha límite (AAAA-MM-DD)</Text>
            <TextInput
              style={s.input}
              value={vence}
              onChangeText={setVence}
              placeholder="2026-11-30"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <View style={s.fila}>
              <Pressable style={s.atajo} onPress={() => setVence(sumarDias(1))}>
                <Text style={s.atajoTexto}>Mañana</Text>
              </Pressable>
              <Pressable style={s.atajo} onPress={() => setVence(sumarDias(7))}>
                <Text style={s.atajoTexto}>+7 días</Text>
              </Pressable>
              <Pressable style={s.atajo} onPress={() => setVence("")}>
                <Text style={s.atajoTexto}>Sin fecha</Text>
              </Pressable>
            </View>

            <Text style={s.label}>Prioridad</Text>
            <View style={s.fila}>
              {PRIORIDADES.map((p) => {
                const on = prioridad === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPrioridad(p)}
                    style={[s.segmento, on && { backgroundColor: prioridadColor[p], borderColor: prioridadColor[p] }]}
                  >
                    <Text style={[s.segmentoTexto, on && { color: colors.blanco }]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>Responsables</Text>
            <View style={s.fila}>
              {personas.map((p) => {
                const on = respIds.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => alternar(respIds, setRespIds, p.id)}
                    style={[s.opcion, on && s.opcionOn]}
                  >
                    <Text style={[s.opcionTexto, on && { color: colors.blanco }]}>{p.nombre}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>Etiquetas</Text>
            <View style={s.fila}>
              {etiquetas.map((e) => {
                const on = etqIds.includes(e.id);
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => alternar(etqIds, setEtqIds, e.id)}
                    style={[s.opcion, { borderColor: e.color }, on && { backgroundColor: e.color }]}
                  >
                    <Text style={[s.opcionTexto, on && { color: colors.blanco }]}>{e.nombre}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[s.fila, { marginTop: 8 }]}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={nuevaEtq}
                onChangeText={setNuevaEtq}
                placeholder="Nueva etiqueta"
              />
              <Pressable style={s.btnSec} onPress={agregarEtiqueta}>
                <Text style={s.btnSecTexto}>Agregar</Text>
              </Pressable>
            </View>

            {!!error && <Text style={s.error}>{error}</Text>}

            <Pressable style={[s.btn, guardando && { opacity: 0.6 }]} onPress={guardar} disabled={guardando}>
              <Text style={s.btnTexto}>{inicial ? "Guardar cambios" : "Crear tarea"}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#3b2a1a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3b2a1a",
    borderBottomWidth: 4,
    borderBottomColor: "#5da130",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitulo: { fontFamily: fuente, fontSize: 32, color: colors.amarillo, ...sombraTexto },
  cerrar: { fontFamily: fuente, fontSize: 24, color: "#e0e0e0" },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontFamily: fuente, fontSize: 24, color: "#ffffff", marginTop: 14, marginBottom: 4, ...sombraTexto },
  input: {
    ...bisel.hueco,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fuente,
    fontSize: 24,
    color: "#ffffff",
  },
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 6 },
  atajo: { ...bisel.boton, paddingHorizontal: 10, paddingVertical: 2 },
  atajoTexto: { fontFamily: fuente, fontSize: 21, color: "#ffffff", ...sombraTexto },
  segmento: { flex: 1, alignItems: "center", paddingVertical: 8, ...bisel.boton },
  segmentoTexto: { fontFamily: fuente, fontSize: 24, color: "#ffffff", ...sombraTexto },
  opcion: { ...bisel.boton, paddingHorizontal: 10, paddingVertical: 3 },
  opcionOn: { ...bisel.botonVerde },
  opcionTexto: { fontFamily: fuente, fontSize: 21, color: "#ffffff", ...sombraTexto },
  btnSec: { ...bisel.boton, paddingHorizontal: 14, paddingVertical: 8 },
  btnSecTexto: { fontFamily: fuente, fontSize: 24, color: "#ffffff", ...sombraTexto },
  error: { fontFamily: fuente, fontSize: 24, color: "#ff6b6b", marginTop: 14, ...sombraTexto },
  btn: { ...bisel.botonVerde, paddingVertical: 12, alignItems: "center", marginTop: 22 },
  btnTexto: { fontFamily: fuente, fontSize: 30, color: "#ffffff", ...sombraTexto },
});
