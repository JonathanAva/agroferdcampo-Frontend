import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiRequest } from "../config/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  roleId?: number;
  phone?: string;
  dui?: string;
  branch?: string;
  branchId?: number;
}

interface BackendUser {
  id: number;
  email: string;
  fullName: string;
  dui?: string;
  phone?: string;
}

export interface Branch {
  id: number;
  name: string;
  role: string;
}

interface LoginResponse {
  accessToken?: string;
  requireBranchSelection?: boolean;
  branches?: Branch[];
  user?: BackendUser;
  message?: string;
  status?: "PASSWORD_CHANGE_REQUIRED" | "MFA_REQUIRED";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  selectBranch: (userId: number, branchId: number) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  availableBranches: Branch[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem("agro-token");
    const savedUser = localStorage.getItem("agro-user");
    if (!savedToken || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [availableBranches, setAvailableBranches] = useState<Branch[]>(() => {
    const savedBranches = localStorage.getItem("agro-available-branches");
    return savedBranches ? JSON.parse(savedBranches) : [];
  });

  // Verificar sesión al montar la app
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("agro-token");
      if (!savedToken) return;

      try {
        const backendUser = await apiRequest<BackendUser>("/auth/me");
        console.log("Sesión comprobada: usuario recuperado", backendUser.email);

        // Al recargar, actualizamos los datos básicos pero mantenemos el rol y la sucursal
        // que ya teníamos en el estado inicial del localStorage para no perder la vista.
        let decodedBranchId: number | undefined = undefined;
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          if (payload && payload.branchId) {
            decodedBranchId = payload.branchId;
          }
        } catch (e) {
          console.error("Error decoding token in verifySession", e);
        }

        if (backendUser && user) {
          setUser({
            ...user, // Conserva role y branch persistidos
            id: backendUser.id.toString(),
            name: backendUser.fullName,
            email: backendUser.email,
            phone: backendUser.phone,
            dui: backendUser.dui,
            branchId: decodedBranchId || user.branchId,
          });
        }
      } catch (error) {
        console.error("Sesión inválida o expirada:", error);
        logout();
      }
    };

    verifySession();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      console.log("Datos procesados en AuthContext.login:", data);

      if (data.accessToken && !data.requireBranchSelection) {
        const primaryBranch = data.branches?.[0];
        handleAuthSuccess(
          data.accessToken,
          data.user!,
          primaryBranch?.name,
          primaryBranch?.role,
        );
      } else if (data.requireBranchSelection) {
        setAvailableBranches(data.branches || []);
        localStorage.setItem(
          "agro-available-branches",
          JSON.stringify(data.branches),
        );
        // Guardamos el usuario temporalmente para completar el proceso luego
        if (data.user) {
          localStorage.setItem("agro-temp-user", JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error: any) {
      console.error("Error de login:", error.message);
      throw error;
    }
  };

  const selectBranch = async (
    userId: number,
    branchId: number,
  ): Promise<LoginResponse> => {
    try {
      console.log("Seleccionando sucursal:", branchId, "para usuario:", userId);
      const data = await apiRequest<LoginResponse>("/auth/select-branch", {
        method: "POST",
        body: JSON.stringify({ userId, branchId }),
      });

      if (data.accessToken) {
        // Buscamos el usuario en:
        // 1. El estado actual (si es un cambio de sucursal)
        // 2. El usuario temporal guardado en el paso 1 (si es login nuevo)
        // 3. El usuario persistido en localStorage (fallback)
        const tempUserStr = localStorage.getItem("agro-temp-user");
        const storedUserStr = localStorage.getItem("agro-user");
        const currentUserData =
          user ||
          (tempUserStr ? JSON.parse(tempUserStr) : null) ||
          (storedUserStr ? JSON.parse(storedUserStr) : null);

        if (currentUserData) {
          console.log(
            "Datos del usuario encontrados para completar el login:",
            currentUserData.email,
          );
          const selectedBranch = availableBranches.find(
            (b) => b.id === branchId,
          );
          handleAuthSuccess(
            data.accessToken,
            {
              id: parseInt(currentUserData.id || currentUserData.sub), // Manejar ambos formatos
              fullName: currentUserData.name || currentUserData.fullName,
              email: currentUserData.email,
              phone: currentUserData.phone,
              dui: currentUserData.dui,
            },
            selectedBranch?.name,
            selectedBranch?.role,
          );

          // Limpiar temp user una vez completado el login
          localStorage.removeItem("agro-temp-user");
        } else {
          console.warn(
            "No se encontraron datos de usuario precedentes para completar el login.",
          );
        }
      }

      return data;
    } catch (error: any) {
      console.error("Error al seleccionar sucursal:", error.message);
      throw error;
    }
  };

  const handleAuthSuccess = (
    token: string,
    backendUser: BackendUser,
    branchName?: string,
    roleString?: string,
  ) => {
    localStorage.setItem("agro-token", token);

    // Mapear el rol del backend a roleId (Insensible a mayúsculas)
    const normalizedRole = roleString?.toUpperCase() || "";
    const roleMap: Record<string, number> = {
      PROPIETARIO: 1,
      ADMINISTRADOR: 2,
      SUPERVISOR: 3,
      CAJERO: 4,
      BODEGUERO: 5,
    };

    const roleId = roleMap[normalizedRole] || undefined;

    let branchId: number | undefined = undefined;
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.branchId) {
          branchId = payload.branchId;
        }
      }
    } catch (e) {
      console.error("Error decoding token", e);
    }

    const mappedUser: User = {
      id: backendUser.id.toString(),
      name: backendUser.fullName,
      email: backendUser.email,
      role: roleString || "ADMIN",
      roleId: roleId,
      phone: backendUser.phone,
      dui: backendUser.dui,
      branch: branchName || "Principal",
      branchId,
    };

    setUser(mappedUser);
    localStorage.setItem("agro-user", JSON.stringify(mappedUser));
  };

  const logout = () => {
    setUser(null);
    setAvailableBranches([]);
    localStorage.removeItem("agro-user");
    localStorage.removeItem("agro-token");
    localStorage.removeItem("agro-available-branches");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        selectBranch,
        logout,
        isAuthenticated: !!user,
        setUser,
        availableBranches,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
