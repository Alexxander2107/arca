import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { Mob } from "./mobs";

// Dibuja un mob con bloques y alterna las patas para que parezca que corre
function MobCorredor({ mob, celda, paso = 150 }: { mob: Mob; celda: number; paso?: number }) {
  const [cuadro, setCuadro] = useState(0);

  useEffect(() => {
    if (!mob.piernas) return;
    const id = setInterval(() => setCuadro((c) => (c === 0 ? 1 : 0)), paso);
    return () => clearInterval(id);
  }, [mob, paso]);

  const partes = [...mob.partes, ...(mob.piernas ? mob.piernas[cuadro] : [])];

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
