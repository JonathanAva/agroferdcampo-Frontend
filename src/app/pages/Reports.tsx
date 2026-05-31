import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Calendar, TrendingUp, DollarSign,
  Package, AlertTriangle, ShieldAlert, Users, Percent, CreditCard,
  RefreshCw, ShoppingCart, Wallet, ArrowLeftRight, UserCheck,
  RotateCcw, BarChart3, FileDown, Info, Receipt, LucideIcon
} from 'lucide-react';
import { reportsService } from '../services/reports.service';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

type FilterType = 'none' | 'date' | 'range' | 'range_with_cashier' | 'range_with_type';

interface ExtraFilter {
  key: string;
  label: string;
  type: 'select' | 'input' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ReportFilter {
  type: FilterType;
  extraFilters?: ExtraFilter[];
}

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  endpointPrefix: string;
  filter: ReportFilter;
  category: 'ventas' | 'compras' | 'inventario' | 'cartera' | 'caja';
  badge?: string; // 'Nuevo' | 'Mejorado' | undefined
}

const REPORTS: ReportType[] = [
  // ── VENTAS ──
  {
    id: 'daily_sales',
    title: 'Ventas Diarias',
    description: 'Detalle completo de todas las ventas facturadas en un día: cliente, método de pago, subtotal, IVA y total.',
    icon: DollarSign,
    endpointPrefix: 'sales/daily',
    filter: {
      type: 'date',
      extraFilters: [
        {
          key: 'paymentMethod',
          label: 'Método de pago',
          type: 'select',
          options: [
            { value: 'ALL', label: 'Todos' },
            { value: 'EFECTIVO', label: 'Efectivo' },
            { value: 'TARJETA', label: 'Tarjeta' },
            { value: 'CREDITO', label: 'Crédito' },
            { value: 'TRANSFERENCIA', label: 'Transferencia' },
          ]
        }
      ]
    },
    category: 'ventas',
    badge: 'Mejorado',
  },
  {
    id: 'period_sales',
    title: 'Ventas por Período',
    description: 'Histórico consolidado de ventas diarias dentro de un rango de fechas con totales acumulados.',
    icon: TrendingUp,
    endpointPrefix: 'sales/period',
    filter: { type: 'range' },
    category: 'ventas',
  },
  {
    id: 'product_sales',
    title: 'Ventas por Producto',
    description: 'Productos vendidos en un rango de fechas: ingresos, costo y margen de rentabilidad.',
    icon: Percent,
    endpointPrefix: 'sales/by-product',
    filter: {
      type: 'range',
      extraFilters: [
        {
          key: 'categoryId',
          label: 'Categoría',
          type: 'select',
          // Esto puede cargarse dinámicamente haciendo un GET a /catalog/categories
          options: [{ value: 'ALL', label: 'Todas las categorías' }]
        },
        {
          key: 'minRevenue',
          label: 'Ingreso mínimo ($)',
          type: 'number',
          placeholder: 'Ej: 100'
        }
      ]
    },
    category: 'ventas',
  },
  {
    id: 'sales_by_cashier',
    title: 'Ventas por Cajero',
    description: 'Rendimiento de cada vendedor: número de ventas, total vendido y promedio por transacción.',
    icon: UserCheck,
    endpointPrefix: 'sales/by-cashier',
    filter: { type: 'range' },
    category: 'ventas',
    badge: 'Nuevo',
  },
  {
    id: 'returns',
    title: 'Devoluciones',
    description: 'Registro de devoluciones en el período: cliente, productos devueltos, monto y motivo.',
    icon: RotateCcw,
    endpointPrefix: 'returns/period',
    filter: { type: 'range' },
    category: 'ventas',
    badge: 'Nuevo',
  },

  // ── COMPRAS ──
  {
    id: 'purchases_period',
    title: 'Compras por Período',
    description: 'Historial de órdenes de compra a proveedores: montos, estados y formas de pago.',
    icon: ShoppingCart,
    endpointPrefix: 'purchases/period',
    filter: {
      type: 'range',
      extraFilters: [
        {
          key: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: 'ALL', label: 'Todos' },
            { value: 'PENDIENTE', label: 'Pendiente' },
            { value: 'CONFIRMADA', label: 'Confirmada' },
            { value: 'RECIBIDA_TOTAL', label: 'Recibida total' },
            { value: 'RECIBIDA_PARCIAL', label: 'Recibida parcial' },
          ]
        }
      ]
    },
    category: 'compras',
    badge: 'Nuevo',
  },
  {
    id: 'payables',
    title: 'Cuentas por Pagar',
    description: 'Deuda vigente con proveedores: facturas pendientes, montos adeudados y antigüedad.',
    icon: Wallet,
    endpointPrefix: 'payables',
    filter: { type: 'none' },
    category: 'compras',
    badge: 'Nuevo',
  },

  // ── INVENTARIO ──
  {
    id: 'inventory_full',
    title: 'Inventario Completo',
    description: 'Todo el inventario de la sucursal: stock actual, precios, valor y estado de cada producto.',
    icon: Package,
    endpointPrefix: 'inventory/full',   // ← apunta a GET /inventory/export/excel|pdf
    filter: {
      type: 'none',
      extraFilters: [
        {
          key: 'search',
          label: 'Buscar producto',
          type: 'input',
          placeholder: 'Nombre del producto...'
        },
        {
          key: 'categoryId',
          label: 'Categoría',
          type: 'select',
          options: [{ value: 'ALL', label: 'Todas las categorías' }]
        },
        {
          key: 'lowStockOnly',
          label: 'Mostrar solo',
          type: 'select',
          options: [
            { value: 'ALL', label: 'Todo el inventario' },
            { value: 'true', label: 'Solo bajo mínimo' },
          ]
        }
      ]
    },
    category: 'inventario',
    badge: 'Nuevo',
  },
  {
    id: 'inventory_low_stock',
    title: 'Stock Bajo Mínimo',
    description: 'Alertas críticas de productos que están en o por debajo del stock mínimo establecido.',
    icon: ShieldAlert,
    endpointPrefix: 'inventory/low-stock',
    filter: { type: 'none' },
    category: 'inventario',
  },
  {
    id: 'inventory_valuation',
    title: 'Valorización de Inventario',
    description: 'Valor monetario total del stock de la sucursal: costo unitario y valor acumulado por producto.',
    icon: BarChart3,
    endpointPrefix: 'inventory/valuation',
    filter: {
      type: 'none',
      extraFilters: [
        {
          key: 'categoryId',
          label: 'Categoría',
          type: 'select',
          options: [{ value: 'ALL', label: 'Todas las categorías' }]
        },
        {
          key: 'minValue',
          label: 'Valor mínimo ($)',
          type: 'number',
          placeholder: 'Ej: 50'
        }
      ]
    },
    category: 'inventario',
  },
  {
    id: 'inventory_movements',
    title: 'Movimientos de Inventario',
    description: 'Historial de entradas, salidas, ajustes y transferencias de stock en el período seleccionado.',
    icon: ArrowLeftRight,
    endpointPrefix: 'inventory/movements',
    filter: {
      type: 'range',
      extraFilters: [
        {
          key: 'type',
          label: 'Tipo de movimiento',
          type: 'select',
          options: [
            { value: 'ALL', label: 'Todos' },
            { value: 'ENTRADA', label: 'Entrada' },
            { value: 'SALIDA', label: 'Salida' },
            { value: 'AJUSTE', label: 'Ajuste' },
            { value: 'TRANSFERENCIA', label: 'Transferencia' },
          ]
        }
      ]
    },
    category: 'inventario',
    badge: 'Nuevo',
  },
  {
    id: 'no_movement',
    title: 'Productos Sin Movimiento',
    description: 'Productos que no han tenido entradas ni salidas en los últimos N días.',
    icon: AlertTriangle,
    endpointPrefix: 'inventory/no-movement',
    filter: {
      type: 'none',
      extraFilters: [
        {
          key: 'days',
          label: 'Días sin movimiento',
          type: 'select',
          options: [
            { value: '30', label: 'Últimos 30 días' },
            { value: '60', label: 'Últimos 60 días' },
            { value: '90', label: 'Últimos 90 días' },
            { value: '180', label: 'Últimos 6 meses' },
          ]
        }
      ]
    },
    category: 'inventario',
  },

  // ── CARTERA ──
  {
    id: 'receivables',
    title: 'Cuentas por Cobrar',
    description: 'Saldo pendiente de cobro de clientes con línea de crédito: límite, saldo y última compra.',
    icon: CreditCard,
    endpointPrefix: 'receivables',
    filter: {
      type: 'none',
      extraFilters: [
        {
          key: 'minBalance',
          label: 'Saldo mínimo ($)',
          type: 'number',
          placeholder: 'Ej: 100'
        }
      ]
    },
    category: 'cartera',
    badge: 'Mejorado',
  },
  {
    id: 'receivables_aging',
    title: 'Antigüedad de Saldos',
    description: 'Distribución de saldos pendientes por plazos de vencimiento: 0-30, 31-60, 61-90 y +90 días.',
    icon: Users,
    endpointPrefix: 'receivables/aging',
    filter: { type: 'none' },
    category: 'cartera',
    badge: 'Mejorado',
  },

  // ── CAJA ──
  {
    id: 'cash_summary',
    title: 'Resumen de Cierres de Caja',
    description: 'Historial de turnos cerrados: fondo inicial, ventas esperadas, efectivo contado y diferencias.',
    icon: FileText,
    endpointPrefix: 'cash/summary',
    filter: { type: 'range' },
    category: 'caja',
  },
  {
    id: 'cash_detail',
    title: 'Detalle por Turno de Caja',
    description: 'Desglose turno a turno: cajero, horarios, ventas por método de pago, conteo y diferencia.',
    icon: Receipt,
    endpointPrefix: 'cash/detail',
    filter: { type: 'range' },
    category: 'caja',
    badge: 'Nuevo',
  },
];

export function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [activeCategory, setActiveCategory] = useState<string>('ventas');
  const [selectedReport, setSelectedReport] = useState<ReportType>(REPORTS[0]);
  const [singleDate, setSingleDate] = useState(today);
  const [dateRange, setDateRange] = useState({ start: thirtyDaysAgo, end: today });
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState<'excel' | 'pdf' | null>(null);

  // Al cambiar reporte, limpiar extraValues y pre-set defaults
  useEffect(() => {
    const defaults: Record<string, string> = {};
    selectedReport.filter.extraFilters?.forEach(f => {
      if (f.options?.[0]) defaults[f.key] = f.options[0].value;
    });
    setExtraValues(defaults);
  }, [selectedReport.id]);

  // Filtrar reportes por categoría activa
  const filteredReports = REPORTS.filter(r => r.category === activeCategory);

  // Cambiar de tab → seleccionar primer reporte de esa categoría
  const handleTabChange = (cat: string) => {
    setActiveCategory(cat);
    const first = REPORTS.find(r => r.category === cat);
    if (first) setSelectedReport(first);
  };

  const buildParams = (): URLSearchParams => {
    const params = new URLSearchParams();

    if (selectedReport.filter.type === 'date') {
      params.set('date', singleDate);
    } else if (selectedReport.filter.type === 'range') {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    // Extra filters (omitir vacíos)
    Object.entries(extraValues).forEach(([key, val]) => {
      if (val && val !== '' && val !== 'ALL') params.set(key, val);
    });

    return params;
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    setDownloading(format);
    const toastId = toast.loading(`Generando reporte ${format.toUpperCase()}...`);
    try {
      // Caso especial: inventario completo va a /inventory/export/ no a /reports/
      const isInventoryFull = selectedReport.id === 'inventory_full';
      const basePath = isInventoryFull
        ? `../inventory/export/${format}`    // → GET /inventory/export/excel|pdf
        : `${selectedReport.endpointPrefix}/export/${format}`;

      const params = buildParams();
      const queryString = params.toString();
      const endpointPath = queryString ? `${basePath}?${queryString}` : basePath;

      const dateLabel = selectedReport.filter.type === 'date' ? singleDate
        : selectedReport.filter.type === 'range' ? `${dateRange.start}_${dateRange.end}`
        : new Date().toISOString().split('T')[0];

      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `${selectedReport.id}-${dateLabel}.${extension}`;
      await reportsService.downloadReport(endpointPath, filename);
      toast.success('Reporte descargado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al generar el reporte');
    } finally {
      toast.dismiss(toastId);
      setDownloading(null);
    }
  };

  const categories = [
    { id: 'ventas', label: 'Ventas' },
    { id: 'compras', label: 'Compras' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'cartera', label: 'Cartera' },
    { id: 'caja', label: 'Caja' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col space-y-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Centro de Reportes
          </h1>
          <p className="text-[var(--text-sec)] mt-1.5 text-sm md:text-base">
            Genera y exporta reportes en Excel o PDF de ventas, inventario, cartera y más.
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-auto items-center justify-start bg-transparent p-0 overflow-x-auto gap-3">
            {categories.map(cat => {
              const count = REPORTS.filter(r => r.category === cat.id).length;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium transition-all hover:border-[var(--primary)]/50 data-[state=active]:border-[var(--primary)] data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=inactive]:text-[var(--text-sec)]"
                >
                  {cat.label} 
                  <span className="ml-2 text-[11px] opacity-80">
                    ({count})
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LISTA DE REPORTES (Izquierda) */}
        <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2 pb-4 scrollbar-thin">
          {filteredReports.map(report => {
            const isSelected = selectedReport.id === report.id;
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                  isSelected 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm' 
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] rounded-l-xl"></div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg)] text-[var(--text-sec)] group-hover:text-[var(--primary)]'
                  }`}>
                    <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>
                        {report.title}
                      </h3>
                    </div>
                    <p className={`text-xs line-clamp-2 ${isSelected ? 'text-[var(--text-main)]/80' : 'text-[var(--text-sec)]'}`}>
                      {report.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* PANEL DE CONFIGURACIÓN (Derecha) */}
        <div className="lg:col-span-2 sticky top-6">
          <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <selectedReport.icon size={24} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                  {selectedReport.title}
                </h2>
              </div>
              <p className="text-[var(--text-sec)] text-sm ml-11">
                {selectedReport.description}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wide">
                Filtros del reporte
              </h3>

              {/* FILTROS DE FECHA */}
              {selectedReport.filter.type === 'date' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-main)] font-semibold">Fecha</Label>
                    <Input 
                      type="date" 
                      value={singleDate} 
                      onChange={e => setSingleDate(e.target.value)} 
                      className="bg-[var(--bg)] border-[var(--border)] h-11" 
                    />
                  </div>
                </div>
              )}

              {selectedReport.filter.type === 'range' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--text-main)] font-semibold">Fecha Inicio</Label>
                    <Input 
                      type="date" 
                      value={dateRange.start} 
                      onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-[var(--bg)] border-[var(--border)] h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--text-main)] font-semibold">Fecha Fin</Label>
                    <Input 
                      type="date" 
                      value={dateRange.end} 
                      onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-[var(--bg)] border-[var(--border)] h-11" 
                    />
                  </div>
                </div>
              )}

              {/* TIPO NONE */}
              {selectedReport.filter.type === 'none' && (!selectedReport.filter.extraFilters || selectedReport.filter.extraFilters.length === 0) && (
                <div className="bg-[var(--bg)]/50 border border-[var(--border)] rounded-xl p-4 flex gap-3 items-start">
                  <Info size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--text-sec)] leading-relaxed">
                    Este reporte se genera en tiempo real con el estado actual del sistema al momento de la descarga.
                  </p>
                </div>
              )}
              
              {selectedReport.filter.type === 'none' && selectedReport.filter.extraFilters && selectedReport.filter.extraFilters.length > 0 && (
                <div className="bg-[var(--bg)]/50 border border-[var(--border)] rounded-xl p-4 flex gap-3 items-start mb-6">
                  <Info size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--text-sec)] leading-relaxed">
                    Este reporte refleja el estado actual del sistema. Puedes aplicar filtros opcionales para refinar los resultados antes de exportar.
                  </p>
                </div>
              )}

              {/* FILTROS EXTRA */}
              {selectedReport.filter.extraFilters && selectedReport.filter.extraFilters.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedReport.filter.extraFilters.map(ef => (
                    <div key={ef.key} className="space-y-2">
                      <Label className="text-[var(--text-main)] font-semibold">{ef.label}</Label>
                      {ef.type === 'select' ? (
                        <Select 
                          value={extraValues[ef.key] || ''} 
                          onValueChange={v => setExtraValues(prev => ({ ...prev, [ef.key]: v }))}
                        >
                          <SelectTrigger className="bg-[var(--bg)] border-[var(--border)] h-11">
                            <SelectValue placeholder="Seleccionar opción..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ef.options?.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={ef.type === 'number' ? 'number' : 'text'}
                          placeholder={ef.placeholder}
                          value={extraValues[ef.key] || ''}
                          onChange={e => setExtraValues(prev => ({ ...prev, [ef.key]: e.target.value }))}
                          className="bg-[var(--bg)] border-[var(--border)] h-11"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* BOTONES EXPORTAR */}
              <div className="pt-6 border-t border-[var(--border)] space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider flex items-center gap-2">
                  <Download size={14} /> Exportar Reporte
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleDownload('excel')}
                    disabled={downloading !== null}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    {downloading === 'excel' ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
                    Descargar Excel (.xlsx)
                  </Button>
                  <Button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloading !== null}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 rounded-xl gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    {downloading === 'pdf' ? <RefreshCw className="animate-spin" size={18} /> : <FileDown size={18} />}
                    Descargar PDF (.pdf)
                  </Button>
                </div>
                
                <p className="text-xs text-[var(--text-sec)] flex items-center gap-1.5 mt-2">
                  <Info size={12} className="opacity-70" />
                  Los archivos se descargarán automáticamente en tu dispositivo.
                </p>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
