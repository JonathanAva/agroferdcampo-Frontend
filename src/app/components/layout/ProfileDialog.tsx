import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { apiRequest } from "../../config/api";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAuth } from "../../context/AuthContext";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (open && user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
      });
      setError("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { ...formData };
      if (!payload.password) delete (payload as any).password;
      delete (payload as any).confirmPassword;
      delete (payload as any).email;
      
      await apiRequest(`/users/profile/me`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      toast.success("Perfil actualizado correctamente");
      onOpenChange(false);
      // Opcional: Actualizar el contexto del usuario si cambió el nombre
      // Para ello habría que recargar la sesión o el 'me'
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md w-full"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-main)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Mi Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tus datos personales y contraseña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black uppercase text-[10px]">Error</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase opacity-70">Nombre Completo</Label>
            <Input
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase opacity-70">Email</Label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-muted opacity-70 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase opacity-70">Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase opacity-70">Nueva Contraseña (Opcional)</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Dejar en blanco para mantener la actual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase opacity-70">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repita la nueva contraseña"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="font-bold shadow-xl rounded-xl"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
