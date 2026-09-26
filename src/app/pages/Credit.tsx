import React, { useState, useEffect, useRef } from 'react';
import {
  Search, FileText, Filter, CheckCircle2,
  CreditCard, DollarSign, AlertCircle, Plus, Eye, History, Users as UsersIcon, RefreshCcw, Trash2, Printer,
  Hash, User, Package, Building2, X, Layers, CheckSquare, Square, ArrowDownUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router';

import { creditService, CreditSale, CreditSummary, CreditPayment, RegisterPaymentDto, RegisterMultiPaymentDto, MultiPaymentResponse, CreateManualCreditDto, GroupedCreditCustomer } from '../services/credit.service';
import { getSaleDetail } from '../services/sales.service';
import { cashRegistersService } from '../services/cash-registers.service';
import { CashRegister } from '../services/cash-shifts.service';
import { apiRequest } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { NumberInput } from '../components/ui/number-input';
import { SemaphoreBanner } from '../components/ui/semaphore-banner';
import { SmartFilter, FilterConfig } from '../components/ui/smart-filter';
import { cn } from '../components/ui/utils';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { UnsavedChangesDialog } from '../components/ui/unsaved-changes-dialog';

const creditFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar cliente...', type: 'text', placeholder: 'Nombre del cliente...' },
  { id: 'status', label: 'Estado', type: 'category', options: [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Vencido', value: 'VENCIDO' },
    { label: 'Pagado', value: 'PAGADO' },
    { label: 'Anulado', value: 'ANULADO' }
  ]},
  { id: 'showCancelled', label: 'Solo anuladas', type: 'boolean' }
];

let isAbonoSubmittingGlobal = false;
let isMultiAbonoSubmittingGlobal = false;

interface MultiPaymentRow {
  creditSale: CreditSale;
  selected: boolean;
  remaining: number;
  amount: number;
}

export function Credit() {
  const isSubmittingRef = useRef(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const multiSubmitBtnRef = useRef<HTMLButtonElement>(null);
  const [groupedCredits, setGroupedCredits] = useState<GroupedCreditCustomer[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Abono Múltiple State
  const [multiPaymentModalOpen, setMultiPaymentModalOpen] = useState(false);
  const [multiPaymentCustomer, setMultiPaymentCustomer] = useState<GroupedCreditCustomer | null>(null);
  const [multiPaymentRows, setMultiPaymentRows] = useState<MultiPaymentRow[]>([]);
  const [multiGlobalAmount, setMultiGlobalAmount] = useState<number | string>('');
  const [multiPaymentMethod, setMultiPaymentMethod] = useState<string>('EFECTIVO');
  const [multiReference, setMultiReference] = useState('');
  const [multiNotes, setMultiNotes] = useState('');
  const [multiCashRegisterId, setMultiCashRegisterId] = useState<number | null>(null);
  const [multiReceiptFile, setMultiReceiptFile] = useState<File | null>(null);
  const [savingMultiPayment, setSavingMultiPayment] = useState(false);
  const [selectedInnerSaleIds, setSelectedInnerSaleIds] = useState<number[]>([]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const searchFilter = searchParams.get('search') || '';
  const showCancelled = searchParams.get('showCancelled') === 'true';
  
  // Modals
  const [selectedGroup, setSelectedGroup] = useState<GroupedCreditCustomer | null>(null);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<CreditSale | null>(null);
  
  // Specific Sale Detail
  const [specificDetailModalOpen, setSpecificDetailModalOpen] = useState(false);
  const [selectedSpecificCredit, setSelectedSpecificCredit] = useState<CreditSale | null>(null);
  const [specificPayments, setSpecificPayments] = useState<CreditPayment[]>([]);
  const [specificPaymentsPage, setSpecificPaymentsPage] = useState(1);
  const [specificDetailTab, setSpecificDetailTab] = useState<'abonos' | 'factura'>('abonos');

  // Inner Modal Filters
  const [innerStatusFilter, setInnerStatusFilter] = useState('all');
  const [innerBuyDateStart, setInnerBuyDateStart] = useState('');
  const [innerBuyDateEnd, setInnerBuyDateEnd] = useState('');
  const [innerDueDateStart, setInnerDueDateStart] = useState('');
  const [innerDueDateEnd, setInnerDueDateEnd] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Payment Detail Modal
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<CreditPayment | null>(null);
  
  // Payment Form
  const [paymentForm, setPaymentForm] = useState<RegisterPaymentDto>({
    amount: 0,
    paymentMethod: 'EFECTIVO',
    reference: '',
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<number | null>(null);

  // Crear Cuenta por Cobrar Manual
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingCredit, setCreatingCredit] = useState(false);
  const [newCreditForm, setNewCreditForm] = useState<CreateManualCreditDto>({
    customerId: 0,
    amount: 0,
    dueDate: '',
    notes: '',
  });
  const [selectedCustomerForCreate, setSelectedCustomerForCreate] = useState<{ id: number; name: string; documentNumber?: string; nit?: string } | null>(null);
  const [customerSearchForCreate, setCustomerSearchForCreate] = useState('');
  const [customerResultsForCreate, setCustomerResultsForCreate] = useState<any[]>([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCredits();
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, statusFilter, searchFilter, showCancelled]);

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
      else if (showCancelled) filters.status = 'ANULADO';
      else filters.excludeCancelled = true;
      if (searchFilter) filters.search = searchFilter;

      const res = await creditService.getGroupedCredits(filters);
      setGroupedCredits(res.data || []);
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

  const handleOpenDetail = (group: GroupedCreditCustomer) => {
    setSelectedGroup(group);
    setSelectedInnerSaleIds([]);
    setInnerStatusFilter('all');
    setInnerBuyDateStart('');
    setInnerBuyDateEnd('');
    setInnerDueDateStart('');
    setInnerDueDateEnd('');
    setDetailModalOpen(true);
  };

  const loadCashRegisters = async () => {
    try {
      const registers = await cashRegistersService.findAll();
      const active = registers.filter(r => r.isActive);
      setCashRegisters(active);
      return active;
    } catch (e) {
      toast.error('Error al cargar las cajas disponibles');
      return [];
    }
  };

  const [specificSaleDetail, setSpecificSaleDetail] = useState<any>(null);

  const handleOpenSpecificDetail = async (sale: CreditSale) => {
    try {
      const [creditPayments, saleDetail] = await Promise.all([
        creditService.getPayments(sale.id),
        sale.saleId ? getSaleDetail(sale.saleId) : Promise.resolve(null),
      ]);
      setSelectedSpecificCredit(sale);
      setSpecificPayments(Array.isArray(creditPayments) ? creditPayments : []);
      setSpecificSaleDetail(saleDetail);
      setSpecificPaymentsPage(1);
      setSpecificDetailTab('abonos');
      setSpecificDetailModalOpen(true);
    } catch (e) {
      toast.error('Error al cargar detalle del crédito');
    }
  };

  const handleOpenPayment = async (credit: CreditSale) => {
    const remaining = Number(credit.remainingAmount) || 0;
    setSelectedCreditForPayment(credit);
    setPaymentForm({
      amount: remaining,
      paymentMethod: 'EFECTIVO',
      reference: '',
      notes: ''
    });
    setReceiptFile(null);
    setSelectedCashRegisterId(null);
    setPaymentModalOpen(true);
    const active = await loadCashRegisters();
    if (active.length === 1) setSelectedCashRegisterId(active[0].id);
  };

  const handleOpenMultiPaymentForCustomer = async (group: GroupedCreditCustomer, preselectedIds?: number[]) => {
    const pendingSales = group.creditSales.filter(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO');
    if (pendingSales.length === 0) {
      toast.info('Este cliente no tiene compras a crédito con saldo pendiente');
      return;
    }

    const hasPreselected = Array.isArray(preselectedIds) && preselectedIds.length > 0;
    const rows: MultiPaymentRow[] = pendingSales.map(s => {
      const rem = Number(s.remainingAmount) || 0;
      const isSelected = hasPreselected ? preselectedIds.includes(s.id) : true;
      return {
        creditSale: s,
        selected: isSelected,
        remaining: rem,
        amount: isSelected ? rem : 0,
      };
    });

    setMultiPaymentCustomer(group);
    setMultiPaymentRows(rows);
    setMultiGlobalAmount('');
    setMultiPaymentMethod('EFECTIVO');
    setMultiReference('');
    setMultiNotes('');
    setMultiReceiptFile(null);
    setMultiPaymentModalOpen(true);

    const active = await loadCashRegisters();
    if (active.length === 1) {
      setMultiCashRegisterId(active[0].id);
    } else if (selectedCashRegisterId) {
      setMultiCashRegisterId(selectedCashRegisterId);
    } else {
      setMultiCashRegisterId(null);
    }
  };

  const handleDistributeGlobalAmount = () => {
    const totalToDistribute = Number(multiGlobalAmount);
    if (!totalToDistribute || totalToDistribute <= 0) {
      toast.error('Ingresa un monto global mayor a 0 para distribuir');
      return;
    }

    const updated = [...multiPaymentRows];
    const selectedIndices = updated
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r.selected)
      .sort((a, b) => {
        const dateA = a.r.creditSale.dueDate ? new Date(a.r.creditSale.dueDate).getTime() : new Date(a.r.creditSale.createdAt).getTime();
        const dateB = b.r.creditSale.dueDate ? new Date(b.r.creditSale.dueDate).getTime() : new Date(b.r.creditSale.createdAt).getTime();
        return dateA - dateB;
      });

    if (selectedIndices.length === 0) {
      toast.error('Selecciona al menos una factura para distribuir el monto');
      return;
    }

    let remainingToDistribute = totalToDistribute;
    for (const { idx } of selectedIndices) {
      const maxPossible = updated[idx].remaining;
      const allocated = Math.min(maxPossible, remainingToDistribute);
      updated[idx].amount = Number(allocated.toFixed(4));
      remainingToDistribute = Number((remainingToDistribute - allocated).toFixed(4));
    }

    if (remainingToDistribute > 0) {
      toast.info(`El monto ingresado excede la deuda de las facturas seleccionadas en $${remainingToDistribute.toFixed(4)}`);
    } else {
      toast.success('Monto distribuido automáticamente según vencimiento');
    }

    setMultiPaymentRows(updated);
  };

  const handleSaldarTodoSelected = () => {
    setMultiPaymentRows(prev => prev.map(r => ({
      ...r,
      amount: r.selected ? r.remaining : 0,
    })));
  };

  const handleLimpiarMontos = () => {
    setMultiPaymentRows(prev => prev.map(r => ({
      ...r,
      amount: 0,
    })));
    setMultiGlobalAmount('');
  };

  const handleRowAmountChange = (idx: number, val: number) => {
    setMultiPaymentRows(prev => {
      const copy = [...prev];
      const max = copy[idx].remaining;
      const safeVal = Math.min(Math.max(0, val || 0), max);
      copy[idx].amount = Number(safeVal.toFixed(4));
      if (safeVal > 0 && !copy[idx].selected) {
        copy[idx].selected = true;
      }
      return copy;
    });
  };

  const handleRowToggle = (idx: number) => {
    setMultiPaymentRows(prev => {
      const copy = [...prev];
      const newSelected = !copy[idx].selected;
      copy[idx].selected = newSelected;
      if (!newSelected) {
        copy[idx].amount = 0;
      } else {
        copy[idx].amount = copy[idx].remaining;
      }
      return copy;
    });
  };

  const totalMultiToPay = Number(
    multiPaymentRows
      .filter(r => r.selected && r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0)
      .toFixed(4)
  );

  const totalFullyPaidCount = multiPaymentRows.filter(
    r => r.selected && r.amount >= r.remaining && r.remaining > 0
  ).length;

  const totalPartialPaidCount = multiPaymentRows.filter(
    r => r.selected && r.amount > 0 && r.amount < r.remaining
  ).length;

  const handleOpenPaymentDetail = (payment: CreditPayment) => {
    setSelectedPaymentDetail(payment);
    setPaymentDetailModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setNewCreditForm({
      customerId: 0,
      amount: 0,
      dueDate: defaultDueDate.toISOString().slice(0, 10),
      notes: '',
    });
    setSelectedCustomerForCreate(null);
    setCustomerSearchForCreate('');
    setCustomerResultsForCreate([]);
    setCreateModalOpen(true);
  };

  const handleCreateCredit = async () => {
    if (!selectedCustomerForCreate) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (!newCreditForm.amount || newCreditForm.amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    if (!newCreditForm.dueDate) {
      toast.error('Selecciona una fecha de vencimiento');
      return;
    }

    setCreatingCredit(true);
    try {
      await creditService.createManualCredit({
        customerId: selectedCustomerForCreate.id,
        amount: Number(newCreditForm.amount),
        dueDate: newCreditForm.dueDate,
        notes: newCreditForm.notes,
      });
      toast.success('Cuenta por cobrar creada correctamente');
      setCreateModalOpen(false);
      fetchSummary();
      fetchCredits();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear la cuenta por cobrar');
    } finally {
      setCreatingCredit(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCreditForPayment) return;
    if (isAbonoSubmittingGlobal) return;
    
    const amount = Number(paymentForm.amount);
    const maxAmount = Number(selectedCreditForPayment.remainingAmount) || 0;
    if (amount <= 0 || amount > maxAmount) {
      toast.error(`El monto debe ser mayor a 0 y no puede exceder $${maxAmount.toFixed(4)}`);
      return;
    }
    if (!selectedCashRegisterId) {
      toast.error('Selecciona la caja a la que se registrará el ingreso');
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
      let receiptUrl = paymentForm.receiptUrl;
      if (receiptFile && (paymentForm.paymentMethod === 'TARJETA' || paymentForm.paymentMethod === 'TRANSFERENCIA')) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        // Utilizar el endpoint de subidas del backend
        const uploadRes = await fetch(import.meta.env.VITE_API_URL + '/uploads/receipt', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('agro-token')}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) {
           throw new Error('Error al subir el comprobante');
        }
        
        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url;
      }
      
      await creditService.registerPayment(selectedCreditForPayment.id, {
        ...paymentForm,
        amount,
        receiptUrl,
        cashRegisterId: selectedCashRegisterId,
      });
      toast.success('Abono registrado correctamente');
      setPaymentModalOpen(false);
      
      // Update selectedGroup dynamically to reflect new balances without closing modal
      if (selectedGroup) {
        const updatedSales = selectedGroup.creditSales.map(s => {
          if (s.id === selectedCreditForPayment.id) {
            const paid = Number(s.paidAmount) + amount;
            const remain = Number(s.remainingAmount) - amount;
            return {
              ...s,
              paidAmount: paid,
              remainingAmount: remain,
              status: remain <= 0 ? 'PAGADO' : s.status
            };
          }
          return s;
        }) as CreditSale[];
        
        setSelectedGroup({
          ...selectedGroup,
          creditSales: updatedSales,
          totalPaid: selectedGroup.totalPaid + amount,
          totalRemaining: selectedGroup.totalRemaining - amount,
        });
      }

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

  const printPaymentReceipt = (payment: CreditPayment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('El navegador bloqueó la ventana emergente de impresión.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Abono #${payment.id}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 10px;
            width: 80mm;
            color: #000;
            font-size: 13px;
            font-weight: bold;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          h2 { margin: 0 0 5px 0; font-size: 16px; }
          p { margin: 0 0 5px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>AGROFERR D'CAMPO</h2>
          <p>San Lorenzo, Ahuachapán,<br>El Salvador, 01009</p>
          <p>Tel: 7216 6748</p>
          <p>agroferreteriadcampo@gmail.com</p>
          <div class="divider"></div>
          <p class="bold" style="font-size: 14px;">COMPROBANTE DE ABONO</p>
        </div>
        <div class="divider"></div>
        
        <div class="row">
          <span>N° Recibo:</span>
          <span>${payment.id.toString().padStart(6, '0')}</span>
        </div>
        <div class="row">
          <span>Fecha:</span>
          <span>${new Date(payment.createdAt).toLocaleString('es-ES')}</span>
        </div>
        <div class="row">
          <span>Cajero:</span>
          <span>${payment.user?.fullName || 'Sistema'}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="row bold">
          <span>MÉTODO DE PAGO</span>
        </div>
        <div class="row">
          <span>${payment.paymentMethod}</span>
          <span>$${Number(payment.amount).toFixed(4)}</span>
        </div>
        ${payment.reference ? `<div class="row"><span>Referencia:</span><span>${payment.reference}</span></div>` : ''}
        
        <div class="divider"></div>
        
        <div class="row bold" style="font-size: 14px; margin-top: 10px;">
          <span>TOTAL ABONADO:</span>
          <span>$${Number(payment.amount).toFixed(4)}</span>
        </div>
        
        <div class="divider"></div>
        <div class="center" style="margin-top: 20px;">
          <p style="font-size: 11px; margin-bottom: 8px;">
            * Este documento NO es una factura válida. 
            Es únicamente un comprobante de abono a cuenta. *
          </p>
          <p class="bold">¡Gracias por su pago!</p>
          <p>*** COPIA CLIENTE ***</p>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleMultiPaymentSubmit = async () => {
    if (!multiPaymentCustomer) return;
    if (isMultiAbonoSubmittingGlobal) return;

    const itemsToPay = multiPaymentRows
      .filter(r => r.selected && r.amount > 0)
      .map(r => ({
        creditSaleId: r.creditSale.id,
        amount: Number(r.amount.toFixed(4)),
      }));

    if (itemsToPay.length === 0) {
      toast.error('Debes ingresar al menos un monto mayor a $0 en las facturas seleccionadas');
      return;
    }

    if (!multiCashRegisterId) {
      toast.error('Selecciona la caja a la que se registrará el ingreso');
      return;
    }

    isMultiAbonoSubmittingGlobal = true;
    if (multiSubmitBtnRef.current) {
      multiSubmitBtnRef.current.disabled = true;
      multiSubmitBtnRef.current.style.pointerEvents = 'none';
      multiSubmitBtnRef.current.style.opacity = '0.6';
    }

    setSavingMultiPayment(true);
    try {
      let receiptUrl: string | undefined = undefined;
      if (multiReceiptFile && (multiPaymentMethod === 'TARJETA' || multiPaymentMethod === 'TRANSFERENCIA')) {
        const formData = new FormData();
        formData.append('file', multiReceiptFile);
        const uploadRes = await fetch(import.meta.env.VITE_API_URL + '/uploads/receipt', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('agro-token')}`
          },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Error al subir el comprobante');
        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url;
      }

      const res = await creditService.registerMultiPayment({
        customerId: multiPaymentCustomer.customer.id,
        payments: itemsToPay,
        paymentMethod: multiPaymentMethod,
        reference: multiReference || undefined,
        notes: multiNotes || undefined,
        receiptUrl,
        cashRegisterId: multiCashRegisterId,
      });

      const printedItems = multiPaymentRows.filter(r => r.selected && r.amount > 0).map(r => ({
        ref: r.creditSale.saleId ? `Venta #${r.creditSale.saleId}` : 'Cuenta manual',
        oldRemaining: r.remaining,
        amount: r.amount,
        newRemaining: Math.max(0, r.remaining - r.amount),
      }));

      const customerName = multiPaymentCustomer.customer.name;
      const paymentMethodUsed = multiPaymentMethod;
      const refUsed = multiReference;

      toast.success(`Abono múltiple registrado: $${res.totalAmount.toFixed(4)} en ${res.paymentCount} factura(s)`, {
        duration: 9000,
        action: {
          label: 'Imprimir Recibo',
          onClick: () => printMultiPaymentReceipt({
            batchId: res.batchId,
            customerName,
            cashierName: 'Caja',
            paymentMethod: paymentMethodUsed,
            reference: refUsed,
            totalAmount: res.totalAmount,
            newTotalDebt: Number(res.customer.creditBalance),
            date: new Date().toLocaleString('es-ES'),
            items: printedItems,
          }),
        },
      });

      if (selectedGroup && selectedGroup.customer.id === multiPaymentCustomer.customer.id) {
        const paymentMap = new Map(itemsToPay.map(it => [it.creditSaleId, it.amount]));
        const updatedSales = selectedGroup.creditSales.map(s => {
          if (paymentMap.has(s.id)) {
            const payAmt = paymentMap.get(s.id)!;
            const newPaid = Number(s.paidAmount) + payAmt;
            const newRem = Math.max(0, Number(s.remainingAmount) - payAmt);
            return {
              ...s,
              paidAmount: newPaid,
              remainingAmount: newRem,
              status: newRem <= 0 ? 'PAGADO' : s.status,
            };
          }
          return s;
        }) as CreditSale[];

        setSelectedGroup({
          ...selectedGroup,
          creditSales: updatedSales,
          totalPaid: selectedGroup.totalPaid + res.totalAmount,
          totalRemaining: Math.max(0, selectedGroup.totalRemaining - res.totalAmount),
        });
      }

      setMultiPaymentModalOpen(false);
      setSelectedInnerSaleIds([]);
      fetchSummary();
      fetchCredits();
    } catch (e: any) {
      toast.error(e.message || 'Error al procesar el abono múltiple');
      if (multiSubmitBtnRef.current) {
        multiSubmitBtnRef.current.disabled = false;
        multiSubmitBtnRef.current.style.pointerEvents = '';
        multiSubmitBtnRef.current.style.opacity = '';
      }
    } finally {
      isMultiAbonoSubmittingGlobal = false;
      setSavingMultiPayment(false);
    }
  };

  const printMultiPaymentReceipt = (data: {
    batchId: string;
    customerName: string;
    cashierName: string;
    paymentMethod: string;
    reference?: string;
    totalAmount: number;
    newTotalDebt: number;
    date: string;
    items: { ref: string; oldRemaining: number; amount: number; newRemaining: number }[];
  }) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('El navegador bloqueó la ventana emergente de impresión.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Abono Múltiple - ${data.batchId}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 10px;
            width: 80mm;
            color: #000;
            font-size: 13px;
            font-weight: bold;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          h2 { margin: 0 0 5px 0; font-size: 16px; }
          p { margin: 0 0 5px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>AGROFERR D'CAMPO</h2>
          <p>San Lorenzo, Ahuachapán,<br>El Salvador, 01009</p>
          <p>Tel: 7216 6748</p>
          <p>agroferreteriadcampo@gmail.com</p>
          <div class="divider"></div>
          <p class="bold" style="font-size: 14px;">COMPROBANTE DE ABONO MÚLTIPLE</p>
        </div>
        <div class="divider"></div>
        <div class="row">
          <span>N° Lote:</span>
          <span>${data.batchId}</span>
        </div>
        <div class="row">
          <span>Fecha:</span>
          <span>${data.date}</span>
        </div>
        <div class="row">
          <span>Cliente:</span>
          <span>${data.customerName}</span>
        </div>
        <div class="row">
          <span>Método de Pago:</span>
          <span>${data.paymentMethod}</span>
        </div>
        ${data.reference ? `<div class="row"><span>Referencia:</span><span>${data.reference}</span></div>` : ''}

        <div class="divider"></div>
        <div class="bold" style="margin-bottom: 6px; font-size: 12px;">DESGLOSE DE FACTURAS ABONADAS:</div>
        ${data.items.map(it => `
          <div class="row">
            <span>${it.ref}</span>
            <span>Abono: $${it.amount.toFixed(4)}</span>
          </div>
          <div class="row" style="font-size: 11px; color: #444; margin-bottom: 4px;">
            <span>Ant: $${it.oldRemaining.toFixed(4)}</span>
            <span>Nuevo Saldo: $${it.newRemaining.toFixed(4)}</span>
          </div>
        `).join('')}

        <div class="divider"></div>
        <div class="row bold" style="font-size: 14px; margin-top: 6px;">
          <span>TOTAL ABONADO:</span>
          <span>$${data.totalAmount.toFixed(4)}</span>
        </div>
        <div class="row" style="margin-top: 4px; font-size: 12px;">
          <span>Nuevo Saldo Deudor:</span>
          <span>$${data.newTotalDebt.toFixed(4)}</span>
        </div>

        <div class="divider"></div>
        <div class="center" style="margin-top: 15px;">
          <p style="font-size: 11px; margin-bottom: 8px;">
            * Este documento NO es una factura válida.
            Es un comprobante de abono múltiple a cuenta. *
          </p>
          <p class="bold">¡Gracias por su pago!</p>
          <p>*** COPIA CLIENTE ***</p>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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

  const remaining = Number(selectedCreditForPayment?.remainingAmount) || 0;

  const filteredInnerSales = selectedGroup?.creditSales.filter(s => {
    if (innerStatusFilter !== 'all' && s.status !== innerStatusFilter) return false;
    
    if (innerBuyDateStart || innerBuyDateEnd) {
      const buyDate = new Date(s.createdAt);
      if (innerBuyDateStart && buyDate < new Date(innerBuyDateStart)) return false;
      if (innerBuyDateEnd && buyDate > new Date(new Date(innerBuyDateEnd).setHours(23, 59, 59))) return false;
    }
    
    if (innerDueDateStart || innerDueDateEnd) {
      const dueDate = s.dueDate ? new Date(s.dueDate) : new Date(new Date(s.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
      if (innerDueDateStart && dueDate < new Date(innerDueDateStart)) return false;
      if (innerDueDateEnd && dueDate > new Date(new Date(innerDueDateEnd).setHours(23, 59, 59))) return false;
    }
    return true;
  }) || [];

  const isDirty =
    (createModalOpen && (
      selectedCustomerForCreate !== null ||
      Number(newCreditForm.amount) > 0 ||
      !!newCreditForm.notes?.trim()
    )) ||
    (paymentModalOpen && (
      !!paymentForm.reference?.trim() ||
      !!paymentForm.notes?.trim()
    )) ||
    (multiPaymentModalOpen && (
      multiPaymentRows.some(r => r.amount > 0) ||
      !!multiReference?.trim() ||
      !!multiNotes?.trim()
    ));
  const { confirmExit, isOpen: exitDialogOpen, handleConfirm: confirmDiscard, handleCancel: cancelDiscard } = useUnsavedChangesGuard(isDirty);

  const itemsPerPage = 10;
  const specificPaymentsTotalPages = Math.ceil(specificPayments.length / itemsPerPage);
  const currentSpecificPayments = specificPayments.slice(
    (specificPaymentsPage - 1) * itemsPerPage,
    specificPaymentsPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Cuentas por Cobrar (CxC)</h1>
          <p className="text-[var(--text-sec)]">Gestiona la cartera de créditos y abonos de clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/credit/payments')}
            className="font-bold"
          >
            <History size={16} className="mr-2" /> Historial de Pagos
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            className="font-bold"
          >
            <Plus size={16} className="mr-2" /> Crear Cuenta por Cobrar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <SemaphoreBanner
        metrics={[
          { label: 'Cartera Total', value: summary ? `$${Number(summary.totalCxC).toFixed(4)}` : '$0.00', status: 'info' },
          { label: 'Saldo Vencido', value: summary ? `$${Number(summary.totalVencido).toFixed(4)}` : '$0.00', status: 'danger' },
          { label: 'Por Vencer (7d)', value: summary ? `$${Number(summary.totalPorVencer).toFixed(4)}` : '$0.00', status: 'warning' },
          { label: 'Clientes Activos', value: summary ? summary.totalClientes : 0, status: 'success' },
        ]}
      />

      <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <SmartFilter config={creditFilters} />
      </div>

      <div className="rounded-xl border overflow-hidden shadow-sm bg-[var(--card)] border-[var(--border)] flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Vencimiento Próximo</TableHead>
                <TableHead className="text-right">Total Original</TableHead>
                <TableHead className="text-right">Abonado</TableHead>
                <TableHead className="text-right">Saldo Restante</TableHead>
                <TableHead className="text-center">Estado General</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && groupedCredits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-[var(--text-sec)] animate-pulse">
                    Cargando cartera...
                  </TableCell>
                </TableRow>
              ) : groupedCredits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-[var(--text-sec)] font-medium">
                    No se encontraron créditos con estos filtros
                  </TableCell>
                </TableRow>
              ) : (
                groupedCredits.map(group => (
                  <TableRow key={group.customer.id} className="group hover:bg-[var(--bg)]/30">
                    <TableCell>
                      <span className="font-bold text-[var(--text-main)] block">
                        {group.customer.name}
                      </span>
                      <span className="text-xs text-[var(--text-sec)] block mt-0.5">
                        {group.creditSales.length} {group.creditSales.length === 1 ? 'compra' : 'compras'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {group.nearestDueDate ? (
                        <span className={group.status === 'VENCIDO' ? 'text-rose-500 font-bold' : ''}>
                          {new Date(group.nearestDueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[var(--text-sec)]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(group.totalDebt).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ${Number(group.totalPaid).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-black text-[var(--primary)]">
                      ${Number(group.totalRemaining).toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(group.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {group.creditSales.some(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenMultiPaymentForCustomer(group)}
                            className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                            title="Abono Múltiple de Facturas"
                          >
                            <Layers size={15} className="mr-1" /> Abono Múltiple
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(group)} className="text-[var(--primary)] hover:bg-[var(--primary)]/10">
                          <Eye size={16} className="mr-1.5" /> Ver Detalle
                        </Button>
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

      {/* DETALLE DEL CLIENTE Y FACTURAS */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-5xl w-full flex flex-col p-0 max-h-[90vh]">
          {selectedGroup && (
            <>
              <DialogHeader className="p-6 pr-16 border-b shrink-0 bg-[var(--bg)]/50">
                <DialogTitle className="flex items-center justify-between">
                  <span className="text-xl font-black">{selectedGroup.customer.name}</span>
                  {getStatusBadge(selectedGroup.status)}
                </DialogTitle>
                <DialogDescription>
                  Resumen de cuenta y facturas pendientes.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[var(--bg)] p-4 rounded-xl border">
                    <p className="text-xs font-bold text-[var(--text-sec)] uppercase">Total Deuda</p>
                    <p className="text-lg font-bold">${Number(selectedGroup.totalDebt).toFixed(4)}</p>
                  </div>
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${Number(selectedGroup.totalPaid).toFixed(4)}</p>
                  </div>
                  <div className="bg-[var(--primary)]/10 p-4 rounded-xl border border-[var(--primary)]/20">
                    <p className="text-xs font-bold text-[var(--primary)] uppercase">Saldo Pendiente</p>
                    <p className="text-lg font-black text-[var(--primary)]">${Number(selectedGroup.totalRemaining).toFixed(4)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-lg flex items-center gap-2"><History size={18}/> Compras a Crédito</h3>
                    {selectedGroup.creditSales.some(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO') && (
                      <Button
                        type="button"
                        onClick={() => handleOpenMultiPaymentForCustomer(selectedGroup, selectedInnerSaleIds)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 shadow-sm"
                      >
                        <Layers size={16} className="mr-1.5" />
                        Abono Múltiple {selectedInnerSaleIds.length > 0 ? `(${selectedInnerSaleIds.length} seleccionada${selectedInnerSaleIds.length > 1 ? 's' : ''})` : ''}
                      </Button>
                    )}
                  </div>
                  
                  {/* Filtros Internos */}
                  <div className="flex flex-wrap gap-3 bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)]">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-[var(--text-sec)]">Estado</Label>
                      <Select value={innerStatusFilter} onValueChange={setInnerStatusFilter}>
                        <SelectTrigger className="h-8 text-xs bg-[var(--card)] min-w-[120px]">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="VENCIDO">Vencido</SelectItem>
                          <SelectItem value="PAGADO">Pagado</SelectItem>
                          <SelectItem value="ANULADO">Anulado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-[var(--text-sec)]">Fecha Compra (Desde)</Label>
                      <Input type="date" className="h-8 text-xs bg-[var(--card)]" value={innerBuyDateStart} onChange={e => setInnerBuyDateStart(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-[var(--text-sec)]">Fecha Compra (Hasta)</Label>
                      <Input type="date" className="h-8 text-xs bg-[var(--card)]" value={innerBuyDateEnd} onChange={e => setInnerBuyDateEnd(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-[var(--text-sec)]">Vencimiento (Desde)</Label>
                      <Input type="date" className="h-8 text-xs bg-[var(--card)]" value={innerDueDateStart} onChange={e => setInnerDueDateStart(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-[var(--text-sec)]">Vencimiento (Hasta)</Label>
                      <Input type="date" className="h-8 text-xs bg-[var(--card)]" value={innerDueDateEnd} onChange={e => setInnerDueDateEnd(e.target.value)} />
                    </div>
                    {(innerStatusFilter !== 'all' || innerBuyDateStart || innerBuyDateEnd || innerDueDateStart || innerDueDateEnd) && (
                      <div className="space-y-1 flex items-end">
                        <Button 
                          variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => {
                            setInnerStatusFilter('all'); setInnerBuyDateStart(''); setInnerBuyDateEnd(''); setInnerDueDateStart(''); setInnerDueDateEnd('');
                          }}
                        >
                          Limpiar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-xl overflow-hidden shadow-sm bg-[var(--card)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-center">
                            <input
                              type="checkbox"
                              className="rounded cursor-pointer h-4 w-4 accent-[var(--primary)]"
                              checked={
                                filteredInnerSales.filter(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO').length > 0 &&
                                filteredInnerSales.filter(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO').every(s => selectedInnerSaleIds.includes(s.id))
                              }
                              onChange={(e) => {
                                const pendings = filteredInnerSales.filter(s => s.status === 'PENDIENTE' || s.status === 'VENCIDO');
                                if (e.target.checked) {
                                  setSelectedInnerSaleIds(pendings.map(s => s.id));
                                } else {
                                  setSelectedInnerSaleIds([]);
                                }
                              }}
                              title="Seleccionar todas las pendientes mostradas"
                            />
                          </TableHead>
                          <TableHead>Ref. Venta</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Abonado</TableHead>
                          <TableHead className="text-right">Restante</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                          <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInnerSales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-6 text-[var(--text-sec)]">
                              No hay compras que coincidan con los filtros
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInnerSales.map(s => {
                            const dateToUse = s.dueDate 
                              ? new Date(s.dueDate) 
                              : new Date(new Date(s.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
                            const isOverdue = dateToUse < new Date() && s.status !== 'PAGADO';
                            
                            return (
                              <TableRow key={s.id} className={selectedInnerSaleIds.includes(s.id) ? 'bg-[var(--primary)]/5' : ''}>
                                <TableCell className="text-center">
                                  {s.status === 'PENDIENTE' || s.status === 'VENCIDO' ? (
                                    <input
                                      type="checkbox"
                                      className="rounded cursor-pointer h-4 w-4 accent-[var(--primary)]"
                                      checked={selectedInnerSaleIds.includes(s.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedInnerSaleIds(prev => [...prev, s.id]);
                                        } else {
                                          setSelectedInnerSaleIds(prev => prev.filter(id => id !== s.id));
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span className="text-[var(--text-sec)] text-xs">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="font-bold">{s.saleId ? `Venta #${s.saleId}` : 'Cuenta Manual'}</TableCell>
                                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                                  {dateToUse.toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">${Number(s.originalAmount).toFixed(4)}</TableCell>
                                <TableCell className="text-right text-emerald-600">${Number(s.paidAmount).toFixed(4)}</TableCell>
                                <TableCell className="text-right font-bold text-[var(--primary)]">${Number(s.remainingAmount).toFixed(4)}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(s.status)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenSpecificDetail(s)} className="text-[var(--primary)] hover:bg-[var(--primary)]/10" title="Ver Historial de Abonos">
                                      <Eye size={16} />
                                    </Button>
                                    {s.status !== 'PAGADO' && s.status !== 'ANULADO' && (
                                      <Button variant="ghost" size="icon" onClick={() => handleOpenPayment(s)} className="text-emerald-600 hover:bg-emerald-600/10" title="Abonar">
                                        <Plus size={16} />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
      <Dialog open={paymentModalOpen} onOpenChange={(o) => o ? setPaymentModalOpen(true) : confirmExit(() => setPaymentModalOpen(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              {selectedGroup?.customer?.name ?? `Cliente #${selectedCreditForPayment?.customerId}`} — {selectedCreditForPayment?.saleId ? `Venta #${selectedCreditForPayment.saleId}` : 'Cuenta Manual'} — Saldo: ${remaining.toFixed(4)}
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
              <Label>Caja de Destino</Label>
              <Select
                value={selectedCashRegisterId ? String(selectedCashRegisterId) : undefined}
                onValueChange={(v) => setSelectedCashRegisterId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={cashRegisters.length === 0 ? "No hay cajas activas" : "Selecciona una caja..."} />
                </SelectTrigger>
                <SelectContent>
                  {cashRegisters.map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[var(--text-sec)] mt-1.5">El ingreso de este abono se registrará en la caja seleccionada.</p>
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
              
              {(paymentForm.paymentMethod === 'TARJETA' || paymentForm.paymentMethod === 'TRANSFERENCIA') && (
                <div className="space-y-2">
                  <Label>Comprobante / Recibo (Opcional)</Label>
                  <Input 
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setReceiptFile(e.target.files[0]);
                      } else {
                        setReceiptFile(null);
                      }
                    }}
                    className="cursor-pointer file:cursor-pointer file:bg-[var(--primary)] file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:text-xs file:font-bold file:mr-3 hover:file:bg-[var(--primary)]/90"
                  />
                  {receiptFile && <p className="text-xs text-[var(--primary)] font-medium">Archivo: {receiptFile.name}</p>}
                </div>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => confirmExit(() => setPaymentModalOpen(false))}>Cancelar</Button>
            <Button
              ref={submitBtnRef}
              onPointerDown={() => {
                if (!isAbonoSubmittingGlobal) handlePaymentSubmit();
              }}
              disabled={savingPayment || !selectedCashRegisterId}
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              {savingPayment ? 'Registrando...' : 'Confirmar Abono'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ABONO MÚLTIPLE DE FACTURAS */}
      <Dialog open={multiPaymentModalOpen} onOpenChange={(o) => o ? setMultiPaymentModalOpen(true) : confirmExit(() => setMultiPaymentModalOpen(false))}>
        <DialogContent className="sm:max-w-4xl w-full flex flex-col p-0 max-h-[92vh]">
          <DialogHeader className="p-5 border-b shrink-0 bg-[var(--bg)]/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <Layers className="text-emerald-600" size={22} />
                  Abono Múltiple de Facturas
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {multiPaymentCustomer?.customer.name} — Deuda total en cartera: ${Number(multiPaymentCustomer?.totalRemaining || 0).toFixed(4)}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-2.5 py-1 font-bold">
                {multiPaymentRows.filter(r => r.selected).length} de {multiPaymentRows.length} seleccionada(s)
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* Barra de Distribución Rápida */}
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <ArrowDownUp size={16} className="text-[var(--primary)] shrink-0" />
                <span className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">
                  Distribuir monto:
                </span>
                <div className="w-36">
                  <Input
                    type="number"
                    min={0.01}
                    step="any"
                    placeholder="Monto total ($)"
                    className="h-8 text-xs bg-[var(--card)]"
                    value={multiGlobalAmount}
                    onChange={e => setMultiGlobalAmount(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleDistributeGlobalAmount();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/10"
                  onClick={handleDistributeGlobalAmount}
                >
                  Distribuir (Antiguas 1°)
                </Button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={handleSaldarTodoSelected}
                >
                  Saldar Seleccionadas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-[var(--text-sec)] hover:text-rose-500"
                  onClick={handleLimpiarMontos}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Tabla de Facturas */}
            <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-xs bg-[var(--card)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--bg)]/60 text-xs">
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer h-4 w-4 accent-[var(--primary)]"
                        checked={multiPaymentRows.length > 0 && multiPaymentRows.every(r => r.selected)}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setMultiPaymentRows(prev => prev.map(r => ({
                            ...r,
                            selected: val,
                            amount: val ? r.remaining : 0,
                          })));
                        }}
                        title="Seleccionar todas"
                      />
                    </TableHead>
                    <TableHead>Factura / Ref</TableHead>
                    <TableHead>Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Saldo Actual</TableHead>
                    <TableHead className="w-40 text-center">Abonar ($)</TableHead>
                    <TableHead className="text-right">Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multiPaymentRows.map((row, idx) => {
                    const cs = row.creditSale;
                    const dateToUse = cs.dueDate ? new Date(cs.dueDate) : new Date(new Date(cs.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
                    const isOverdue = dateToUse < new Date() && cs.status !== 'PAGADO';
                    const finalBalance = Math.max(0, row.remaining - row.amount);

                    return (
                      <TableRow key={cs.id} className={cn('transition-colors', row.selected ? 'bg-[var(--primary)]/5' : 'opacity-60')}>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer h-4 w-4 accent-[var(--primary)]"
                            checked={row.selected}
                            onChange={() => handleRowToggle(idx)}
                          />
                        </TableCell>
                        <TableCell className="font-bold text-xs">
                          {cs.saleId ? `Venta #${cs.saleId}` : 'Cuenta manual'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(cs.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className={cn('text-xs', isOverdue ? 'text-rose-500 font-bold' : '')}>
                          {dateToUse.toLocaleDateString()}
                          {isOverdue && <span className="ml-1 text-[10px] text-rose-500 uppercase font-black">(Vencida)</span>}
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs">
                          ${row.remaining.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-center">
                            <Input
                              type="number"
                              min={0}
                              max={row.remaining}
                              step="any"
                              disabled={!row.selected}
                              className="h-8 text-xs text-right font-bold bg-[var(--card)] w-28"
                              value={row.amount || ''}
                              onChange={e => handleRowAmountChange(idx, parseFloat(e.target.value) || 0)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!row.selected}
                              className="h-8 px-2 text-[10px] text-[var(--primary)] font-bold hover:bg-[var(--primary)]/10"
                              onClick={() => handleRowAmountChange(idx, row.remaining)}
                              title="Pagar saldo total de esta factura"
                            >
                              Max
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {finalBalance === 0 ? (
                            <Badge variant="success" className="text-[10px] px-2 py-0.5">Saldada ($0.00)</Badge>
                          ) : (
                            <span className="font-bold text-[var(--text-sec)]">${finalBalance.toFixed(4)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Configuración del Pago & Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Método de Pago</Label>
                  <Select
                    value={multiPaymentMethod}
                    onValueChange={(val) => setMultiPaymentMethod(val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Caja de Destino</Label>
                  <Select
                    value={multiCashRegisterId ? String(multiCashRegisterId) : undefined}
                    onValueChange={(v) => setMultiCashRegisterId(Number(v))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={cashRegisters.length === 0 ? "No hay cajas activas" : "Selecciona una caja..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {cashRegisters.map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-[var(--text-sec)]">El ingreso se registrará en esta caja.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Referencia (Opcional)</Label>
                  <Input
                    placeholder="Voucher, N° Transferencia..."
                    className="h-8 text-xs"
                    value={multiReference}
                    onChange={e => setMultiReference(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Notas / Observaciones (Opcional)</Label>
                  <Input
                    placeholder="Detalles sobre este pago..."
                    className="h-8 text-xs"
                    value={multiNotes}
                    onChange={e => setMultiNotes(e.target.value)}
                  />
                </div>

                {(multiPaymentMethod === 'TARJETA' || multiPaymentMethod === 'TRANSFERENCIA') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Comprobante de Pago (Opcional)</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setMultiReceiptFile(e.target.files[0]);
                        } else {
                          setMultiReceiptFile(null);
                        }
                      }}
                      className="cursor-pointer file:cursor-pointer file:bg-[var(--primary)] file:text-white file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:text-xs file:font-bold file:mr-2 hover:file:bg-[var(--primary)]/90 h-8 text-xs"
                    />
                    {multiReceiptFile && <p className="text-[11px] text-[var(--primary)] font-medium">Archivo: {multiReceiptFile.name}</p>}
                  </div>
                )}
              </div>

              {/* Resumen Final */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Resumen del Pago
                  </p>
                  <div className="flex justify-between text-xs py-1 border-b border-[var(--border)]">
                    <span className="text-[var(--text-sec)]">Facturas con abono:</span>
                    <span className="font-bold">{multiPaymentRows.filter(r => r.selected && r.amount > 0).length}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-[var(--border)]">
                    <span className="text-[var(--text-sec)]">Quedarán saldadas (100%):</span>
                    <span className="font-bold text-emerald-600">{totalFullyPaidCount}</span>
                  </div>
                  {totalPartialPaidCount > 0 && (
                    <div className="flex justify-between text-xs py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-sec)]">Con abono parcial:</span>
                      <span className="font-bold text-amber-600">{totalPartialPaidCount}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-emerald-500/20 mt-2">
                  <p className="text-xs font-bold text-[var(--text-sec)] uppercase">Total a Cobrar</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ${totalMultiToPay.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t shrink-0 bg-[var(--bg)]/50 flex items-center justify-between sm:justify-between">
            <Button variant="outline" onClick={() => confirmExit(() => setMultiPaymentModalOpen(false))}>
              Cancelar
            </Button>
            <Button
              ref={multiSubmitBtnRef}
              onPointerDown={() => {
                if (!isMultiAbonoSubmittingGlobal) handleMultiPaymentSubmit();
              }}
              disabled={savingMultiPayment || totalMultiToPay <= 0 || !multiCashRegisterId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {savingMultiPayment ? 'Procesando Abono...' : `Confirmar Abono Múltiple ($${totalMultiToPay.toFixed(4)})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREAR CUENTA POR COBRAR MANUAL */}
      <Dialog open={createModalOpen} onOpenChange={(o) => o ? setCreateModalOpen(true) : confirmExit(() => setCreateModalOpen(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Cuenta por Cobrar</DialogTitle>
            <DialogDescription>
              Registra una deuda pendiente de un cliente sin necesidad de una venta en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              {selectedCustomerForCreate ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                  <div>
                    <p className="font-bold text-sm">{selectedCustomerForCreate.name}</p>
                    <p className="text-xs text-[var(--text-sec)]">{selectedCustomerForCreate.documentNumber || selectedCustomerForCreate.nit || 'Sin documento'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomerForCreate(null); setCustomerSearchForCreate(''); }}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar cliente por nombre..."
                    value={customerSearchForCreate}
                    onChange={e => {
                      setCustomerSearchForCreate(e.target.value);
                      if (e.target.value.length > 1) {
                        apiRequest<any>(`/customers/search?q=${encodeURIComponent(e.target.value)}`)
                          .then(res => setCustomerResultsForCreate(Array.isArray(res) ? res : []))
                          .catch(console.error);
                      } else {
                        setCustomerResultsForCreate([]);
                      }
                    }}
                  />
                  {customerResultsForCreate.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                      {customerResultsForCreate.map(c => (
                        <div
                          key={c.id}
                          className="p-3 hover:bg-[var(--bg)]/50 cursor-pointer flex justify-between border-b border-[var(--border)] text-sm"
                          onClick={() => { setSelectedCustomerForCreate(c); setCustomerResultsForCreate([]); setCustomerSearchForCreate(''); }}
                        >
                          <span className="font-bold">{c.name}</span>
                          <span className="text-[var(--text-sec)] text-xs">{c.documentNumber || c.nit || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Monto Adeudado ($)</Label>
              <NumberInput
                value={newCreditForm.amount || 0}
                min={0.01}
                onValueChange={(val) => setNewCreditForm(prev => ({ ...prev, amount: val ?? 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Input
                type="date"
                value={newCreditForm.dueDate}
                onChange={e => setNewCreditForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas (Opcional)</Label>
              <Input
                placeholder="Motivo de la deuda, detalles..."
                value={newCreditForm.notes}
                onChange={e => setNewCreditForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => confirmExit(() => setCreateModalOpen(false))}>Cancelar</Button>
            <Button
              onClick={handleCreateCredit}
              disabled={creatingCredit}
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              {creatingCredit ? 'Creando...' : 'Crear Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETALLE DE FACTURA ESPECÍFICA (HISTORIAL DE ABONOS Y DOCUMENTOS) */}
      <Dialog open={specificDetailModalOpen} onOpenChange={setSpecificDetailModalOpen}>
        <DialogContent className="sm:max-w-5xl w-full flex flex-col p-0 max-h-[90vh]">
          {selectedSpecificCredit && (
            <>
              <DialogHeader className="p-6 pr-16 border-b shrink-0 bg-[var(--bg)]/50">
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedSpecificCredit.saleId ? `Venta #${selectedSpecificCredit.saleId}` : 'Cuenta por Cobrar Manual'}</span>
                  {getStatusBadge(selectedSpecificCredit.status)}
                </DialogTitle>
                <DialogDescription>
                  {selectedSpecificCredit.saleId
                    ? 'Historial de abonos y documentos requeridos para esta compra.'
                    : (selectedSpecificCredit.notes || 'Historial de abonos de esta cuenta por cobrar.')}
                </DialogDescription>
              </DialogHeader>

              <div className="flex px-6 pt-2 gap-4 border-b shrink-0 bg-[var(--bg)]/30">
                <button
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    specificDetailTab === 'abonos'
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--text-sec)] hover:text-[var(--text-main)]'
                  }`}
                  onClick={() => setSpecificDetailTab('abonos')}
                >
                  <History size={16} />
                  Historial de Abonos
                </button>
                {selectedSpecificCredit.saleId && (
                  <button
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${
                      specificDetailTab === 'factura'
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-[var(--text-sec)] hover:text-[var(--text-main)]'
                    }`}
                    onClick={() => setSpecificDetailTab('factura')}
                  >
                    <FileText size={16} />
                    Detalle de Factura
                  </button>
                )}
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
                {specificDetailTab === 'abonos' ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm bg-[var(--card)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Referencia</TableHead>
                          <TableHead>Registrado por</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-center w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specificPayments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              No hay abonos registrados
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentSpecificPayments.map(p => (
                            <TableRow key={p.id}>
                              <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                              <TableCell>{p.paymentMethod}</TableCell>
                              <TableCell>{p.reference || '-'}</TableCell>
                              <TableCell>{p.user?.fullName || '-'}</TableCell>
                              <TableCell className="text-right font-bold text-emerald-600">
                                ${Number(p.amount).toFixed(4)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenPaymentDetail(p)} className="text-[var(--primary)] hover:bg-[var(--primary)]/10" title="Ver Detalle de Abono">
                                  <FileText size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {specificPaymentsTotalPages > 1 && (
                      <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/5">
                        <p className="text-xs font-bold text-[var(--text-sec)]">
                          Página {specificPaymentsPage} de {specificPaymentsTotalPages} ({specificPayments.length} abonos)
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" size="sm" 
                            disabled={specificPaymentsPage === 1}
                            onClick={() => setSpecificPaymentsPage(p => p - 1)}
                          >
                            Anterior
                          </Button>
                          <Button 
                            variant="outline" size="sm" 
                            disabled={specificPaymentsPage === specificPaymentsTotalPages}
                            onClick={() => setSpecificPaymentsPage(p => p + 1)}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                  {/* ESTADO BANNER */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={specificSaleDetail?.dteResponse?.estado === 'PROCESADO' ? "text-emerald-500" : "text-[var(--text-sec)]"} size={24} />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Estado en Hacienda</p>
                        <p className={cn("text-sm font-black uppercase", specificSaleDetail?.dteResponse?.estado === 'PROCESADO' ? "text-emerald-600" : "text-[var(--text-main)]")}>
                          {specificSaleDetail?.dteResponse?.estado || 'NO ENVIADO'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right mt-4 sm:mt-0">
                      <p className="text-sm font-bold text-[var(--text-main)]">
                        {specificSaleDetail?.createdAt ? new Date(specificSaleDetail.createdAt).toLocaleString('es-ES') : ''}
                      </p>
                      <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Fecha Procesamiento</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* IDENTIFICACION */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                        <Hash size={16} className="text-[var(--text-sec)]" />
                        <h3 className="text-xs font-black text-[var(--text-sec)] uppercase tracking-widest">Identificación</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Número de Control</p>
                          <div className="bg-[var(--bg)] px-3 py-2 rounded-md border border-[var(--border)] font-mono text-sm text-[var(--text-main)]">
                            {specificSaleDetail?.dteResponse?.numeroControl || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Código de Generación</p>
                          <div className="bg-[var(--bg)] px-3 py-2 rounded-md border border-[var(--border)] font-mono text-sm text-amber-600 font-bold break-all">
                            {specificSaleDetail?.dteResponse?.codigoGeneracion || 'N/A'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Serie / POS</p>
                            <p className="font-bold text-[var(--text-main)] uppercase">{specificSaleDetail?.dteResponse?.serie || 'P001'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Ambiente</p>
                            <p className="font-bold text-[var(--text-main)] uppercase">{specificSaleDetail?.dteResponse?.ambiente || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RECEPTOR */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                        <User size={16} className="text-[var(--text-sec)]" />
                        <h3 className="text-xs font-black text-[var(--text-sec)] uppercase tracking-widest">Receptor / Cliente</h3>
                      </div>
                      
                      <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 space-y-4">
                        <div>
                          <p className="font-bold text-[var(--text-main)] text-base">{specificSaleDetail?.customer?.name || 'Consumidor Final'}</p>
                          <p className="text-sm text-[var(--text-sec)]">{specificSaleDetail?.customer?.email || 'Sin correo'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Documento</p>
                            <p className="font-medium text-[var(--text-main)] text-sm">{specificSaleDetail?.customer?.nit || specificSaleDetail?.customer?.documentNumber || 'S/N'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">NRC</p>
                            <p className="font-medium text-[var(--text-main)] text-sm">{specificSaleDetail?.customer?.customerType === 'CONTRIBUYENTE' ? 'S/N' : 'S/N'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRODUCTOS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                      <Package size={16} className="text-[var(--text-sec)]" />
                      <h3 className="text-xs font-black text-[var(--text-sec)] uppercase tracking-widest">Detalle de Productos / Servicios</h3>
                    </div>
                    
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg)]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[var(--border)] hover:bg-transparent">
                            <TableHead className="text-[10px] font-black tracking-widest uppercase text-[var(--text-sec)]">Cant</TableHead>
                            <TableHead className="text-[10px] font-black tracking-widest uppercase text-[var(--text-sec)]">Descripción</TableHead>
                            <TableHead className="text-[10px] font-black tracking-widest uppercase text-[var(--text-sec)] text-right">P. Unit</TableHead>
                            <TableHead className="text-[10px] font-black tracking-widest uppercase text-[var(--text-sec)] text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {specificSaleDetail?.items?.map((item: any) => (
                            <TableRow key={item.id} className="border-b border-[var(--border)]/50 hover:bg-transparent">
                              <TableCell className="font-bold text-[var(--text-main)]">{item.quantity}</TableCell>
                              <TableCell>
                                <p className="font-bold text-[var(--text-main)] uppercase">{item.product?.name}</p>
                                <p className="text-[10px] text-[var(--text-sec)] uppercase">Cód: {item.product?.id}</p>
                              </TableCell>
                              <TableCell className="text-right text-[var(--text-sec)] font-medium">${Number(item.unitPrice).toFixed(4)}</TableCell>
                              <TableCell className="text-right font-black text-amber-500">${Number(item.totalPrice).toFixed(4)}</TableCell>
                            </TableRow>
                          ))}
                          {!specificSaleDetail?.items?.length && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                No hay productos en esta factura.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <div className="p-4 border-t border-[var(--border)] flex justify-end bg-[var(--bg)]/50">
                        <div className="flex items-center gap-8">
                          <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-widest">Total a Pagar</p>
                          <p className="text-xl font-black text-amber-500">${Number(specificSaleDetail?.totalAmount || 0).toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* FOOTER */}
                  <div className="flex items-center justify-between pt-4 pb-4">
                    <div className="flex items-center gap-2 text-[var(--text-sec)]">
                      <Building2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Emisor: Agroferr D'Campo</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-sec)]">MH-API-V2 / DTE-01</span>
                  </div>
                </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DETALLE DE ABONO (TIPO FACTURA) */}
      <Dialog open={paymentDetailModalOpen} onOpenChange={setPaymentDetailModalOpen}>
        <DialogContent 
          className="flex flex-col p-0 overflow-hidden bg-[var(--card)] border-[var(--border)]"
          style={{ maxWidth: '600px', width: '90vw', maxHeight: '90vh' }}
        >
          {selectedPaymentDetail && (
            <>
              <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/50 relative">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-[var(--text-main)] uppercase tracking-wide">
                      Detalle de Abono
                    </DialogTitle>
                    <DialogDescription className="text-sm font-mono text-[var(--text-sec)]">
                      COMPROBANTE #{selectedPaymentDetail.id.toString().padStart(6, '0')}
                    </DialogDescription>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 p-6">
                <div className="space-y-8">
                  {/* ESTADO BANNER */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={24} />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Estado del Abono</p>
                        <p className="text-sm font-black uppercase text-emerald-600">
                          PROCESADO
                        </p>
                      </div>
                    </div>
                    <div className="text-right mt-4 sm:mt-0">
                      <p className="text-sm font-bold text-[var(--text-main)]">
                        {new Date(selectedPaymentDetail.createdAt).toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Fecha Registro</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* DATOS DEL PAGO */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                        <DollarSign size={16} className="text-[var(--text-sec)]" />
                        <h3 className="text-xs font-black text-[var(--text-sec)] uppercase tracking-widest">Información del Pago</h3>
                      </div>
                      
                      <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Método de Pago</p>
                            <p className="font-bold text-[var(--text-main)] uppercase">{selectedPaymentDetail.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Referencia</p>
                            <p className="font-medium text-[var(--text-main)] text-sm">{selectedPaymentDetail.reference || 'S/N'}</p>
                          </div>
                        </div>
                        <div className="border-t border-[var(--border)] pt-4">
                          <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Notas / Observaciones</p>
                          <p className="font-medium text-[var(--text-main)] text-sm">{selectedPaymentDetail.notes || 'Ninguna'}</p>
                        </div>
                        <div className="border-t border-[var(--border)] pt-4">
                          <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-wider mb-1">Registrado Por</p>
                          <p className="font-medium text-[var(--text-main)] text-sm">{selectedPaymentDetail.user?.fullName || 'Sistema'}</p>
                        </div>
                        <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center">
                          <p className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-widest">Total Abonado</p>
                          <p className="text-xl font-black text-emerald-600">${Number(selectedPaymentDetail.amount).toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/50 flex justify-between items-center gap-4">
                <Button 
                  onClick={() => printPaymentReceipt(selectedPaymentDetail)} 
                  variant="outline" 
                  className="font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                >
                  <Printer size={16} className="mr-2" /> IMPRIMIR RECIBO
                </Button>
                <Button onClick={() => setPaymentDetailModalOpen(false)} variant="outline" className="font-bold px-8">
                  CERRAR DETALLE
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog open={exitDialogOpen} onConfirm={confirmDiscard} onCancel={cancelDiscard} />
    </div>
  );
}
