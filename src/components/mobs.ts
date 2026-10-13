// Criaturas de bloques en vista 2D (de perfil, mirando a la derecha).
// Cada parte es [x, y, ancho, alto, color] en "píxeles".
export type Rect = [number, number, number, number, string];
export type Modo = "camina" | "salta" | "vuela" | "nada";

export interface Mob {
  nombre: string;
  hostil: boolean;
  modo: Modo;
  ancho: number;
  alto: number;
  partes: Rect[];
  piernas?: [Rect[], Rect[]]; // 2 cuadros: patas, alas, aletas o tentáculos
  ojos?: Rect[]; // para parpadear
  parpado?: string; // color con el que se "cierra" el ojo
  grito: string;
  velocidad?: number; // 1 = normal, menos = más lento
}

// ---------- Ayudas para dibujar ----------
function patas(xs: number[], w: number, y: number, largo: number, corto: number, color: string): [Rect[], Rect[]] {
  const cuadro = (inv: boolean) =>
    xs.map((x, i) => [x, y, w, (i % 2 === 0) !== inv ? largo : corto, color] as Rect);
  return [cuadro(false), cuadro(true)];
}

// Convierte un dibujo en texto (una letra por color) en rectángulos
function desdeTexto(filas: string[], paleta: Record<string, string>, y0 = 0, soloLetra?: string): Rect[] {
  const rects: Rect[] = [];
  filas.forEach((fila, i) => {
    let x = 0;
    while (x < fila.length) {
      const ch = fila[x];
      if (ch === "." || ch === " " || (soloLetra && ch !== soloLetra)) {
        x++;
        continue;
      }
      let n = 1;
      while (x + n < fila.length && fila[x + n] === ch) n++;
      rects.push([x, y0 + i, n, 1, paleta[ch]]);
      x += n;
    }
  });
  return rects;
}

interface DibujoTexto {
  nombre: string;
  hostil?: boolean;
  modo: Modo;
  grito: string;
  velocidad?: number;
  paleta: Record<string, string>;
  base: string[];
  parpado: string;
  cuadros?: { y: number; a: string[]; b: string[] };
  patas?: [number[], number, number, number, number, string]; // xs, w, y, largo, corto, color
}

function mobTexto(d: DibujoTexto): Mob {
  const partes = desdeTexto(d.base, d.paleta);
  const ojos = desdeTexto(d.base, d.paleta, 0, "E");
  let piernas: [Rect[], Rect[]] | undefined;
  let alto = d.base.length;
  if (d.cuadros) {
    piernas = [desdeTexto(d.cuadros.a, d.paleta, d.cuadros.y), desdeTexto(d.cuadros.b, d.paleta, d.cuadros.y)];
    alto = Math.max(alto, d.cuadros.y + Math.max(d.cuadros.a.length, d.cuadros.b.length));
  } else if (d.patas) {
    const [xs, w, y, largo, corto, color] = d.patas;
    piernas = patas(xs, w, y, largo, corto, color);
    alto = Math.max(alto, y + largo);
  }
  return {
    nombre: d.nombre,
    hostil: d.hostil ?? false,
    modo: d.modo,
    ancho: Math.max(...d.base.map((f) => f.length)),
    alto,
    partes,
    piernas,
    ojos,
    parpado: d.parpado,
    grito: d.grito,
    velocidad: d.velocidad,
  };
}

// ---------- Personajes ----------
export const MOBS: Mob[] = [
  // ===== No hostiles =====
  {
    nombre: "Cerdo",
    hostil: false,
    modo: "camina",
    ancho: 16,
    alto: 11,
    grito: "¡Oinc!",
    partes: [
      [0, 2, 11, 6, "#f2a7b0"],
      [0, 6, 11, 2, "#e594a0"],
      [10, 1, 5, 6, "#f2a7b0"],
      [14, 3, 2, 3, "#d9818f"],
      [12, 2, 1, 1, "#222222"],
      [11, 0, 2, 1, "#d9818f"],
    ],
    ojos: [[12, 2, 1, 1, "#222222"]],
    parpado: "#f2a7b0",
    piernas: patas([1, 4, 9, 12], 2, 8, 3, 2, "#d9818f"),
  },
  {
    nombre: "Gallina",
    hostil: false,
    modo: "camina",
    ancho: 12,
    alto: 11,
    grito: "¡Cloc!",
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
    ojos: [[9, 2, 1, 1, "#111111"]],
    parpado: "#f5f5f5",
    piernas: patas([3, 6], 1, 8, 3, 2, "#f0a020"),
  },
  {
    nombre: "Oveja",
    hostil: false,
    modo: "camina",
    ancho: 14,
    alto: 11,
    grito: "¡Beee!",
    partes: [
      [1, 1, 10, 7, "#f4f4f4"],
      [2, 2, 3, 2, "#e2e2e2"],
      [6, 4, 3, 2, "#e2e2e2"],
      [10, 2, 4, 4, "#e0cdb4"],
      [12, 3, 1, 1, "#111111"],
      [10, 2, 1, 1, "#c9b394"],
    ],
    ojos: [[12, 3, 1, 1, "#111111"]],
    parpado: "#e0cdb4",
    piernas: patas([2, 4, 8, 10], 2, 8, 3, 2, "#5a5a5a"),
  },
  {
    nombre: "Vaca",
    hostil: false,
    modo: "camina",
    ancho: 16,
    alto: 11,
    grito: "¡Muuu!",
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
    ojos: [[13, 2, 1, 1, "#111111"]],
    parpado: "#ebebeb",
    piernas: patas([2, 5, 9, 12], 2, 8, 3, 2, "#bdbdbd"),
  },
  mobTexto({
    nombre: "Conejo",
    modo: "salta",
    grito: "¡Pip!",
    paleta: { B: "#c9a26b", D: "#a07a45", L: "#f1e3c8", I: "#e8a0a0", E: "#222222", N: "#d97a86" },
    parpado: "#c9a26b",
    base: [
      "..........BB.BB.",
      "..........BI.BI.",
      "..........BI.BI.",
      ".........BBBBBBB",
      ".........BBBBEBN",
      "...BBBBBBBBBBBBB",
      "..LBBBBBBBBBBBB.",
      "..LLBBBBBBBBBBB.",
      "...LBBBBBBBBBLL.",
    ],
    patas: [[3, 5, 10, 12], 2, 9, 3, 2, "#a07a45"],
  }),
  mobTexto({
    nombre: "Loro",
    modo: "vuela",
    grito: "¡Cuac!",
    paleta: {
      R: "#d8372f", r: "#a82622", Y: "#f2c22a", y: "#c99a14", B: "#2a5fd8", b: "#1f48a8",
      G: "#2fa04a", E: "#111111", W: "#ffffff", O: "#e8892a",
    },
    parpado: "#d8372f",
    base: [
      "..........RRRR...",
      ".........RRRRRR..",
      ".........RRRWERYY",
      ".........RRRRRRYy",
      "........rRRRRRR..",
      ".......rRRRRRRR..",
      "......rRRRRRRR...",
      ".....GrRRRRRRR...",
      "....GGrRRRRR.....",
      "...GGGBrRRR......",
      "..GGBBB..O.O.....",
      ".GGB......OO.OO..",
    ],
    cuadros: {
      y: 1,
      a: ["......BB.........", ".....BBB.........", "....BBBB.........", "...BBBBB.........", "...bBBBB........."],
      b: ["", "", "", "", "......BBBB.......", "....bBBBBB.......", "...bBBBBB........", "....bBBB........."],
    },
  }),
  mobTexto({
    nombre: "Tortuga",
    modo: "camina",
    velocidad: 0.5,
    grito: "¡Glup!",
    paleta: { S: "#3f8f3a", s: "#2e6e2c", h: "#5fb34f", G: "#8fbf6a", E: "#111111" },
    parpado: "#8fbf6a",
    base: [
      "....SSSSSSSS......",
      "..SSSShSSShSSS....",
      ".SSShSSSSSShSS.GGG",
      "sSSSSSSSSSSSSSGGEG",
      "ssssssssssssssGGGG",
    ],
    patas: [[3, 6, 11], 2, 5, 2, 1, "#8fbf6a"],
  }),
  mobTexto({
    nombre: "Murciélago",
    modo: "vuela",
    grito: "¡Skii!",
    paleta: { K: "#3a2a4a", k: "#241830", P: "#6a4a8a", E: "#ff5555" },
    parpado: "#3a2a4a",
    base: [
      "........K..K......",
      "........KKKK......",
      "........KEKKEK....",
      ".......KKKKKK.....",
      ".......KKKKKK.....",
      "........KKKK......",
      ".........kk.......",
    ],
    cuadros: {
      y: 1,
      a: [
        "P................P",
        "PP..............PP",
        "PPP............PPP",
        ".PPPPPP....PPPPPP.",
      ],
      b: [
        "", "", "",
        "..PPPPP....PPPPP..",
        ".PPPPP......PPPPP.",
        "PPPP..........PPPP",
        "PPP............PPP",
        "PP..............PP",
      ],
    },
  }),
  mobTexto({
    nombre: "Pez globo",
    modo: "nada",
    grito: "¡Blup!",
    paleta: { Y: "#f2c230", y: "#d99a1a", W: "#fff6c8", E: "#111111", S: "#8a5a10", F: "#e08a1a" },
    parpado: "#f2c230",
    base: [
      "...S..S..S..",
      "..SYYYYYYYS.",
      ".SYYYYYYYYYS",
      ".YYYYYYYYWEY",
      ".YYYYYYYYYyy",
      ".YWWWWWWWWY.",
      "..SYWWWWWYS.",
      "...S.SS..S..",
    ],
    cuadros: {
      y: 3,
      a: ["FF..........", "F...........", "FF.........."],
      b: ["", "FF..........", "F...........", "FF.........."],
    },
  }),
  mobTexto({
    nombre: "Calamar",
    modo: "nada",
    grito: "¡Splash!",
    paleta: { Q: "#2f4a8c", q: "#233a70", W: "#ffffff", E: "#111111", T: "#3a5aa8" },
    parpado: "#2f4a8c",
    base: [
      "...QQQQ...",
      "..QQQQQQ..",
      ".QQQQQQQQ.",
      ".QQQQQQQQ.",
      ".QWEQQWEQ.",
      ".QQQQQQQQ.",
      "..qQQQQq..",
    ],
    patas: [[2, 4, 5, 7], 1, 7, 4, 3, "#3a5aa8"],
  }),
  mobTexto({
    nombre: "Camello",
    modo: "camina",
    velocidad: 0.8,
    grito: "¡Brrr!",
    paleta: { C: "#d9b36a", c: "#b8914a", M: "#e8d3a0", E: "#111111", D: "#8a6a30" },
    parpado: "#d9b36a",
    base: [
      "....CCCC..............",
      "...CCCCCC.......CCCCCC",
      "..CCCCCCCC......CCCECC",
      ".CCCCCCCCCCC..CCCCCMMM",
      ".CCCCCCCCCCCCCCCCCCM..",
      ".CCCCCCCCCCCCCCCC.....",
      ".CCCCCCCCCCCCCCCC.....",
      ".cCCCCCCCCCCCCCc......",
      "..ccccccccccccc.......",
    ],
    patas: [[2, 5, 11, 14], 2, 9, 5, 4, "#b8914a"],
  }),

  // ===== Hostiles =====
  {
    nombre: "Zombi",
    hostil: true,
    modo: "camina",
    ancho: 15,
    alto: 15,
    grito: "¡Uhhh!",
    partes: [
      [8, 0, 5, 5, "#6aa84f"],
      [11, 2, 1, 1, "#1d1d1d"],
      [10, 4, 2, 1, "#3f6b2c"],
      [6, 5, 5, 6, "#3b6fb6"],
      [10, 5, 5, 2, "#6aa84f"],
    ],
    ojos: [[11, 2, 1, 1, "#1d1d1d"]],
    parpado: "#6aa84f",
    piernas: patas([6, 9], 2, 11, 4, 3, "#2f4d8a"),
  },
  {
    nombre: "Esqueleto",
    hostil: true,
    modo: "camina",
    ancho: 15,
    alto: 14,
    grito: "¡Clac!",
    partes: [
      [7, 0, 5, 5, "#e8e8e8"],
      [10, 2, 1, 1, "#111111"],
      [7, 5, 3, 5, "#e8e8e8"],
      [7, 6, 3, 1, "#4a4a4a"],
      [7, 8, 3, 1, "#4a4a4a"],
      [9, 5, 6, 1, "#e8e8e8"],
    ],
    ojos: [[10, 2, 1, 1, "#111111"]],
    parpado: "#e8e8e8",
    piernas: patas([7, 9], 1, 10, 4, 3, "#e8e8e8"),
  },
  {
    nombre: "Araña",
    hostil: true,
    modo: "camina",
    ancho: 14,
    alto: 10,
    grito: "¡Tsss!",
    partes: [
      [2, 2, 6, 4, "#2d2d2d"],
      [8, 2, 4, 4, "#3a3a3a"],
      [11, 2, 1, 1, "#ee3333"],
      [11, 4, 1, 1, "#ee3333"],
      [3, 0, 1, 3, "#2d2d2d"],
      [9, 0, 1, 2, "#2d2d2d"],
    ],
    ojos: [[11, 2, 1, 1, "#ee3333"], [11, 4, 1, 1, "#ee3333"]],
    parpado: "#3a3a3a",
    piernas: patas([2, 4, 7, 9], 1, 6, 4, 3, "#2d2d2d"),
  },
  {
    nombre: "Limo",
    hostil: true,
    modo: "salta",
    ancho: 12,
    alto: 11,
    grito: "¡Boing!",
    partes: [
      [1, 2, 10, 9, "#7ed957"],
      [3, 4, 6, 6, "#5fb83f"],
      [3, 5, 2, 2, "#1d3d12"],
      [7, 5, 2, 2, "#1d3d12"],
      [5, 8, 2, 1, "#1d3d12"],
    ],
    ojos: [[3, 5, 2, 2, "#1d3d12"], [7, 5, 2, 2, "#1d3d12"]],
    parpado: "#5fb83f",
  },
];
