import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../auth";
import Aparecer from "../components/Aparecer";
import { buscarUsuario, crearUsuario } from "../db";
import { hashPassword } from "../storage";
import { colors, bisel, fuente, sombraTexto } from "../theme";
import { ROL_LABEL, Rol, Usuario } from "../types";
import FondoBloques from "../components/FondoBloques";
import TextoSplash from "../components/TextoSplash";

export default function Login() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("DOCENTE");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarModo = (m: "login" | "registro") => {
    setModo(m);
    setError("");
  };

  const enviar = async () => {
    setError("");
    const correo = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError("Escribe un correo válido.");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");
    if (modo === "registro" && (nombre.trim().length < 2 || apellido.trim().length < 2))
      return setError("Escribe tu nombre y apellido.");

    setCargando(true);
    try {
      const hash = await hashPassword(password);

      if (modo === "registro") {
        const nuevo = await crearUsuario({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          correo,
          hash,
          rol,
        });
        await entrar(nuevo);
        router.replace("/board");
      } else {
        const u = await buscarUsuario(correo, hash);
        if (!u) return setError("Correo o contraseña incorrectos.");
        await entrar(u);
        router.replace("/board");
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message === "CORREO_DUPLICADO"
          ? "Ese correo ya está registrado. Inicia sesión."
          : "No se pudo acceder a la base de datos."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <FondoBloques variante="tierra" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Aparecer style={s.hero}>
            <Text style={s.logo}>ARCA</Text>
            <Text style={s.sub}>Administrador de Registro, Control y Actividades</Text>
            <TextoSplash />
          </Aparecer>

          <Aparecer delay={250} desde={40} style={s.card}>
            <View style={s.tabs}>
              {(["login", "registro"] as const).map((m) => (
                <Pressable key={m} style={s.tab} onPress={() => cambiarModo(m)}>
                  <Text style={[s.tabText, modo === m && s.tabActive]}>
                    {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </Text>
                  {modo === m && <View style={s.tabLine} />}
                </Pressable>
              ))}
            </View>

            {modo === "registro" && (
              <>
                <Text style={s.label}>Nombre</Text>
                <TextInput style={s.input} value={nombre} onChangeText={setNombre} />
                <Text style={s.label}>Apellido</Text>
                <TextInput style={s.input} value={apellido} onChangeText={setApellido} />
              </>
            )}

            <Text style={s.label}>Correo</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={s.label}>Contraseña</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {modo === "registro" && (
              <>
                <Text style={s.label}>Rol</Text>
                <View style={s.roles}>
                  {(Object.keys(ROL_LABEL) as Rol[]).map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRol(r)}
                      style={[s.rolBtn, rol === r && s.rolBtnActive]}
                    >
                      <Text style={[s.rolText, rol === r && { color: colors.blanco }]}>
                        {ROL_LABEL[r]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {!!error && <Text style={s.error}>{error}</Text>}

            <Pressable
              style={[s.btn, cargando && { opacity: 0.6 }]}
              onPress={enviar}
              disabled={cargando}
            >
              <Text style={s.btnText}>
                {modo === "login" ? "Entrar" : "Crear cuenta"}
              </Text>
            </Pressable>
          </Aparecer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#3b2a1a" },
  scroll: { flexGrow: 1, justifyContent: "center" },
  hero: { padding: 28, paddingTop: 40, paddingBottom: 12, alignItems: "center" },
  logo: {
    fontFamily: fuente,
    fontSize: 88,
    color: colors.amarillo,
    letterSpacing: 6,
    ...sombraTexto,
    textShadowOffset: { width: 4, height: 4 },
  },
  sub: { fontFamily: fuente, fontSize: 24, color: "#ffffff", textAlign: "center", ...sombraTexto },
  card: { ...bisel.panel, margin: 16, padding: 20 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { flex: 1, ...bisel.boton, paddingVertical: 8, alignItems: "center" },
  tabText: { fontFamily: fuente, fontSize: 24, color: "#e0e0e0", ...sombraTexto },
  tabActive: { color: colors.amarillo },
  tabLine: { height: 4, backgroundColor: colors.amarillo, alignSelf: "stretch", marginTop: 4 },
  label: { fontFamily: fuente, fontSize: 22, color: "#2b2b2b", marginTop: 10, marginBottom: 4 },
  input: {
    ...bisel.hueco,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fuente,
    fontSize: 24,
    color: "#ffffff",
  },
  roles: { flexDirection: "row", gap: 6 },
  rolBtn: { flex: 1, ...bisel.boton, paddingVertical: 10, alignItems: "center" },
  rolBtnActive: { ...bisel.botonVerde },
  rolText: { fontFamily: fuente, fontSize: 20, color: "#ffffff", ...sombraTexto },
  error: { fontFamily: fuente, fontSize: 22, color: "#b3261e", marginTop: 10 },
  btn: { ...bisel.botonVerde, paddingVertical: 12, alignItems: "center", marginTop: 18 },
  btnText: { fontFamily: fuente, fontSize: 28, color: "#ffffff", ...sombraTexto },
});
