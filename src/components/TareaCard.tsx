import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, prioridadColor } from "../theme";
import { Tarea } from "../types";
import { estadoVencimiento, formatearFecha } from "../utils/fechas";

interface Props {
  tarea: Tarea;
  borde: string;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  onEditar: () => void;
  onMover: (dir: -1 | 1) => void;
  onEliminar: () => void;
}

const VENCE_ESTILO = {
  vencida: { bg: "#fde8e5", fg: colors.error },
  hoy: { bg: "#fff1e0", fg: "#a15c00" },
  pronto: { bg: "#fff1e0", fg: "#a15c00" },
  normal: { bg: "#e6f0f1", fg: colors.suave },
};

export default function TareaCard({
  tarea: t,
  borde,
  puedeEditar,
  puedeEliminar,
  onEditar,
  onMover,
  onEliminar,
}: Props) {
  const venc = estadoVencimiento(t.vence, t.estado === "completado");
  const vEstilo = venc ? VENCE_ESTILO[venc] : null;
  const vTexto =
    venc === "vencida" ? "Vencida" : venc === "hoy" ? "Vence hoy" : t.vence ? formatearFecha(t.vence) : "";

  return (
    <Pressable
      style={[s.card, { borderLeftColor: borde }]}
      onPress={puedeEditar ? onEditar : undefined}
    >
      <Text style={s.titulo}>{t.titulo}</Text>
      {!!t.descripcion && <Text style={s.desc}>{t.descripcion}</Text>}

      <View style={s.chips}>
        <View style={[s.chip, { backgroundColor: prioridadColor[t.prioridad] }]}>
          <Text style={s.chipBlanco}>{t.prioridad}</Text>
        </View>
        {vEstilo && (
          <View style={[s.chip, { backgroundColor: vEstilo.bg }]}>
            <Text style={[s.chipTexto, { color: vEstilo.fg }]}>
              {venc === "vencida" || venc === "hoy" ? vTexto : `Vence ${vTexto}`}
            </Text>
          </View>
        )}
        {t.etiquetas.map((e) => (
          <View key={e.id} style={[s.chip, { backgroundColor: e.color }]}>
            <Text style={s.chipBlanco}>{e.nombre}</Text>
          </View>
        ))}
      </View>

      {t.responsables.length > 0 && (
        <Text style={s.resp}>Responsables: {t.responsables.map((r) => r.nombre).join(", ")}</Text>
      )}

      <View style={s.foot}>
        <Text style={s.autor}>{t.creadaPor}</Text>
        <View style={s.acciones}>
          <Pressable
            style={[s.icon, t.estado === "espera" && s.off]}
            disabled={t.estado === "espera"}
            onPress={() => onMover(-1)}
          >
            <Text style={s.iconTexto}>←</Text>
          </Pressable>
          <Pressable
            style={[s.icon, t.estado === "completado" && s.off]}
            disabled={t.estado === "completado"}
            onPress={() => onMover(1)}
          >
            <Text style={s.iconTexto}>→</Text>
          </Pressable>
          {puedeEliminar && (
            <Pressable style={s.icon} onPress={onEliminar}>
              <Text style={[s.iconTexto, { color: colors.error }]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  titulo: { fontSize: 16, fontWeight: "700", color: colors.texto },
  desc: { color: "#3f5b67", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  chipBlanco: { color: colors.blanco, fontSize: 12, fontWeight: "700" },
  chipTexto: { fontSize: 12, fontWeight: "700" },
  resp: { color: colors.suave, fontSize: 12, marginTop: 8 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  autor: { color: colors.suave, fontSize: 12 },
  acciones: { flexDirection: "row", gap: 6 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: "center",
    justifyContent: "center",
  },
  off: { opacity: 0.3 },
  iconTexto: { fontSize: 16, color: colors.texto },
});
