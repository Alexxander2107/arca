const pad = (n: number) => String(n).padStart(2, "0");
const aISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function fechaValida(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function sumarDias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return aISO(d);
}

export function formatearFecha(s: string): string {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export type Vencimiento = "vencida" | "hoy" | "pronto" | "normal";

export function estadoVencimiento(vence: string | null, completada: boolean): Vencimiento | null {
  if (!vence || !fechaValida(vence)) return null;
  if (completada) return "normal";
  const [y, m, d] = vence.split("-").map(Number);
  const hoy = new Date();
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const dias = Math.round((new Date(y, m - 1, d).getTime() - base) / 86400000);
  if (dias < 0) return "vencida";
  if (dias === 0) return "hoy";
  if (dias <= 2) return "pronto";
  return "normal";
}
