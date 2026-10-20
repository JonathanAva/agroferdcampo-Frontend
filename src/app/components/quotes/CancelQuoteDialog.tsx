import React, { useState, useEffect } from 'react';
import { Ban, AlertCircle, CheckCircle2, Loader2, FileText, ArrowRight, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { QuoteResponse, quotesService } from '../../services/quotes.service';
import { toast } from 'sonner';

interface CancelQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: QuoteResponse | null;
  currentUser?: { name?: string; email?: string } | null;
  onSuccess: () => void;
}

export function CancelQuoteDialog({
  open,
  onOpenChange,
  quote,
  currentUser,
  onSuccess,
}: CancelQuoteDialogProps) {
  const [canceling, setCanceling] = useState(false);

  // Formulario para anulación fiscal o cancelación directa
  const [form, setForm] = useState({
    motivoAnulacion: '',
    nombreResponsable: '',
    tipDocResponsable: '13',
    numDocResponsable: '',
    nombreSolicita: '',
    tipDocSolicita: '13',
    numDocSolicita: '',
  });

  const isConfirmed = quote?.status === 'CONFIRMADA';
  const hasSale = !!quote?.saleId && !!quote?.sale;
  const isDteProcessed = quote?.sale?.dteResponse?.estado === 'PROCESADO';
  const hasCredit = !!quote?.sale?.creditSale;
  const creditRemaining = Number(quote?.sale?.creditSale?.remainingAmount || 0);

  useEffect(() => {
    if (open && quote) {
      setForm({
        motivoAnulacion: '',
        nombreResponsable: currentUser?.name || '',
        tipDocResponsable: '13',
        numDocResponsable: '',
        nombreSolicita: quote.customer?.name || '',
        tipDocSolicita: quote.customer?.nit ? '36' : '13',
        numDocSolicita: quote.customer?.documentNumber || quote.customer?.nit || '',
      });
    }
  }, [open, quote, currentUser]);

  if (!quote) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isConfirmed && isDteProcessed) {
      if (!form.motivoAnulacion.trim() || form.motivoAnulacion.trim().length < 5) {
        toast.error('El motivo de anulación es obligatorio (mínimo 5 caracteres)');
        return;
      }
      if (!form.nombreResponsable.trim() || !form.numDocResponsable.trim()) {
        toast.error('Completa los datos del responsable (cajero/emisor)');
        return;
      }
      if (!form.nombreSolicita.trim() || !form.numDocSolicita.trim()) {
        toast.error('Completa los datos del solicitante (cliente)');
        return;
      }
    }

    setCanceling(true);
    try {
      await quotesService.cancelQuote(quote.id, {
        motivoAnulacion: form.motivoAnulacion.trim() || 'Cancelación de pedido desde Cotización',
        ...(isDteProcessed ? {
          nombreResponsable: form.nombreResponsable.trim(),
          tipDocResponsable: form.tipDocResponsable,
          numDocResponsable: form.numDocResponsable.trim(),
          nombreSolicita: form.nombreSolicita.trim(),
          tipDocSolicita: form.tipDocSolicita,
          numDocSolicita: form.numDocSolicita.trim(),
        } : {}),
      });

      if (isConfirmed) {
        if (isDteProcessed) {
          toast.success(`Factura del pedido #${quote.id} invalidada ante Hacienda y cancelada en todos los módulos`);
        } else {
          toast.success(`Pedido #${quote.id} y su venta cancelados directamente`);
        }
      } else {
        toast.success(`Cotización #${quote.id} cancelada exitosamente`);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la cancelación');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !canceling && onOpenChange(o)}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden bg-[var(--card)] border-[var(--border)] text-[var(--text-main)] shadow-2xl">
        {/* HEADER */}
        <div className="p-5 border-b border-[var(--border)] flex items-start gap-3 bg-[var(--bg)]/40">
          <div className="size-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <Ban size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-lg font-black text-[var(--text-main)] uppercase tracking-wide">
                {isConfirmed
                  ? (isDteProcessed ? 'Anular Factura y Pedido (DTE Hacienda)' : 'Cancelar Pedido y Factura')
                  : 'Cancelar Cotización'}
              </DialogTitle>
              <Badge variant="destructive" className="font-bold">
                Cotización #{quote.id}
              </Badge>
              {isConfirmed && (
                <Badge variant={isDteProcessed ? 'warning' : 'secondary'} className="font-bold">
                  {isDteProcessed ? 'Con DTE en Hacienda' : 'Cancelación Directa (Sin DTE)'}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-[var(--text-sec)] mt-1">
              {isConfirmed
                ? 'La cancelación se reflejará automáticamente en Ventas, Cuentas por Cobrar, Inventario y Hacienda si aplica.'
                : 'La cotización pasará a estado Cancelada y ya no podrá convertirse en venta.'}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* RESUMEN DEL DOCUMENTO */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)] block">Cliente</span>
                <span className="font-black text-[var(--text-main)]">{quote.customer?.name || 'Cliente Ocasional'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)] block">Monto Total</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ${Number(quote.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {hasSale && (
              <div className="pt-2 border-t border-[var(--border)]/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-sec)] uppercase block">Venta Asociada</span>
                  <span className="font-bold text-[var(--text-main)]">Venta #{quote.sale?.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-sec)] uppercase block">Cuentas por Cobrar</span>
                  <span className="font-bold text-[var(--text-main)]">
                    {hasCredit
                      ? `Factura a Crédito (${creditRemaining > 0 ? `Debe $${creditRemaining.toFixed(2)}` : 'Saldada'})`
                      : `Contado (${quote.sale?.paymentMethod || 'Efectivo'})`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-sec)] uppercase block">Estado Fiscal (DTE)</span>
                  <span className="font-bold text-[var(--text-main)]">
                    {isDteProcessed
                      ? `Procesado (${quote.sale?.dteResponse?.codigoGeneracion?.slice(0, 8)}...)`
                      : 'Sin reportar a Hacienda'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* IMPACTO AUTOMÁTICO DE LA CANCELACIÓN */}
          {isConfirmed && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertCircle size={14} /> Impacto automático en el sistema:
              </p>
              <ul className="space-y-1 pl-4 list-disc font-medium">
                <li>
                  <strong>Historial de Ventas:</strong> La venta #{quote.sale?.id} quedará marcada como <strong>CANCELADA</strong> y no contará como venta activa.
                </li>
                {hasCredit && (
                  <li>
                    <strong>Cuentas por Cobrar:</strong> La factura de crédito será anulada y se descontará ${creditRemaining.toFixed(2)} del saldo deudor del cliente.
                  </li>
                )}
                <li>
                  <strong>Inventario:</strong> Los productos reservados/descontados volverán a estar disponibles en stock.
                </li>
                {isDteProcessed ? (
                  <li>
                    <strong>Ministerio de Hacienda:</strong> Se enviará el evento de <strong>Invalidación DTE</strong> oficial ante los servidores de Hacienda.
                  </li>
                ) : (
                  <li>
                    <strong>Hacienda:</strong> La venta no fue reportada previamente, por lo que su <strong>cancelación es directa</strong> sin trámite tributario.
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* MOTIVO DE CANCELACIÓN */}
          <div className="space-y-1.5">
            <Label htmlFor="motivoAnulacion" className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">
              Motivo de {isConfirmed ? 'anulación / cancelación' : 'cancelación'} {isDteProcessed && <span className="text-rose-500">*</span>}
            </Label>
            <Input
              id="motivoAnulacion"
              required={isDteProcessed}
              placeholder={isConfirmed ? 'Ej. Cliente desistió de la compra / Error en cotización' : 'Ej. No aceptada por el cliente'}
              value={form.motivoAnulacion}
              onChange={(e) => setForm({ ...form, motivoAnulacion: e.target.value })}
              className="bg-[var(--bg)] font-medium"
              autoFocus
            />
          </div>

          {/* CAMPOS REQUERIDOS POR HACIENDA SI ES DTE PROCESADO */}
          {isConfirmed && isDteProcessed && (
            <div className="pt-2 border-t border-[var(--border)] space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Datos requeridos por el Ministerio de Hacienda para invalidar DTE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RESPONSABLE (EMISOR) */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-2.5">
                  <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 block border-b border-[var(--border)] pb-1">
                    Responsable Emisor (Cajero / Usuario)
                  </span>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">Nombre Completo *</Label>
                    <Input
                      required
                      value={form.nombreResponsable}
                      onChange={(e) => setForm({ ...form, nombreResponsable: e.target.value })}
                      placeholder="Nombre del cajero"
                      className="h-8 text-xs bg-[var(--bg)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">Tipo Doc.</Label>
                      <Select
                        value={form.tipDocResponsable}
                        onValueChange={(v) => setForm({ ...form, tipDocResponsable: v })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-[var(--bg)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="13">DUI</SelectItem>
                          <SelectItem value="36">NIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">No. Documento *</Label>
                      <Input
                        required
                        value={form.numDocResponsable}
                        onChange={(e) => setForm({ ...form, numDocResponsable: e.target.value })}
                        placeholder="00000000-0"
                        className="h-8 text-xs bg-[var(--bg)]"
                      />
                    </div>
                  </div>
                </div>

                {/* SOLICITANTE (RECEPTOR) */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-2.5">
                  <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 block border-b border-[var(--border)] pb-1">
                    Solicitante (Cliente / Receptor)
                  </span>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">Nombre Completo *</Label>
                    <Input
                      required
                      value={form.nombreSolicita}
                      onChange={(e) => setForm({ ...form, nombreSolicita: e.target.value })}
                      placeholder="Nombre del cliente"
                      className="h-8 text-xs bg-[var(--bg)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">Tipo Doc.</Label>
                      <Select
                        value={form.tipDocSolicita}
                        onValueChange={(v) => setForm({ ...form, tipDocSolicita: v })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-[var(--bg)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="13">DUI</SelectItem>
                          <SelectItem value="36">NIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] font-bold text-[var(--text-sec)] uppercase">No. Documento *</Label>
                      <Input
                        required
                        value={form.numDocSolicita}
                        onChange={(e) => setForm({ ...form, numDocSolicita: e.target.value })}
                        placeholder="00000000-0"
                        className="h-8 text-xs bg-[var(--bg)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTONES */}
          <DialogFooter className="pt-3 border-t border-[var(--border)] flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={canceling}
              className="flex-1 font-bold"
            >
              Regresar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={canceling}
              className="flex-1 font-black"
            >
              {canceling ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isConfirmed && isDteProcessed ? 'Invalidando en Hacienda...' : 'Cancelando...'}
                </>
              ) : (
                <>
                  <Ban size={16} className="mr-2" />
                  {isConfirmed
                    ? (isDteProcessed ? 'Invalidar DTE y Cancelar Pedido' : 'Cancelar Pedido y Venta')
                    : 'Confirmar Cancelación'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
