import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, prioridadColor, bisel, fuente, sombraTexto } from "../theme";
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
  card: { ...bisel.panel, padding: 12, marginBottom: 10, borderLeftWidth: 8 },
  titulo: { fontFamily: fuente, fontSize: 26, color: "#222222" },
  desc: { fontFamily: fuente, fontSize: 21, color: "#3a3a3a", marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 1, borderWidth: 2, borderColor: "#222222" },
  chipBlanco: { fontFamily: fuente, color: "#ffffff", fontSize: 19, ...sombraTexto, textShadowOffset: { width: 1, height: 1 } },
  chipTexto: { fontFamily: fuente, fontSize: 19 },
  resp: { fontFamily: fuente, color: "#444444", fontSize: 19, marginTop: 6 },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  autor: { fontFamily: fuente, color: "#444444", fontSize: 19 },
  acciones: { flexDirection: "row", gap: 6 },
  icon: { ...bisel.boton, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  off: { opacity: 0.35 },
  iconTexto: { fontSize: 18, color: "#ffffff" },
});
