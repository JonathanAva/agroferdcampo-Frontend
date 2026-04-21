import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Filter,
  ArrowLeftRight,
  ClipboardList,
  ChevronDown,
  X,
  Building2,
  Check,
} from 'lucide-react';
import { apiRequest } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';

interface Product {
  id: number;
  name: string;
  internalCode?: string;
  barcode?: string;
  price: string | number;
  costPrice: string | number;
  category?: { name: string };
  unit: string;
}

interface InventoryItem {
  id: number;
  productId: number;
  branchId: number;
  quantity: string | number;
  minStock: string | number;
  product: Product;
}

interface Branch {
  id: number;
  name: string;
}

const MOVEMENT_TYPES = [
  { value: 'COMPRA', label: 'Compra (Entrada)', isAdd: true },
  { value: 'VENTA', label: 'Venta (Salida)', isAdd: false },
  { value: 'AJUSTE', label: 'Ajuste Manual', isAdd: true },
];

export function Inventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'low' | 'critical'>('all');

  // Modals state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [adjustData, setAdjustData] = useState({
    type: 'COMPRA',
    quantity: '',
    reference: '',
  });

  const [transferData, setTransferData] = useState({
    toBranchId: '',
    quantity: '',
    reference: '',
  });

  const canAdjust = user?.roleId === 1 || user?.roleId === 2 || user?.roleId === 5;
  const canTransfer = user?.roleId === 1 || user?.roleId === 2;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invData, branchData] = await Promise.all([
        apiRequest<InventoryItem[]>('/inventory'),
        apiRequest<Branch[]>('/branches')
      ]);
      setInventory(invData);
      setBranches(branchData);
    } catch (error) {
      toast.error('Error al cargar datos de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setFormLoading(true);
    try {
      await apiRequest('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedItem.product.id,
          quantity: Number(adjustData.quantity),
          type: adjustData.type,
          reference: adjustData.reference || 'Ajuste manual',
        })
      });
      toast.success('Inventario actualizado');
      setIsAdjustModalOpen(false);
      setAdjustData({ type: 'COMPRA', quantity: '', reference: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al ajustar stock');
    } finally {
      setFormLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !transferData.toBranchId) return;

    setFormLoading(true);
    try {
      await apiRequest('/inventory/transfer', {
        method: 'POST',
        body: JSON.stringify({
          fromBranchId: selectedItem.branchId,
          toBranchId: Number(transferData.toBranchId),
          productId: selectedItem.product.id,
          quantity: Number(transferData.quantity),
          reference: transferData.reference || 'Traslado entre sucursales',
        })
      });
      toast.success('Traslado completado');
      setIsTransferModalOpen(false);
      setTransferData({ toBranchId: '', quantity: '', reference: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar traslado');
    } finally {
      setFormLoading(false);
    }
  };

  const getProductStatus = (item: InventoryItem) => {
    const qty = Number(item.quantity);
    const min = Number(item.minStock);
    if (qty <= 0) return 'critical';
    if (qty <= min) return 'low';
    return 'active';
  };

  const filteredInventory = inventory.filter(item => {
    const status = getProductStatus(item);
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.internalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalItemsCount = inventory.length;
  const lowStockCount = inventory.filter(i => getProductStatus(i) === 'low').length;
  const criticalStockCount = inventory.filter(i => getProductStatus(i) === 'critical').length;
  const totalValue = inventory.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.product.costPrice)), 0);

  const getStatusBadge = (item: InventoryItem) => {
    const status = getProductStatus(item);
    const styles = {
      active: { label: 'En Stock', color: 'var(--success-text)', bg: 'var(--success-bg)' },
      low: { label: 'Stock Bajo', color: '#92400e', bg: '#fef3c7' },
      critical: { label: 'Sin Stock / Crítico', color: 'var(--error-red)', bg: 'var(--error-bg)' }
    };
    const style = styles[status];
    
    return (
      <Badge 
        className="rounded-full px-3 py-1 font-bold text-[10px] uppercase border-none"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-accent animate-pulse">
        <Package size={48} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
            Inventario
          </h1>
          <p style={{ color: 'var(--text-sec)' }}>Manejo de stock por sucursal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>Total Productos</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{totalItemsCount}</p>
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>Stock Bajo</p>
            <p className="text-2xl font-bold text-amber-500">{lowStockCount}</p>
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>Críticos / Sin Stock</p>
            <p className="text-2xl font-bold text-red-500">{criticalStockCount}</p>
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>Valor Inventario</p>
            <p className="text-2xl font-bold text-emerald-500">${totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div 
        className="p-4 rounded-2xl border mb-6 shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div 
            className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all focus-within:border-[var(--accent)]"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <Search size={20} style={{ color: 'var(--text-sec)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código o categoría..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--text-main)' }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border outline-none bg-transparent font-medium cursor-pointer transition-all hover:bg-[var(--bg)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <option value="all">Todos los estados</option>
                <option value="active">En Stock (Normal)</option>
                <option value="low">Stock Bajo</option>
                <option value="critical">Crítico / Sin Stock</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div 
        className="rounded-2xl border border-separate overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr 
                className="border-b"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <th className="p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Producto</th>
                <th className="p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Categoría</th>
                <th className="p-4 font-semibold text-center" style={{ color: 'var(--text-main)' }}>Stock Actual</th>
                <th className="p-4 font-semibold text-center" style={{ color: 'var(--text-main)' }}>Estado</th>
                <th className="p-4 font-semibold text-right" style={{ color: 'var(--text-main)' }}>Precio</th>
                <th className="p-4 font-semibold text-center" style={{ color: 'var(--text-main)' }}>Operaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredInventory.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-[var(--bg)] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold" style={{ color: 'var(--text-main)' }}>{item.product.name}</span>
                      <span className="text-xs font-mono opacity-60" style={{ color: 'var(--text-sec)' }}>
                        {item.product.internalCode || item.product.barcode || 'SIN-CODIGO'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm px-2 py-0.5 rounded-lg border bg-[var(--bg)]" style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
                      {item.product.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold" style={{ color: Number(item.quantity) <= Number(item.minStock) ? 'var(--error-red)' : 'var(--accent)' }}>
                        {Number(item.quantity)}
                      </span>
                      <span className="text-[10px] uppercase opacity-50 font-bold" style={{ color: 'var(--text-sec)' }}>
                        Min: {Number(item.minStock)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(item)}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>
                      ${Number(item.product.price).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {canAdjust && (
                        <button
                          onClick={() => { setSelectedItem(item); setIsAdjustModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-all text-[var(--text-sec)]"
                          title="Ajustar Stock"
                        >
                          <ClipboardList size={20} />
                        </button>
                      )}
                      {canTransfer && (
                        <button
                          onClick={() => { setSelectedItem(item); setIsTransferModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-[var(--text-sec)]"
                          title="Trasladar a otra sucursal"
                        >
                          <ArrowLeftRight size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center" style={{ color: 'var(--text-sec)' }}>
              No se encontraron productos en el inventario.
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajustar Stock */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden scale-in-95 duration-200" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Movimiento de Inventario</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} style={{ color: 'var(--text-sec)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-[var(--bg)] border flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold">
                  {selectedItem.product.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{selectedItem.product.name}</p>
                  <p className="text-xs opacity-60" style={{ color: 'var(--text-sec)' }}>Stock actual: {Number(selectedItem.quantity)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Tipo de Movimiento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOVEMENT_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setAdjustData({...adjustData, type: t.value})}
                        className={cn(
                          "py-2 rounded-xl border text-xs font-bold transition-all",
                          adjustData.type === t.value 
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20" 
                            : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:bg-[var(--bg)]"
                        )}
                      >
                        {t.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData({...adjustData, quantity: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Referencia (Opcional)</label>
                  <textarea
                    rows={2}
                    value={adjustData.reference}
                    onChange={(e) => setAdjustData({...adjustData, reference: e.target.value})}
                    placeholder="Ej. Factura #123, Ajuste por merma..."
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)] resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border font-bold transition-all hover:bg-[var(--bg)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !adjustData.quantity}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {formLoading ? 'Procesando...' : 'Aplicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transferencia */}
      {isTransferModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden scale-in-95 duration-200" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Traslado entre Sucursales</h2>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ color: 'var(--text-sec)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div className="p-4 rounded-xl border bg-emerald-500/5 flex flex-col items-center gap-3 border-emerald-500/20">
                <div className="flex items-center gap-4 w-full">
                   <div className="flex-1 text-center bg-white p-2 rounded-lg shadow-sm border border-[var(--border)]">
                      <p className="text-[10px] uppercase font-bold opacity-50">Origen</p>
                      <p className="text-xs font-bold truncate">Actual</p>
                   </div>
                   <ArrowLeftRight className="text-emerald-500 shrink-0" size={24} />
                   <div className="flex-1 text-center bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold opacity-80">Destino</p>
                      <p className="text-xs font-bold truncate">Nueva</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-sec)' }}>
                  <Package size={14} />
                  <span>{selectedItem.product.name} (Disp: {Number(selectedItem.quantity)})</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Sucursal Destino</label>
                  <select
                    required
                    value={transferData.toBranchId}
                    onChange={(e) => setTransferData({...transferData, toBranchId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                  >
                    <option value="">Selecciona sucursal...</option>
                    {branches.filter(b => b.id !== selectedItem.branchId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Cantidad</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={Number(selectedItem.quantity)}
                      value={transferData.quantity}
                      onChange={(e) => setTransferData({...transferData, quantity: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>UDM</label>
                    <div className="w-full px-4 py-2.5 rounded-xl border bg-[var(--bg)] font-bold text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
                      {selectedItem.product.unit || 'UNID'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-70" style={{ color: 'var(--text-sec)' }}>Referencia</label>
                  <input
                    type="text"
                    value={transferData.reference}
                    onChange={(e) => setTransferData({...transferData, reference: e.target.value})}
                    placeholder="Ej. Reabastecimiento urgente..."
                    className="w-full px-4 py-2.5 rounded-xl border outline-none bg-transparent transition-all focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border font-bold transition-all hover:bg-[var(--bg)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !transferData.quantity || !transferData.toBranchId}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {formLoading ? 'Enviando...' : 'Confirmar Envío'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
