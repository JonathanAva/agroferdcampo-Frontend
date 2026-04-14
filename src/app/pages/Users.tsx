import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Plus,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dui: string;
  roleId: number;
  isActive: boolean;
}

const ROLES = [
  { id: 1, name: "Propietario" },
  { id: 2, name: "Administrador" },
  { id: 3, name: "Supervisor" },
  { id: 4, name: "Cajero" },
  { id: 5, name: "Bodeguero" },
];

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dui: "",
    password: "",
    roleId: 4,
    isActive: true,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest<User[]>("/users");
      setUsers(data);
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dui: user.dui,
        password: "",
        roleId: user.roleId,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        dui: "",
        password: "",
        roleId: 4,
        isActive: true,
      });
    }
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await apiRequest(`/users/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/users", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      toast.success(editingUser ? "Usuario actualizado" : "Usuario creado");
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      setFormError(error.message || "Error al procesar la solicitud");
      toast.error(error.message || "Error al guardar");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleClick = (user: User) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    setToggleLoading(true);
    try {
      if (userToToggle.isActive) {
        await apiRequest(`/users/${userToToggle.id}`, { method: "DELETE" });
      } else {
        await apiRequest(`/users/${userToToggle.id}/activate`, {
          method: "PATCH",
        });
      }
      toast.success(
        userToToggle.isActive ? "Usuario bloqueado" : "Usuario activado",
      );
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado");
    } finally {
      setToggleLoading(false);
      setIsConfirmOpen(false);
      setUserToToggle(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      u.id !== Number(currentUser?.id),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-main)" }}
        >
          Usuarios
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats - Estilo Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <UsersIcon size={24} style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--text-sec)" }}>
                Total Usuarios
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-main)" }}
              >
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <UsersIcon size={24} style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--text-sec)" }}>
                Activos
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Shield size={24} style={{ color: "#f59e0b" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--text-sec)" }}>
                Admins
              </p>
              <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
                {users.filter((u) => u.roleId === 2).length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={24} style={{ color: "#ef4444" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--text-sec)" }}>
                Inactivos
              </p>
              <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>
                {users.filter((u) => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search - Estilo Clientes */}
      <div
        className="p-4 rounded-xl border mb-4"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg border"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <Search size={20} style={{ color: "var(--text-sec)" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuarios..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: "var(--text-main)" }}
          />
        </div>
      </div>

      {/* Table - Estilo Clientes */}
      <div
        className="rounded-xl border border-separate overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                }}
              >
                <th
                  className="text-left p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Usuario
                </th>
                <th
                  className="text-left p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Contacto
                </th>
                <th
                  className="text-right p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Rol
                </th>
                <th
                  className="text-right p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  DUI / Tel
                </th>
                <th
                  className="text-center p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Estado
                </th>
                <th
                  className="text-center p-4 font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-base"
                        style={{
                          backgroundColor: "var(--bg)",
                          color: "var(--accent)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: "var(--text-main)" }}
                        >
                          {u.fullName}
                        </p>
                        <p
                          className="text-sm font-mono"
                          style={{ color: "var(--text-sec)" }}
                        >
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-sec)" }}
                      >
                        <Phone size={14} />
                        <span>{u.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {ROLES.find((r) => r.id === u.roleId)?.name}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className="font-semibold font-mono"
                      style={{ color: "var(--accent)" }}
                    >
                      {u.dui}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1 border-none font-bold text-xs",
                        u.isActive
                          ? "bg-transparent hover:bg-transparent"
                          : "bg-transparent hover:bg-transparent",
                      )}
                      style={{
                        backgroundColor: u.isActive ? "var(--success-bg)" : "var(--error-bg)",
                        color: u.isActive ? "var(--success-text)" : "var(--error-red)",
                      }}
                    >
                      {u.isActive ? "Activo" : "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1 rounded-md hover:bg-accent transition-colors"
                        style={{ color: "var(--text-sec)" }}
                        title="Editar Usuario"
                      >
                        <Edit size={18} />
                      </button>
                      <div
                        className="flex items-center"
                        title={
                          u.isActive ? "Bloquear Usuario" : "Activar Usuario"
                        }
                      >
                        <Switch
                          checked={u.isActive}
                          onCheckedChange={() => handleToggleClick(u)}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Estilo consistente con el sistema */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-xl border shadow-2xl"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-main)" }}
              >
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: "var(--text-sec)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">
                  {formError}
                </div>
              )}
              <div>
                <label
                  className="block text-xs font-bold mb-1 uppercase opacity-70"
                  style={{ color: "var(--text-sec)" }}
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-main)",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold mb-1 uppercase opacity-70"
                    style={{ color: "var(--text-sec)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold mb-1 uppercase opacity-70"
                    style={{ color: "var(--text-sec)" }}
                  >
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold mb-1 uppercase opacity-70"
                    style={{ color: "var(--text-sec)" }}
                  >
                    DUI
                  </label>
                  <input
                    type="text"
                    value={formData.dui}
                    onChange={(e) =>
                      setFormData({ ...formData, dui: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold mb-1 uppercase opacity-70"
                    style={{ color: "var(--text-sec)" }}
                  >
                    Rol
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roleId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-main)",
                    }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label
                    className="block text-xs font-bold mb-1 uppercase opacity-70"
                    style={{ color: "var(--text-sec)" }}
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border outline-none bg-transparent"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg border font-bold"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-main)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 rounded-lg font-bold"
                  style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
                >
                  {formLoading ? "Procesando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog (SweetAlert2 Style) */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl" style={{ backgroundColor: "var(--card)" }}>
          <div className="flex flex-col items-center p-8">
            {/* Massive Icon Circle Area */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300"
              style={{
                backgroundColor: userToToggle?.isActive
                  ? "var(--error-bg)"
                  : "var(--success-bg)",
                color: userToToggle?.isActive
                  ? "var(--error-red)"
                  : "var(--accent)",
                border: `4px solid ${userToToggle?.isActive ? "var(--error-red)" : "var(--accent)"}20`,
              }}
            >
              {userToToggle?.isActive ? (
                <ShieldAlert size={40} />
              ) : (
                <ShieldCheck size={40} />
              )}
            </div>

            <div className="text-center space-y-2">
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--text-main)" }}
              >
                {userToToggle?.isActive
                  ? "¿Bloquear usuario?"
                  : "¿Activar usuario?"}
              </h2>
              <p style={{ color: "var(--text-sec)" }} className="px-4">
                ¿Estás seguro de que deseas{" "}
                {userToToggle?.isActive ? "desactivar" : "activar"} el acceso
                para{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  {userToToggle?.fullName}
                </span>
                ?
              </p>
            </div>

            <div className="flex w-full gap-3 mt-8">
              <button
                onClick={() => setIsConfirmOpen(false)}
                disabled={toggleLoading}
                className="flex-1 py-3 rounded-xl font-bold transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text-sec)",
                  border: "1px solid var(--border)",
                }}
              >
                No, cancelar
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={toggleLoading}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95"
                style={{
                  backgroundColor: userToToggle?.isActive
                    ? "var(--error-red)"
                    : "var(--accent)",
                }}
              >
                {toggleLoading ? "Procesando..." : "Sí, continuar"}
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
