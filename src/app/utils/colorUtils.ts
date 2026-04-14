// ============================================================
// colorUtils.ts — Utilidades de manipulación y sugerencia de colores
// ============================================================

export interface ColorPalette {
  // Colores principales
  bg: string;
  sidebar: string;
  card: string;
  textMain: string;
  textSec: string;
  primary: string;
  accent: string;
  border: string;
  shadow: string;
  // Colores de estados
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  errorBg: string;
  errorText: string;
  alertOrange: string;
  errorRed: string;
}

// ---- Colores predeterminados ----

export const DEFAULT_LIGHT_COLORS: ColorPalette = {
  bg: "#f8fafc",
  sidebar: "#ffffff",
  card: "#ffffff",
  textMain: "#1e293b",
  textSec: "#64748b",
  primary: "#1e293b",
  accent: "#10b981",
  border: "#e2e8f0",
  shadow: "rgba(30, 41, 59, 0.08)",
  successBg: "#d1fae5",
  successText: "#065f46",
  warningBg: "#fef3c7",
  warningText: "#92400e",
  errorBg: "#fee2e2",
  errorText: "#991b1b",
  alertOrange: "#f59e0b",
  errorRed: "#ef4444",
};

export const DEFAULT_DARK_COLORS: ColorPalette = {
  bg: "#0f172a",
  sidebar: "#1e293b",
  card: "#1e293b",
  textMain: "#f1f5f9",
  textSec: "#94a3b8",
  primary: "#38bdf8",
  accent: "#34d399",
  border: "#334155",
  shadow: "rgba(0, 0, 0, 0.3)",
  successBg: "#064e3b",
  successText: "#6ee7b7",
  warningBg: "#78350f",
  warningText: "#fde68a",
  errorBg: "#7f1d1d",
  errorText: "#fca5a5",
  alertOrange: "#f59e0b",
  errorRed: "#ef4444",
};

// ---- Mapeo CSS variable <-> key ----

export const CSS_VAR_MAP: Record<keyof ColorPalette, string> = {
  bg: "--bg",
  sidebar: "--sidebar",
  card: "--card",
  textMain: "--text-main",
  textSec: "--text-sec",
  primary: "--primary",
  accent: "--accent",
  border: "--border",
  shadow: "--shadow",
  successBg: "--success-bg",
  successText: "--success-text",
  warningBg: "--warning-bg",
  warningText: "--warning-text",
  errorBg: "--error-bg",
  errorText: "--error-text",
  alertOrange: "--alert-orange",
  errorRed: "--error-red",
};

// Etiquetas en español
export const COLOR_LABELS: Record<keyof ColorPalette, string> = {
  bg: "Fondo Principal",
  sidebar: "Barra Lateral",
  card: "Tarjetas",
  textMain: "Texto Principal",
  textSec: "Texto Secundario",
  primary: "Color Primario",
  accent: "Color de Acento",
  border: "Bordes",
  shadow: "Sombras",
  successBg: "Éxito — Fondo",
  successText: "Éxito — Texto",
  warningBg: "Advertencia — Fondo",
  warningText: "Advertencia — Texto",
  errorBg: "Error — Fondo",
  errorText: "Error — Texto",
  alertOrange: "Alerta Naranja",
  errorRed: "Error Rojo",
};

// Agrupaciones para la UI
export const COLOR_GROUPS = [
  {
    title: "Colores Principales",
    keys: [
      "bg",
      "sidebar",
      "card",
      "primary",
      "accent",
      "border",
    ] as (keyof ColorPalette)[],
  },
  {
    title: "Colores de Texto",
    keys: ["textMain", "textSec"] as (keyof ColorPalette)[],
  },
  {
    title: "Colores de Estados",
    keys: [
      "successBg",
      "successText",
      "warningBg",
      "warningText",
      "errorBg",
      "errorText",
      "alertOrange",
      "errorRed",
    ] as (keyof ColorPalette)[],
  },
];

// ---- Conversiones de color ----

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// ---- Utilidades de contraste ----

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRGB(hex1);
  const rgb2 = hexToRGB(hex2);
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isGoodContrast(fg: string, bg: string): boolean {
  return getContrastRatio(fg, bg) >= 4.5;
}

// ---- Generación de colores ----

export function generateComplementary(hex: string): string {
  const hsl = hexToHSL(hex);
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

export function generateAnalogous(hex: string): string[] {
  const hsl = hexToHSL(hex);
  return [
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}

export function generateTriadic(hex: string): string[] {
  const hsl = hexToHSL(hex);
  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

export function lighten(hex: string, amount: number): string {
  const hsl = hexToHSL(hex);
  return hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + amount));
}

export function darken(hex: string, amount: number): string {
  const hsl = hexToHSL(hex);
  return hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount));
}

export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHSL(hex);
  return hslToHex(hsl.h, Math.max(0, Math.min(100, hsl.s + amount)), hsl.l);
}

// ---- Sugerencias de paletas ----

export interface PaletteSuggestion {
  name: string;
  description: string;
  light: ColorPalette;
  dark: ColorPalette;
}

function generateStateColorsForAccent(
  accent: string,
  isDark: boolean,
): Partial<ColorPalette> {
  const hsl = hexToHSL(accent);

  // Éxito: Verde (hue ~140)
  const successHue = 152;
  // Advertencia: Amarillo (hue ~45)
  const warningHue = 45;
  // Error: Rojo (hue ~0)
  const errorHue = 0;

  if (isDark) {
    return {
      successBg: hslToHex(successHue, 70, 15),
      successText: hslToHex(successHue, 60, 75),
      warningBg: hslToHex(warningHue, 70, 15),
      warningText: hslToHex(warningHue, 60, 80),
      errorBg: hslToHex(errorHue, 60, 15),
      errorText: hslToHex(errorHue, 60, 75),
      alertOrange: hslToHex(38, 92, 50),
      errorRed: hslToHex(0, 84, 60),
    };
  }

  return {
    successBg: hslToHex(successHue, 76, 90),
    successText: hslToHex(successHue, 90, 20),
    warningBg: hslToHex(warningHue, 96, 89),
    warningText: hslToHex(warningHue, 80, 20),
    errorBg: hslToHex(errorHue, 93, 94),
    errorText: hslToHex(errorHue, 70, 22),
    alertOrange: hslToHex(38, 92, 50),
    errorRed: hslToHex(0, 84, 60),
  };
}

function buildPalette(accent: string, isDark: boolean): ColorPalette {
  const hsl = hexToHSL(accent);
  const stateColors = generateStateColorsForAccent(accent, isDark);

  if (isDark) {
    const bgColor = hslToHex(hsl.h, Math.min(50, hsl.s), 8);
    const sidebarColor = hslToHex(hsl.h, Math.min(40, hsl.s), 14);
    return {
      bg: bgColor,
      sidebar: sidebarColor,
      card: sidebarColor,
      textMain: "#f1f5f9",
      textSec: "#94a3b8",
      primary: lighten(accent, 20),
      accent: lighten(accent, 10),
      border: hslToHex(hsl.h, Math.min(30, hsl.s), 25),
      shadow: "rgba(0, 0, 0, 0.3)",
      ...stateColors,
    } as ColorPalette;
  }

  return {
    bg: hslToHex(hsl.h, Math.min(30, hsl.s), 97),
    sidebar: "#ffffff",
    card: "#ffffff",
    textMain: hslToHex(hsl.h, Math.min(50, hsl.s), 15),
    textSec: hslToHex(hsl.h, Math.min(20, hsl.s), 45),
    primary: hslToHex(hsl.h, Math.min(50, hsl.s), 15),
    accent: accent,
    border: hslToHex(hsl.h, Math.min(20, hsl.s), 88),
    shadow: "rgba(30, 41, 59, 0.08)",
    ...stateColors,
  } as ColorPalette;
}

// ---- Variación aleatoria para generar resultados diferentes cada vez ----

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function varyColor(
  hex: string,
  hueRange = 15,
  satRange = 15,
  lightRange = 10,
): string {
  const hsl = hexToHSL(hex);
  const h = (hsl.h + randomRange(-hueRange, hueRange) + 360) % 360;
  const s = Math.max(
    10,
    Math.min(100, hsl.s + randomRange(-satRange, satRange)),
  );
  const l = Math.max(
    5,
    Math.min(95, hsl.l + randomRange(-lightRange, lightRange)),
  );
  return hslToHex(h, s, l);
}

// Paletas temáticas predefinidas con variaciones
const THEMED_PALETTES: Array<{
  name: string;
  description: string;
  getAccent: () => string;
}> = [
  {
    name: "Naturaleza",
    description: "Tonos verdes orgánicos inspirados en la vegetación",
    getAccent: () =>
      hslToHex(randomRange(100, 155), randomRange(50, 80), randomRange(35, 50)),
  },
  {
    name: "Océano",
    description: "Azules profundos y tranquilos como el mar",
    getAccent: () =>
      hslToHex(randomRange(190, 220), randomRange(60, 90), randomRange(40, 55)),
  },
  {
    name: "Atardecer",
    description: "Cálidos naranjas y rosados como un cielo al ocaso",
    getAccent: () =>
      hslToHex(randomRange(10, 40), randomRange(70, 95), randomRange(50, 65)),
  },
  {
    name: "Bosque",
    description: "Verdes oscuros y terrosos para un look rústico",
    getAccent: () =>
      hslToHex(randomRange(140, 170), randomRange(30, 60), randomRange(30, 45)),
  },
  {
    name: "Corporativo",
    description: "Azules serios y profesionales para negocios",
    getAccent: () =>
      hslToHex(randomRange(210, 240), randomRange(50, 75), randomRange(40, 55)),
  },
  {
    name: "Lavanda",
    description: "Púrpuras suaves y elegantes con estilo moderno",
    getAccent: () =>
      hslToHex(randomRange(260, 290), randomRange(40, 70), randomRange(50, 65)),
  },
  {
    name: "Volcán",
    description: "Rojos intensos con energía y pasión",
    getAccent: () =>
      hslToHex(randomRange(0, 15), randomRange(65, 90), randomRange(45, 58)),
  },
  {
    name: "Otoño",
    description: "Marrones cálidos y dorados de hojas secas",
    getAccent: () =>
      hslToHex(randomRange(25, 45), randomRange(50, 80), randomRange(40, 55)),
  },
  {
    name: "Primavera",
    description: "Rosas frescos y alegres con vitalidad",
    getAccent: () =>
      hslToHex(randomRange(320, 350), randomRange(50, 75), randomRange(55, 70)),
  },
  {
    name: "Tropical",
    description: "Turquesas vibrantes y colores de playa",
    getAccent: () =>
      hslToHex(randomRange(170, 190), randomRange(60, 90), randomRange(40, 55)),
  },
  {
    name: "Medianoche",
    description: "Índigos profundos para un look misterioso",
    getAccent: () =>
      hslToHex(randomRange(230, 260), randomRange(40, 65), randomRange(35, 50)),
  },
  {
    name: "Solar",
    description: "Amarillos energéticos y luminosos",
    getAccent: () =>
      hslToHex(randomRange(45, 60), randomRange(70, 95), randomRange(45, 55)),
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function suggestPalettes(accentColor: string): PaletteSuggestion[] {
  const hsl = hexToHSL(accentColor);

  // 1. Paletas basadas en el color elegido (con variaciones aleatorias leves)
  const colorTheoryPalettes: PaletteSuggestion[] = [
    {
      name: "Base Directa",
      description: "Paleta construida directamente desde tu color elegido",
      light: buildPalette(accentColor, false),
      dark: buildPalette(accentColor, true),
    },
    {
      name: "Complementaria",
      description: "Color opuesto en el círculo cromático con variación",
      light: buildPalette(
        varyColor(generateComplementary(accentColor), 10, 10, 5),
        false,
      ),
      dark: buildPalette(
        varyColor(generateComplementary(accentColor), 10, 10, 5),
        true,
      ),
    },
    {
      name: "Análoga",
      description: "Colores vecinos con toque aleatorio",
      light: buildPalette(
        varyColor(generateAnalogous(accentColor)[randomRange(0, 2)], 8, 12, 8),
        false,
      ),
      dark: buildPalette(
        varyColor(generateAnalogous(accentColor)[randomRange(0, 2)], 8, 12, 8),
        true,
      ),
    },
    {
      name: "Triádica",
      description: "Tres puntos equidistantes en el círculo cromático",
      light: (() => {
        const triadic = generateTriadic(accentColor);
        const varied = varyColor(triadic[randomRange(1, 2)], 10, 10, 5);
        return { ...buildPalette(varied, false), accent: accentColor };
      })(),
      dark: (() => {
        const triadic = generateTriadic(accentColor);
        const varied = varyColor(triadic[randomRange(1, 2)], 10, 10, 5);
        return {
          ...buildPalette(varied, true),
          accent: lighten(accentColor, 10),
        };
      })(),
    },
    {
      name: "Variación Aleatoria",
      description: "Tu color con saturación y luminosidad modificadas al azar",
      light: buildPalette(varyColor(accentColor, 20, 25, 15), false),
      dark: buildPalette(varyColor(accentColor, 20, 25, 15), true),
    },
    {
      name: "Split Complementaria",
      description:
        "Dos colores a los lados del complementario para balance sutil",
      light: buildPalette(
        hslToHex(
          (hsl.h + 150 + randomRange(0, 20)) % 360,
          Math.max(30, hsl.s + randomRange(-10, 10)),
          hsl.l,
        ),
        false,
      ),
      dark: buildPalette(
        hslToHex(
          (hsl.h + 210 + randomRange(0, 20)) % 360,
          Math.max(30, hsl.s + randomRange(-10, 10)),
          hsl.l,
        ),
        true,
      ),
    },
  ];

  // 2. Paletas temáticas aleatorias (elegir 3 al azar de las disponibles)
  const shuffledThemes = shuffle(THEMED_PALETTES).slice(0, 3);
  const themedPalettes: PaletteSuggestion[] = shuffledThemes.map((theme) => {
    const accent = theme.getAccent();
    return {
      name: theme.name,
      description: theme.description,
      light: buildPalette(accent, false),
      dark: buildPalette(accent, true),
    };
  });

  // 3. Mezclar paletas de teoría de color + temáticas y elegir 8
  const allPalettes = shuffle([...colorTheoryPalettes, ...themedPalettes]);

  // Siempre incluir "Base Directa" primero, luego las demás mezcladas
  const basePalette = colorTheoryPalettes[0];
  const rest = allPalettes.filter((p) => p.name !== "Base Directa").slice(0, 7);

  return [basePalette, ...rest];
}

// ---- Generación automática de contraparte (claro ↔ oscuro) ----

export function autoGenerateDarkFromLight(light: ColorPalette): ColorPalette {
  const accentHsl = hexToHSL(light.accent);
  const stateColors = generateStateColorsForAccent(light.accent, true);

  return {
    bg: darken(light.bg, 80),
    sidebar: darken(light.sidebar, 75),
    card: darken(light.card, 75),
    textMain: lighten(light.textMain, 70),
    textSec: lighten(light.textSec, 25),
    primary: lighten(light.primary, 50),
    accent: hslToHex(accentHsl.h, accentHsl.s, Math.min(70, accentHsl.l + 15)),
    border: darken(light.border, 55),
    shadow: "rgba(0, 0, 0, 0.3)",
    ...stateColors,
  } as ColorPalette;
}

export function autoGenerateLightFromDark(dark: ColorPalette): ColorPalette {
  const accentHsl = hexToHSL(dark.accent);
  const stateColors = generateStateColorsForAccent(dark.accent, false);

  return {
    bg: lighten(dark.bg, 85),
    sidebar: "#ffffff",
    card: "#ffffff",
    textMain: darken(dark.textMain, 70),
    textSec: darken(dark.textSec, 20),
    primary: darken(dark.primary, 50),
    accent: hslToHex(accentHsl.h, accentHsl.s, Math.max(35, accentHsl.l - 15)),
    border: lighten(dark.border, 55),
    shadow: "rgba(30, 41, 59, 0.08)",
    ...stateColors,
  } as ColorPalette;
}

// ---- Validación ----

export function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function sanitizeHex(value: string): string {
  let hex = value.replace(/[^0-9A-Fa-f#]/g, "");
  if (!hex.startsWith("#")) hex = "#" + hex;
  return hex.substring(0, 7);
}

// ---- Aplicar colores al DOM ----

export function applyColorsToDOM(colors: ColorPalette): void {
  const root = document.documentElement;
  Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
    const value = colors[key as keyof ColorPalette];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  });
}

export function clearCustomColorsFromDOM(): void {
  const root = document.documentElement;
  Object.values(CSS_VAR_MAP).forEach((cssVar) => {
    root.style.removeProperty(cssVar);
  });
}
