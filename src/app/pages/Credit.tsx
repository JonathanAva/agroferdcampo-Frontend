import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, FileText, Filter,
  CreditCard, DollarSign, AlertCircle, Plus, Eye, History, Users as UsersIcon
} from 'lucide-react';
import { toast } from 'sonner';

import { creditService, CreditSale, CreditSummary, CreditPayment, RegisterPaymentDto } from '../services/credit.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { NumberInput } from '../components/ui/number-input';

let isAbonoSubmittingGlobal = false;

export function Credit() {
  const isSubmittingRef = useRef(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [credits, setCredits] = useState<CreditSale[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [selectedCredit, setSelectedCredit] = useState<CreditSale | null>(null);
  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Payment Form
  const [paymentForm, setPaymentForm] = useState<RegisterPaymentDto>({
    amount: 0,
    paymentMethod: 'EFECTIVO',
    reference: '',
    notes: ''
  });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCredits();
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, statusFilter]);

  const fetchSummary = async () => {
    try {
      const res = await creditService.getSummary();
      setSummary(res);
    } catch (e) {
      console.error('Error fetching summary', e);
    }
  };

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const filters: any = { page: pagination.page, limit: pagination.limit };
      if (statusFilter !== 'all') filters.status = statusFilter;

      const res = await creditService.getCredits(filters);
      setCredits(res.data || []);
      setPagination({
        page: res.page || 1,
        limit: res.limit || 20,
        total: res.total || 0,
        totalPages: res.totalPages || 1
      });
    } catch (e) {
      toast.error('Error al cargar cuentas por cobrar');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (credit: CreditSale) => {
    try {
      const fullCredit = await creditService.getCreditDetail(credit.id);
      const creditPayments = await creditService.getPayments(credit.id);
      setSelectedCredit(fullCredit);
      setPayments(Array.isArray(creditPayments) ? creditPayments : []);
      setDetailModalOpen(true);
    } catch (e) {
      toast.error('Error al cargar detalle del crédito');
    }
  };

  const handleOpenPayment = (credit: CreditSale) => {
    const remaining = Number(credit.remainingAmount) || 0;
    setSelectedCredit(credit);
    setPaymentForm({
      amount: remaining,
      paymentMethod: 'EFECTIVO',
      reference: '',
      notes: ''
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCredit) return;
    if (isAbonoSubmittingGlobal) return;
    
    const amount = Number(paymentForm.amount);
    const maxAmount = Number(selectedCredit.remainingAmount) || 0;
    if (amount <= 0 || amount > maxAmount) {
      toast.error(`El monto debe ser mayor a 0 y no puede exceder $${maxAmount.toFixed(2)}`);
      return;
    }
    
    // Bloquear el botón a nivel DOM ANTES de cualquier código asíncrono
    isAbonoSubmittingGlobal = true;
    isSubmittingRef.current = true;
    if (submitBtnRef.current) {
      submitBtnRef.current.disabled = true;
      submitBtnRef.current.style.pointerEvents = 'none';
      submitBtnRef.current.style.opacity = '0.6';
    }
    
    setSavingPayment(true);
    try {
      await creditService.registerPayment(selectedCredit.id, {
        ...paymentForm,
        amount,
      });
      toast.success('Abono registrado correctamente');
      setPaymentModalOpen(false);
      fetchSummary();
      fetchCredits();
    } catch (e: any) {
      toast.error(e.message || 'Error al registrar abono');
      // Si falla, rehabilitar el botón para que el cajero corrija y reintente
      if (submitBtnRef.current) {
        submitBtnRef.current.disabled = false;
        submitBtnRef.current.style.pointerEvents = '';
        submitBtnRef.current.style.opacity = '';
      }
    } finally {
      // Siempre liberar el lock al terminar (éxito o error)
      isAbonoSubmittingGlobal = false;
      isSubmittingRef.current = false;
      setSavingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDIENTE': return <Badge variant="warning">Pendiente</Badge>;
      case 'VENCIDO': return <Badge variant="destructive">Vencido</Badge>;
      case 'PAGADO': return <Badge variant="success">Pagado</Badge>;
      case 'ANULADO': return <Badge variant="outline">Anulado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const remaining = Number(selectedCredit?.remainingAmount) || 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Cuentas por Cobrar (CxC)</h1>
          <p className="text-[var(--text-sec)]">Gestiona la cartera de créditos y abonos de clientes.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Total', value: summary ? summary.totalCxC : 0, icon: CreditCard, color: 'var(--primary)' },
          { label: 'Saldo Vencido', value: summary ? summary.totalVencido : 0, icon: AlertCircle, color: '#ef4444' },
          { label: 'Por Vencer (7d)', value: summary ? summary.totalPorVencer : 0, icon: FileText, color: '#f59e0b' },
          { label: 'Clientes Activos', value: summary ? summary.totalClientes : 0, icon: UsersIcon, color: '#10b981', isCount: true },
        ].map(({ label, value, icon: Icon, color, isCount }) => (
          <Card key={label} className="px-5 py-4 flex items-center justify-between border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={18} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">{label}</p>
            </div>
            <p className="text-xl font-black text-[var(--text-main)]">
              {isCount ? value : `$${Number(value).toFixed(2)}`}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-4 border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <Label className="text-xs font-bold text-[var(--text-sec)] uppercase">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[var(--bg)]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="PAGADO">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border overflow-hidden shadow-sm bg-[var(--card)] border-[var(--border)] flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Venta Ref.</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total Original</TableHead>
                <TableHead className="text-right">Abonado</TableHead>
                <TableHead className="text-right">Saldo Restante</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[var(--text-sec)] animate-pulse">
                    Cargando cartera...
                  </TableCell>
                </TableRow>
              ) : credits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[var(--text-sec)] font-medium">
                    No se encontraron créditos con estos filtros
                  </TableCell>
                </TableRow>
              ) : (
                credits.map(credit => (
                  <TableRow key={credit.id} className="group hover:bg-[var(--bg)]/30">
                    <TableCell>
                      <span className="font-bold text-[var(--text-main)] block">
                        {credit.customer?.name ?? `Cliente #${credit.customerId}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      Venta #{credit.saleId}
                      <br/>
                      <span className="text-xs text-[var(--text-sec)]">{new Date(credit.createdAt).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const dateToUse = credit.dueDate 
                          ? new Date(credit.dueDate) 
                          : new Date(new Date(credit.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
                        const isOverdue = dateToUse < new Date() && credit.status !== 'PAGADO';
                        return (
                          <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                            {dateToUse.toLocaleDateString()}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(credit.originalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ${Number(credit.paidAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-black text-[var(--primary)]">
                      ${Number(credit.remainingAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(credit.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDetail(credit)} className="text-[var(--primary)] hover:bg-[var(--primary)]/10">
                          <Eye size={18} />
                        </Button>
                        {credit.status !== 'PAGADO' && credit.status !== 'ANULADO' && (
                          <Button variant="ghost" size="icon" onClick={() => handleOpenPayment(credit)} className="text-emerald-600 hover:bg-emerald-600/10" title="Registrar Abono">
                            <Plus size={18} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/5">
            <p className="text-xs font-bold text-[var(--text-sec)]">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" size="sm" 
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" size="sm" 
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DETALLE DEL CRÉDITO Y ABONOS */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-4xl w-full flex flex-col p-0">
          {selectedCredit && (
            <>
              <DialogHeader className="p-6 pr-16 border-b">
                <DialogTitle className="flex items-center justify-between">
                  <span>Crédito #{selectedCredit.id} — Venta #{selectedCredit.saleId}</span>
                  {getStatusBadge(selectedCredit.status)}
                </DialogTitle>
                <DialogDescription>
                  Cliente: {selectedCredit.customer?.name ?? `#${selectedCredit.customerId}`}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[var(--bg)] p-4 rounded-xl border">
                    <p className="text-xs font-bold text-[var(--text-sec)] uppercase">Total Deuda</p>
                    <p className="text-lg font-bold">${Number(selectedCredit.originalAmount).toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${Number(selectedCredit.paidAmount).toFixed(2)}</p>
                  </div>
                  <div className="bg-[var(--primary)]/10 p-4 rounded-xl border border-[var(--primary)]/20">
                    <p className="text-xs font-bold text-[var(--primary)] uppercase">Saldo Pendiente</p>
                    <p className="text-lg font-black text-[var(--primary)]">${Number(selectedCredit.remainingAmount).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><History size={18}/> Historial de Abonos</h3>
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Referencia</TableHead>
                          <TableHead>Registrado por</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                              No hay abonos registrados
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map(p => (
                            <TableRow key={p.id}>
                              <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                              <TableCell>{p.paymentMethod}</TableCell>
                              <TableCell>{p.reference || '-'}</TableCell>
                              <TableCell>{p.user?.fullName || '-'}</TableCell>
                              <TableCell className="text-right font-bold text-emerald-600">
                                ${Number(p.amount).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* REGISTRAR ABONO */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              {selectedCredit?.customer?.name ?? `Cliente #${selectedCredit?.customerId}`} — Saldo: ${remaining.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Abonar ($)</Label>
              <NumberInput 
                value={paymentForm.amount || 0} 
                min={0.01}
                max={remaining}
                onValueChange={(val) => setPaymentForm({...paymentForm, amount: val ?? 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(val) => setPaymentForm({...paymentForm, paymentMethod: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referencia (Opcional)</Label>
              <Input 
                placeholder="N° Transacción, Cheque..." 
                value={paymentForm.reference}
                onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas (Opcional)</Label>
              <Input 
                placeholder="Detalles adicionales..." 
                value={paymentForm.notes}
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancelar</Button>
            <Button
              ref={submitBtnRef}
              onPointerDown={() => {
                if (!isAbonoSubmittingGlobal) handlePaymentSubmit();
              }}
              disabled={savingPayment}
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              {savingPayment ? 'Registrando...' : 'Confirmar Abono'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
