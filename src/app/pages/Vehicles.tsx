import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Truck, Package, Car, Bike, Circle, Edit2, Trash2, Power, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../config/api';
import { Vehicle, VehicleStatus, VehicleType } from '../types/transport';
import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS, vehicleStatusColor } from '../utils/transport';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { NumberInput } from '../components/ui/number-input';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';

export default function Vehicles() {
  const { user } = useAuth();
  const { branches } = useBranch();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'ALL'>('ALL');

  const [showDialog, setShowDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [saving, setSaving] = useState(false);

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newStatus, setNewStatus] = useState<VehicleStatus>('DISPONIBLE');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let endpoint = `/vehicles?limit=100`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'ALL') endpoint += `&status=${statusFilter}`;
      if (typeFilter !== 'ALL') endpoint += `&type=${typeFilter}`;

      const res = await apiRequest<any>(endpoint);
      const dataObj = res.data || res;
      setVehicles(Array.isArray(dataObj) ? dataObj : (dataObj.items || []));
    } catch (e: any) {
      toast.error('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: VehicleType) => {
    switch (type) {
      case 'CAMION': return <Truck size={20} />;
      case 'FURGON': return <Package size={20} />;
      case 'PICKUP': return <Car size={20} />;
      case 'MOTOCICLETA': return <Bike size={20} />;
      default: return <Circle size={20} />;
    }
  };

  const handleSave = async () => {
    if (!editingVehicle?.plate || !editingVehicle?.brand || !editingVehicle?.model) {
      toast.error('Placa, marca y modelo son obligatorios');
      return;
    }
    setSaving(true);
    try {
      if (editingVehicle.id) {
        await apiRequest(`/vehicles/${editingVehicle.id}`, {
          method: 'PATCH',
          body: JSON.stringify(editingVehicle),
        });
        toast.success('Vehículo actualizado');
      } else {
        const payload = { ...editingVehicle };
        delete payload.status;
        await apiRequest('/vehicles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Vehículo registrado correctamente');
      }
      setShowDialog(false);
      fetchVehicles();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar vehículo');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedVehicle) return;
    setUpdatingStatus(true);
    try {
      await apiRequest(`/vehicles/${selectedVehicle.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('Estado actualizado');
      setShowStatusDialog(false);
      fetchVehicles();
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setDeleting(true);
    try {
      await apiRequest(`/vehicles/${selectedVehicle.id}`, { method: 'DELETE' });
      toast.success('Vehículo eliminado');
      setShowDeleteDialog(false);
      fetchVehicles();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar vehículo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Flota de Vehículos</h1>
          <p className="text-[var(--text-sec)]">Gestiona camiones, furgones y pickups para entregas.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingVehicle({ type: 'CAMION', branchId: user?.branchId });
            setShowDialog(true);
          }} 
          className="font-bold gap-2 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
        >
          <Plus size={18} /> Agregar Vehículo
        </Button>
      </div>

      <Card className="p-4 border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-2 w-full md:max-w-xs space-y-1.5">
            <Label className="text-xs font-bold text-[var(--text-sec)] uppercase">Buscar</Label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
              <Input 
                placeholder="Placa, marca, conductor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-[var(--bg)]"
              />
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-1.5">
            <Label className="text-xs font-bold text-[var(--text-sec)] uppercase">Tipo</Label>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="bg-[var(--bg)]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(VEHICLE_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <Label className="text-xs font-bold text-[var(--text-sec)] uppercase">Estado</Label>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="bg-[var(--bg)]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {Object.entries(VEHICLE_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-[var(--bg)]/50 border border-[var(--border)]"></div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--text-sec)] border rounded-2xl border-dashed">
          <Truck size={48} className="mb-4 opacity-20" />
          <p className="font-medium">No se encontraron vehículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
          {(Array.isArray(vehicles) ? vehicles : []).map(vehicle => (
            <Card key={vehicle.id} className="overflow-hidden border-[var(--border)] flex flex-col transition-all hover:shadow-md hover:border-[var(--primary)]/50">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${vehicleStatusColor(vehicle.status).split(' ')[0]} ${vehicleStatusColor(vehicle.status).split(' ')[1]}`}>
                      {getTypeIcon(vehicle.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-wider">{vehicle.plate}</h3>
                      <p className="text-sm font-bold text-[var(--text-sec)]">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-bold border ${vehicleStatusColor(vehicle.status)}`}>
                    {VEHICLE_STATUS_LABELS[vehicle.status]}
                  </Badge>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-sm border-b border-dashed border-[var(--border)] pb-2">
                    <span className="text-[var(--text-sec)]">Tipo</span>
                    <span className="font-bold text-[var(--text-main)]">{VEHICLE_TYPE_LABELS[vehicle.type]}</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-[var(--text-sec)]">Capacidad</span>
                    <span className="font-bold text-[var(--text-main)]">
                      {vehicle.capacityKg ? `${vehicle.capacityKg} kg` : '-'}
                      {vehicle.capacityM3 ? ` / ${vehicle.capacityM3} m³` : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-[var(--bg)]/50 border-t border-[var(--border)] flex justify-between gap-2">
                <Button 
                  variant="ghost" size="sm" className="flex-1 font-bold text-[var(--text-sec)]"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setNewStatus(vehicle.status);
                    setShowStatusDialog(true);
                  }}
                >
                  <Power size={14} className="mr-2" /> Estado
                </Button>
                <Button 
                  variant="ghost" size="sm" className="flex-1 font-bold text-[var(--text-main)]"
                  onClick={() => {
                    setEditingVehicle(vehicle);
                    setShowDialog(true);
                  }}
                >
                  <Edit2 size={14} className="mr-2" /> Editar
                </Button>
                <Button 
                  variant="ghost" size="sm" className="flex-1 font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 size={14} className="mr-2" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-[var(--card)] border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Truck className="text-[var(--primary)]" />
              {editingVehicle?.id ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
            </DialogTitle>
            <DialogDescription className="hidden">Completa los datos del vehículo</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Placa *</Label>
              <Input 
                value={editingVehicle?.plate || ''} 
                onChange={e => setEditingVehicle({ ...editingVehicle, plate: e.target.value.toUpperCase() })}
                placeholder="Ej. P-123456"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={editingVehicle?.type || 'CAMION'} 
                onValueChange={(v: VehicleType) => setEditingVehicle({ ...editingVehicle, type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VEHICLE_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Input 
                value={editingVehicle?.brand || ''} 
                onChange={e => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                placeholder="Ej. Isuzu"
              />
            </div>
            <div className="space-y-2">
              <Label>Modelo *</Label>
              <Input 
                value={editingVehicle?.model || ''} 
                onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                placeholder="Ej. NQR"
              />
            </div>

            <div className="space-y-2">
              <Label>Año</Label>
              <NumberInput 
                value={editingVehicle?.year || 2020} 
                min={1990} max={2030}
                onValueChange={v => setEditingVehicle({ ...editingVehicle, year: v || 2020 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sucursal Asignada</Label>
              <Select 
                value={editingVehicle?.branchId ? String(editingVehicle.branchId) : 'none'}
                onValueChange={v => setEditingVehicle({ ...editingVehicle, branchId: v === 'none' ? undefined : Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sucursal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No asignada (General)</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Capacidad (Kg)</Label>
              <NumberInput 
                value={editingVehicle?.capacityKg || 0} 
                min={0}
                onValueChange={v => setEditingVehicle({ ...editingVehicle, capacityKg: v || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label>Volumen (m³)</Label>
              <NumberInput 
                value={editingVehicle?.capacityM3 || 0} 
                min={0}
                onValueChange={v => setEditingVehicle({ ...editingVehicle, capacityM3: v || undefined })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] text-white font-bold">
              {saving ? 'Guardando...' : 'Guardar Vehículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STATUS DIALOG */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar Estado</DialogTitle>
            <DialogDescription>
              {selectedVehicle?.plate} - {selectedVehicle?.brand}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedVehicle?.status === 'EN_RUTA' && newStatus !== 'EN_RUTA' && (
              <div className="bg-amber-100 text-amber-800 p-3 rounded-lg flex items-start gap-2 text-sm font-medium">
                <AlertTriangle size={16} className="mt-0.5" />
                <span>Este vehículo está en ruta. Cambiar su estado podría afectar la logística.</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={(v: VehicleStatus) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VEHICLE_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancelar</Button>
            <Button onClick={handleStatusChange} disabled={updatingStatus || newStatus === selectedVehicle?.status} className="font-bold">
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 size={20} /> Eliminar Vehículo
            </DialogTitle>
            <DialogDescription className="hidden">Confirma la eliminación del vehículo</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-[var(--text-main)]">
            ¿Estás seguro de eliminar el vehículo con placa <strong className="text-destructive">{selectedVehicle?.plate}</strong>? Esta acción no se puede deshacer.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="font-bold">
              {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
