import { memo } from "react";
import { View } from "react-native";

// Cara de 8x8 bloques: "X" = oscuro, "." = verde
const CARA = [
  "........",
  "........",
  ".XX..XX.",
  ".XX..XX.",
  "...XX...",
  "..XXXX..",
  "..XXXX..",
  "..X..X..",
];
const VERDES = ["#4fa83d", "#5cb847", "#43963a"];
const OSCURO = "#0d1f0d";

function CreeperPixel({ size = 96 }: { size?: number }) {
  const c = size / 8;
  return (
    <View style={{ width: size, height: size }}>
      {CARA.map((fila, y) => (
        <View key={y} style={{ flexDirection: "row" }}>
          {fila.split("").map((ch, x) => (
            <View
              key={x}
              style={{
                width: c,
                height: c,
                backgroundColor: ch === "X" ? OSCURO : VERDES[((x * 7 + y * 13) ^ (x * y)) % 3],
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default memo(CreeperPixel);
