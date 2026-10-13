import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { Mob, Rect } from "./mobs";

// Dibuja un mob en 2D con bloques: alterna patas/alas y parpadea de vez en cuando
function MobCorredor({ mob, celda, paso = 150 }: { mob: Mob; celda: number; paso?: number }) {
  const [cuadro, setCuadro] = useState(0);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    if (!mob.piernas) return;
    const id = setInterval(() => setCuadro((c) => (c === 0 ? 1 : 0)), paso);
    return () => clearInterval(id);
  }, [mob, paso]);

  // Parpadeo a intervalos al azar
  useEffect(() => {
    if (!mob.ojos || mob.ojos.length === 0) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const programar = () => {
      t = setTimeout(() => {
        setCerrado(true);
        t = setTimeout(() => {
          setCerrado(false);
          programar();
        }, 130);
      }, 2200 + Math.random() * 2500);
    };
    programar();
    return () => {
      if (t) clearTimeout(t);
    };
  }, [mob]);

  const parpados: Rect[] =
    cerrado && mob.ojos ? mob.ojos.map(([x, y, w, h]) => [x, y, w, h, mob.parpado ?? "#000000"] as Rect) : [];
  const partes: Rect[] = [...mob.partes, ...(mob.piernas ? mob.piernas[cuadro] : []), ...parpados];

  return (
    <View style={{ width: mob.ancho * celda, height: mob.alto * celda }}>
      {partes.map(([x, y, w, h, color], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x * celda,
            top: y * celda,
            width: w * celda,
            height: h * celda,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

export default memo(MobCorredor);
