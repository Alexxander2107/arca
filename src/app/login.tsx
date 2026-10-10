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
import { buscarUsuario, crearUsuario } from "../db";
import { hashPassword } from "../storage";
import { colors } from "../theme";
import { ROL_LABEL, Rol, Usuario } from "../types";

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.hero}>
            <Text style={s.logo}>ARCA</Text>
            <Text style={s.sub}>Administrador de Registro, Control y Actividades</Text>
          </View>

          <View style={s.card}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.abismo },
  scroll: { flexGrow: 1 },
  hero: { padding: 32, paddingTop: 48 },
  logo: { color: colors.blanco, fontSize: 56, fontWeight: "800", letterSpacing: 3 },
  sub: { color: "#b9d3d8", fontSize: 16, marginTop: 4, maxWidth: 260 },
  card: {
    flex: 1,
    backgroundColor: colors.espuma,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: 420,
  },
  tabs: { flexDirection: "row", marginBottom: 16 },
  tab: { paddingVertical: 8, paddingRight: 20 },
  tabText: { fontSize: 16, fontWeight: "600", color: colors.suave },
  tabActive: { color: colors.abismo },
  tabLine: { height: 3, backgroundColor: colors.laguna, marginTop: 6, borderRadius: 2 },
  label: { color: colors.texto, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.texto,
  },
  roles: { flexDirection: "row", gap: 8 },
  rolBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.blanco,
    alignItems: "center",
  },
  rolBtnActive: { backgroundColor: colors.laguna, borderColor: colors.laguna },
  rolText: { fontWeight: "600", color: colors.texto, fontSize: 13 },
  error: { color: colors.error, marginTop: 12 },
  btn: {
    backgroundColor: colors.laguna,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: colors.blanco, fontSize: 16, fontWeight: "700" },
});
