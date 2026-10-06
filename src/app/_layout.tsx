import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "../auth";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.abismo} />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}