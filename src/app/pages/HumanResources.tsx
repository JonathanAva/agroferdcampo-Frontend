import { useState, useEffect } from "react";
import {
  Users2,
  UserPlus,
  Calendar,
  Clock,
  Briefcase,
  Building2,
  FileText,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  User,
  History,
  Settings as SettingsIcon,
  X,
  ChevronDown,
  Trash2,
  Info,
} from "lucide-react";
import { apiRequest } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useBranch } from "../context/BranchContext";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit } from "lucide-react";

// --- Interfaces ---

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Position {
  id: number;
  title: string;
  description?: string;
  departmentId?: number;
}

interface WorkSchedule {
  id: number;
  name: string;
  entryTime: string;
  exitTime: string;
  breakMinutes: number;
}

interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  dui?: string;
  nit?: string;
  birthDate?: string;
  gender: "MASCULINO" | "FEMENINO" | "OTRO";
  email?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  status: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | "BAJA" | "PERMISO";
  employmentType: string;
  hireDate: string;
  branchId: number;
  departmentId?: number;
  positionId?: number;
  workScheduleId?: number;
  branch?: { id: number; name: string };
  department?: Department;
  position?: Position;
  workSchedule?: WorkSchedule;
  notes?: string;
}

interface HRStats {
  totalActive: number;
  totalInactive: number;
  byEmploymentType: { type: string; count: number }[];
  byDepartment: { name: string; count: number }[];
  absentToday: number;
}

interface AttendanceRecord {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  attendance: {
    checkIn: string;
    checkOut: string | null;
    workedMinutes: number | null;
    status: string;
  } | null;
}

interface LeaveRequest {
  id: number;
  employee: Employee;
  leaveType: { name: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "CANCELADO";
}

export function HumanResources() {
  const { user } = useAuth();
  const { selectedBranch, branches } = useBranch();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [stats, setStats] = useState<HRStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Config Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<{
    type: "dept" | "pos" | "sch";
    open: boolean;
  }>({ type: "dept", open: false });
  const [formLoading, setFormLoading] = useState(false);

  // Selected Department for Filtering Positions
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  // Edit / View Modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [detailsTab, setDetailsTab] = useState<"datos" | "expediente">("datos");

  // Status Change Modal
  const [statusChangeModal, setStatusChangeModal] = useState<{
    employee: Employee | null;
    newStatus: string | null;
  }>({ employee: null, newStatus: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedBranch) {
      loadData();
      loadConfigData();
    }
  }, [selectedBranch, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const data = await apiRequest<HRStats>(
          `/employees/stats?branchId=${selectedBranch?.id}`,
        );
        setStats(data);
      } else if (activeTab === "employees") {
        const response = await apiRequest<{ data: Employee[] }>(
          `/employees?branchId=${selectedBranch?.id}`,
        );
        setEmployees(response.data);
      } else if (activeTab === "attendance") {
        const data = await apiRequest<AttendanceRecord[]>(
          `/attendance/today/${selectedBranch?.id}`,
        );
        setAttendance(data);
      } else if (activeTab === "leaves") {
        const data = await apiRequest<LeaveRequest[]>(
          `/leave-requests/pending?branchId=${selectedBranch?.id}`,
        );
        setPendingLeaves(data);
      }
    } catch (error) {
      console.error("Error loading HR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfigData = async () => {
    try {
      const [depts, pos, sch] = await Promise.all([
        apiRequest<Department[]>("/departments"),
        apiRequest<Position[]>("/positions"),
        apiRequest<WorkSchedule[]>("/work-schedules"),
      ]);
      setDepartments(depts);
      setPositions(pos);
      setSchedules(sch);
    } catch (error) {
      console.error("Error loading config data:", error);
    }
  };

  const handleCheckIn = async (employeeId: number) => {
    try {
      await apiRequest("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      });
      toast.success("Entrada registrada");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar entrada");
    }
  };

  const handleCheckOut = async (employeeId: number) => {
    try {
      await apiRequest("/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      });
      toast.success("Salida registrada");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar salida");
    }
  };

  const handleLeaveAction = async (id: number, status: string) => {
    try {
      await apiRequest(`/leave-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reviewNotes: "Procesado desde panel RRHH",
        }),
      });
      toast.success(`Solicitud ${status.toLowerCase()}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al procesar solicitud");
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      dui: formData.get("dui") || undefined,
      nit: formData.get("nit") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      gender: formData.get("gender"),
      birthDate: formData.get("birthDate") || undefined,
      hireDate: formData.get("hireDate"),
      employmentType: formData.get("employmentType"),
      branchId: formData.get("branchId")
        ? Number(formData.get("branchId"))
        : selectedBranch?.id,
      departmentId:
        formData.get("departmentId") && formData.get("departmentId") !== "none"
          ? Number(formData.get("departmentId"))
          : undefined,
      positionId:
        formData.get("positionId") && formData.get("positionId") !== "none"
          ? Number(formData.get("positionId"))
          : undefined,
      workScheduleId:
        formData.get("workScheduleId") &&
        formData.get("workScheduleId") !== "none"
          ? Number(formData.get("workScheduleId"))
          : undefined,
      emergencyContactName: formData.get("emergencyContactName") || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
      emergencyContactRelation:
        formData.get("emergencyContactRelation") || undefined,
      notes: formData.get("notes") || undefined,
    };

    try {
      await apiRequest("/employees", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Empleado creado exitosamente");
      setIsEmployeeModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al crear empleado");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!statusChangeModal.employee || !statusChangeModal.newStatus) return;

    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      status: statusChangeModal.newStatus,
      notes: formData.get("notes") || undefined,
    };

    try {
      await apiRequest(`/employees/${statusChangeModal.employee.id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      toast.success("Estado actualizado exitosamente");
      setStatusChangeModal({ employee: null, newStatus: null });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      dui: formData.get("dui") || undefined,
      nit: formData.get("nit") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      gender: formData.get("gender"),
      birthDate: formData.get("birthDate") || undefined,
      hireDate: formData.get("hireDate"),
      employmentType: formData.get("employmentType"),
      branchId: formData.get("branchId")
        ? Number(formData.get("branchId"))
        : undefined,
      departmentId:
        formData.get("departmentId") && formData.get("departmentId") !== "none"
          ? Number(formData.get("departmentId"))
          : undefined,
      positionId:
        formData.get("positionId") && formData.get("positionId") !== "none"
          ? Number(formData.get("positionId"))
          : undefined,
      workScheduleId:
        formData.get("workScheduleId") &&
        formData.get("workScheduleId") !== "none"
          ? Number(formData.get("workScheduleId"))
          : undefined,
      emergencyContactName: formData.get("emergencyContactName") || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
      emergencyContactRelation:
        formData.get("emergencyContactRelation") || undefined,
      notes: formData.get("notes") || undefined,
    };

    try {
      await apiRequest(`/employees/${selectedEmployee.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      toast.success("Información actualizada exitosamente");
      setSelectedEmployee(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar empleado");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const type = isConfigModalOpen.type;

    let endpoint = "";
    let body = {};

    if (type === "dept") {
      endpoint = "/departments";
      body = {
        name: formData.get("name"),
        description: formData.get("description"),
      };
    } else if (type === "pos") {
      endpoint = "/positions";
      body = {
        title: formData.get("title"),
        description: formData.get("description"),
        departmentId: formData.get("departmentId")
          ? Number(formData.get("departmentId"))
          : undefined,
      };
    } else if (type === "sch") {
      endpoint = "/work-schedules";
      body = {
        name: formData.get("name"),
        entryTime: formData.get("entryTime"),
        exitTime: formData.get("exitTime"),
        breakMinutes: Number(formData.get("breakMinutes")),
        workDays: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"],
      };
    }

    try {
      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Creado exitosamente");
      setIsConfigModalOpen({ ...isConfigModalOpen, open: false });
      loadConfigData();
    } catch (error: any) {
      toast.error(error.message || "Error al crear");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfig = async (
    type: "dept" | "pos" | "sch",
    id: number,
  ) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const endpoint =
        type === "dept"
          ? `/departments/${id}`
          : type === "pos"
            ? `/positions/${id}`
            : `/work-schedules/${id}`;
      await apiRequest(endpoint, { method: "DELETE" });
      toast.success("Eliminado exitosamente");
      loadConfigData();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    }
  };

  // Filtered positions based on selected department
  const filteredPositions = positions.filter(
    (pos) => !selectedDeptId || pos.departmentId === Number(selectedDeptId),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            Recursos Humanos
          </h1>
          <p style={{ color: "var(--text-sec)" }}>
            Gestión de empleados, asistencia y permisos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "employees" && (
            <Button
              onClick={() => {
                setSelectedDeptId("");
                setIsEmployeeModalOpen(true);
              }}
              size="lg"
              className="gap-2 font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--color-accent)", color: "#ffffff" }}
            >
              <UserPlus size={18} />
              Nuevo Empleado
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 h-auto p-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 py-2.5"
          >
            <Briefcase size={16} /> Resumen
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="flex items-center gap-2 py-2.5"
          >
            <Users2 size={16} /> Empleados
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="flex items-center gap-2 py-2.5"
          >
            <Clock size={16} /> Asistencia
          </TabsTrigger>
          <TabsTrigger
            value="leaves"
            className="flex items-center gap-2 py-2.5"
          >
            <Calendar size={16} /> Permisos
          </TabsTrigger>
          {user?.roleId === 2 && (
            <TabsTrigger
              value="config"
              className="flex items-center gap-2 py-2.5"
            >
              <SettingsIcon size={16} /> Config
            </TabsTrigger>
          )}
        </TabsList>

        {/* --- TAB: RESUMEN --- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Users2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-sec)]">
                    Total Activos
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-main)]">
                    {stats?.totalActive || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-sec)]">
                    Bajas/Inactivos
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-main)]">
                    {stats?.totalInactive || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-sec)]">
                    Ausentes Hoy
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-main)]">
                    {stats?.absentToday || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-sec)]">
                    En Planilla
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-main)]">
                    100%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)]">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-[var(--accent)]" />
                Por Departamento
              </h3>
              <div className="space-y-4">
                {stats?.byDepartment.map((dept, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)]"
                  >
                    <span className="font-medium">{dept.name}</span>
                    <Badge
                      variant="outline"
                      className="bg-[var(--card)] border-[var(--border)]"
                    >
                      {dept.count} empleados
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)]">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[var(--accent)]" />
                Tipo de Contrato
              </h3>
              <div className="space-y-4">
                {stats?.byEmploymentType.map((type, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)]"
                  >
                    <span className="font-medium">
                      {type.type.replace("_", " ")}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-[var(--card)] border-[var(--border)]"
                    >
                      {type.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: EMPLEADOS --- */}
        <TabsContent value="employees" className="space-y-6">
          <div className="p-4 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3 px-4 py-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20 transition-all">
              <Search size={20} className="text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, código o DUI..."
                className="border-none bg-transparent shadow-none focus-visible:ring-0 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

            <div className="rounded-2xl border bg-[var(--card)] border-[var(--border)] overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold text-xs uppercase tracking-wider">
                      Empleado
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">
                      Depto / Cargo
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">
                      Contacto
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">
                      Estado
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees
                    .filter(
                      (e) =>
                        e.fullName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        e.employeeCode
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (e.dui && e.dui.includes(searchTerm)),
                    )
                    .map((emp) => (
                      <TableRow
                        key={emp.id}
                        className="hover:bg-[var(--bg)] transition-colors group"
                      >
                        <TableCell className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-bold">
                              {emp.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{emp.fullName}</p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {emp.employeeCode}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <p className="font-medium">
                            {emp.department?.name || "Sin Depto"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.position?.title || "Sin Cargo"}
                          </p>
                        </TableCell>
                        <TableCell className="p-4 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={12} className="opacity-60" />{" "}
                            {emp.phone || "N/A"}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail size={12} className="opacity-60" />{" "}
                            {emp.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge
                                variant={emp.status === "ACTIVO" ? "default" : "secondary"}
                                className={cn(
                                  "rounded-full px-3 py-1 font-bold text-[10px] cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1",
                                  emp.status === "ACTIVO"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : emp.status === "PERMISO"
                                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                                      : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
                                )}
                              >
                                {emp.status}{" "}
                                <ChevronDown size={12} className="opacity-50" />
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {[
                                "ACTIVO",
                                "INACTIVO",
                                "SUSPENDIDO",
                                "BAJA",
                                "PERMISO",
                              ].map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() =>
                                    setStatusChangeModal({
                                      employee: emp,
                                      newStatus: s,
                                    })
                                  }
                                >
                                  Cambiar a {s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedEmployee(emp)}
                              className="text-muted-foreground hover:text-[var(--color-accent)]"
                            >
                              <Info size={18} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedEmployee(emp)}>
                                  <User size={16} className="mr-2" /> Ver Detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedEmployee(emp);
                                  // logic for edit
                                }}>
                                  <Edit size={16} className="mr-2" /> Editar Datos
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 size={16} className="mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
        </TabsContent>

        {/* --- TAB: ASISTENCIA --- */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">
                  Control de Asistencia del Día
                </h3>
                <p className="text-sm text-emerald-600">
                  Fecha: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 shadow-sm transition-all">
              <History size={18} />
              Ver Historial
            </button>
          </div>

          <div className="rounded-2xl border bg-[var(--card)] border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <tr>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">
                      Entrada
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">
                      Salida
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">
                      Estado
                    </th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {attendance.map((rec) => (
                    <tr
                      key={rec.employeeId}
                      className="hover:bg-[var(--bg)] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg)] flex items-center justify-center font-bold text-xs border border-[var(--border)]">
                            {rec.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{rec.fullName}</p>
                            <p className="text-[10px] text-[var(--text-sec)]">
                              {rec.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-sm">
                        {rec.attendance?.checkIn
                          ? new Date(rec.attendance.checkIn).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )
                          : "--:--"}
                      </td>
                      <td className="p-4 text-center font-mono text-sm">
                        {rec.attendance?.checkOut
                          ? new Date(
                              rec.attendance.checkOut,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </td>
                      <td className="p-4 text-center">
                        {!rec.attendance ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-500 border-red-100"
                          >
                            FALTA
                          </Badge>
                        ) : rec.attendance.checkOut ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-600 border-emerald-100"
                          >
                            COMPLETO
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-600 border-amber-100"
                          >
                            PRESENTE
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!rec.attendance ? (
                          <button
                            onClick={() => handleCheckIn(rec.employeeId)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all"
                          >
                            Entrada
                          </button>
                        ) : !rec.attendance.checkOut ? (
                          <button
                            onClick={() => handleCheckOut(rec.employeeId)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all"
                          >
                            Salida
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg)] text-[var(--text-sec)] text-xs font-bold border border-[var(--border)] opacity-50"
                          >
                            Finalizado
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: CONFIGURACIÓN --- */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Departamentos */}
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Building2 size={20} className="text-[var(--accent)]" />{" "}
                  Departamentos
                </h3>
                <button
                  onClick={() =>
                    setIsConfigModalOpen({ type: "dept", open: true })
                  }
                  className="p-1.5 rounded-lg bg-[var(--accent)] text-white shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {departments.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all"
                  >
                    <span className="text-sm font-medium">{d.name}</span>
                    <button
                      onClick={() => handleDeleteConfig("dept", d.id)}
                      className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {departments.length === 0 && (
                  <p className="text-xs text-center py-8 opacity-40">
                    Sin departamentos
                  </p>
                )}
              </div>
            </div>

            {/* Cargos */}
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Briefcase size={20} className="text-[var(--accent)]" />{" "}
                  Cargos / Puestos
                </h3>
                <button
                  onClick={() =>
                    setIsConfigModalOpen({ type: "pos", open: true })
                  }
                  className="p-1.5 rounded-lg bg-[var(--accent)] text-white shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {positions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-[10px] text-[var(--text-sec)]">
                        {departments.find((d) => d.id === p.departmentId)
                          ?.name || "General"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteConfig("pos", p.id)}
                      className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {positions.length === 0 && (
                  <p className="text-xs text-center py-8 opacity-40">
                    Sin cargos
                  </p>
                )}
              </div>
            </div>

            {/* Horarios */}
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Clock size={20} className="text-[var(--accent)]" /> Horarios
                </h3>
                <button
                  onClick={() =>
                    setIsConfigModalOpen({ type: "sch", open: true })
                  }
                  className="p-1.5 rounded-lg bg-[var(--accent)] text-white shadow-lg active:scale-95 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-[10px] text-[var(--text-sec)]">
                        {s.entryTime} - {s.exitTime}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteConfig("sch", s.id)}
                      className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-xs text-center py-8 opacity-40">
                    Sin horarios
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- MODAL: NUEVO EMPLEADO (ALINEADO CON LA GUÍA) --- */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/20">
                <UserPlus size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-[var(--text-main)] text-left">
                  Registro de Personal
                </DialogTitle>
                <p className="text-sm text-[var(--text-sec)] flex items-center gap-1.5 mt-1">
                  <Info size={14} className="text-[var(--accent)]" />
                  Sigue los pasos de la guía oficial de creación
                </p>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleCreateEmployee}
            className="p-8 overflow-y-auto custom-scrollbar flex-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* COLUMNA 1 */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <User size={18} /> Datos del Empleado
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Nombre Completo *
                    </Label>
                    <Input
                      name="fullName"
                      required
                      placeholder="Nombre y apellidos"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        DUI
                      </Label>
                      <Input
                        name="dui"
                        placeholder="00000000-0"
                        pattern="^\d{8}-\d$"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        NIT
                      </Label>
                      <Input name="nit" placeholder="Opcional" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        Género *
                      </Label>
                      <Select name="gender" required defaultValue="MASCULINO">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMENINO">Femenino</SelectItem>
                          <SelectItem value="OTRO">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        Nacimiento
                      </Label>
                      <Input name="birthDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Dirección Residencial
                    </Label>
                    <Textarea
                      name="address"
                      rows={3}
                      placeholder="Ciudad, Colonia, Casa..."
                      className="resize-none"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-2 pt-4">
                  <AlertCircle size={18} /> Contacto de Emergencia
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Nombre Completo
                    </Label>
                    <Input
                      name="emergencyContactName"
                      placeholder="Ej. Carlos Pérez (Padre)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        Parentesco
                      </Label>
                      <Input
                        name="emergencyContactRelation"
                        placeholder="Ej. Padre, Esposa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                        Teléfono
                      </Label>
                      <Input
                        name="emergencyContactPhone"
                        placeholder="7999-1111"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA 2 */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <Briefcase size={18} /> Asignación Laboral
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Sucursal *
                    </Label>
                    <Select
                      name="branchId"
                      required
                      defaultValue={
                        selectedBranch ? String(selectedBranch.id) : undefined
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sucursal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Fecha de Contratación *
                    </Label>
                    <Input
                      name="hireDate"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Tipo de Contrato *
                    </Label>
                    <Select
                      name="employmentType"
                      required
                      defaultValue="TIEMPO_COMPLETO"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIEMPO_COMPLETO">
                          Tiempo Completo
                        </SelectItem>
                        <SelectItem value="MEDIO_TIEMPO">
                          Medio Tiempo
                        </SelectItem>
                        <SelectItem value="TEMPORAL">Temporal</SelectItem>
                        <SelectItem value="POR_HORA">Por Hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Departamento
                    </Label>
                    <Select
                      name="departmentId"
                      value={selectedDeptId}
                      onValueChange={setSelectedDeptId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Cargo / Puesto
                    </Label>
                    <Select name="positionId">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cargo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {filteredPositions.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Horario Asignado
                    </Label>
                    <Select name="workScheduleId">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar horario..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {schedules.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} ({s.entryTime} - {s.exitTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-2 pt-4">
                  <Phone size={18} /> Información de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Teléfono
                    </Label>
                    <Input name="phone" placeholder="7777-7777" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                      Email
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES FULL WIDTH */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] pb-2 pt-2">
                  <FileText size={18} /> Observaciones
                </h3>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase opacity-60 tracking-widest">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    name="notes"
                    rows={3}
                    placeholder="Cualquier información relevante..."
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8 mt-6 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="px-8 flex items-center gap-3"
              >
                {formLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                {formLoading
                  ? "Procesando Registro..."
                  : "Confirmar y Guardar Empleado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: NUEVA CONFIGURACIÓN --- */}
      <Dialog
        open={isConfigModalOpen.open}
        onOpenChange={(open) =>
          setIsConfigModalOpen({ ...isConfigModalOpen, open })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isConfigModalOpen.type === "dept"
                ? "Nuevo Depto"
                : isConfigModalOpen.type === "pos"
                  ? "Nuevo Cargo"
                  : "Nuevo Horario"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateConfig} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Nombre / Título</Label>
              <Input
                name={isConfigModalOpen.type === "pos" ? "title" : "name"}
                required
              />
            </div>

            {isConfigModalOpen.type === "pos" && (
              <div className="space-y-1.5">
                <Label>Asociar a Departamento</Label>
                <Select name="departmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Sin departamento (General)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Sin departamento (General)
                    </SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isConfigModalOpen.type === "sch" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Entrada</Label>
                  <Input name="entryTime" type="time" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Salida</Label>
                  <Input name="exitTime" type="time" required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Minutos Descanso</Label>
                  <Input
                    name="breakMinutes"
                    type="number"
                    defaultValue="60"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Descripción (Opcional)</Label>
                <Textarea name="description" rows={3} className="resize-none" />
              </div>
            )}
            <Button type="submit" disabled={formLoading} className="w-full">
              {formLoading ? "Creando..." : "Guardar Configuración"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* --- MODAL: DETALLES / EDICIÓN DE EMPLEADO --- */}
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-[var(--border)] bg-[var(--bg)]/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                {selectedEmployee?.fullName.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-[var(--text-main)] text-left">
                  {selectedEmployee?.fullName}
                </DialogTitle>
                <p className="text-sm font-mono text-[var(--text-sec)] text-left mt-1">
                  {selectedEmployee?.employeeCode} •{" "}
                  {selectedEmployee?.position?.title || "Sin Cargo"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {selectedEmployee && (
              <Tabs
                value={detailsTab}
                onValueChange={(val: any) => setDetailsTab(val)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6 p-1 bg-[var(--bg)] rounded-xl">
                  <TabsTrigger value="datos" className="py-2.5">
                    Datos Generales
                  </TabsTrigger>
                  <TabsTrigger value="expediente" className="py-2.5">
                    Expediente Digital
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="datos" className="space-y-6">
                  <form onSubmit={handleEditEmployee} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-2">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Nombre Completo *
                          </Label>
                          <Input
                            name="fullName"
                            required
                            defaultValue={selectedEmployee.fullName}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              DUI
                            </Label>
                            <Input
                              name="dui"
                              defaultValue={selectedEmployee.dui || ""}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              NIT
                            </Label>
                            <Input
                              name="nit"
                              defaultValue={selectedEmployee.nit || ""}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              Género
                            </Label>
                            <Select
                              name="gender"
                              defaultValue={selectedEmployee.gender || "OTRO"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MASCULINO">
                                  Masculino
                                </SelectItem>
                                <SelectItem value="FEMENINO">
                                  Femenino
                                </SelectItem>
                                <SelectItem value="OTRO">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              Nacimiento
                            </Label>
                            <Input
                              name="birthDate"
                              type="date"
                              defaultValue={
                                selectedEmployee.birthDate
                                  ? new Date(selectedEmployee.birthDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Dirección
                          </Label>
                          <Textarea
                            name="address"
                            rows={2}
                            defaultValue={selectedEmployee.address || ""}
                            className="resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              Teléfono
                            </Label>
                            <Input
                              name="phone"
                              defaultValue={selectedEmployee.phone || ""}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase opacity-60">
                              Email
                            </Label>
                            <Input
                              name="email"
                              type="email"
                              defaultValue={selectedEmployee.email || ""}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Sucursal *
                          </Label>
                          <Select
                            name="branchId"
                            defaultValue={String(
                              selectedEmployee.branchId || "",
                            )}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Departamento
                          </Label>
                          <Select
                            name="departmentId"
                            defaultValue={
                              selectedEmployee.departmentId
                                ? String(selectedEmployee.departmentId)
                                : "none"
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ninguno</SelectItem>
                              {departments.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Cargo
                          </Label>
                          <Select
                            name="positionId"
                            defaultValue={
                              selectedEmployee.positionId
                                ? String(selectedEmployee.positionId)
                                : "none"
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione cargo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ninguno</SelectItem>
                              {positions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Tipo de Contrato
                          </Label>
                          <Select
                            name="employmentType"
                            defaultValue={
                              selectedEmployee.employmentType ||
                              "TIEMPO_COMPLETO"
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TIEMPO_COMPLETO">
                                Tiempo Completo
                              </SelectItem>
                              <SelectItem value="MEDIO_TIEMPO">
                                Medio Tiempo
                              </SelectItem>
                              <SelectItem value="TEMPORAL">Temporal</SelectItem>
                              <SelectItem value="POR_HORA">Por Hora</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase opacity-60">
                            Fecha de Contratación *
                          </Label>
                          <Input
                            name="hireDate"
                            type="date"
                            required
                            defaultValue={
                              selectedEmployee.hireDate
                                ? new Date(selectedEmployee.hireDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="px-6"
                      >
                        {formLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="expediente" className="space-y-6">
                  <div className="p-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                      <Download size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Subir Documento</h3>
                      <p className="text-sm text-[var(--text-sec)]">
                        Selecciona o arrastra un archivo PDF, JPG o PNG
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase opacity-60">
                          Tipo
                        </Label>
                        <Select disabled defaultValue="CONTRATO">
                          <SelectTrigger className="opacity-70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONTRATO">CONTRATO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase opacity-60">
                          Nombre Documento
                        </Label>
                        <Input
                          disabled
                          placeholder="Ej. Contrato 2024"
                          className="opacity-70"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase opacity-60">
                          Expiración
                        </Label>
                        <Input disabled type="date" className="opacity-70" />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      disabled
                      className="mt-4 border-[var(--accent)] text-[var(--accent)]"
                    >
                      Seleccionar Archivo (Próximamente)
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-sm">Archivos Actuales</h3>
                      <Badge variant="outline">0 Archivos</Badge>
                    </div>
                    <div className="text-center py-12 bg-[var(--bg)]/50 rounded-2xl border border-[var(--border)]">
                      <FileText size={40} className="mx-auto opacity-10 mb-3" />
                      <p className="text-xs text-[var(--text-sec)]">
                        No hay documentos registrados aún
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* --- MODAL: CAMBIO DE ESTADO --- */}
      <Dialog
        open={!!(statusChangeModal.employee && statusChangeModal.newStatus)}
        onOpenChange={(open) =>
          !open && setStatusChangeModal({ employee: null, newStatus: null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-[var(--accent)]" />
              Cambiar Estado a {statusChangeModal.newStatus}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus} className="space-y-6 pt-4">
            <div className="space-y-1.5">
              <Label>Notas / Motivo (Opcional)</Label>
              <Textarea
                name="notes"
                rows={4}
                placeholder="Justificación del cambio de estado..."
                className="resize-none"
              />
            </div>
            <Button type="submit" disabled={formLoading} className="w-full">
              {formLoading ? "Guardando..." : "Confirmar Cambio"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
