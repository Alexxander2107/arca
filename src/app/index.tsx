import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../auth";
import { colors } from "../theme";

// Pantalla de arranque: decide si mostrar login o tablero
export default function Index() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.abismo }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }
  return <Redirect href={usuario ? "/board" : "/login"} />;
}
