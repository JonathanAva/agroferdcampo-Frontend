import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Edit,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { apiRequest } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
} from "../components/ui/alert-dialog";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface Branch {
  id: number;
  name: string;
  address?: string;
  taxId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export function Branches() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    taxId: "",
    phone: "",
    isActive: true,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToToggle, setBranchToToggle] = useState<Branch | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const isAdmin = user?.roleId === 1 || user?.roleId === 2;

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await apiRequest<Branch[]>("/branches");
      setBranches(data);
    } catch (error) {
      toast.error("Error al cargar sucursales");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address || "",
        taxId: branch.taxId || "",
        phone: branch.phone || "",
        isActive: branch.isActive,
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        address: "",
        taxId: "",
        phone: "",
        isActive: true,
      });
    }
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("No tienes permisos para realizar esta acción");
      return;
    }
    setFormLoading(true);
    setFormError("");

    try {
      if (editingBranch) {
        await apiRequest(`/branches/${editingBranch.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest("/branches", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      toast.success(editingBranch ? "Sucursal actualizada" : "Sucursal creada");
      setShowModal(false);
      fetchBranches();
    } catch (error: any) {
      setFormError(error.message || "Error al procesar la solicitud");
      toast.error(error.message || "Error al guardar");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleClick = (branch: Branch) => {
    if (!isAdmin) {
      toast.error("No tienes permisos para esta acción");
      return;
    }
    setBranchToToggle(branch);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!branchToToggle) return;

    setToggleLoading(true);
    try {
      await apiRequest(`/branches/${branchToToggle.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !branchToToggle.isActive }),
      });
      toast.success(
        branchToToggle.isActive ? "Sucursal desactivada" : "Sucursal activada",
      );
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado");
    } finally {
      setToggleLoading(false);
      setIsConfirmOpen(false);
      setBranchToToggle(null);
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-accent animate-pulse">
        <Building2 size={48} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
            Sucursales
          </h1>
          <p style={{ color: "var(--text-sec)" }}>Gestionar locales físicos y datos fiscales</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--accent)", color: "#ffffff", boxShadow: "0 4px 12px var(--shadow)" }}
          >
            <Plus size={20} />
            Nueva Sucursal
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-sec)" }}>Total</p>
            <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>{branches.length}</p>
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-sec)" }}>Activas</p>
            <p className="text-2xl font-bold text-emerald-500">{branches.filter(b => b.isActive).length}</p>
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-sec)" }}>Inactivas</p>
            <p className="text-2xl font-bold text-red-500">{branches.filter(b => !b.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="p-4 rounded-2xl border mb-6 shadow-sm"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all focus-within:border-[var(--accent)]"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <Search size={20} style={{ color: "var(--text-sec)" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sucursal por nombre o dirección..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: "var(--text-main)" }}
          />
        </div>
      </div>

      {/* Branches Table */}
      <div
        className="rounded-2xl border border-separate overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-b"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                <th className="p-4 font-semibold" style={{ color: "var(--text-main)" }}>Sucursal</th>
                <th className="p-4 font-semibold" style={{ color: "var(--text-main)" }}>Ubicación</th>
                <th className="p-4 font-semibold" style={{ color: "var(--text-main)" }}>NIT / Registro</th>
                <th className="p-4 font-semibold" style={{ color: "var(--text-main)" }}>Contacto</th>
                <th className="p-4 font-semibold text-center" style={{ color: "var(--text-main)" }}>Estado</th>
                {isAdmin && <th className="p-4 font-semibold text-center" style={{ color: "var(--text-main)" }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((b) => (
                <tr key={b.id} className="border-b last:border-b-0 hover:bg-[var(--bg)] transition-colors" style={{ borderColor: "var(--border)" }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                        style={{ backgroundColor: "var(--bg)", color: "var(--accent)", border: "1px solid var(--border)" }}
                      >
                        <Building2 size={20} />
                      </div>
                      <p className="font-semibold" style={{ color: "var(--text-main)" }}>{b.name}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium" style={{ color: "var(--text-sec)" }}>
                    <div className="flex items-start gap-1.5 max-w-xs">
                      <MapPin size={16} className="mt-0.5 shrink-0 opacity-60" />
                      <span className="text-sm line-clamp-2">{b.address || "No especificada"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <FileText size={16} className="opacity-60" />
                      <span className="font-mono text-sm" style={{ color: "var(--text-main)" }}>{b.taxId || "---"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-sec)" }}>
                      <Phone size={16} className="opacity-60" />
                      <span>{b.phone || "---"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      className="rounded-full px-3 py-1 font-bold text-xs"
                      style={{
                        backgroundColor: b.isActive ? "var(--success-bg)" : "var(--error-bg)",
                        color: b.isActive ? "var(--success-text)" : "var(--error-red)",
                      }}
                    >
                      {b.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleOpenModal(b)}
                          className="p-2 rounded-lg hover:bg-[var(--bg)] transition-all text-[var(--text-sec)] hover:text-[var(--accent)]"
                          title="Editar Sucursal"
                        >
                          <Edit size={18} />
                        </button>
                        <Switch
                          checked={b.isActive}
                          onCheckedChange={() => handleToggleClick(b)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBranches.length === 0 && (
            <div className="p-12 text-center" style={{ color: "var(--text-sec)" }}>
              {searchTerm ? "No hay sucursales que coincidan con la búsqueda" : "No hay sucursales registradas"}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Estilo consistente con el sistema */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden scale-in-95 duration-200"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-sec)" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20">
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: "var(--text-sec)" }}>
                    Nombre de la Sucursal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sucursal Santa Tecla"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: "var(--text-sec)" }}>
                    Dirección
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Final 4a Calle Poniente #23..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)] resize-none"
                    style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: "var(--text-sec)" }}>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      placeholder="2222-2222"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent focus:border-[var(--accent)]"
                      style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: "var(--text-sec)" }}>
                      NIT / NRC
                    </label>
                    <input
                      type="text"
                      placeholder="0614-..."
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent focus:border-[var(--accent)]"
                      style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border font-bold transition-all hover:bg-[var(--bg)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {formLoading ? "Guardando..." : "Guardar Sucursal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <button className="hidden" /> {/* Fix for AlertDialog needs a trigger or controlled open */}
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl" style={{ backgroundColor: "var(--card)" }}>
          <div className="flex flex-col items-center p-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300"
              style={{
                backgroundColor: branchToToggle?.isActive ? "var(--error-bg)" : "var(--success-bg)",
                color: branchToToggle?.isActive ? "var(--error-red)" : "var(--accent)",
                border: `4px solid ${branchToToggle?.isActive ? "var(--error-red)" : "var(--accent)"}20`,
              }}
            >
              {branchToToggle?.isActive ? <ShieldAlert size={40} /> : <ShieldCheck size={40} />}
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                {branchToToggle?.isActive ? "¿Desactivar sucursal?" : "¿Activar sucursal?"}
              </h2>
              <p style={{ color: "var(--text-sec)" }} className="px-4 text-sm">
                ¿Estás seguro de que deseas {branchToToggle?.isActive ? "desactivar" : "activar"} la sucursal{" "}
                <span className="font-semibold" style={{ color: "var(--text-main)" }}>{branchToToggle?.name}</span>?
              </p>
            </div>

            <div className="flex w-full gap-3 mt-8">
              <button
                onClick={() => setIsConfirmOpen(false)}
                disabled={toggleLoading}
                className="flex-1 py-3 rounded-xl font-bold transition-all border shadow-sm"
                style={{ backgroundColor: "var(--bg)", color: "var(--text-sec)", borderColor: "var(--border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={toggleLoading}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: branchToToggle?.isActive ? "var(--error-red)" : "var(--accent)" }}
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
