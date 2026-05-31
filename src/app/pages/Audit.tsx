import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Activity,
  History,
  Info,
  Clock,
  User as UserIcon,
  Database
} from "lucide-react";
import { apiRequest, API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { InlinePills } from "../components/ui/inline-pills";
import { useSearchParams } from "react-router";
import { SmartFilter, FilterConfig } from "../components/ui/smart-filter";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  };
}

interface PaginatedResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function Audit() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  
  const [actionsList, setActionsList] = useState<string[]>([]);
  const [entitiesList, setEntitiesList] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const actionFilter = searchParams.get('action') || 'all';
  const entityFilter = searchParams.get('entity') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, entityFilter, startDate, endDate]);

  const fetchMetadata = async () => {
    try {
      const [actions, entities] = await Promise.all([
        apiRequest<string[]>("/audit/actions"),
        apiRequest<string[]>("/audit/entities")
      ]);
      setActionsList(actions);
      setEntitiesList(entities);
    } catch (error) {
      console.error("Error fetching audit metadata:", error);
    }
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
      
      // If the user is an admin but not owner, maybe limit to their branch? 
      // The backend handles this if they only have branch access, but currently we send branchId if needed.
      if (currentUser?.roleId !== 1 && currentUser?.branchId) {
        params.append('branchId', currentUser.branchId.toString());
      }

      const response = await apiRequest<PaginatedResponse>(`/audit?${params.toString()}`);
      setLogs(response.data);
      setMeta(response.meta);
    } catch (error) {
      toast.error("Error al cargar registros de auditoría");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.delete('page'); // Export all based on current filters
      
      const token = localStorage.getItem("agro-token");
      const url = `${API_BASE_URL}/audit/export/${format}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error(`Error al exportar a ${format}`);
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Auditoria_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success(`Exportación a ${format.toUpperCase()} exitosa`);
    } catch (error: any) {
      toast.error(error.message || "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const openDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'destructive';
      case 'LOGIN': return 'info';
      case 'LOGOUT': return 'default';
      default: return 'outline';
    }
  };

  const filters: FilterConfig[] = [
    { 
      id: 'action', 
      label: 'Acción', 
      type: 'category', 
      options: actionsList.map(a => ({ label: a, value: a })) 
    },
    { 
      id: 'entity', 
      label: 'Módulo/Entidad', 
      type: 'category', 
      options: entitiesList.map(e => ({ label: e.toUpperCase(), value: e })) 
    },
    { 
      id: 'dateRange', 
      label: 'Fecha', 
      type: 'date_range' 
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
            <ShieldAlert className="text-[var(--primary)]" />
            Auditoría de Sistema
          </h1>
          <InlinePills
            metrics={[
              { label: 'Registros Encontrados', value: meta.total, icon: Database, color: 'var(--primary)' },
              { label: 'Página Actual', value: `${meta.page} de ${meta.totalPages || 1}`, icon: FileText, color: '#10b981' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={exporting || logs.length === 0}
            className="gap-2 border-[var(--border)] bg-[var(--card)] hover:bg-[#107c41]/10 hover:text-[#107c41] hover:border-[#107c41]/30 transition-all"
          >
            <FileSpreadsheet size={18} />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting || logs.length === 0}
            className="gap-2 border-[var(--border)] bg-[var(--card)] hover:bg-[#e11d48]/10 hover:text-[#e11d48] hover:border-[#e11d48]/30 transition-all"
          >
            <Download size={18} />
            PDF
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <SmartFilter config={filters} />
      </div>

      {/* Audit Logs Table */}
      <Card className="rounded-xl border overflow-hidden shadow-sm bg-[var(--card)] border-[var(--border)] flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--bg)]/50 border-b border-[var(--border)]">
                <TableHead className="font-bold text-[var(--text-main)]">Fecha y Hora</TableHead>
                <TableHead className="font-bold text-[var(--text-main)]">Usuario</TableHead>
                <TableHead className="font-bold text-[var(--text-main)] text-center">Acción</TableHead>
                <TableHead className="font-bold text-[var(--text-main)]">Entidad</TableHead>
                <TableHead className="font-bold text-[var(--text-main)] text-center">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-sec)]">
                      <Activity className="animate-spin text-[var(--primary)]" size={32} />
                      <span className="font-bold animate-pulse">Cargando registros...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-[var(--text-sec)] font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History size={48} className="opacity-20 mb-2" />
                      No se encontraron registros de auditoría
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-[var(--bg)]/30 transition-colors border-b border-[var(--border)]">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-main)]">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-[var(--text-sec)] flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                          {log.user ? log.user.fullName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[var(--text-main)]">
                            {log.user ? log.user.fullName : 'Sistema'}
                          </span>
                          <span className="text-[10px] text-[var(--text-sec)] flex items-center gap-1 opacity-70">
                            {log.ipAddress || 'IP desconocida'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getActionColor(log.action) as any} className="font-black text-[10px] tracking-wide py-1 px-3">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--text-main)] capitalize">
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="text-xs font-mono text-[var(--text-sec)] bg-[var(--bg)] px-1 rounded inline-block w-fit mt-1">
                            ID: {log.entityId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(log)}
                        className="text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg font-bold"
                      >
                        <Eye size={16} className="mr-2" />
                        Ver Cambios
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/50 mt-auto">
          <span className="text-sm font-medium text-[var(--text-sec)]">
            Mostrando página {meta.page} de {meta.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || loading}
              onClick={() => handlePageChange(meta.page - 1)}
              className="bg-[var(--card)]"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || loading}
              onClick={() => handlePageChange(meta.page + 1)}
              className="bg-[var(--card)]"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent 
          className="max-w-3xl w-full"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-main)" }}
        >
          <DialogHeader className="border-b border-[var(--border)] pb-4">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Activity className="text-[var(--primary)]" />
              Detalle de Auditoría #{selectedLog?.id}
            </DialogTitle>
            <DialogDescription>
              Información detallada sobre la operación y los cambios registrados.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="py-4 space-y-6">
              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] opacity-70 flex items-center gap-1">
                    <UserIcon size={12} /> Usuario
                  </span>
                  <span className="font-bold text-sm truncate">{selectedLog.user?.fullName || 'Sistema'}</span>
                </div>
                <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] opacity-70 flex items-center gap-1">
                    <Activity size={12} /> Acción
                  </span>
                  <Badge variant={getActionColor(selectedLog.action) as any} className="w-fit">{selectedLog.action}</Badge>
                </div>
                <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] opacity-70 flex items-center gap-1">
                    <Database size={12} /> Entidad
                  </span>
                  <span className="font-bold text-sm capitalize">{selectedLog.entity} {selectedLog.entityId ? `#${selectedLog.entityId}` : ''}</span>
                </div>
                <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-sec)] opacity-70 flex items-center gap-1">
                    <Clock size={12} /> Fecha
                  </span>
                  <span className="font-bold text-sm truncate">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-[var(--bg)]/50 p-4 rounded-xl border border-[var(--border)] text-sm text-[var(--text-sec)] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Info size={14} className="opacity-70" />
                  <span className="font-bold opacity-70 w-24">IP Address:</span>
                  <span className="font-mono text-[var(--text-main)]">{selectedLog.ipAddress || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={14} className="opacity-70" />
                  <span className="font-bold opacity-70 w-24">User Agent:</span>
                  <span className="font-mono truncate flex-1 text-[var(--text-main)]">{selectedLog.userAgent || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={14} className="opacity-70" />
                  <span className="font-bold opacity-70 w-24">Duration:</span>
                  <span className="font-mono text-[var(--text-main)]">{selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</span>
                </div>
              </div>

              {/* JSON Diff View */}
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase opacity-80">
                  <FileText size={16} /> Datos Registrados (Payload)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Old Values (if any) or Metadata */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 w-fit">
                      {selectedLog.action === 'UPDATE' ? 'Valores Anteriores' : 'Metadata / Request'}
                    </span>
                    <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-auto text-xs max-h-[300px] border border-[var(--border)] shadow-inner custom-scrollbar">
                      <code>
                        {JSON.stringify(
                          selectedLog.oldValues || selectedLog.metadata || {}, 
                          null, 
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                  
                  {/* New Values (if any) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 w-fit">
                      {selectedLog.action === 'DELETE' ? 'Registro Eliminado' : 'Valores Nuevos / Response'}
                    </span>
                    <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-auto text-xs max-h-[300px] border border-[var(--border)] shadow-inner custom-scrollbar">
                      <code>
                        {JSON.stringify(
                          selectedLog.newValues || selectedLog.changes || {}, 
                          null, 
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
