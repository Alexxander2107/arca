import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { AuthProvider } from "../auth";

export default function RootLayout() {
  const [fuenteLista, errorFuente] = useFonts({ VT323_400Regular });

  // Espera un instante a que cargue la fuente (si falla, sigue con la del sistema)
  if (!fuenteLista && !errorFuente) return null;

  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
    </AuthProvider>
  );
}
