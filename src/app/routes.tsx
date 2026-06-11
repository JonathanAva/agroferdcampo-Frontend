import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { OtpVerification } from "./pages/OtpVerification";
import { Users as UsersPage } from "./pages/Users";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { POS } from "./pages/POS";
import { Inventory } from "./pages/Inventory";
import { Customers } from "./pages/Customers";
import { Finance } from "./pages/Finance";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { ThemeCustomizer } from "./pages/ThemeCustomizer";
import { Branches as BranchesPage } from "./pages/Branches";
import { CashRegisters } from "./pages/CashRegisters";
import { HumanResources } from "./pages/HumanResources";
import { Catalog } from "./pages/Catalog";
import { UIComponentsShowcase } from "./pages/UIComponentsShowcase";
import { SalesHistory } from "./pages/SalesHistory";
import { SystemConfig } from "./pages/SystemConfig";
import { Quotes } from "./pages/Quotes";
import { NewQuote } from "./pages/NewQuote";
import { Purchases } from "./pages/Purchases";
import { DeliveryNotes } from "./pages/DeliveryNotes";
import { Credit } from "./pages/Credit";
import Vehicles from "./pages/Vehicles";
import DeliveryRoutes from "./pages/DeliveryRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-otp",
    element: <OtpVerification />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "ui-showcase",
        element: <UIComponentsShowcase />,
      },
      // Roles 1, 2, 3, 4 (Cajero y Supervisor)
      {
        element: <ProtectedRoute allowedRoles={[1, 2, 3, 4]} />,
        children: [
          { path: "pos", element: <POS /> },
          { path: "sales", element: <SalesHistory /> },
          { path: "quotes", element: <Quotes /> },
          { path: "quotes/new", element: <NewQuote /> },
          { path: "customers", element: <Customers /> },
          { path: "credit", element: <Credit /> },
          { path: "finance", element: <Finance /> },
        ]
      },
      // Roles 1, 2, 3, 5 (Bodeguero)
      {
        element: <ProtectedRoute allowedRoles={[1, 2, 3, 5]} />,
        children: [
          { path: "inventory", element: <Inventory /> },
          { path: "delivery-notes", element: <DeliveryNotes /> },
        ]
      },
      // Roles 1, 2, 5 (Compras)
      {
        element: <ProtectedRoute allowedRoles={[1, 2, 5]} />,
        children: [
          { path: "purchases", element: <Purchases /> },
        ]
      },
      // Roles 1, 2, 3 (Supervisor)
      {
        element: <ProtectedRoute allowedRoles={[1, 2, 3]} />,
        children: [
          { path: "rrhh", element: <HumanResources /> },
        ]
      },
      // Roles 1, 2 (Propietario y Admin)
      {
        element: <ProtectedRoute allowedRoles={[1, 2]} />,
        children: [
          { path: "catalog", element: <Catalog /> },
          { path: "users", element: <UsersPage /> },
          { path: "vehicles", element: <Vehicles /> },
          { path: "delivery-routes", element: <DeliveryRoutes /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
          { path: "settings/theme", element: <ThemeCustomizer /> },
          { path: "settings/branches", element: <BranchesPage /> },
          { path: "settings/cash-registers", element: <CashRegisters /> },
          { path: "settings/global", element: <SystemConfig /> },
        ]
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
