import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { quotesService, CostAccessResponse } from "../../services/quotes.service";

interface CostAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cotización cuyos costos se solicitan; null al crear una cotización nueva */
  quoteId: number | null;
  onGranted: (result: CostAccessResponse) => void;
}

/**
 * Pide contraseña (propia o de un administrador) para mostrar costos y márgenes internos.
 * La verificación y el registro en auditoría ocurren en el servidor.
 */
export function CostAccessDialog({ open, onOpenChange, quoteId, onGranted }: CostAccessDialogProps) {
  const [mode, setMode] = useState<"own" | "admin">("own");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Nunca conservar credenciales entre aperturas
  useEffect(() => {
    if (!open) {
      setPassword("");
      setEmail("");
      setError(null);
      setMode("own");
    }
  }, [open]);

  const submit = async () => {
    if (!password) {
      setError("Ingresa la contraseña");
      return;
    }
    if (mode === "admin" && !email.trim()) {
      setError("Ingresa el correo del administrador que autoriza");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await quotesService.grantCostAccess(quoteId, {
        password,
        ...(mode === "admin" ? { authorizerEmail: email.trim() } : {}),
      });
      onGranted(result);
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || "No se pudo autorizar");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock size={18} /> Información interna
          </DialogTitle>
          <DialogDescription>
            Los costos y márgenes son confidenciales. El acceso queda registrado en la auditoría.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
          {([
            { value: "own", label: "Mi contraseña" },
            { value: "admin", label: "Autoriza un admin" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setMode(opt.value); setError(null); }}
              className={cn(
                "h-8 rounded-md text-xs font-bold transition-colors",
                mode === opt.value ? "bg-[var(--card)] shadow-sm text-[var(--text-main)]" : "text-[var(--text-sec)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          autoComplete="off"
        >
          {mode === "admin" && (
            <div className="space-y-1.5">
              <Label htmlFor="cost-access-email">Correo del administrador</Label>
              <Input
                id="cost-access-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="cost-access-password">
              {mode === "admin" ? "Contraseña del administrador" : "Tu contraseña"}
            </Label>
            <Input
              id="cost-access-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus={mode === "own"}
            />
          </div>
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          <p className="text-[11px] text-[var(--text-sec)]">
            Solo propietarios, administradores y supervisores de la sucursal pueden ver o autorizar esta información.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={14} className="mr-2 animate-spin" />} Mostrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
