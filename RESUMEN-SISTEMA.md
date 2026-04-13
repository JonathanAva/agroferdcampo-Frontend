# Agroferr D'Campo - Sistema de Gestión Multi-Sucursal

## Resumen Técnico y de Diseño

---

## PALETA DE COLORES

### **Modo Claro (Light Mode)**

```css
--bg: #f8fafc /* Fondo principal - Gris claro azulado */ --sidebar: #ffffff
  /* Barra lateral - Blanco puro */ --card: #ffffff /* Tarjetas - Blanco puro */
  --text-main: #1e293b /* Texto principal - Azul oscuro navy */
  --text-sec: #64748b /* Texto secundario - Gris slate */ --primary: #1e293b
  /* Color primario - Navy oscuro */ --accent: #10b981
  /* Color de acento - Verde esmeralda */ --border: #e2e8f0
  /* Bordes - Gris claro */ --shadow: rgba(30, 41, 59, 0.08)
  /* Sombras suaves */;
```

**Uso en el diseño:**

- `#f8fafc` - Fondo general de la aplicación
- `#ffffff` - Sidebar, tarjetas y elementos elevados
- `#1e293b` - Títulos, encabezados, texto importante
- `#64748b` - Subtítulos, descripciones, texto secundario
- `#10b981` - Botones de acción, enlaces activos, indicadores positivos
- `#e2e8f0` - Separadores, bordes de inputs y tarjetas

---

### **Modo Oscuro (Dark Mode)**

```css
--bg: #0f172a /* Fondo principal - Navy profundo */ --sidebar: #1e293b
  /* Barra lateral - Slate oscuro */ --card: #1e293b
  /* Tarjetas - Slate oscuro */ --text-main: #f1f5f9
  /* Texto principal - Gris muy claro */ --text-sec: #94a3b8
  /* Texto secundario - Gris medio */ --primary: #38bdf8
  /* Color primario - Azul cielo */ --accent: #34d399
  /* Color de acento - Verde aguamarina */ --border: #334155
  /* Bordes - Gris oscuro */ --shadow: rgba(0, 0, 0, 0.3)
  /* Sombras profundas */;
```

**Uso en el diseño:**

- `#0f172a` - Fondo profundo para reducir fatiga visual
- `#1e293b` - Sidebar y tarjetas con contraste sutil
- `#f1f5f9` - Texto de alta legibilidad sobre fondos oscuros
- `#94a3b8` - Texto secundario con contraste apropiado
- `#34d399` - Acento verde más brillante para modo oscuro
- `#38bdf8` - Azul cielo para elementos primarios
- `#334155` - Bordes visibles pero no intrusivos

---

### **Colores Adicionales del Sistema**

#### Estados y Alertas:

```css
/* Éxito / Activo */
--success-bg: #d1fae5 --success-text: #065f46 /* Advertencia / Stock Bajo */
  --warning-bg: #fef3c7 --warning-text: #92400e /* Error / Crítico */
  --error-bg: #fee2e2 --error-text: #991b1b /* Advertencia Importante */
  --alert-orange: #f59e0b /* Error Fuerte */ --error-red: #ef4444;
```

---

## 📝 TIPOGRAFÍA

### **Familia de Fuentes**

```css
font-family:
  "Inter",
  system-ui,
  -apple-system,
  sans-serif;
```

**Inter** - Fuente moderna, legible y profesional

- Fuente principal para todo el sistema
- Sans-serif diseñada específicamente para interfaces digitales
- Excelente legibilidad en pantallas de todos los tamaños

### **Pesos de Fuente Utilizados**

```css
font-weight: 400; /* Regular - Texto general, párrafos */
font-weight: 500; /* Medium - Navegación, labels */
font-weight: 600; /* Semi-Bold - Subtítulos, botones */
font-weight: 700; /* Bold - Títulos, valores importantes */
```

### **Jerarquía Tipográfica**

#### Títulos:

- **H1** (Páginas principales): `1.875rem (30px)` - Bold (700)
- **H2** (Secciones): `1.5rem (24px)` - Semi-Bold (600)
- **H3** (Subsecciones): `1.25rem (20px)` - Semi-Bold (600)

#### Cuerpo de Texto:

- **Base**: `1rem (16px)` - Regular (400)
- **Pequeño**: `0.875rem (14px)` - Regular (400)
- **Extra pequeño**: `0.75rem (12px)` - Medium (500)

#### Elementos Especiales:

- **Valores numéricos grandes**: `1.8rem - 2xl` - Bold (700)
- **Botones**: `1rem` - Semi-Bold (600)
- **Códigos de producto**: `font-mono` - Regular (400)

---

## ICONOS

### **Biblioteca de Iconos: Lucide React**

Versión: `0.487.0`

**Importación:**

```typescript
import { IconName } from "lucide-react";
```

### **Iconos Principales del Sistema**

#### **Navegación (Sidebar)**

```typescript
Sprout; // Logo principal de Agroferr D'Campo
LayoutDashboard; // Dashboard / Panel principal
ShoppingCart; // Punto de Venta (POS)
Package; // Inventario
Users; // Clientes
TruckIcon; // Proveedores
Wallet; // Finanzas y Cartera
FileText; // Reportes
Settings; // Configuración
```

#### **Acciones Comunes**

```typescript
Search; // Búsqueda
Plus; // Agregar nuevo
Edit; // Editar
Trash2; // Eliminar
Printer; // Imprimir / Procesar
Download; // Descargar reportes
Filter; // Filtrar datos
```

#### **Estados e Indicadores**

```typescript
TrendingUp; // Tendencia positiva / Aumento
TrendingDown; // Tendencia negativa / Disminución
AlertCircle; // Alerta / Atención requerida
AlertTriangle; // Advertencia / Stock crítico
Clock; // Pendiente / En espera
```

#### **Interfaz de Usuario**

```typescript
Moon; // Modo oscuro
Sun; // Modo claro
LogOut; // Cerrar sesión
ChevronDown; // Menú desplegable
MapPin; // Sucursal / Ubicación
```

#### **Contacto y Comunicación**

```typescript
Phone; // Teléfono
Mail; // Correo electrónico
User; // Usuario / Perfil
UserPlus; // Nuevo cliente
```

#### **Finanzas**

```typescript
DollarSign; // Dinero / Transacciones
CreditCard; // Tarjeta de crédito / Pagos
Wallet; // Cartera / Finanzas
```

#### **Inventario y Productos**

```typescript
Package; // Productos / Paquetes
Calendar; // Fechas / Reportes mensuales
Building2; // Sucursales / Edificios
Receipt; // Facturación / Recibos
Bell; // Notificaciones
```

### **Tamaños de Iconos Estándar**

```typescript
size={16}  // Extra pequeño (badges, inline)
size={18}  // Pequeño (botones pequeños, inputs)
size={20}  // Estándar (navegación, acciones)
size={24}  // Medio (encabezados de tarjetas)
size={28}  // Grande (secciones importantes)
size={40}  // Extra grande (logo, hero)
```

---

## ARQUITECTURA DE COMPONENTES

### **Estructura de Carpetas**

```
/src
  /app
    /components
      /layout
        - Sidebar.tsx        (Navegación principal)
        - Header.tsx         (Barra superior con búsqueda y tema)
        - Layout.tsx         (Contenedor principal)
    /context
      - ThemeContext.tsx     (Modo claro/oscuro)
      - AuthContext.tsx      (Autenticación y usuarios)
      - BranchContext.tsx    (Sucursal seleccionada)
    /pages
      - Login.tsx            (Página de inicio de sesión)
      - Dashboard.tsx        (Panel principal)
      - POS.tsx              (Punto de Venta)
      - Inventory.tsx        (Gestión de inventario)
      - Customers.tsx        (Clientes y créditos)
      - Suppliers.tsx        (Proveedores)
      - Finance.tsx          (Finanzas y cartera)
      - Reports.tsx          (Reportes del sistema)
      - Settings.tsx         (Configuración)
    - routes.tsx             (Configuración de rutas)
    - App.tsx                (Componente raíz)
  /styles
    - theme.css              (Variables CSS y estilos globales)
    - fonts.css              (Importación de tipografías)
```

---

## USUARIOS DE PRUEBA

```javascript
// Administrador General
Email: admin@agroferdcampo.com
Password: admin123
Rol: Acceso completo, todas las sucursales

// Supervisor de Sucursal
Email: supervisor@agroferdcampo.com
Password: super123
Rol: Gestión de sucursal asignada

// Cajero / Vendedor
Email: cajero@agroferdcampo.com
Password: cajero123
Rol: Punto de venta, consulta de inventario
```

---

## MÓDULOS DEL SISTEMA

### **1. Autenticación y Control de Acceso**

- Login seguro con validación
- Gestión de roles (Admin, Supervisor, Cajero, Bodeguero)
- Sesión persistente en localStorage

### **2. Dashboard Principal**

- Resumen de ventas del día
- Indicadores de pedidos pendientes
- Alertas de stock crítico
- Nuevos clientes registrados
- Actividad reciente del sistema

### **3. Punto de Venta (POS)**

- Búsqueda rápida de productos
- Carrito de compras interactivo
- Múltiples métodos de pago (Efectivo, Tarjeta, Crédito)
- Cálculo automático de IVA
- Proceso de venta simplificado

### **4. Gestión de Inventario**

- Catálogo completo de productos
- Control de stock por sucursal
- Alertas de stock bajo y crítico
- Filtros y búsqueda avanzada
- Estados visuales por producto

### **5. Clientes y Cartera**

- Registro completo de clientes
- Gestión de límites de crédito
- Control de deuda actual
- Estados: Activo / Bloqueado
- Información de contacto

### **6. Proveedores**

- Directorio de proveedores
- Datos de contacto
- Categorización de productos suministrados

### **7. Finanzas**

- Balance general
- Registro de ingresos y gastos
- Transacciones pendientes
- Historial financiero

### **8. Reportes**

- Ventas diarias
- Estado de inventario
- Cartera de clientes
- Rentabilidad por producto
- Cierres de caja
- Consolidado mensual

### **9. Configuración**

- Gestión de sucursales
- Administración de usuarios
- Configuración de facturación electrónica
- Sistema de notificaciones

---

## CARACTERÍSTICAS DE DISEÑO

### **Transiciones y Animaciones**

```css
transition: background-color 0.4s ease; /* Cambio de tema */
transition: all 0.3s ease; /* Hover en tarjetas */
transition: color 0.2s; /* Hover en links */
hover: -translate-y-1; /* Elevación de tarjetas */
```

### **Sombras y Elevaciones**

```css
/* Tarjetas principales */
box-shadow: 0 4px 6px var(--shadow);

/* Modal y dropdowns */
box-shadow: 0 10px 25px var(--shadow);

/* Modo oscuro - Gradientes sutiles */
background: linear-gradient(145deg, #1e293b, #0f172a);
```

### **Bordes y Radios**

```css
border-radius: 8px; /* Botones, inputs pequeños */
border-radius: 10px; /* Botones de acción */
border-radius: 12px; /* Cards medianas */
border-radius: 16px; /* Cards grandes */
border-radius: 2xl; /* Containers principales */
```

---

## TECNOLOGÍAS UTILIZADAS

- **Framework**: React 18.3.1 con TypeScript
- **Enrutamiento**: React Router 7.13.0
- **Estilos**: Tailwind CSS 4.1.12 + CSS Variables
- **Iconos**: Lucide React 0.487.0
- **Build Tool**: Vite 6.3.5
- **Gestión de Estado**: React Context API

---

## DISEÑO RESPONSIVO

El sistema está optimizado para:

- **Desktop**: 1920x1080 y superiores
- **Laptop**: 1366x768
- **Tablet**: 768px y superiores
- **Mobile**: 375px y superiores

Breakpoints principales:

```css
sm: 640px   /* Teléfonos grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktop */
```

---

## MEJORAS FUTURAS SUGERIDAS

1. **Integración con API real** para facturación electrónica (DTE)
2. **Base de datos PostgreSQL/MySQL** para persistencia de datos
3. **Dashboard con gráficos interactivos** usando Recharts
4. **Exportación de reportes** a PDF y Excel
5. **Sistema de notificaciones push**
6. **Aplicación móvil nativa** con React Native
7. **Scanner de códigos de barras** para inventario
8. **Multi-idioma** (Español/Inglés)

---

**Agroferr D'Campo** — Sistema de Gestión Multi-Sucursal Profesional.
