import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "../auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
