import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: number[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user.roleId && !allowedRoles.includes(user.roleId)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
