import { useEffect, useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface VoidRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Resumen del registro a anular (monto, fecha, cliente...) */
  summary?: React.ReactNode;
  /** Qué pasa al anular (se muestra como aviso) */
  consequence?: string;
  onConfirm: (reason: string) => Promise<void>;
}

/**
 * Confirma la anulación de un registro pidiendo el motivo. El registro no se borra: queda con
 * estado ANULADO y guarda quién, cuándo y por qué se anuló.
 */
export function VoidRecordDialog({ open, onOpenChange, title, summary, consequence, onConfirm }: VoidRecordDialogProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (reason.trim().length < 5) {
      setError("Describe el motivo de la anulación (mínimo 5 caracteres)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || "No se pudo anular el registro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Ban size={18} /> {title}
          </DialogTitle>
          <DialogDescription>
            El registro no se elimina: queda marcado como ANULADO con tu usuario, la fecha, la hora y el motivo.
          </DialogDescription>
        </DialogHeader>
        {summary && (
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm">{summary}</div>
        )}
        {consequence && (
          <p className="text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">{consequence}</p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="void-reason">Motivo de la anulación</Label>
          <Textarea
            id="void-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Se registró con el método de pago equivocado"
            maxLength={500}
            rows={3}
            autoFocus
          />
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="destructive" onClick={submit} disabled={saving}>
            {saving && <Loader2 size={14} className="mr-2 animate-spin" />} Anular registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
