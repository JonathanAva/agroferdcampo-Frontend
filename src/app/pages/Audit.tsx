import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Eye,
  FileSpreadsheet,
  Download,
  Activity,
  History,
  Clock,
  User as UserIcon,
  Database,
  FileText,
  Globe,
  Zap,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Share2,
} from "lucide-react";
import { apiRequest, API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { InlinePills } from "../components/ui/inline-pills";
import { useSearchParams } from "react-router";
import { SmartFilter, FilterConfig } from "../components/ui/smart-filter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

interface AuditLog {
  id: number;
  userId: number | null;
  branchId: number | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: any;
  newValues: any;
  changes: any;
  module: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  duration: number | null;
  metadata: any;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    branches?: { role: string; branchId: number }[];
  };
}

interface PaginatedResponse {
  data: AuditLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  CREATE: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: Plus, label: 'Creación' },
  UPDATE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: Pencil, label: 'Actualización' },
  DELETE: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: Trash2, label: 'Eliminación' },
  LOGIN:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: LogIn, label: 'Inicio de sesión' },
  LOGOUT: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', icon: LogOut, label: 'Cierre de sesión' },
  EXPORT: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)', icon: Share2, label: 'Exportación' },
};

const getActionCfg = (action: string) =>
  ACTION_CONFIG[action] ?? { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', icon: Zap, label: action };

const ENTITY_LABELS: Record<string, string> = {
  users: 'Usuarios', user: 'Usuarios',
  sales: 'Ventas', sale: 'Ventas',
  products: 'Productos', product: 'Productos',
  categories: 'Categorías', category: 'Categorías',
  branches: 'Sucursales', branch: 'Sucursales',
  customers: 'Clientes', customer: 'Clientes',
  inventory: 'Inventario',
  purchases: 'Compras', purchase: 'Compras',
  employees: 'Empleados', employee: 'Empleados',
  credit: 'Crédito',
  quotes: 'Cotizaciones', quote: 'Cotizaciones',
  'cash-shifts': 'Turnos de Caja', cashshift: 'Turnos de Caja',
  'delivery-notes': 'Albaranes',
  'delivery-routes': 'Rutas de Entrega',
  vehicles: 'Vehículos', vehicle: 'Vehículos',
  'cash-registers': 'Cajas Registradoras',
  suppliers: 'Proveedores', supplier: 'Proveedores',
  'saved-addresses': 'Direcciones',
  'pre-sales': 'Pre-ventas',
};

const ROLE_LABELS: Record<string, string> = {
  PROPIETARIO: 'Propietario',
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  CAJERO: 'Cajero',
  BODEGUERO: 'Bodeguero',
  CONDUCTOR: 'Conductor',
  VENDEDOR: 'Vendedor',
};

const getEntityLabel = (entity: string) =>
  ENTITY_LABELS[entity] ?? ENTITY_LABELS[entity.toLowerCase()] ?? entity;

const getUserRole = (log: AuditLog): string | null => {
  if (!log.user?.branches?.length) return null;
  const match = log.branchId
    ? log.user.branches.find(b => b.branchId === log.branchId)
    : log.user.branches[0];
  return match?.role ?? null;
};

const getEntityRole = (log: AuditLog): string | null => {
  const nv = log.newValues as any;
  if (nv?.branches?.[0]?.role) return nv.branches[0].role;
  if (nv?.role) return nv.role;
  return null;
};

function JsonBlock({ data, label, color }: { data: any; label: string; color: string }) {
  const isEmpty = !data || (typeof data === 'object' && Object.keys(data).length === 0);
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-md border w-fit"
        style={{ color, backgroundColor: `${color}12`, borderColor: `${color}25` }}
      >
        {label}
      </span>
      {isEmpty ? (
        <div className="flex items-center justify-center h-14 rounded-lg border border-dashed border-[var(--border)] text-[var(--text-sec)] text-xs">
          Sin datos
        </div>
      ) : (
        <pre
          className="p-3 rounded-xl overflow-auto text-xs max-h-[260px] border font-mono leading-5"
          style={{
            background: '#0d1117',
            color: '#c9d1d9',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}

export function Audit() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [actionsList, setActionsList] = useState<string[]>([]);
  const [entitiesList, setEntitiesList] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const actionFilter = searchParams.get('action') || 'all';
  const entityFilter = searchParams.get('entity') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  useEffect(() => { fetchMetadata(); }, []);
  useEffect(() => { fetchLogs(); }, [currentPage, actionFilter, entityFilter, startDate, endDate]);

  const fetchMetadata = async () => {
    try {
      const [actions, entities] = await Promise.all([
        apiRequest<string[]>("/audit/actions"),
        apiRequest<string[]>("/audit/entities"),
      ]);
      setActionsList(actions);
      setEntitiesList(entities);
    } catch { /* silent */ }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '50');
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (entityFilter !== 'all') params.append('entity', entityFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (currentUser?.roleId !== 1 && currentUser?.branchId) {
        params.append('branchId', currentUser.branchId.toString());
      }
      const response = await apiRequest<PaginatedResponse>(`/audit?${params.toString()}`);
      setLogs(response.data);
      setMeta(response.meta);
    } catch {
      toast.error("Error al cargar registros de auditoría");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    const p = new URLSearchParams(searchParams);
    p.set('page', newPage.toString());
    setSearchParams(p);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.delete('page');
      const token = localStorage.getItem("agro-token");
      const response = await fetch(`${API_BASE_URL}/audit/export/${format}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error al exportar`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Auditoria_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exportado a ${format.toUpperCase()}`);
    } catch (e: any) {
      toast.error(e.message || "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const filters: FilterConfig[] = [
    { id: 'action', label: 'Acción', type: 'category', options: actionsList.map(a => ({ label: a, value: a })) },
    { id: 'entity', label: 'Módulo/Entidad', type: 'category', options: entitiesList.map(e => ({ label: e.toUpperCase(), value: e })) },
    { id: 'dateRange', label: 'Fecha', type: 'date_range' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <ShieldAlert size={20} className="text-[var(--primary)]" />
            </div>
            Auditoría de Sistema
          </h1>
          <div className="mt-2">
            <InlinePills
              metrics={[
                { label: 'Registros Encontrados', value: meta.total, icon: Database, color: 'var(--primary)' },
                { label: 'Página Actual', value: `${meta.page} de ${meta.totalPages || 1}`, icon: FileText, color: '#10b981' },
              ]}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={exporting || logs.length === 0}
            className="gap-2 border-[var(--border)] bg-[var(--card)] hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all"
          >
            <FileSpreadsheet size={16} />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting || logs.length === 0}
            className="gap-2 border-[var(--border)] bg-[var(--card)] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
          >
            <Download size={16} />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
        <SmartFilter config={filters} />
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm bg-[var(--card)] flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60">
                <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-sec)]">Fecha y Hora</th>
                <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-sec)]">Usuario</th>
                <th className="text-center px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-sec)]">Acción</th>
                <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-sec)]">Entidad</th>
                <th className="text-center px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-sec)]">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-sec)]">
                      <Activity className="animate-spin text-[var(--primary)]" size={28} />
                      <span className="text-sm font-semibold animate-pulse">Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-sec)]">
                      <History size={40} className="opacity-20" />
                      <span className="text-sm font-medium">No se encontraron registros</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const cfg = getActionCfg(log.action);
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={log.id}
                      className="group border-b border-[var(--border)] hover:bg-[var(--bg)]/40 transition-colors"
                      style={{ borderLeft: `3px solid ${cfg.color}` }}
                    >
                      {/* Fecha */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--text-main)]">
                            {new Date(log.createdAt).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-[var(--text-sec)] flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {new Date(log.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}
                          >
                            {log.user ? log.user.fullName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-[var(--text-main)] truncate">
                              {log.user?.fullName || 'Sistema'}
                            </span>
                            {getUserRole(log) && (
                              <span className="text-[10px] font-bold text-[var(--primary)] opacity-80">
                                {ROLE_LABELS[getUserRole(log)!] ?? getUserRole(log)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          <Icon size={11} />
                          {cfg.label}
                        </div>
                      </td>

                      {/* Entidad */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-[var(--text-main)]">
                            {getEntityLabel(log.entity)}
                          </span>
                          {log.entityId && (
                            <span className="text-[11px] font-mono text-[var(--text-sec)] bg-[var(--bg)] px-1.5 py-0.5 rounded w-fit">
                              #{log.entityId}
                            </span>
                          )}
                          {getEntityRole(log) && (
                            <span className="text-[10px] font-bold text-[var(--primary)] opacity-80">
                              {ROLE_LABELS[getEntityRole(log)!] ?? getEntityRole(log)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Detalles */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { setSelectedLog(log); setShowModal(true); }}
                          title="Ver detalle"
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors mx-auto"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/30">
          <span className="text-xs font-medium text-[var(--text-sec)]">
            Página {meta.page} de {meta.totalPages || 1} · {meta.total} registros
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1 || loading} onClick={() => handlePageChange(meta.page - 1)} className="bg-[var(--card)] text-xs">
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages || loading} onClick={() => handlePageChange(meta.page + 1)} className="bg-[var(--card)] text-xs">
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="max-w-2xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-main)" }}
        >
          {selectedLog && (() => {
            const cfg = getActionCfg(selectedLog.action);
            const Icon = cfg.icon;
            return (
              <>
                <DialogHeader className="pb-4 border-b border-[var(--border)]">
                  <DialogTitle className="flex items-center gap-2.5 text-lg font-black">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                      <Icon size={16} style={{ color: cfg.color }} />
                    </div>
                    Registro #{selectedLog.id}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ml-1" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </div>
                  </DialogTitle>
                  <DialogDescription className="text-[var(--text-sec)]">
                    Información detallada sobre la operación registrada.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-5 space-y-5">
                  {/* Meta info — 2 columnas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] tracking-wider flex items-center gap-1">
                        <UserIcon size={10} /> Usuario
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-main)] truncate">{selectedLog.user?.fullName || 'Sistema'}</span>
                    </div>
                    <div className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] tracking-wider flex items-center gap-1">
                        <Database size={10} /> Entidad
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-main)]">
                        {selectedLog.entity}{selectedLog.entityId ? ` #${selectedLog.entityId}` : ''}
                      </span>
                    </div>
                    <div className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] tracking-wider flex items-center gap-1">
                        <Clock size={10} /> Fecha y hora
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-main)]">
                        {new Date(selectedLog.createdAt).toLocaleString('es-SV')}
                      </span>
                    </div>
                    <div className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] tracking-wider flex items-center gap-1">
                        <Globe size={10} /> IP / Dispositivo
                      </span>
                      <span className="text-xs font-mono text-[var(--text-main)] truncate">
                        {selectedLog.ipAddress || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* JSON payload — apilados verticalmente */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-sec)] flex items-center gap-1.5">
                      <FileText size={13} /> Datos del Registro
                    </h3>
                    <JsonBlock
                      data={selectedLog.oldValues || selectedLog.metadata || {}}
                      label={selectedLog.action === 'UPDATE' ? 'Valores anteriores' : 'Solicitud / Metadata'}
                      color="#f59e0b"
                    />
                    <JsonBlock
                      data={selectedLog.newValues || selectedLog.changes || {}}
                      label={selectedLog.action === 'DELETE' ? 'Registro eliminado' : 'Valores nuevos / Respuesta'}
                      color="#10b981"
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
