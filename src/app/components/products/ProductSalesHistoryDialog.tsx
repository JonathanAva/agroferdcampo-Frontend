import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  History,
  Receipt,
  PackageCheck,
  DollarSign,
  User,
  Users,
  X,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Store,
  PlusCircle,
  Check,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Switch } from '../ui/switch';
import { apiRequest } from '../../config/api';
import {
  getProductSalesHistory,
  ProductSalesHistoryResponse,
} from '../../services/sales.service';
import { toast } from 'sonner';

interface ProductSalesHistoryDialogProps {
  productId: number | null;
  productName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductSalesHistoryDialog({
  productId,
  productName,
  open,
  onOpenChange,
}: ProductSalesHistoryDialogProps) {
  const [data, setData] = useState<ProductSalesHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allBranches, setAllBranches] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<Array<{ id: number; name: string; documentNumber?: string }>>([]);
  const [usersList, setUsersList] = useState<Array<{ id: number; fullName: string; role?: string }>>([]);

  useEffect(() => {
    if (open) {
      apiRequest<Array<{ id: number; fullName: string; role?: string }>>('/users')
        .then((users) => setUsersList(Array.isArray(users) ? users : []))
        .catch((err) => console.error('Error fetching users for filter:', err));
    }
  }, [open]);

  const fetchHistory = useCallback(
    async (targetPage = 1) => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await getProductSalesHistory(productId, {
          page: targetPage,
          limit: 10,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          allBranches,
          userId: selectedUserId && selectedUserId !== 'all' ? Number(selectedUserId) : undefined,
          customerId: selectedCustomer?.id,
        });
        setData(res);
        setPage(targetPage);
      } catch (err: any) {
        console.error('Error fetching product sales history:', err);
        toast.error(
          err?.response?.data?.message ||
            'Error al cargar el historial de ventas del producto',
        );
      } finally {
        setLoading(false);
      }
    },
    [productId, startDate, endDate, allBranches, selectedUserId, selectedCustomer],
  );

  const applyDatePreset = (preset: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'last30') => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'today') {
      const d = toYMD(today);
      setStartDate(d);
      setEndDate(d);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const d = toYMD(y);
      setStartDate(d);
      setEndDate(d);
    } else if (preset === 'last7') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      setStartDate(toYMD(past));
      setEndDate(toYMD(today));
    } else if (preset === 'thisMonth') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(toYMD(first));
      setEndDate(toYMD(today));
    } else if (preset === 'last30') {
      const past = new Date(today);
      past.setDate(today.getDate() - 30);
      setStartDate(toYMD(past));
      setEndDate(toYMD(today));
    }
  };

  useEffect(() => {
    if (open && productId) {
      setPage(1);
      fetchHistory(1);
    } else {
      setData(null);
    }
  }, [open, productId, startDate, endDate, allBranches, selectedUserId, selectedCustomer]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setAllBranches(false);
    setSelectedUserId('all');
    setSelectedCustomer(null);
    setCustomerQuery('');
    setCustomerSuggestions([]);
  };

  const hasActiveFilters = Boolean(
    startDate ||
      endDate ||
      allBranches ||
      (selectedUserId && selectedUserId !== 'all') ||
      selectedCustomer,
  );

  const displayName = data?.product?.name || productName || 'Producto';
  const unit = data?.product?.unit?.replace('_', ' ') || 'Unidades';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl lg:max-w-6xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-5 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                <History className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  Historial de Ventas
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base font-semibold mt-1 text-[var(--text-sec)] flex items-center flex-wrap gap-2">
                  <span>{displayName}</span>
                  {data?.product?.internalCode && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted/60 text-[var(--text-main)]">
                      Cód: {data.product.internalCode}
                    </span>
                  )}
                  {data?.product?.category?.name && (
                    <Badge variant="outline" className="text-xs py-0.5 px-2 font-bold">
                      {data.product.category.name}
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="p-5 rounded-2xl border border-[var(--border)] flex items-center gap-4 shadow-sm"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-sec)] uppercase tracking-wider block">
                  Veces Vendido
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-main)] mt-0.5 block">
                  {data?.summary?.timesSold ?? 0}
                </span>
                <span className="text-xs text-[var(--text-sec)] font-medium block mt-1">
                  {data?.summary?.timesSold === 1 ? 'Venta registrada' : 'Ventas registradas'}
                </span>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border border-[var(--border)] flex items-center gap-4 shadow-sm"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <PackageCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-sec)] uppercase tracking-wider block">
                  Cantidad Total Vendida
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {data?.summary?.totalQuantitySold != null
                    ? Number(data.summary.totalQuantitySold).toLocaleString('es-SV', {
                        maximumFractionDigits: 2,
                      })
                    : 0}
                </span>
                <span className="text-xs text-[var(--text-sec)] font-medium block mt-1">
                  {unit}
                </span>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border border-[var(--border)] flex items-center gap-4 shadow-sm"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-sec)] uppercase tracking-wider block">
                  Ingresos Generados
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-purple-600 dark:text-purple-400 mt-0.5 block">
                  ${(data?.summary?.totalRevenue ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-[var(--text-sec)] font-medium block mt-1">
                  Total facturado sin anular
                </span>
              </div>
            </div>
          </div>

          {/* Smart Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Customer Search on Left */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              {selectedCustomer ? (
                <div className="flex items-center justify-between h-10 pl-9 pr-3 rounded-md border bg-background text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Cliente:</span>
                    <span className="font-bold text-[var(--text-main)] truncate">{selectedCustomer.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerQuery('');
                    }}
                    className="text-muted-foreground hover:text-red-500 p-1"
                    title="Quitar filtro de cliente"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Buscar por cliente o documento..."
                    value={customerQuery}
                    onChange={(e) => {
                      const q = e.target.value;
                      setCustomerQuery(q);
                      if (q.trim().length >= 2) {
                        apiRequest<any[]>(`/customers/search?q=${encodeURIComponent(q.trim())}`)
                          .then((res) => setCustomerSuggestions(Array.isArray(res) ? res : []))
                          .catch(console.error);
                      } else {
                        setCustomerSuggestions([]);
                      }
                    }}
                    className="pl-9 h-10 bg-background text-sm"
                  />
                  {customerSuggestions.length > 0 && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCustomerSuggestions([])}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        {customerSuggestions.map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 hover:bg-muted/70 cursor-pointer flex flex-col text-xs border-b border-[var(--border)] last:border-0"
                            onClick={() => {
                              setSelectedCustomer({ id: c.id, name: c.name });
                              setCustomerSuggestions([]);
                              setCustomerQuery('');
                            }}
                          >
                            <span className="font-bold text-sm text-[var(--text-main)]">{c.name}</span>
                            {c.documentNumber && (
                              <span className="text-xs text-[var(--text-sec)] font-mono">Doc: {c.documentNumber}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Filter Buttons on Right */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Vendedor Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-dashed h-10 text-sm">
                    <User className="mr-2 h-4 w-4" />
                    Vendedor
                    {selectedUserId !== 'all' && (
                      <>
                        <div className="mx-2 h-4 w-[1px] bg-border" />
                        <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                          {usersList.find((u) => String(u.id) === selectedUserId)?.fullName || 'Seleccionado'}
                        </Badge>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1 w-64" align="start">
                  <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
                    <Button
                      variant="ghost"
                      className="w-full justify-between font-normal h-8 px-2 text-xs"
                      onClick={() => setSelectedUserId('all')}
                    >
                      <span>Todos los vendedores</span>
                      {selectedUserId === 'all' && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </Button>
                    {usersList.map((u) => (
                      <Button
                        key={u.id}
                        variant="ghost"
                        className="w-full justify-between font-normal h-8 px-2 text-xs"
                        onClick={() => setSelectedUserId(String(u.id))}
                        title={u.fullName}
                      >
                        <span className="truncate">{u.fullName}</span>
                        {selectedUserId === String(u.id) && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-dashed h-10 text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Fechas
                    {(startDate || endDate) && (
                      <>
                        <div className="mx-2 h-4 w-[1px] bg-border" />
                        <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                          {startDate && endDate
                            ? `${startDate} al ${endDate}`
                            : startDate
                              ? `>= ${startDate}`
                              : `<= ${endDate}`}
                        </Badge>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-72 space-y-3" align="start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)] block mb-1.5">
                      Atajos Rápidos
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium justify-start"
                        onClick={() => applyDatePreset('today')}
                      >
                        Hoy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium justify-start"
                        onClick={() => applyDatePreset('last7')}
                      >
                        Últimos 7 días
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium justify-start"
                        onClick={() => applyDatePreset('thisMonth')}
                      >
                        Este Mes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-medium justify-start"
                        onClick={() => applyDatePreset('last30')}
                      >
                        Últimos 30 días
                      </Button>
                    </div>
                  </div>
                  <div className="border-t pt-2.5 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)] block">
                      Rango Personalizado
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px] text-[var(--text-sec)]">Desde</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-8 text-xs mt-0.5"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-[var(--text-sec)]">Hasta</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-8 text-xs mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                    >
                      Limpiar fechas
                    </Button>
                  )}
                </PopoverContent>
              </Popover>

              {/* Branch Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-dashed h-10 text-sm">
                    <Store className="mr-2 h-4 w-4" />
                    Sucursal
                    {allBranches && (
                      <>
                        <div className="mx-2 h-4 w-[1px] bg-border" />
                        <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                          Todas
                        </Badge>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-64" align="start">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-main)]">Todas las sucursales</span>
                      <span className="text-[11px] text-[var(--text-sec)]">Ver ventas de toda la red</span>
                    </div>
                    <Switch checked={allBranches} onCheckedChange={setAllBranches} />
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear All Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-10 px-2.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                  <X className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sales History Table */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Venta / Ref</TableHead>
                    <TableHead className="font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Fecha y Hora</TableHead>
                    <TableHead className="font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Vendedor / Usuario</TableHead>
                    <TableHead className="font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Cliente</TableHead>
                    <TableHead className="text-right font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Cantidad</TableHead>
                    <TableHead className="text-right font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Precio Unit.</TableHead>
                    <TableHead className="text-right font-bold text-sm py-3.5 px-4 text-[var(--text-main)]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-indigo-500">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <History className="h-8 w-8 animate-spin text-indigo-500" />
                          <span className="text-sm font-semibold text-[var(--text-sec)]">
                            Consultando historial de ventas...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !data || data.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-[var(--text-sec)]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="h-8 w-8 opacity-30" />
                          <span className="font-bold text-base text-[var(--text-main)]">
                            No se encontraron registros de ventas
                          </span>
                          <span className="text-sm opacity-70">
                            {hasActiveFilters
                              ? 'Prueba modificando o limpiando los filtros seleccionados'
                              : 'Este producto no registra ventas confirmadas aún'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.data.map((item) => (
                      <TableRow key={item.saleItemId} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                              #{item.saleId}
                            </span>
                            <span className="text-xs text-[var(--text-sec)] font-medium mt-0.5">
                              {item.branch?.name || 'Sucursal'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--text-main)]">
                              {new Date(item.date).toLocaleDateString('es-SV', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-[var(--text-sec)] font-mono mt-0.5">
                              {new Date(item.date).toLocaleTimeString('es-SV', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                              <User size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-[var(--text-main)] truncate max-w-[180px]" title={item.seller.fullName}>
                                {item.seller.fullName}
                              </span>
                              <span className="text-xs text-[var(--text-sec)] truncate max-w-[180px]">
                                {item.seller.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--text-main)]">
                              {item.customer ? item.customer.name : 'Cliente Ocasional'}
                            </span>
                            {item.customer?.documentNumber && (
                              <span className="text-xs text-[var(--text-sec)] font-mono mt-0.5">
                                Doc: {item.customer.documentNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <span className="font-black text-sm sm:text-base text-[var(--text-main)]">
                            {Number(item.quantity).toLocaleString('es-SV', {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-sec)] ml-1">
                            {item.unitType || unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm sm:text-base font-bold py-3 px-4 text-[var(--text-main)]">
                          ${Number(item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <span className="font-black text-sm sm:text-base text-indigo-600 dark:text-indigo-400 font-mono">
                            ${Number(item.totalPrice).toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {data && data.pagination.totalPages > 1 && (
              <div className="p-3.5 border-t border-[var(--border)] flex items-center justify-between bg-muted/20 text-sm">
                <span className="text-[var(--text-sec)]">
                  Página <strong className="text-[var(--text-main)]">{data.pagination.page}</strong> de{' '}
                  <strong className="text-[var(--text-main)]">{data.pagination.totalPages}</strong> ({data.pagination.total} ventas registradas)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs sm:text-sm gap-1"
                    disabled={data.pagination.page <= 1 || loading}
                    onClick={() => fetchHistory(data.pagination.page - 1)}
                  >
                    <ChevronLeft size={15} />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs sm:text-sm gap-1"
                    disabled={data.pagination.page >= data.pagination.totalPages || loading}
                    onClick={() => fetchHistory(data.pagination.page + 1)}
                  >
                    Siguiente
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-[var(--border)] bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
