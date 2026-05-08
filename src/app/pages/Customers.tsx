import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Phone, Mail, CreditCard, 
  AlertCircle, Edit2, Trash2, MoreVertical
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { apiRequest } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { CustomerDialog } from '../components/customers/CustomerDialog';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge as UIBadge } from '../components/ui/badge';

// --- Types ---
interface Customer {
  id: number;
  name: string;
  customerType: 'CONSUMIDOR_FINAL' | 'CONTRIBUYENTE' | 'SUJETO_EXCLUIDO';
  nit?: string;
  nrc?: string;
  phone?: string;
  email?: string;
  creditLimit: string | number;
  creditBalance: string | number;
  isActive: boolean;
  comercialName?: string;
  documentNumber?: string;
  _count?: {
    sales: number;
    quotes: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function Customers() {
  const { user } = useAuth();
  const isAdmin = user?.roleId === 1 || user?.roleId === 2;

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, showInactive]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: showInactive ? 'all' : 'active',
      });

      if (searchTerm) query.append('search', searchTerm);

      const response = await apiRequest<any>(`/customers?${query.toString()}`);
      
      // La API devuelve directamente { data, total, page, limit, totalPages }
      // apiRequest desempaqueta el { success: true, data: ... } si existe.
      // Así que response es el objeto con la data.
      
      if (response && response.data) {
        setCustomers(response.data);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages
        });
      }
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de desactivar este cliente?')) return;
    try {
      await apiRequest(`/customers/${id}`, { method: 'DELETE' });
      toast.success('Cliente desactivado correctamente');
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo desactivar el cliente');
    }
  };

  const toggleStatus = async (customer: Customer) => {
    try {
      const newStatus = !customer.isActive;
      await apiRequest(`/customers/${customer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: newStatus }),
      });
      toast.success(`Cliente ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado del cliente');
    }
  };

  const totalCustomers = pagination?.total || 0;
  const totalCredit = customers.reduce((sum, c) => sum + Number(c.creditBalance), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
          Clientes
        </h1>
        <Button
          size="lg"
          className="gap-2 font-bold shadow-md"
          style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
          onClick={() => { setSelectedCustomer(null); setIsDialogOpen(true); }}
        >
          <Plus size={20} />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Users size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Total Clientes</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Users size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Clientes Activos</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <CreditCard size={24} style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Crédito Total</p>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Con Deuda</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{customers.filter(c => Number(c.creditBalance) > 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl border mb-4 shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <Search size={20} className="text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar clientes por nombre, NIT o NRC..."
            className="border-none bg-transparent shadow-none focus-visible:ring-0 h-9"
          />
        </div>
        <div className="flex items-center gap-2 mt-4 px-1">
          <Switch 
            id="show-inactive" 
            checked={showInactive} 
            onCheckedChange={setShowInactive} 
          />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer opacity-70">
            Mostrar clientes inactivos
          </Label>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Límite Crédito</TableHead>
                <TableHead className="text-right">Deuda Actual</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="p-8 text-center opacity-50">Cargando clientes...</TableCell></TableRow>
              ) : customers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="p-8 text-center opacity-50">No se encontraron clientes</TableCell></TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="border-b hover:bg-[var(--bg)]/30 transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <TableCell className="p-4">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {customer.customerType === 'CONSUMIDOR_FINAL' ? (customer.documentNumber || 'Consumidor Final') : (customer.nit || 'Sin NIT')}
                          {customer.nrc && ` • NRC: ${customer.nrc}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone size={12} className="opacity-60" />
                          <span>{customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail size={12} className="opacity-60" />
                          <span>{customer.email || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <span className="font-semibold">
                        ${Number(customer.creditLimit).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <span 
                        className={cn(
                          "font-bold",
                          Number(customer.creditBalance) > Number(customer.creditLimit) ? "text-destructive" : "text-[var(--color-accent)]"
                        )}
                      >
                        ${Number(customer.creditBalance).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-center">
                      <div className="flex justify-center">
                        <UIBadge 
                          onClick={() => toggleStatus(customer)}
                          variant={customer.isActive ? "default" : "destructive"}
                          className="cursor-pointer hover:opacity-80 transition-all"
                        >
                          {customer.isActive ? 'Activo' : 'Inactivo'}
                        </UIBadge>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedCustomer(customer); setIsDialogOpen(true); }}>
                              <Edit2 size={14} className="mr-2" /> Editar
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-red-500">
                                <Trash2 size={14} className="mr-2" /> Desactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Simple */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-2 bg-[var(--bg)]/10" style={{ borderColor: 'var(--border)' }}>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Anterior
            </Button>
            <div className="flex items-center px-4 text-sm font-medium">
              Página {currentPage} de {pagination.totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      <CustomerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        customer={selectedCustomer} 
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
