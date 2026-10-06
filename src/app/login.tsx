import { FormEvent, useState } from "react";
import { getUsuarios, hashPassword, saveUsuarios, uid } from "../storage";
import { ROL_LABEL, Rol, Usuario } from "../types";

interface Props {
  onAuth: (u: Usuario) => void;
}

export default function Login({ onAuth }: Props) {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("secretaria");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarModo = (m: "login" | "registro") => {
    setModo(m);
    setError("");
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const correo = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      return setError("Escribe un correo válido.");
    }
    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }
    if (modo === "registro" && nombre.trim().length < 2) {
      return setError("Escribe tu nombre.");
    }

    setCargando(true);
    try {
      const hash = await hashPassword(password);
      const usuarios = await getUsuarios();

      if (modo === "registro") {
        if (usuarios.some((u) => u.email === correo)) {
          return setError("Ese correo ya está registrado. Inicia sesión.");
        }
        const nuevo: Usuario = {
          id: uid(),
          nombre: nombre.trim(),
          email: correo,
          passwordHash: hash,
          rol,
        };
        saveUsuarios([...usuarios, nuevo]);
        onAuth(nuevo);
      } else {
        const u = usuarios.find(
          (x) => x.email === correo && x.passwordHash === hash
        );
        if (!u) return setError("Correo o contraseña incorrectos.");
        onAuth(u);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-wrap">
      <section className="login-hero" aria-hidden="true">
        <h1>ARCA</h1>
        <p>Administrador de Registro, Control y Actividades</p>
        <svg viewBox="0 0 400 120" className="waves">
          <path d="M0 60 Q50 20 100 60 T200 60 T300 60 T400 60 V120 H0Z" />
          <path d="M0 85 Q50 55 100 85 T200 85 T300 85 T400 85 V120 H0Z" />
        </svg>
      </section>

      <section className="login-card">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={modo === "login"}
            className={modo === "login" ? "tab active" : "tab"}
            onClick={() => cambiarModo("login")}
          >
            Iniciar sesión
          </button>
          <button
            role="tab"
            aria-selected={modo === "registro"}
            className={modo === "registro" ? "tab active" : "tab"}
            onClick={() => cambiarModo("registro")}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={enviar} noValidate>
          {modo === "registro" && (
            <label>
              Nombre
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === "login" ? "current-password" : "new-password"}
            />
          </label>

          {modo === "registro" && (
            <label>
              Rol
              <select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                {(Object.keys(ROL_LABEL) as Rol[]).map((r) => (
                  <option key={r} value={r}>
                    {ROL_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={cargando}>
            {modo === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </section>
    </main>
  );
}