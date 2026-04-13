# Agroferr D'Campo — Sistema de Gestión Multi-Sucursal

Sistema integral de gestión para agroferretería con soporte de punto de venta, inventario, clientes, proveedores, finanzas y reportes.

## Tecnologías

- **React 18** + TypeScript
- **Vite** como build tool
- **Tailwind CSS 4** + CSS Variables para temas
- **Lucide React** para iconografía
- **React Router 7** para navegación

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

## Estructura de carpetas

```
src/
  app/
    components/   → Componentes reutilizables (layout, ui)
    context/      → Proveedores de contexto (Auth, Theme, Branch)
    pages/        → Páginas del sistema
    utils/        → Utilidades y helpers
    routes.tsx    → Configuración de rutas
    App.tsx       → Componente raíz
  styles/         → CSS global, tema y fuentes
  assets/         → Imágenes y recursos estáticos
```