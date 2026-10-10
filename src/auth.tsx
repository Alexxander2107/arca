import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { usuarioPorId } from "./db";
import { getSesion, saveSesion } from "./storage";
import { Usuario } from "./types";

interface AuthCtx {
  usuario: Usuario | null;
  cargando: boolean;
  entrar: (u: Usuario) => Promise<void>;
  salir: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  usuario: null,
  cargando: true,
  entrar: async () => {},
  salir: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Recupera la sesión guardada al abrir la app
  useEffect(() => {
    (async () => {
      try {
        const id = await getSesion();
        setUsuario(id ? await usuarioPorId(id) : null);
      } catch {
        setUsuario(null);
      }
      setCargando(false);
    })();
  }, []);

  const entrar = async (u: Usuario) => {
    await saveSesion(u.id);
    setUsuario(u);
  };

  const salir = async () => {
    await saveSesion(null);
    setUsuario(null);
  };

  return (
    <Ctx.Provider value={{ usuario, cargando, entrar, salir }}>
      {children}
    </Ctx.Provider>
  );
}
