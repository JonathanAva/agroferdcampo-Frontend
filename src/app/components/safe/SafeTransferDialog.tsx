import { useEffect, useState } from "react";
import { Vault, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NumberInput } from "../ui/number-input";
import { safeService, newRequestId, SafePackage } from "../../services/safe.service";
import { printSafePackageTicket } from "../../utils/printSafeTicket";
import type { SystemConfigData } from "../../pages/SystemConfig";

interface SafeTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Caja de origen fija (Finanzas). Si se omite, el servidor usa la caja del turno abierto. */
  cashRegisterId?: number;
  registerName?: string;
  /** Efectivo disponible en la caja, solo informativo (el servidor valida) */
  availableCash?: number | null;
  sysConfig: SystemConfigData | null;
  onDone?: (pkg: SafePackage) => void;
}

/** Traslado de efectivo de una caja a caja fuerte: crea un paquete e imprime su ticket. */
export function SafeTransferDialog({ open, onOpenChange, cashRegisterId, registerName, availableCash, sysConfig, onDone }: SafeTransferDialogProps) {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [receivedBy, setReceivedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [requestId, setRequestId] = useState(newRequestId);

  // Cada apertura es una operación nueva (nuevo requestId); los reintentos dentro de la misma no duplican
  useEffect(() => {
    if (open) {
      setAmount(undefined);
      setReceivedBy("");
      setNotes("");
      setRequestId(newRequestId());
    }
  }, [open]);

  const submit = async () => {
    if (!amount || amount <= 0) {
      toast.error("Indica el monto exacto de efectivo que entregas");
      return;
    }
    if (availableCash != null && amount > availableCash) {
      toast.error(`La caja solo tiene $${availableCash.toFixed(2)} en efectivo registrado`);
      return;
    }
    setSaving(true);
    try {
      const pkg = await safeService.transfer({
        ...(cashRegisterId ? { cashRegisterId } : {}),
        amount: Math.round(amount * 100) / 100,
        receivedByName: receivedBy.trim() || undefined,
        notes: notes.trim() || undefined,
        requestId,
      });
      toast.success(`Paquete ${pkg.code} registrado en caja fuerte`);
      try {
        printSafePackageTicket(pkg, sysConfig);
      } catch (e: any) {
        toast.error(e.message);
      }
      onDone?.(pkg);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "No se pudo registrar el traslado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vault size={18} /> Enviar efectivo a caja fuerte
          </DialogTitle>
          <DialogDescription>
            {registerName ? `Caja de origen: ${registerName}. ` : "Sale de la caja de tu turno abierto. "}
            Se creará un paquete con código único y se imprimirá el ticket para firmar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Monto exacto a entregar ($)</Label>
            <NumberInput value={amount} onValueChange={setAmount} min={0} className="h-12 text-lg font-black" />
            {availableCash != null && (
              <p className="text-xs text-[var(--text-sec)]">Efectivo registrado en la caja: ${availableCash.toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Recibe <span className="font-normal text-[var(--text-sec)]">(opcional, va en el ticket)</span></Label>
            <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Nombre de quien recibe" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label>Observaciones <span className="font-normal text-[var(--text-sec)]">(opcional)</span></Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 size={14} className="mr-2 animate-spin" />} Registrar e imprimir ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
