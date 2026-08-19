import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Banknote, CreditCard, Smartphone, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { creditService, CreditPayment } from '../services/credit.service';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { SmartFilter, FilterConfig } from '../components/ui/smart-filter';
import { cn } from '../components/ui/utils';

const paymentsFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar cliente...', type: 'text', placeholder: 'Nombre del cliente...' },
  { id: 'paymentMethod', label: 'Método', type: 'category', options: [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Tarjeta', value: 'TARJETA' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
  ]},
  { id: 'date', label: 'Fecha Específica', type: 'date_range' },
];

const METHOD_STYLE: Record<string, { icon: React.ReactNode; className: string }> = {
  EFECTIVO: { icon: <Banknote size={13} />, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  TARJETA: { icon: <CreditCard size={13} />, className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  TRANSFERENCIA: { icon: <Smartphone size={13} />, className: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
};

function PaymentMethodBadge({ method }: { method: string }) {
  const style = METHOD_STYLE[method] || { icon: null, className: 'bg-[var(--bg)] text-[var(--text-sec)] border-[var(--border)]' };
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-bold uppercase text-[10px]', style.className)}>
      {style.icon} {method}
    </Badge>
  );
}

export function CreditPayments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';
  const methodFilter = searchParams.get('paymentMethod') || 'all';
  const dateFilter = searchParams.get('date') || '';

  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, searchFilter, methodFilter, dateFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const filters: any = { page: pagination.page, limit: pagination.limit };
      if (searchFilter) filters.search = searchFilter;
      if (methodFilter !== 'all') filters.paymentMethod = methodFilter;
      if (dateFilter) { filters.startDate = dateFilter; filters.endDate = dateFilter; }

      const res = await creditService.getAllPayments(filters);
      setPayments(res.data || []);
      setPagination({
        page: res.page || 1,
        limit: res.limit || 20,
        total: res.total || 0,
        totalPages: res.totalPages || 1,
      });
      setTotalCollected((res.data || []).reduce((sum, p) => sum + Number(p.amount), 0));
    } catch (e) {
      toast.error('Error al cargar el historial de pagos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/credit')}
            className="w-10 h-10 p-0 rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors text-[var(--text-sec)]"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <History size={26} className="text-[var(--primary)]" /> Historial de Pagos
            </h1>
            <p className="text-[var(--text-sec)]">Todos los abonos recibidos a cuentas por cobrar: quién pagó, cuándo y con qué método.</p>
          </div>
        </div>
        <div className="text-right bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-2.5">
          <p className="text-[10px] font-bold text-[var(--text-sec)] uppercase tracking-widest">Cobrado en esta página</p>
          <p className="text-2xl font-black text-emerald-600">${totalCollected.toFixed(4)}</p>
        </div>
      </div>

      <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <SmartFilter config={paymentsFilters} />
      </div>

      <div className="rounded-xl border overflow-hidden shadow-sm bg-[var(--card)] border-[var(--border)] flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[var(--text-sec)] animate-pulse">
                    Cargando pagos...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[var(--text-sec)] font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={28} className="opacity-30" />
                      No se encontraron pagos con estos filtros
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(p => (
                  <TableRow key={p.id} className="hover:bg-[var(--bg)]/30">
                    <TableCell className="text-sm">
                      <span className="font-medium text-[var(--text-main)] block">
                        {new Date(p.createdAt).toLocaleDateString('es-SV')}
                      </span>
                      <span className="text-[10px] text-[var(--text-sec)] block">
                        {new Date(p.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-[var(--text-main)]">
                      {p.customer?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={p.paymentMethod} />
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-sec)]">
                      {p.user?.fullName || 'Sistema'}
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-600">
                      ${Number(p.amount).toFixed(4)}
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
    </div>
  );
}
