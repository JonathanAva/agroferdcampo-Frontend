import { useEffect, useMemo, useState } from "react";
import {
  Package, PackageOpen, PackageX, Vault, ArrowUpFromLine, Scale, Printer, History, Ban, Loader2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NumberInput } from "../ui/number-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { cn } from "../ui/utils";
import { VoidRecordDialog } from "../common/VoidRecordDialog";
import {
  safeService, newRequestId, PURPOSE_LABEL, SOURCE_LABEL,
  SafeCount, SafePackage, SafePackageFilter, SafePackageStatus, SafeSummary, SafeWithdrawal, SafeWithdrawalPurpose,
} from "../../services/safe.service";
import { printSafePackageTicket, printSafeWithdrawalTicket } from "../../utils/printSafeTicket";
import type { SystemConfigData } from "../../pages/SystemConfig";

const money = (v: number | string | null | undefined) => `$${Number(v || 0).toFixed(2)}`;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString("es-SV") : "—");

const STATUS_BADGE: Record<SafePackageStatus, { label: string; className: string }> = {
  CERRADO: { label: "Cerrado", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  ABIERTO: { label: "Abierto", className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  AGOTADO: { label: "Agotado", className: "bg-slate-500/10 text-slate-600 border-slate-500/30" },
  ANULADO: { label: "Anulado", className: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
};

const FILTERS: { value: SafePackageFilter; label: string }[] = [
  { value: "EN_CAJA", label: "En caja fuerte" },
  { value: "CERRADO", label: "Cerrados" },
  { value: "ABIERTO", label: "Abiertos" },
  { value: "AGOTADO", label: "Agotados" },
  { value: "ANULADO", label: "Anulados" },
  { value: "TODOS", label: "Todos" },
];

interface SafeBoxPanelProps {
  sysConfig: SystemConfigData | null;
  /** Propietario, administrador o supervisor */
  canManage: boolean;
  /** Llamado después de cada operación que cambia el saldo (para refrescar otros datos) */
  onChanged?: () => void;
}

/** Caja fuerte controlada por paquetes de efectivo únicos y trazables. */
export function SafeBoxPanel({ sysConfig, canManage, onChanged }: SafeBoxPanelProps) {
  const [summary, setSummary] = useState<SafeSummary | null>(null);
  const [tab, setTab] = useState<"paquetes" | "retiros" | "arqueos">("paquetes");
  const [filter, setFilter] = useState<SafePackageFilter>("EN_CAJA");
  const [packages, setPackages] = useState<SafePackage[]>([]);
  const [withdrawals, setWithdrawals] = useState<SafeWithdrawal[]>([]);
  const [counts, setCounts] = useState<SafeCount[]>([]);
  const [loading, setLoading] = useState(true);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [countOpen, setCountOpen] = useState(false);
  const [historyPkg, setHistoryPkg] = useState<SafePackage | null>(null);
  const [openingPkg, setOpeningPkg] = useState<SafePackage | null>(null);
  const [voidingPkg, setVoidingPkg] = useState<SafePackage | null>(null);
  const [voidingWithdrawal, setVoidingWithdrawal] = useState<SafeWithdrawal | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, w, c] = await Promise.all([
        safeService.getSummary(),
        safeService.getPackages(filter),
        safeService.getWithdrawals(),
        safeService.getCounts(),
      ]);
      setSummary(s);
      setPackages(p.data);
      setWithdrawals(w);
      setCounts(c);
    } catch (e: any) {
      toast.error(e.message || "Error al cargar la caja fuerte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const afterChange = () => {
    load();
    onChanged?.();
  };

  const canVoidPackage = (p: SafePackage) =>
    canManage && (p.source === "CAJA" || p.source === "CIERRE_TURNO") &&
    p.status !== "ANULADO" && Number(p.balance) === Number(p.originalAmount);

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 bg-[var(--card)] border-[var(--border)] col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5"><Vault size={14} /> Saldo caja fuerte</p>
          <p className="text-2xl font-black text-[var(--primary)] mt-1">{money(summary?.balance)}</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5"><Package size={14} /> Cerrados</p>
          <p className="text-xl font-black mt-1">{money(summary?.byStatus.CERRADO.balance)}</p>
          <p className="text-[11px] text-[var(--text-sec)]">{summary?.byStatus.CERRADO.count ?? 0} paquete(s)</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5"><PackageOpen size={14} /> Abiertos con saldo</p>
          <p className="text-xl font-black mt-1">{money(summary?.byStatus.ABIERTO.balance)}</p>
          <p className="text-[11px] text-[var(--text-sec)]">{summary?.byStatus.ABIERTO.count ?? 0} paquete(s)</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5"><PackageX size={14} /> Agotados</p>
          <p className="text-xl font-black mt-1">{summary?.byStatus.AGOTADO.count ?? 0}</p>
          <p className="text-[11px] text-[var(--text-sec)]">historial conservado</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text-sec)] flex items-center gap-1.5"><Scale size={14} /> Último arqueo</p>
          {summary?.lastCount ? (
            <>
              <p className={cn("text-xl font-black mt-1", Number(summary.lastCount.difference) === 0 ? "text-emerald-600" : "text-rose-600")}>
                {Number(summary.lastCount.difference) === 0 ? "Cuadrado" : `${Number(summary.lastCount.difference) > 0 ? "+" : ""}${money(summary.lastCount.difference)}`}
              </p>
              <p className="text-[11px] text-[var(--text-sec)]">{fmtDate(summary.lastCount.createdAt)}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-sec)] mt-1">Sin arqueos</p>
          )}
        </Card>
      </div>

      {summary && summary.unreconciled !== 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          El saldo registrado difiere de la suma de paquetes en {money(summary.unreconciled)}. Revisa los movimientos recientes de caja fuerte.
        </div>
      )}

      {canManage && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setWithdrawOpen(true)} variant="destructive" className="font-bold">
            <ArrowUpFromLine size={16} className="mr-2" /> Retirar efectivo
          </Button>
          <Button onClick={() => setCountOpen(true)} variant="outline" className="font-bold">
            <Scale size={16} className="mr-2" /> Registrar arqueo
          </Button>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex border-b border-[var(--border)]">
        {([
          ["paquetes", "Paquetes"],
          ["retiros", "Retiros"],
          ["arqueos", "Arqueos"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "px-5 py-2.5 text-sm font-bold border-b-2 -mb-px",
              tab === value ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--text-sec)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "paquetes" && (
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <div className="p-3 flex flex-wrap gap-2 border-b border-[var(--border)]">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-3 h-8 rounded-full text-xs font-bold border",
                  filter === f.value ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--text-sec)]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Procedencia</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Original</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center h-20">Cargando...</TableCell></TableRow>
                ) : packages.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center h-20 text-[var(--text-sec)]">No hay paquetes en este filtro</TableCell></TableRow>
                ) : packages.map((p) => (
                  <TableRow key={p.id} className={p.status === "ANULADO" ? "opacity-60" : undefined}>
                    <TableCell className="font-mono font-black">{p.code}</TableCell>
                    <TableCell className="text-xs">{fmtDate(p.createdAt)}</TableCell>
                    <TableCell className="text-sm">
                      {p.cashRegister?.name || SOURCE_LABEL[p.source]}
                      <span className="block text-[10px] text-[var(--text-sec)]">{SOURCE_LABEL[p.source]}</span>
                    </TableCell>
                    <TableCell className="text-sm">{p.createdBy?.fullName || "—"}</TableCell>
                    <TableCell className="text-right">{money(p.originalAmount)}</TableCell>
                    <TableCell className="text-right font-black">{money(p.balance)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGE[p.status].className)}>{STATUS_BADGE[p.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="icon" variant="ghost" className="size-8" title="Historial" onClick={async () => {
                        try { setHistoryPkg(await safeService.getPackage(p.id)); } catch (e: any) { toast.error(e.message); }
                      }}>
                        <History size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8" title="Reimprimir ticket" onClick={() => {
                        try { printSafePackageTicket(p, sysConfig, true); } catch (e: any) { toast.error(e.message); }
                      }}>
                        <Printer size={14} />
                      </Button>
                      {canManage && p.status === "CERRADO" && (
                        <Button size="sm" variant="ghost" className="h-8 text-amber-700" onClick={() => setOpeningPkg(p)}>
                          <PackageOpen size={14} className="mr-1" /> Abrir
                        </Button>
                      )}
                      {canVoidPackage(p) && (
                        <Button size="icon" variant="ghost" className="size-8 text-rose-600" title="Anular traslado" onClick={() => setVoidingPkg(p)}>
                          <Ban size={14} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {tab === "retiros" && (
        <Card className="bg-[var(--card)] border-[var(--border)] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo / destino</TableHead>
                <TableHead>Paquetes utilizados</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center h-20 text-[var(--text-sec)]">Sin retiros registrados</TableCell></TableRow>
              ) : withdrawals.map((w) => {
                const voided = w.status === "ANULADO";
                return (
                  <TableRow key={w.id} className={voided ? "opacity-60" : undefined}>
                    <TableCell className="font-mono font-black">
                      {w.code}
                      {voided && <Badge variant="destructive" className="ml-2 text-[10px]">ANULADO</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{fmtDate(w.createdAt)}</TableCell>
                    <TableCell className="text-sm">
                      <span className="font-bold">{PURPOSE_LABEL[w.purpose]}</span>
                      <span className="block text-xs text-[var(--text-sec)]">{w.description}{w.reference ? ` · Ref: ${w.reference}` : ""}</span>
                      {voided && (
                        <span className="block text-[11px] text-rose-600">
                          Anulado por {w.voidedBy?.fullName || "usuario"} el {fmtDate(w.voidedAt)} · {w.voidReason}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {w.items.map((i) => (
                        <span key={i.id} className="block">{i.package.code}: {money(i.amount)} (queda {money(i.balanceAfter)})</span>
                      ))}
                    </TableCell>
                    <TableCell className={cn("text-right font-black", voided ? "line-through" : "text-rose-600")}>{money(w.totalAmount)}</TableCell>
                    <TableCell className="text-sm">{w.createdBy?.fullName || "—"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="icon" variant="ghost" className="size-8" title="Reimprimir comprobante" onClick={() => {
                        try { printSafeWithdrawalTicket(w, sysConfig, true); } catch (e: any) { toast.error(e.message); }
                      }}>
                        <Printer size={14} />
                      </Button>
                      {canManage && !voided && (
                        <Button size="icon" variant="ghost" className="size-8 text-rose-600" title="Anular retiro" onClick={() => setVoidingWithdrawal(w)}>
                          <Ban size={14} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === "arqueos" && (
        <Card className="bg-[var(--card)] border-[var(--border)] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Saldo registrado</TableHead>
                <TableHead className="text-right">Efectivo contado</TableHead>
                <TableHead className="text-right">Diferencia</TableHead>
                <TableHead>Realizado por</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-20 text-[var(--text-sec)]">Sin arqueos registrados</TableCell></TableRow>
              ) : counts.map((c) => {
                const diff = Number(c.difference);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{fmtDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">{money(c.expectedAmount)}</TableCell>
                    <TableCell className="text-right">{money(c.countedAmount)}</TableCell>
                    <TableCell className={cn("text-right font-black", diff === 0 ? "text-emerald-600" : "text-rose-600")}>
                      {diff === 0 ? "Cuadrado" : `${diff > 0 ? "+" : ""}${money(diff)}`}
                    </TableCell>
                    <TableCell className="text-sm">{c.countedBy?.fullName || "—"}</TableCell>
                    <TableCell className="text-xs text-[var(--text-sec)]">{c.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} sysConfig={sysConfig} onDone={afterChange} />
      <CountDialog open={countOpen} onOpenChange={setCountOpen} expected={summary?.balance ?? 0} onDone={afterChange} />
      <PackageHistoryDialog pkg={historyPkg} onClose={() => setHistoryPkg(null)} />
      <OpenPackageDialog pkg={openingPkg} onClose={() => setOpeningPkg(null)} onDone={afterChange} />

      <VoidRecordDialog
        open={!!voidingPkg}
        onOpenChange={(o) => !o && setVoidingPkg(null)}
        title={`Anular paquete ${voidingPkg?.code ?? ""}`}
        summary={voidingPkg && (
          <p>{voidingPkg.cashRegister?.name || SOURCE_LABEL[voidingPkg.source]} · {fmtDate(voidingPkg.createdAt)} · <b>{money(voidingPkg.originalAmount)}</b></p>
        )}
        consequence="El efectivo vuelve a contarse en la caja de origen y el paquete queda ANULADO en el historial."
        onConfirm={async (reason) => {
          await safeService.voidPackage(voidingPkg!.id, reason);
          toast.success("Traslado anulado");
          afterChange();
        }}
      />
      <VoidRecordDialog
        open={!!voidingWithdrawal}
        onOpenChange={(o) => !o && setVoidingWithdrawal(null)}
        title={`Anular retiro ${voidingWithdrawal?.code ?? ""}`}
        summary={voidingWithdrawal && (
          <p>{PURPOSE_LABEL[voidingWithdrawal.purpose]} · {voidingWithdrawal.description} · <b>{money(voidingWithdrawal.totalAmount)}</b></p>
        )}
        consequence="El efectivo vuelve a los paquetes de los que salió y al saldo de caja fuerte."
        onConfirm={async (reason) => {
          await safeService.voidWithdrawal(voidingWithdrawal!.id, reason);
          toast.success("Retiro anulado");
          afterChange();
        }}
      />
    </div>
  );
}

/** Retiro de efectivo eligiendo de qué paquete(s) sale. */
function WithdrawDialog({ open, onOpenChange, sysConfig, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; sysConfig: SystemConfigData | null; onDone: () => void;
}) {
  const [available, setAvailable] = useState<SafePackage[]>([]);
  const [amounts, setAmounts] = useState<Record<number, number | undefined>>({});
  const [purpose, setPurpose] = useState<SafeWithdrawalPurpose>("DEPOSITO_BANCARIO");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [requestId, setRequestId] = useState(newRequestId);

  useEffect(() => {
    if (!open) return;
    setAmounts({});
    setPurpose("DEPOSITO_BANCARIO");
    setDescription("");
    setReference("");
    setRequestId(newRequestId());
    safeService.getPackages("EN_CAJA").then((r) => setAvailable(r.data.filter((p) => Number(p.balance) > 0))).catch(() => setAvailable([]));
  }, [open]);

  const lines = useMemo(
    () => available.filter((p) => (amounts[p.id] ?? 0) > 0).map((p) => ({ pkg: p, amount: amounts[p.id]! })),
    [available, amounts],
  );
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const invalid = lines.find((l) => Math.round(l.amount * 100) > Math.round(Number(l.pkg.balance) * 100));

  const submit = async () => {
    if (lines.length === 0) return toast.error("Indica cuánto se retira de al menos un paquete");
    if (invalid) return toast.error(`El paquete ${invalid.pkg.code} solo tiene ${money(invalid.pkg.balance)}`);
    if (description.trim().length < 3) return toast.error("Describe el destino del efectivo");
    setSaving(true);
    try {
      const w = await safeService.withdraw({
        purpose,
        description: description.trim(),
        reference: reference.trim() || undefined,
        items: lines.map((l) => ({ packageId: l.pkg.id, amount: Math.round(l.amount * 100) / 100 })),
        requestId,
      });
      toast.success(`Retiro ${w.code} registrado`);
      try { printSafeWithdrawalTicket(w, sysConfig); } catch (e: any) { toast.error(e.message); }
      onDone();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "No se pudo registrar el retiro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-2xl bg-[var(--card)] border-[var(--border)] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowUpFromLine size={18} /> Retirar efectivo de caja fuerte</DialogTitle>
          <DialogDescription>Selecciona de qué paquete(s) sale el dinero. El saldo de cada paquete se actualiza y queda en su historial.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Select value={purpose} onValueChange={(v) => setPurpose(v as SafeWithdrawalPurpose)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PURPOSE_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Referencia <span className="font-normal text-[var(--text-sec)]">(boleta, factura…)</span></Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Destino del efectivo</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. Depósito en Banco Agrícola, cuenta corriente" maxLength={500} />
          </div>

          <div className="space-y-2">
            <Label>Paquetes disponibles</Label>
            {available.length === 0 ? (
              <p className="text-sm text-[var(--text-sec)]">No hay paquetes con saldo en caja fuerte.</p>
            ) : available.map((p) => {
              const value = amounts[p.id];
              const over = (value ?? 0) > Number(p.balance);
              return (
                <div key={p.id} className={cn("grid grid-cols-[minmax(0,1fr)_auto_140px] items-center gap-3 p-2.5 rounded-lg border", value ? "border-[var(--primary)]/50 bg-[var(--primary)]/5" : "border-[var(--border)]")}>
                  <div className="min-w-0">
                    <p className="font-mono font-black text-sm">
                      {p.code} <Badge variant="outline" className={cn("ml-1 text-[10px]", STATUS_BADGE[p.status].className)}>{STATUS_BADGE[p.status].label}</Badge>
                    </p>
                    <p className="text-[11px] text-[var(--text-sec)] truncate">{p.cashRegister?.name || SOURCE_LABEL[p.source]} · {fmtDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-[var(--text-sec)]">Disponible</span>
                    <p className="font-black">{money(p.balance)}</p>
                  </div>
                  <div className="flex gap-1">
                    <NumberInput
                      value={value}
                      onValueChange={(v) => setAmounts((prev) => ({ ...prev, [p.id]: v }))}
                      min={0}
                      placeholder="0.00"
                      className={cn("h-9", over && "border-rose-500")}
                    />
                    <Button type="button" size="sm" variant="ghost" className="h-9 px-2 text-[10px]" title="Usar todo el saldo"
                      onClick={() => setAmounts((prev) => ({ ...prev, [p.id]: Number(p.balance) }))}>
                      Todo
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <div>
            <p className="text-xs text-[var(--text-sec)]">Total a retirar</p>
            <p className="text-2xl font-black text-rose-600">{money(total)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button variant="destructive" onClick={submit} disabled={saving || lines.length === 0 || !!invalid}>
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />} Confirmar retiro
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Arqueo: compara el efectivo contado con el saldo registrado. */
function CountDialog({ open, onOpenChange, expected, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; expected: number; onDone: () => void;
}) {
  const [counted, setCounted] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setCounted(undefined); setNotes(""); } }, [open]);
  const diff = counted !== undefined ? Math.round((counted - expected) * 100) / 100 : null;

  const submit = async () => {
    if (counted === undefined || counted < 0) return toast.error("Ingresa el efectivo contado");
    setSaving(true);
    try {
      await safeService.createCount({ countedAmount: counted, notes: notes.trim() || undefined });
      toast.success("Arqueo registrado");
      onDone();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "No se pudo registrar el arqueo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-sm bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Scale size={18} /> Arqueo de caja fuerte</DialogTitle>
          <DialogDescription>Cuenta el efectivo físico y regístralo. La diferencia queda en el historial.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-[var(--text-sec)]">Saldo registrado</span><b>{money(expected)}</b></div>
          <div className="space-y-1.5">
            <Label>Efectivo contado ($)</Label>
            <NumberInput value={counted} onValueChange={setCounted} min={0} className="h-11 text-lg font-black" />
          </div>
          {diff !== null && (
            <p className={cn("text-sm font-bold", diff === 0 ? "text-emerald-600" : "text-rose-600")}>
              {diff === 0 ? "Cuadrado" : diff > 0 ? `Sobrante de ${money(diff)}` : `Faltante de ${money(-diff)}`}
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Observaciones</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="mr-2 animate-spin" />} Registrar arqueo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Registrar la apertura física de un paquete (no cambia el saldo). */
function OpenPackageDialog({ pkg, onClose, onDone }: { pkg: SafePackage | null; onClose: () => void; onDone: () => void }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (pkg) setNotes(""); }, [pkg]);

  const submit = async () => {
    if (!pkg) return;
    setSaving(true);
    try {
      await safeService.openPackage(pkg.id, notes.trim() || undefined);
      toast.success(`Paquete ${pkg.code} abierto`);
      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "No se pudo abrir el paquete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PackageOpen size={18} /> Abrir / deshacer paquete {pkg?.code}</DialogTitle>
          <DialogDescription>
            Registra que el paquete físico se abrió. <b>No disminuye el saldo</b>: eso solo ocurre al confirmar un retiro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Observación <span className="font-normal text-[var(--text-sec)]">(opcional)</span></Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Se abre para separar efectivo de depósito" maxLength={300} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="mr-2 animate-spin" />} Abrir paquete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Historial completo de un paquete: ingreso, apertura, retiros y anulación. */
function PackageHistoryDialog({ pkg, onClose }: { pkg: SafePackage | null; onClose: () => void }) {
  const events = useMemo(() => {
    if (!pkg) return [];
    const list: { at: string; title: string; detail: string; tone: string }[] = [
      {
        at: pkg.createdAt,
        title: `Ingreso — ${money(pkg.originalAmount)}`,
        detail: `${pkg.cashRegister?.name || SOURCE_LABEL[pkg.source]} · entregó ${pkg.createdBy?.fullName || "—"}${pkg.receivedByName ? ` · recibió ${pkg.receivedByName}` : ""}`,
        tone: "text-emerald-600",
      },
    ];
    if (pkg.openedAt) {
      list.push({ at: pkg.openedAt, title: "Paquete abierto", detail: pkg.openedBy?.fullName || "—", tone: "text-amber-600" });
    }
    for (const item of pkg.withdrawalItems || []) {
      const w = item.withdrawal;
      list.push({
        at: w.createdAt,
        title: `Retiro ${w.code} — ${money(item.amount)}${w.status === "ANULADO" ? " (ANULADO)" : ""}`,
        detail: `${PURPOSE_LABEL[w.purpose]}: ${w.description} · ${w.createdBy?.fullName || "—"} · saldo ${money(item.balanceBefore)} → ${money(item.balanceAfter)}`,
        tone: w.status === "ANULADO" ? "text-[var(--text-sec)] line-through" : "text-rose-600",
      });
      if (w.status === "ANULADO" && w.voidedAt) {
        list.push({ at: w.voidedAt, title: `Anulación de ${w.code}`, detail: `${w.voidedBy?.fullName || "—"} · ${w.voidReason || ""}`, tone: "text-[var(--text-sec)]" });
      }
    }
    if (pkg.voidedAt) {
      list.push({ at: pkg.voidedAt, title: "Paquete anulado", detail: `${pkg.voidedBy?.fullName || "—"} · ${pkg.voidReason || ""}`, tone: "text-rose-600" });
    }
    return list.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [pkg]);

  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[var(--card)] border-[var(--border)] max-h-[85vh] overflow-y-auto">
        {pkg && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono">
                <History size={18} /> {pkg.code}
                <Badge variant="outline" className={cn("text-[10px] font-sans", STATUS_BADGE[pkg.status].className)}>{STATUS_BADGE[pkg.status].label}</Badge>
              </DialogTitle>
              <DialogDescription>Original {money(pkg.originalAmount)} · Saldo actual {money(pkg.balance)}</DialogDescription>
            </DialogHeader>
            <ol className="relative border-l border-[var(--border)] ml-2 space-y-4">
              {events.map((e, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-[var(--border)]" />
                  <p className="text-[11px] text-[var(--text-sec)]">{fmtDate(e.at)}</p>
                  <p className={cn("text-sm font-bold", e.tone)}>{e.title}</p>
                  <p className="text-xs text-[var(--text-sec)]">{e.detail}</p>
                </li>
              ))}
            </ol>
            {pkg.notes && <p className="text-xs text-[var(--text-sec)] whitespace-pre-line border-t border-[var(--border)] pt-2">{pkg.notes}</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
