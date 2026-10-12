import { useState } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../auth";
import Splash from "../components/Splash";

// Pantalla de arranque: muestra la carga y después va al login (o al tablero si ya hay sesión)
export default function Index() {
  const { usuario, cargando } = useAuth();
  const [terminada, setTerminada] = useState(false);

  if (!terminada || cargando) return <Splash onFinish={() => setTerminada(true)} />;
  return <Redirect href={usuario ? "/board" : "/login"} />;
}
