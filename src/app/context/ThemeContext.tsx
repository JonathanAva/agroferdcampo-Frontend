import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  ColorPalette,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
  applyColorsToDOM,
  clearCustomColorsFromDOM,
} from '../utils/colorUtils';

type Theme = 'light' | 'dark';

export interface SavedTheme {
  id: string;
  name: string;
  baseColor: string;
  lightColors: ColorPalette;
  darkColors: ColorPalette;
  createdAt: string;
}

interface ThemeContextType {
  // Modo claro/oscuro
  theme: Theme;
  toggleTheme: () => void;
  // Colores actuales
  currentColors: ColorPalette;
  defaultLightColors: ColorPalette;
  defaultDarkColors: ColorPalette;
  // Personalización
  customLightColors: ColorPalette | null;
  customDarkColors: ColorPalette | null;
  applyCustomColors: (light: ColorPalette, dark: ColorPalette) => void;
  resetToDefault: () => void;
  isCustomThemeActive: boolean;
  // Temas guardados
  savedThemes: SavedTheme[];
  saveTheme: (name: string, light: ColorPalette, dark: ColorPalette, baseColor: string) => void;
  deleteTheme: (id: string) => void;
  loadTheme: (id: string) => void;
  // Vista previa temporal
  previewColors: (colors: ColorPalette) => void;
  cancelPreview: () => void;
  isPreviewActive: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ---- LocalStorage helpers ----
const LS_THEME = 'agro-theme';
const LS_CUSTOM_LIGHT = 'agro-custom-light';
const LS_CUSTOM_DARK = 'agro-custom-dark';
const LS_SAVED_THEMES = 'agro-saved-themes';
const LS_CUSTOM_ACTIVE = 'agro-custom-active';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // --- Estado base ---
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(LS_THEME);
    return (saved as Theme) || 'light';
  });

  const [customLightColors, setCustomLightColors] = useState<ColorPalette | null>(
    () => loadJSON<ColorPalette | null>(LS_CUSTOM_LIGHT, null)
  );
  const [customDarkColors, setCustomDarkColors] = useState<ColorPalette | null>(
    () => loadJSON<ColorPalette | null>(LS_CUSTOM_DARK, null)
  );
  const [isCustomThemeActive, setIsCustomThemeActive] = useState<boolean>(
    () => loadJSON<boolean>(LS_CUSTOM_ACTIVE, false)
  );
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(
    () => loadJSON<SavedTheme[]>(LS_SAVED_THEMES, [])
  );

  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewBackup, setPreviewBackup] = useState<ColorPalette | null>(null);

  // --- Colores actuales según estado ---
  const getActiveColors = useCallback(
    (currentTheme: Theme): ColorPalette => {
      if (isCustomThemeActive) {
        if (currentTheme === 'light' && customLightColors) return customLightColors;
        if (currentTheme === 'dark' && customDarkColors) return customDarkColors;
      }
      return currentTheme === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    },
    [isCustomThemeActive, customLightColors, customDarkColors]
  );

  const currentColors = getActiveColors(theme);

  // --- Efectos ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(LS_THEME, theme);

    // Aplicar colores personalizados si están activos
    if (isCustomThemeActive) {
      const colors = getActiveColors(theme);
      applyColorsToDOM(colors);
    } else {
      clearCustomColorsFromDOM();
    }
  }, [theme, isCustomThemeActive, getActiveColors]);

  // --- Acciones ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const applyCustomColors = (light: ColorPalette, dark: ColorPalette) => {
    setCustomLightColors(light);
    setCustomDarkColors(dark);
    setIsCustomThemeActive(true);
    localStorage.setItem(LS_CUSTOM_LIGHT, JSON.stringify(light));
    localStorage.setItem(LS_CUSTOM_DARK, JSON.stringify(dark));
    localStorage.setItem(LS_CUSTOM_ACTIVE, JSON.stringify(true));
    // Aplicar inmediatamente
    const active = theme === 'light' ? light : dark;
    applyColorsToDOM(active);
  };

  const resetToDefault = () => {
    setCustomLightColors(null);
    setCustomDarkColors(null);
    setIsCustomThemeActive(false);
    localStorage.removeItem(LS_CUSTOM_LIGHT);
    localStorage.removeItem(LS_CUSTOM_DARK);
    localStorage.setItem(LS_CUSTOM_ACTIVE, JSON.stringify(false));
    clearCustomColorsFromDOM();
  };

  const saveTheme = (name: string, light: ColorPalette, dark: ColorPalette, baseColor: string) => {
    const newTheme: SavedTheme = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      name,
      baseColor,
      lightColors: light,
      darkColors: dark,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedThemes, newTheme];
    setSavedThemes(updated);
    localStorage.setItem(LS_SAVED_THEMES, JSON.stringify(updated));
  };

  const deleteTheme = (id: string) => {
    const updated = savedThemes.filter(t => t.id !== id);
    setSavedThemes(updated);
    localStorage.setItem(LS_SAVED_THEMES, JSON.stringify(updated));
  };

  const loadTheme = (id: string) => {
    const found = savedThemes.find(t => t.id === id);
    if (found) {
      applyCustomColors(found.lightColors, found.darkColors);
    }
  };

  const previewColorsAction = (colors: ColorPalette) => {
    if (!isPreviewActive) {
      setPreviewBackup(currentColors);
    }
    setIsPreviewActive(true);
    applyColorsToDOM(colors);
  };

  const cancelPreview = () => {
    setIsPreviewActive(false);
    if (previewBackup) {
      if (isCustomThemeActive) {
        applyColorsToDOM(previewBackup);
      } else {
        clearCustomColorsFromDOM();
      }
      setPreviewBackup(null);
    } else {
      clearCustomColorsFromDOM();
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        currentColors,
        defaultLightColors: DEFAULT_LIGHT_COLORS,
        defaultDarkColors: DEFAULT_DARK_COLORS,
        customLightColors,
        customDarkColors,
        applyCustomColors,
        resetToDefault,
        isCustomThemeActive,
        savedThemes,
        saveTheme,
        deleteTheme,
        loadTheme,
        previewColors: previewColorsAction,
        cancelPreview,
        isPreviewActive,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
