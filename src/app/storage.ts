import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Tarea, Usuario } from "./types";

// Beta: persistencia local en el dispositivo (funciona sin conexión).
// En producción se reemplaza por la API REST (HTTPS/TLS 1.2+) y JWT del SLA.
const K_USERS = "arca.usuarios";
const K_SESSION = "arca.sesion";
const K_TASKS = "arca.tareas";

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const getUsuarios = () => read<Usuario[]>(K_USERS, []);
export const saveUsuarios = (u: Usuario[]) => write(K_USERS, u);

export const getSesion = () => read<string | null>(K_SESSION, null);
export const saveSesion = (id: string | null) => write(K_SESSION, id);

export const getTareas = () => read<Tarea[]>(K_TASKS, []);
export const saveTareas = (t: Tarea[]) => write(K_TASKS, t);

export const hashPassword = (password: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);