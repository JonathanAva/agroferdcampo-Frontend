import React, { useState, useEffect } from 'react';
import {
  DollarSign, Package, AlertTriangle, ShoppingBag,
  TrendingUp, Users, RefreshCcw, CreditCard,
  Receipt, Truck, UserCheck, CalendarCheck,
  FileText, RotateCcw, Target, Banknote, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import {
  reportsService,
  DailySalesResponse,
  SalesPeriodResponse,
  ProductSaleReportItem,
  ManagerDashboardResponse
} from '../services/reports.service';
import { deliveryNotesService } from '../services/delivery-notes.service';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ProgressKPIList } from '../components/ui/progress-kpi-list';

// ────────────────────────────────────────────────────────────────────────────
// Dashboard principal
// ────────────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [loading, setLoading] = useState(true);

  const [dailySales, setDailySales] = useState<DailySalesResponse | null>(null);
  const [pendingNotesCount, setPendingNotesCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [inventoryValuation, setInventoryValuation] = useState(0);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriodResponse | null>(null);
  const [topProducts, setTopProducts] = useState<ProductSaleReportItem[]>([]);
  const [managerKpis, setManagerKpis] = useState<ManagerDashboardResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 30);
      const startDateStr = pastDate.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];

      const [dailyRes, notesRes, lowStockRes, valuationRes, periodRes, productsRes, managerRes] =
        await Promise.all([
          reportsService.getDailySales(),
          deliveryNotesService.getDeliveryNotes({ status: 'EMITIDO', limit: 1 }),
          reportsService.getLowStock(),
          reportsService.getInventoryValuation(),
          reportsService.getSalesByPeriod(startDateStr, endDateStr),
          reportsService.getSalesByProduct(startDateStr, endDateStr),
          reportsService.getManagerDashboard(),
        ]);

      setDailySales(dailyRes);
      setPendingNotesCount(notesRes.total || 0);
      setLowStockCount(lowStockRes.length || 0);
      setInventoryValuation(valuationRes.totalValuation || 0);
      setSalesPeriod(periodRes);
      setManagerKpis(managerRes);

      const sortedProducts = [...productsRes]
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 5);
      setTopProducts(sortedProducts);
    } catch (error: any) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  const fmt = (val: number) =>
    new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(val);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-[var(--border)] rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[var(--card)] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-[var(--card)] rounded-2xl" />
          <div className="h-[350px] bg-[var(--card)] rounded-2xl" />
        </div>
      </div>
    );
  }

  const chartData = salesPeriod?.dailyBreakdown.map(item => ({
    fecha: new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    monto: Number(item.total),
  })) || [];

  const m = managerKpis;
  
  // Datos para gráficos adicionales
  const financialData = [
    { name: 'Por Cobrar', valor: m?.cartera.totalPorCobrar ?? 0 },
    { name: 'CxP Proveedores', valor: m?.payables.totalPorPagar ?? 0 }
  ];

  const rrhhData = [
    { name: 'Presentes', value: m?.rrhh.asistenciaHoyPresentes ?? 0, color: '#10b981' },
    { name: 'Ausentes/Otros', value: (m?.rrhh.asistenciaHoyTotal ?? 0) - (m?.rrhh.asistenciaHoyPresentes ?? 0), color: 'var(--border)' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Dashboard Estratégico
          </h1>
          <p className="text-[var(--text-sec)] mt-1">
            Hola, <span className="font-semibold text-[var(--text-main)]">{user?.name}</span>. 
            Viendo: <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">{selectedBranch?.name || user?.branch || 'Principal'}</span>
          </p>
        </div>
        <Button variant="outline" onClick={loadData} className="rounded-xl border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] shadow-sm">
          <RefreshCcw size={16} className="mr-2" /> Actualizar Datos
        </Button>
      </div>

      {/* ── FILA 1: KPIs Principales (Lo más importante arriba) ── */}
      <ProgressKPIList
        kpis={[
          {
            label: 'Ventas del Mes',
            value: fmt(m?.ventas.totalMes ?? 0),
            icon: TrendingUp,
            color: '#10b981',
            trend: m?.ventas.trendPct !== undefined
              ? { value: Math.abs(m.ventas.trendPct), isPositive: m.ventas.trendPct >= 0 }
              : undefined,
            subtitle: `Ventas de Hoy: ${fmt(dailySales?.totalVentas || 0)}`,
          },
          {
            label: 'Cuentas x Cobrar',
            value: fmt(m?.cartera.totalPorCobrar ?? 0),
            icon: CreditCard,
            color: '#3b82f6',
            subtitle: `Vencido: ${fmt(m?.cartera.creditosVencidosAmount ?? 0)} (${m?.cartera.creditosVencidosCount ?? 0})`,
          },
          {
            label: 'Cuentas x Pagar',
            value: fmt(m?.payables.totalPorPagar ?? 0),
            icon: Banknote,
            color: '#f43f5e',
            subtitle: `${m?.payables.comprasPendientesCount ?? 0} compras pendientes`,
          },
          {
            label: 'Valor de Inventario',
            value: fmt(inventoryValuation),
            icon: Package,
            color: '#8b5cf6',
            subtitle: `${lowStockCount} prods. en stock crítico`,
          },
        ]}
      />

      {/* ── FILA 2: Gráfico Principal + Operaciones ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de ventas */}
        <Card className="lg:col-span-2 border-[var(--border)] bg-[var(--card)] p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Tendencia de Ventas</h3>
              <p className="text-xs text-[var(--text-sec)]">Últimos 30 días</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-none shadow-none font-bold">
              Ticket Promedio: {fmt(m?.ventas.ticketPromedio ?? 0)}
            </Badge>
          </div>
          <div className="h-[280px] w-full mt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--text-sec)] text-sm bg-[var(--bg)]/50 rounded-xl">
                No hay ventas en este periodo.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="fecha" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--text-sec)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--text-sec)' }} tickFormatter={t => `$${t}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={val => [`$${Number(val).toFixed(2)}`, 'Ventas']}
                  />
                  <Area type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Panel de Alertas y Operaciones */}
        <Card className="border-[var(--border)] bg-[var(--card)] p-6 rounded-2xl flex flex-col gap-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500"/> Alertas Operativas
            </h3>
            <p className="text-xs text-[var(--text-sec)]">Pendientes por atender hoy</p>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 justify-center">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-blue-600"/>
                <span className="font-semibold text-sm text-[var(--text-main)]">Rutas Activas</span>
              </div>
              <Badge className="bg-blue-600 hover:bg-blue-700">{m?.operaciones.rutasActivas ?? 0}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-amber-600"/>
                <span className="font-semibold text-sm text-[var(--text-main)]">Albaranes Emitidos</span>
              </div>
              <Badge className="bg-amber-600 hover:bg-amber-700">{pendingNotesCount}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-600"/>
                <span className="font-semibold text-sm text-[var(--text-main)]">Cotizaciones Pts.</span>
              </div>
              <Badge className="bg-purple-600 hover:bg-purple-700">{m?.operaciones.cotizacionesPendientes ?? 0}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-rose-600"/>
                <span className="font-semibold text-sm text-[var(--text-main)]">Permisos RRHH</span>
              </div>
              <Badge className="bg-rose-600 hover:bg-rose-700">{m?.rrhh.permisosPendientes ?? 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* ── FILA 3: Finanzas y Desempeño ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Balance Financiero (Gráfico de Barras) */}
        <Card className="border-[var(--border)] bg-[var(--card)] p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Deuda vs Obligaciones</h3>
            <p className="text-xs text-[var(--text-sec)]">Comparativa de liquidez</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128,128,128,0.1)" />
                <XAxis 
                  type="number" 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--text-sec)' }} 
                  tickFormatter={t => t >= 1000 ? `$${(t/1000).toFixed(1)}k` : `$${t}`} 
                />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: 'var(--text-main)', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{fill: 'var(--bg)'}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  formatter={val => [`$${Number(val).toFixed(2)}`, 'Monto']}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* RRHH Asistencia (Gráfico Circular) */}
        <Card className="border-[var(--border)] bg-[var(--card)] p-6 rounded-2xl flex flex-col gap-4 shadow-sm relative">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Asistencia Hoy</h3>
            <p className="text-xs text-[var(--text-sec)]">Personal en sucursal</p>
          </div>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rrhhData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {rrhhData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Texto en el centro del donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-3xl font-black text-[var(--text-main)]">{m?.rrhh.asistenciaHoyPct ?? 0}%</span>
              <span className="text-[10px] text-[var(--text-sec)] font-bold uppercase tracking-wider">Presentes</span>
            </div>
          </div>
        </Card>

        {/* Top Productos (Tabla) */}
        <Card className="border-[var(--border)] bg-[var(--card)] p-6 rounded-2xl flex flex-col gap-4 shadow-sm h-full">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Target size={18} className="text-emerald-500"/> Top Productos
            </h3>
            <p className="text-xs text-[var(--text-sec)]">Por volumen (últimos 30 días)</p>
          </div>
          <div className="flex-1 overflow-x-auto rounded-xl border border-[var(--border)]">
            <Table>
              <TableHeader className="bg-[var(--bg)]/50">
                <TableRow className="border-[var(--border)]">
                  <TableHead className="text-xs font-semibold text-[var(--text-sec)]">Producto</TableHead>
                  <TableHead className="text-xs text-center font-semibold text-[var(--text-sec)]">Cant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-xs text-[var(--text-sec)] py-8">
                      Sin datos
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map(p => (
                    <TableRow key={p.productId} className="hover:bg-[var(--bg)] transition-colors border-[var(--border)]">
                      <TableCell className="py-2 px-3">
                        <span className="text-xs font-bold text-[var(--text-main)] block truncate max-w-[120px] uppercase">
                          {p.productName}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2 px-3 text-xs font-bold text-[var(--text-main)]">
                        {p.totalQty}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
