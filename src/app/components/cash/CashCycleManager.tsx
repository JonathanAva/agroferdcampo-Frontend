import { useState } from 'react';
import {
  RotateCcw, History, AlertTriangle, CheckCircle2, Calendar, ShieldAlert,
  ChevronDown, Info, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NumberInput } from '../ui/number-input';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { cashCyclesService, CashCycle, CashCycleType, ActiveCycleInfo } from '../../services/cash-cycles.service';

const money = (v: number | string | null | undefined) => `$${Number(v || 0).toFixed(2)}`;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString('es-SV') : '—');

const TYPE_LABEL: Record<CashCycleType, { label: string; badge: string }> = {
  GLOBAL: { label: 'Global (Todo el sistema)', badge: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
  CAJA_GENERAL: { label: 'Caja General', badge: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  CAJA_REGISTRADORA: { label: 'Caja Registradora', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
  CAJA_FUERTE: { label: 'Caja Fuerte', badge: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
};

interface CashCycleManagerProps {
  canManage: boolean;
  activeCycleInfo: ActiveCycleInfo | null;
  cycles: CashCycle[];
  selectedCycleId: string; // 'current' | 'all' | cycleId string
  onSelectCycle: (cycleId: string, cycle: CashCycle | null) => void;
  onCycleClosed: () => void;
  cashRegisters: Array<{ id: number; name: string }>;
  currentTabScope?: {
    type: 'general' | 'petty' | 'register' | 'shifts';
    registerId?: number;
    registerName?: string;
  };
}

export function CashCycleManager({
  canManage,
  activeCycleInfo,
  cycles,
  selectedCycleId,
  onSelectCycle,
  onCycleClosed,
  cashRegisters,
  currentTabScope,
}: CashCycleManagerProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedCycleDetails, setSelectedCycleDetails] = useState<CashCycle | null>(null);

  // Estados del modal de cierre de ciclo
  const [closeType, setCloseType] = useState<CashCycleType>(
    currentTabScope?.type === 'register' ? 'CAJA_REGISTRADORA' :
    currentTabScope?.type === 'general' ? 'CAJA_GENERAL' :
    currentTabScope?.type === 'petty' ? 'CAJA_FUERTE' : 'GLOBAL'
  );
  const [targetRegisterId, setTargetRegisterId] = useState<number | undefined>(
    currentTabScope?.registerId || (cashRegisters[0]?.id)
  );
  const [reason, setReason] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState<number | ''>(0);
  const [closeOpenShifts, setCloseOpenShifts] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeSince = activeCycleInfo?.activeSince;
  const currentCycleObj = cycles.find(c => String(c.id) === selectedCycleId);
  const isViewingHistorical = selectedCycleId !== 'current' && selectedCycleId !== 'all';

  const handleOpenCloseDialog = (defaultType?: CashCycleType, defaultRegId?: number) => {
    setCloseType(defaultType || (currentTabScope?.type === 'register' ? 'CAJA_REGISTRADORA' : 'GLOBAL'));
    if (defaultRegId || currentTabScope?.registerId) {
      setTargetRegisterId(defaultRegId || currentTabScope?.registerId);
    }
    setReason('');
    setNewInitialBalance(0);
    setConfirmText('');
    setCloseDialogOpen(true);
  };

  const handleExecuteCloseCycle = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Ingresa un motivo de al menos 5 caracteres');
      return;
    }
    if (confirmText.trim().toUpperCase() !== 'REINICIAR') {
      toast.error('Escribe la palabra REINICIAR para confirmar');
      return;
    }

    setSubmitting(true);
    try {
      const res = await cashCyclesService.closeCycle({
        type: closeType,
        cashRegisterId: closeType === 'CAJA_REGISTRADORA' ? targetRegisterId : undefined,
        reason: reason.trim(),
        newInitialBalance: newInitialBalance === '' ? 0 : Number(newInitialBalance),
        closeOpenShifts,
      });
      toast.success(res.message || 'Cierre de ciclo realizado con éxito');
      setCloseDialogOpen(false);
      onCycleClosed();
    } catch (e: any) {
      toast.error(e.message || 'Error al cerrar ciclo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* BARRA SUPERIOR DE CICLO */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        {/* Selector de Ciclo Contable */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5">
            <Calendar size={14} className="text-[var(--primary)]" /> Ciclo contable:
          </span>
          <Select
            value={selectedCycleId}
            onValueChange={(val) => {
              if (val === 'current') onSelectCycle('current', null);
              else if (val === 'all') onSelectCycle('all', null);
              else {
                const found = cycles.find(c => String(c.id) === val);
                onSelectCycle(val, found || null);
              }
            }}
          >
            <SelectTrigger className="h-8 min-w-[240px] text-xs font-bold bg-[var(--background)]">
              <SelectValue placeholder="Seleccionar ciclo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current" className="font-bold text-emerald-600">
                🟢 Ciclo Actual (En curso) {activeSince ? `· desde ${new Date(activeSince).toLocaleDateString('es-SV')}` : ''}
              </SelectItem>
              <SelectItem value="all" className="font-semibold text-[var(--text-sec)]">
                🌐 Histórico Completo (Sin filtro de ciclo)
              </SelectItem>
              {cycles.length > 0 && (
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider border-t border-[var(--border)] mt-1">
                  Ciclos Cerrados Anteriores
                </div>
              )}
              {cycles.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                  📁 {c.code} ({new Date(c.closedAt).toLocaleDateString('es-SV')}) — {TYPE_LABEL[c.type]?.label || c.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-bold gap-1.5"
            onClick={() => setHistoryOpen(true)}
            title="Ver todos los cierres de ciclo pasados"
          >
            <History size={14} /> Historial de Ciclos ({cycles.length})
          </Button>

          {canManage && (
            <Button
              size="sm"
              variant="default"
              className="h-8 text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              onClick={() => handleOpenCloseDialog()}
              title="Cerrar el ciclo contable y reiniciar saldos a cero de forma segura"
            >
              <RotateCcw size={14} /> Cerrar Ciclo / Reiniciar
            </Button>
          )}
        </div>
      </div>

      {/* BANNER INFORMATIVO SI SE ESTÁ VIENDO UN CICLO HISTÓRICO */}
      {isViewingHistorical && currentCycleObj && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                Estás visualizando el histórico de <b>{currentCycleObj.code}</b> ({TYPE_LABEL[currentCycleObj.type]?.label}).
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Periodo: {fmtDate(currentCycleObj.startDate)} al {fmtDate(currentCycleObj.closedAt)} · Cerrado por {currentCycleObj.closedBy?.fullName || 'Admin'} · Motivo: "{currentCycleObj.reason}"
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectCycle('current', null)}
            className="h-7 text-xs border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 shrink-0"
          >
            Volver al Ciclo Actual
          </Button>
        </div>
      )}

      {/* MODAL: HISTORIAL DE CICLOS */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-4xl bg-[var(--card)] border-[var(--border)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={18} className="text-[var(--primary)]" /> Historial de Ciclos Contables y Reinicios
            </DialogTitle>
            <DialogDescription>
              Registro completo de todos los cierres de ciclo y reinicios realizados en la sucursal con respaldo de auditoría.
            </DialogDescription>
          </DialogHeader>

          {cycles.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-sec)] text-sm">
              No se han registrado cierres de ciclo en esta sucursal todavía. El sistema se encuentra en su ciclo contable inicial.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo / Alcance</TableHead>
                    <TableHead>Fecha Cierre</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-bold text-xs">{c.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px]', TYPE_LABEL[c.type]?.badge)}>
                          {c.cashRegister?.name ? `${c.cashRegister.name}` : TYPE_LABEL[c.type]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{fmtDate(c.closedAt)}</TableCell>
                      <TableCell className="text-xs">{c.closedBy?.fullName || '—'}</TableCell>
                      <TableCell className="text-xs max-w-xs truncate" title={c.reason}>{c.reason}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setSelectedCycleDetails(c);
                          }}
                        >
                          <Eye size={13} /> Ver Detalle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs ml-1"
                          onClick={() => {
                            onSelectCycle(String(c.id), c);
                            setHistoryOpen(false);
                          }}
                        >
                          Filtrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: DETALLES DE UN CICLO ESPECÍFICO */}
      <Dialog open={!!selectedCycleDetails} onOpenChange={(o) => !o && setSelectedCycleDetails(null)}>
        <DialogContent className="sm:max-w-lg bg-[var(--card)] border-[var(--border)]">
          {selectedCycleDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-mono">
                  <CheckCircle2 size={18} className="text-emerald-600" /> {selectedCycleDetails.code} — Detalle de Cierre
                </DialogTitle>
                <DialogDescription>
                  Realizado el {fmtDate(selectedCycleDetails.closedAt)} por {selectedCycleDetails.closedBy?.fullName || 'Admin'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-1">
                  <p className="font-bold text-[var(--text-sec)]">Motivo registrado:</p>
                  <p className="text-sm font-semibold">{selectedCycleDetails.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-[var(--border)]">
                    <p className="text-[var(--text-sec)]">Fecha Inicio Ciclo</p>
                    <p className="font-bold mt-0.5">{fmtDate(selectedCycleDetails.startDate)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[var(--border)]">
                    <p className="text-[var(--text-sec)]">Fecha Fin Ciclo</p>
                    <p className="font-bold mt-0.5">{fmtDate(selectedCycleDetails.closedAt)}</p>
                  </div>
                </div>

                {/* Snapshot de saldos finales */}
                <div className="p-3 rounded-lg border border-[var(--border)] space-y-2">
                  <p className="font-bold text-[var(--text-sec)]">Saldos al momento del cierre (Snapshot):</p>
                  {selectedCycleDetails.finalBalances ? (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {selectedCycleDetails.finalBalances.general !== undefined && (
                        <div className="flex justify-between border-b border-[var(--border)] pb-1">
                          <span>Caja General:</span>
                          <span className="font-bold">{money(selectedCycleDetails.finalBalances.general)}</span>
                        </div>
                      )}
                      {selectedCycleDetails.finalBalances.safe && (
                        <div className="flex justify-between border-b border-[var(--border)] pb-1">
                          <span>Caja Fuerte (saldo):</span>
                          <span className="font-bold">{money(selectedCycleDetails.finalBalances.safe.balance)} ({selectedCycleDetails.finalBalances.safe.packagesCount ?? 0} paq. liquidados)</span>
                        </div>
                      )}
                      {selectedCycleDetails.finalBalances.register && (
                        <div className="flex justify-between border-b border-[var(--border)] pb-1">
                          <span>{selectedCycleDetails.finalBalances.register.name}:</span>
                          <span className="font-bold">{money(selectedCycleDetails.finalBalances.register.balance)}</span>
                        </div>
                      )}
                      {Array.isArray(selectedCycleDetails.finalBalances.registers) && selectedCycleDetails.finalBalances.registers.map((r: any) => (
                        <div key={r.id} className="flex justify-between border-b border-[var(--border)] pb-1">
                          <span>{r.name}:</span>
                          <span className="font-bold">{money(r.balance)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-sec)]">No hay snapshot disponible.</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCycleDetails(null)}>Volver</Button>
                <Button onClick={() => {
                  onSelectCycle(String(selectedCycleDetails.id), selectedCycleDetails);
                  setSelectedCycleDetails(null);
                  setHistoryOpen(false);
                }}>
                  Filtrar este Ciclo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: REALIZAR CIERRE DE CICLO / REINICIAR */}
      <Dialog open={closeDialogOpen} onOpenChange={(o) => !submitting && setCloseDialogOpen(o)}>
        <DialogContent className="max-w-4xl w-[94vw] sm:max-w-4xl bg-[var(--card)] border-[var(--border)] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-2 border-b border-[var(--border)]">
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-lg">
              <RotateCcw size={20} /> Cierre de Ciclo / Reiniciar a Cero
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cierra el ciclo contable actual, regulariza saldos a cero (o fondo inicial) y archiva la trazabilidad para arrancar un nuevo período.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            {/* Alerta de advertencia - ancho completo */}
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <ShieldAlert size={16} /> Importante: Ningún dato se borra
              </p>
              <p>
                Todo el historial de ventas, movimientos, tickets y turnos se conserva intacto. El sistema realiza un corte contable formal, genera los asientos de regularización y deja las cajas listas para el nuevo período.
              </p>
            </div>

            {/* Distribución espaciosa a 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Columna Izquierda: Configuración del alcance y saldos detectados */}
              <div className="space-y-4">
                {/* Selector de Tipo de Cierre */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs">Alcance del Cierre de Ciclo <span className="text-rose-500">*</span></Label>
                  <Select value={closeType} onValueChange={(v) => setCloseType(v as CashCycleType)}>
                    <SelectTrigger className="font-bold h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">🌐 Global (Todo el Sistema: Caja General, Fuerte y Cajas Registradoras)</SelectItem>
                      <SelectItem value="CAJA_GENERAL">💼 Solo Caja General</SelectItem>
                      <SelectItem value="CAJA_REGISTRADORA">🏪 Solo una Caja Registradora en particular</SelectItem>
                      <SelectItem value="CAJA_FUERTE">🛡️ Solo Caja Fuerte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de caja si es registradora */}
                {closeType === 'CAJA_REGISTRADORA' && (
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs">Caja Registradora a Cerrar</Label>
                    <Select
                      value={targetRegisterId ? String(targetRegisterId) : ''}
                      onValueChange={(v) => setTargetRegisterId(Number(v))}
                    >
                      <SelectTrigger className="font-bold h-9">
                        <SelectValue placeholder="Seleccionar caja..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cashRegisters.map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Resumen del impacto según el tipo seleccionado */}
                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <p className="font-bold text-[var(--text-sec)] flex items-center justify-between text-xs">
                    <span>Saldos actuales detectados:</span>
                    <span className="text-[10px] font-normal">Se ajustarán al confirmar</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <span className="text-[var(--text-sec)] block text-[10px] font-sans">Caja General</span>
                      <span className="font-bold text-sm text-[var(--text-main)]">{money(activeCycleInfo?.balances.general)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <span className="text-[var(--text-sec)] block text-[10px] font-sans">Caja Fuerte</span>
                      <span className="font-bold text-sm text-[var(--text-main)]">{money(activeCycleInfo?.balances.safe.balance)}</span>
                    </div>
                    {activeCycleInfo?.balances.registers.map(r => (
                      <div key={r.id} className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                        <span className="text-[var(--text-sec)] block text-[10px] font-sans truncate">{r.name}</span>
                        <span className="font-bold text-sm text-[var(--text-main)]">{money(r.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Motivo, Saldo Inicial y Confirmación */}
              <div className="space-y-4">
                {/* Motivo */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs">Motivo del Cierre de Ciclo <span className="text-rose-500">*</span></Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej. Cierre de ciclo mensual / Arranque de nuevo período en cero"
                    maxLength={200}
                    className="h-9"
                    disabled={submitting}
                  />
                  <p className="text-[10px] text-[var(--text-sec)]">Mínimo 5 caracteres para respaldo contable.</p>
                </div>

                {/* Saldo inicial para nuevo ciclo */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs">Saldo Inicial para el Nuevo Ciclo ($)</Label>
                  <NumberInput
                    value={newInitialBalance}
                    onChange={(v) => setNewInitialBalance(v ?? 0)}
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="h-9"
                    disabled={submitting}
                  />
                  <p className="text-[10px] text-[var(--text-sec)]">
                    Déjalo en $0.00 para iniciar en cero limpio. Si se coloca un monto mayor, se registrará como fondo inicial.
                  </p>
                </div>

                {/* Confirmación obligatoria */}
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                  <Label className="font-bold text-xs text-rose-600 dark:text-rose-400 block">
                    Confirmación de seguridad: Escribe "REINICIAR" para proceder
                  </Label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="REINICIAR"
                    className="font-mono uppercase font-bold tracking-wider h-9 bg-[var(--card)]"
                    disabled={submitting}
                  />
                  <p className="text-[10px] text-[var(--text-sec)]">Evita ejecuciones accidentales.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExecuteCloseCycle}
              disabled={
                submitting ||
                !reason.trim() ||
                reason.trim().length < 5 ||
                confirmText.trim().toUpperCase() !== 'REINICIAR'
              }
              className="gap-2 bg-rose-600 hover:bg-rose-700 font-bold px-5"
            >
              {submitting ? 'Cerrando ciclo...' : 'Confirmar Cierre de Ciclo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
