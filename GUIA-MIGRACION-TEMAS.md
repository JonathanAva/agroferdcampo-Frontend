# 📦 Guía de Migración: Temas de localStorage a Base de Datos

## Contexto

Actualmente, el sistema de personalización de colores almacena toda la información en **`localStorage`** del navegador del administrador. Esta guía detalla exactamente los pasos para migrar este almacenamiento a una **base de datos relacional** cuando se implemente el backend.

---

## 1. Estructura Actual de Datos (localStorage)

### Claves utilizadas

| Clave localStorage | Tipo | Descripción |
|---|---|---|
| `agro-theme` | `string` (`"light"` / `"dark"`) | Modo claro/oscuro activo |
| `agro-custom-light` | `JSON (ColorPalette)` | Paleta personalizada para modo claro |
| `agro-custom-dark` | `JSON (ColorPalette)` | Paleta personalizada para modo oscuro |
| `agro-custom-active` | `boolean` | Si hay un tema personalizado activo |
| `agro-saved-themes` | `JSON (SavedTheme[])` | Array de temas guardados |

### Estructura ColorPalette (JSON)

```json
{
  "bg": "#f8fafc",
  "sidebar": "#ffffff",
  "card": "#ffffff",
  "textMain": "#1e293b",
  "textSec": "#64748b",
  "primary": "#1e293b",
  "accent": "#10b981",
  "border": "#e2e8f0",
  "shadow": "rgba(30, 41, 59, 0.08)",
  "successBg": "#d1fae5",
  "successText": "#065f46",
  "warningBg": "#fef3c7",
  "warningText": "#92400e",
  "errorBg": "#fee2e2",
  "errorText": "#991b1b",
  "alertOrange": "#f59e0b",
  "errorRed": "#ef4444"
}
```

### Estructura SavedTheme (JSON)

```json
{
  "id": "m1abc2def3",
  "name": "Verde Corporativo",
  "lightColors": { /* ColorPalette */ },
  "darkColors": { /* ColorPalette */ },
  "createdAt": "2026-04-13T12:00:00.000Z"
}
```

---

## 2. Esquema de Base de Datos Sugerido (SQL)

### Tabla: `theme_config`
Almacena la configuración de tema activa del sistema (una sola fila global, o una por usuario si se desea por usuario).

```sql
CREATE TABLE theme_config (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id),  -- NULL = configuración global
  theme_mode      VARCHAR(10) DEFAULT 'light',    -- 'light' o 'dark'
  custom_active   BOOLEAN DEFAULT FALSE,
  light_colors    JSONB,                          -- ColorPalette JSON
  dark_colors     JSONB,                          -- ColorPalette JSON
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE UNIQUE INDEX idx_theme_config_user ON theme_config(user_id);
```

### Tabla: `saved_themes`
Almacena las combinaciones de colores guardadas.

```sql
CREATE TABLE saved_themes (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  created_by      INTEGER REFERENCES users(id),
  light_colors    JSONB NOT NULL,                 -- ColorPalette JSON
  dark_colors     JSONB NOT NULL,                 -- ColorPalette JSON
  is_global       BOOLEAN DEFAULT TRUE,           -- Visible para todos
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Índice por creador
CREATE INDEX idx_saved_themes_creator ON saved_themes(created_by);
```

---

## 3. Endpoints API REST Necesarios

### Configuración de Tema Activo

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/theme/config` | Obtener la configuración de tema activa |
| `PUT` | `/api/theme/config` | Actualizar configuración (aplicar colores personalizados) |
| `DELETE` | `/api/theme/config` | Restaurar a predeterminado (eliminar personalización) |

#### `GET /api/theme/config` — Respuesta

```json
{
  "themeMode": "light",
  "customActive": true,
  "lightColors": { /* ColorPalette */ },
  "darkColors": { /* ColorPalette */ }
}
```

#### `PUT /api/theme/config` — Body

```json
{
  "themeMode": "light",
  "customActive": true,
  "lightColors": { /* ColorPalette */ },
  "darkColors": { /* ColorPalette */ }
}
```

### Temas Guardados

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/theme/saved` | Listar todos los temas guardados |
| `POST` | `/api/theme/saved` | Guardar un nuevo tema |
| `PUT` | `/api/theme/saved/:id` | Actualizar un tema guardado |
| `DELETE` | `/api/theme/saved/:id` | Eliminar un tema guardado |

#### `POST /api/theme/saved` — Body

```json
{
  "name": "Verde Corporativo",
  "lightColors": { /* ColorPalette */ },
  "darkColors": { /* ColorPalette */ },
  "isGlobal": true
}
```

#### `GET /api/theme/saved` — Respuesta

```json
[
  {
    "id": 1,
    "name": "Verde Corporativo",
    "createdBy": { "id": 1, "name": "Carlos Yanez" },
    "lightColors": { /* ColorPalette */ },
    "darkColors": { /* ColorPalette */ },
    "isGlobal": true,
    "createdAt": "2026-04-13T12:00:00.000Z"
  }
]
```

---

## 4. Paso a Paso para la Migración

### Paso 1: Crear las tablas en la base de datos
Ejecutar los scripts SQL de la sección 2.

### Paso 2: Crear el servicio API
Implementar los endpoints de la sección 3 en tu backend (Node.js/Express, NestJS, etc.).

### Paso 3: Crear un servicio/hook de API en el frontend

Crear un archivo `src/app/services/themeApi.ts`:

```typescript
const API_BASE = '/api/theme';

export async function getThemeConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function updateThemeConfig(data: {
  themeMode: string;
  customActive: boolean;
  lightColors: ColorPalette;
  darkColors: ColorPalette;
}) {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function resetThemeConfig() {
  return fetch(`${API_BASE}/config`, { method: 'DELETE' });
}

export async function getSavedThemes() {
  const res = await fetch(`${API_BASE}/saved`);
  return res.json();
}

export async function saveThemeToServer(data: {
  name: string;
  lightColors: ColorPalette;
  darkColors: ColorPalette;
}) {
  const res = await fetch(`${API_BASE}/saved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteThemeFromServer(id: number) {
  return fetch(`${API_BASE}/saved/${id}`, { method: 'DELETE' });
}
```

### Paso 4: Modificar `ThemeContext.tsx`

Reemplazar las llamadas a `localStorage` por las llamadas a la API:

```typescript
// ANTES (localStorage):
localStorage.setItem(LS_CUSTOM_LIGHT, JSON.stringify(light));

// DESPUÉS (API):
await updateThemeConfig({
  themeMode: theme,
  customActive: true,
  lightColors: light,
  darkColors: dark,
});
```

Los puntos exactos a cambiar en ThemeContext.tsx son:
1. **Inicialización**: En lugar de `loadJSON(LS_CUSTOM_LIGHT, null)`, hacer un `fetch` a `GET /api/theme/config` en un `useEffect` al montar el componente.
2. **`applyCustomColors`**: Reemplazar `localStorage.setItem(...)` por `PUT /api/theme/config`.
3. **`resetToDefault`**: Reemplazar `localStorage.removeItem(...)` por `DELETE /api/theme/config`.
4. **`saveTheme`**: Reemplazar `localStorage.setItem(LS_SAVED_THEMES, ...)` por `POST /api/theme/saved`.
5. **`deleteTheme`**: Reemplazar `localStorage.setItem(LS_SAVED_THEMES, ...)` por `DELETE /api/theme/saved/:id`.
6. **`loadTheme` / `savedThemes`**: Cargar desde `GET /api/theme/saved` al montar.

### Paso 5: Mantener localStorage como caché
Recomendación: mantener localStorage como caché local para que los colores se apliquen instantáneamente al cargar la página, y sincronizar con el servidor en segundo plano.

```typescript
// Estrategia: Cache-first, luego sincronizar
useEffect(() => {
  // 1. Aplicar desde caché (instantáneo)
  const cached = loadJSON(LS_CUSTOM_LIGHT, null);
  if (cached) applyColorsToDOM(cached);

  // 2. Sincronizar con servidor
  getThemeConfig().then(config => {
    if (config.customActive) {
      setCustomLightColors(config.lightColors);
      setCustomDarkColors(config.darkColors);
      // Actualizar caché
      localStorage.setItem(LS_CUSTOM_LIGHT, JSON.stringify(config.lightColors));
    }
  });
}, []);
```

### Paso 6: Agregar middleware de autorización
Asegurarse de que solo usuarios con rol `admin` puedan modificar temas:

```typescript
// middleware de ejemplo (Express)
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden modificar temas' });
  }
  next();
}

app.put('/api/theme/config', requireAdmin, updateThemeHandler);
app.post('/api/theme/saved', requireAdmin, saveThemeHandler);
app.delete('/api/theme/saved/:id', requireAdmin, deleteThemeHandler);
```

---

## 5. Consideraciones Adicionales

### Temas compartidos vs. por usuario
- **Actual**: Los temas son globales (se aplican a todo el sistema).
- **Futuro**: Se puede agregar un campo `user_id` a `theme_config` para permitir que cada usuario tenga sus preferencias.
- La tabla ya tiene el campo `user_id` preparado para esto.

### Migración de datos existentes
Si ya hay datos en localStorage al momento de la migración, crear un script de migración one-time:
```typescript
async function migrateLocalStorageToServer() {
  const savedThemes = loadJSON('agro-saved-themes', []);
  for (const theme of savedThemes) {
    await saveThemeToServer({
      name: theme.name,
      lightColors: theme.lightColors,
      darkColors: theme.darkColors,
    });
  }
  // Limpiar localStorage después de migrar
  localStorage.removeItem('agro-saved-themes');
}
```

### Validación de colores en el servidor
Agregar validación en el backend para asegurar que los colores sean valores hex válidos:
```typescript
function isValidColorPalette(palette: any): boolean {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  const requiredKeys = ['bg', 'sidebar', 'card', 'textMain', 'textSec', 
                        'primary', 'accent', 'border'];
  return requiredKeys.every(key => hexRegex.test(palette[key]));
}
```

---

**Documento creado**: Abril 2026  
**Última actualización**: Al implementarse el sistema de temas
