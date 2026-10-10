import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

// Solo guarda el id de la sesión activa. Los datos viven en SQLite (db.ts).
const K_SESSION = "arca.sesion";

export async function getSesion(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(K_SESSION);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSesion(id: number | null) {
  try {
    if (id === null) await AsyncStorage.removeItem(K_SESSION);
    else await AsyncStorage.setItem(K_SESSION, String(id));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const hashPassword = (password: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
