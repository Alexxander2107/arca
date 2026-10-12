import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, prioridadColor, bisel, fuente, sombraTexto } from "../theme";
import { Etiqueta, Prioridad } from "../types";

export interface FiltroTareas {
  etiquetaId: number | null;
  prioridad: Prioridad | null;
  soloMias: boolean;
}

export const FILTRO_VACIO: FiltroTareas = { etiquetaId: null, prioridad: null, soloMias: false };

interface Props {
  busqueda: string;
  onBusqueda: (v: string) => void;
  filtro: FiltroTareas;
  onFiltro: (f: FiltroTareas) => void;
  etiquetas: Etiqueta[];
}

const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

function Chip({
  texto,
  activo,
  color = colors.laguna,
  onPress,
}: {
  texto: string;
  activo: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, { borderColor: color }, activo && { backgroundColor: color }]}
    >
      <Text style={[s.chipTexto, activo && { color: colors.blanco }]}>{texto}</Text>
    </Pressable>
  );
}

export default function Filtros({ busqueda, onBusqueda, filtro, onFiltro, etiquetas }: Props) {
  const hayFiltro =
    !!busqueda || filtro.etiquetaId !== null || filtro.prioridad !== null || filtro.soloMias;

  return (
    <View style={s.caja}>
      <TextInput
        style={s.input}
        value={busqueda}
        onChangeText={onBusqueda}
        placeholder="Buscar tareas..."
        clearButtonMode="while-editing"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fila}>
        <Chip
          texto="Mis tareas"
          activo={filtro.soloMias}
          onPress={() => onFiltro({ ...filtro, soloMias: !filtro.soloMias })}
        />
        {PRIORIDADES.map((p) => (
          <Chip
            key={p}
            texto={p}
            color={prioridadColor[p]}
            activo={filtro.prioridad === p}
            onPress={() => onFiltro({ ...filtro, prioridad: filtro.prioridad === p ? null : p })}
          />
        ))}
        {etiquetas.map((e) => (
          <Chip
            key={e.id}
            texto={e.nombre}
            color={e.color}
            activo={filtro.etiquetaId === e.id}
            onPress={() => onFiltro({ ...filtro, etiquetaId: filtro.etiquetaId === e.id ? null : e.id })}
          />
        ))}
        {hayFiltro && (
          <Pressable
            onPress={() => {
              onBusqueda("");
              onFiltro(FILTRO_VACIO);
            }}
          >
            <Text style={s.limpiar}>Limpiar</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  caja: { paddingHorizontal: 16, paddingTop: 10 },
  input: {
    ...bisel.hueco,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: fuente,
    fontSize: 24,
    color: "#ffffff",
  },
  fila: { flexDirection: "row", gap: 8, paddingVertical: 10, alignItems: "center" },
  chip: { ...bisel.boton, paddingHorizontal: 10, paddingVertical: 2 },
  chipTexto: { fontFamily: fuente, fontSize: 21, color: "#ffffff", ...sombraTexto },
  limpiar: { fontFamily: fuente, fontSize: 21, color: "#ff6b6b", paddingHorizontal: 6, ...sombraTexto },
});
