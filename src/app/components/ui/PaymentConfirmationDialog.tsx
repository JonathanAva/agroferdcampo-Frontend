import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building2,
  User,
  FileText,
  Landmark,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";

export interface PaymentConfirmationDetails {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  operationType: string; // Ej: "Abono a Crédito", "Cobro de Venta", "Pago a Proveedor", "Ingreso a Caja"
  amount: number;
  paymentMethod: string; // Ej: "EFECTIVO", "TARJETA", "TRANSFERENCIA", "CREDITO", "MIXTO"
  relatedPerson?: string; // Ej: "Juan Pérez", "Distribuidora San Juan"
  personRole?: "Cliente" | "Proveedor" | "Persona relacionada" | "Beneficiario" | "Usuario";
  documentNumber?: string; // Ej: "Factura #1234", "Ticket #45", "Orden #89"
  cashRegisterOrAccount?: string; // Ej: "Caja Principal - Sucursal Central", "Caja Chica"
  notes?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta (Crédito/Débito)",
  TRANSFERENCIA: "Transferencia Bancaria",
  CREDITO: "Crédito",
  MIXTO: "Pago Mixto",
  CHEQUE: "Cheque",
};

export function PaymentConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  operationType,
  amount,
  paymentMethod,
  relatedPerson,
  personRole = "Cliente",
  documentNumber,
  cashRegisterOrAccount,
  notes,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar y Registrar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
}: PaymentConfirmationDetails) {
  const methodLabel =
    PAYMENT_METHOD_LABELS[paymentMethod?.toUpperCase()] ||
    paymentMethod ||
    "Efectivo";

  const personText = relatedPerson?.trim() || "Público General";
  const docText = documentNumber?.trim() || "Sin documento específico";
  const cashText = cashRegisterOrAccount?.trim() || "Caja del turno actual";

  // Construcción del texto en lenguaje natural según el ejemplo solicitado:
  // "¿Está seguro de que desea registrar un abono de $250.00 en efectivo al cliente Juan Pérez correspondiente a la factura #1234?"
  const naturalPhrase = `¿Está seguro de que desea registrar un ${operationType.toLowerCase()} de $${Number(
    amount || 0
  ).toFixed(2)} en ${methodLabel.toLowerCase()} al ${personRole.toLowerCase()} ${personText} correspondiente a ${docText}?`;

  const handleCancelClick = () => {
    onOpenChange(false);
    if (onCancel) onCancel();
  };

  const handleConfirmClick = async () => {
    try {
      await onConfirm();
    } finally {
      // onConfirm handles state or closing
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl bg-[var(--card)] border-[var(--border)] text-[var(--text-main)] shadow-2xl p-0 overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text-main)",
        }}
      >
        {/* Cabecera con advertencia y título */}
        <div className="p-6 bg-[var(--bg)]/70 border-b border-[var(--border)] flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle size={26} />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                Confirmación Requerida
              </span>
            </div>
            <DialogTitle className="text-xl font-black text-[var(--text-main)] tracking-tight">
              {title || `¿Confirmar ${operationType}?`}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-sec)]">
              Por favor revise detalladamente los datos de la transacción antes
              de asentar el movimiento en el sistema.
            </DialogDescription>
          </div>
        </div>

        {/* Cuerpo con frase clara y desglose de datos */}
        <div className="p-6 space-y-5">
          {/* Tarjeta con la frase natural */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-950 dark:text-amber-100 text-sm font-semibold leading-relaxed shadow-xs">
            <p className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">“</span>
              <span>{naturalPhrase}</span>
              <span className="text-amber-500 mt-0.5">”</span>
            </p>
          </div>

          {/* Grilla estructurada con los 6 datos clave solicitados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Monto */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 flex items-center justify-between col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
                    Monto a Registrar
                  </p>
                  <p className="text-xs font-semibold text-[var(--text-sec)]">
                    {operationType}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                ${Number(amount || 0).toFixed(4)}
              </span>
            </div>

            {/* Método de Pago */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
                <CreditCard size={12} className="text-[var(--primary)]" />
                Método de pago
              </div>
              <p className="font-black text-sm text-[var(--text-main)]">
                {methodLabel}
              </p>
            </div>

            {/* Cliente o Proveedor */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
                {personRole === "Proveedor" ? (
                  <Building2 size={12} className="text-blue-500" />
                ) : (
                  <User size={12} className="text-indigo-500" />
                )}
                {personRole}
              </div>
              <p className="font-black text-sm text-[var(--text-main)] truncate" title={personText}>
                {personText}
              </p>
            </div>

            {/* Factura / Documento */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
                <FileText size={12} className="text-amber-500" />
                Documento relacionado
              </div>
              <p className="font-mono font-bold text-sm text-[var(--text-main)] truncate" title={docText}>
                {docText}
              </p>
            </div>

            {/* Caja o Cuenta */}
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
                <Landmark size={12} className="text-violet-500" />
                Caja / Cuenta destino
              </div>
              <p className="font-black text-sm text-[var(--text-main)] truncate" title={cashText}>
                {cashText}
              </p>
            </div>
          </div>

          {notes && (
            <div className="text-[11px] text-[var(--text-sec)] p-2.5 rounded-lg bg-[var(--bg)]/30 border border-[var(--border)] flex items-start gap-1.5">
              <span className="font-bold shrink-0">Nota:</span>
              <span className="italic truncate">{notes}</span>
            </div>
          )}
        </div>

        {/* Footer con opciones Confirmar y Cancelar */}
        <DialogFooter className="p-4 bg-[var(--bg)]/50 border-t border-[var(--border)] flex sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="font-bold border-[var(--border)] text-[var(--text-sec)] hover:bg-[var(--bg)]"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="font-black bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-md gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
