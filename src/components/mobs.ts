// Criaturas de bloques: cada parte es [x, y, ancho, alto, color] en "píxeles".
// Miran hacia la derecha. Las patas tienen 2 cuadros para simular la carrera.
export type Rect = [number, number, number, number, string];

export interface Mob {
  nombre: string;
  hostil: boolean;
  ancho: number;
  alto: number;
  partes: Rect[];
  piernas?: [Rect[], Rect[]];
  salta?: boolean; // se desplaza a saltos en vez de correr
}

function patas(xs: number[], w: number, y: number, largo: number, corto: number, color: string): [Rect[], Rect[]] {
  const cuadro = (inv: boolean) =>
    xs.map((x, i) => [x, y, w, (i % 2 === 0) !== inv ? largo : corto, color] as Rect);
  return [cuadro(false), cuadro(true)];
}

export const MOBS: Mob[] = [
  // ---------- No hostiles ----------
  {
    nombre: "Cerdo",
    hostil: false,
    ancho: 16,
    alto: 11,
    partes: [
      [0, 2, 11, 6, "#f2a7b0"],
      [10, 1, 5, 6, "#f2a7b0"],
      [14, 3, 2, 3, "#d9818f"],
      [12, 2, 1, 1, "#222222"],
      [11, 0, 2, 1, "#d9818f"],
    ],
    piernas: patas([1, 4, 9, 12], 2, 8, 3, 2, "#d9818f"),
  },
  {
    nombre: "Gallina",
    hostil: false,
    ancho: 12,
    alto: 11,
    partes: [
      [0, 2, 2, 3, "#d9d9d9"],
      [1, 3, 7, 5, "#f5f5f5"],
      [3, 4, 3, 2, "#dcdcdc"],
      [7, 1, 3, 4, "#f5f5f5"],
      [8, 0, 2, 1, "#d33a2f"],
      [9, 2, 1, 1, "#111111"],
      [10, 2, 2, 1, "#f0a020"],
      [10, 3, 1, 1, "#d33a2f"],
    ],
    piernas: patas([3, 6], 1, 8, 3, 2, "#f0a020"),
  },
  {
    nombre: "Oveja",
    hostil: false,
    ancho: 14,
    alto: 11,
    partes: [
      [1, 1, 10, 7, "#f4f4f4"],
      [2, 2, 3, 2, "#e2e2e2"],
      [6, 4, 3, 2, "#e2e2e2"],
      [10, 2, 4, 4, "#e0cdb4"],
      [12, 3, 1, 1, "#111111"],
      [10, 2, 1, 1, "#c9b394"],
    ],
    piernas: patas([2, 4, 8, 10], 2, 8, 3, 2, "#5a5a5a"),
  },
  {
    nombre: "Vaca",
    hostil: false,
    ancho: 16,
    alto: 11,
    partes: [
      [1, 2, 11, 6, "#f2f2f2"],
      [2, 3, 3, 2, "#2b2b2b"],
      [8, 5, 3, 2, "#2b2b2b"],
      [12, 1, 4, 5, "#ebebeb"],
      [14, 4, 2, 2, "#e9b4b4"],
      [12, 0, 1, 1, "#dddddd"],
      [15, 0, 1, 1, "#dddddd"],
      [13, 2, 1, 1, "#111111"],
    ],
    piernas: patas([2, 5, 9, 12], 2, 8, 3, 2, "#bdbdbd"),
  },

  // ---------- Hostiles ----------
  {
    nombre: "Zombi",
    hostil: true,
    ancho: 15,
    alto: 15,
    partes: [
      [8, 0, 5, 5, "#6aa84f"],
      [11, 2, 1, 1, "#1d1d1d"],
      [10, 4, 2, 1, "#3f6b2c"],
      [6, 5, 5, 6, "#3b6fb6"],
      [10, 5, 5, 2, "#6aa84f"],
    ],
    piernas: patas([6, 9], 2, 11, 4, 3, "#2f4d8a"),
  },
  {
    nombre: "Esqueleto",
    hostil: true,
    ancho: 15,
    alto: 14,
    partes: [
      [7, 0, 5, 5, "#e8e8e8"],
      [10, 2, 1, 1, "#111111"],
      [7, 5, 3, 5, "#e8e8e8"],
      [7, 6, 3, 1, "#4a4a4a"],
      [7, 8, 3, 1, "#4a4a4a"],
      [9, 5, 6, 1, "#e8e8e8"],
    ],
    piernas: patas([7, 9], 1, 10, 4, 3, "#e8e8e8"),
  },
  {
    nombre: "Araña",
    hostil: true,
    ancho: 14,
    alto: 10,
    partes: [
      [2, 2, 6, 4, "#2d2d2d"],
      [8, 2, 4, 4, "#3a3a3a"],
      [11, 2, 1, 1, "#ee3333"],
      [11, 4, 1, 1, "#ee3333"],
      [3, 0, 1, 3, "#2d2d2d"],
      [9, 0, 1, 2, "#2d2d2d"],
    ],
    piernas: patas([2, 4, 7, 9], 1, 6, 4, 3, "#2d2d2d"),
  },
  {
    nombre: "Limo",
    hostil: true,
    ancho: 12,
    alto: 11,
    salta: true,
    partes: [
      [1, 2, 10, 9, "#7ed957"],
      [3, 4, 6, 6, "#5fb83f"],
      [3, 5, 2, 2, "#1d3d12"],
      [7, 5, 2, 2, "#1d3d12"],
      [5, 8, 2, 1, "#1d3d12"],
    ],
  },
];
