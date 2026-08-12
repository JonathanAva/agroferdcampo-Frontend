import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo de confirmación reutilizable para salir de un formulario con cambios sin guardar. Úsalo junto con useUnsavedChangesGuard. */
export function UnsavedChangesDialog({ open, onConfirm, onCancel }: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={20} />
            ¿Estás seguro que quieres salir?
          </DialogTitle>
          <DialogDescription>
            Tienes cambios sin guardar. Si sales ahora, se perderán.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Seguir editando</Button>
          <Button variant="destructive" onClick={onConfirm}>Salir sin guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
