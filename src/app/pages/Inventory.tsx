import React, { useState, useEffect } from 'react';
import {
  Package, Search, TrendingUp, TrendingDown, AlertCircle, ArrowLeftRight,
  ClipboardList, ChevronDown, Store, Trash2, PackagePlus, ArrowUpRight, ArrowDownLeft, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProductPrice {
  priceType: string;
  branchId: number | null;
  price: string | number;
}

interface Product {
  id: number;
  name: string;
  internalCode?: string;
  barcode?: string;
  prices?: ProductPrice[];
  category?: { name: string };
  unit: string;
}

function getPublicPrice(product: Product): number {
  if (product.prices && product.prices.length > 0) {
    const pub = product.prices.find(p => p.priceType === 'PUBLICO');
    return Number(pub ? pub.price : product.prices[0].price);
  }
  return 0;
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

// ── Component ──────────────────────────────────────────────────────────────────
export function Inventory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Roles & Permissions (Define early to avoid ReferenceErrors)
  const isOwner = user?.roleId === 1;
  const isAdmin = user?.roleId === 2;
  const canAdjust = isOwner || isAdmin || user?.roleId === 5;
  const canTransfer = isOwner || isAdmin;

  // 2. Main States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'low' | 'critical'>('all');

  // 3. Modals state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 4. Form states
  const [adjustData, setAdjustData] = useState({ type: 'COMPRA', quantity: '', reference: '' });
  const [transferData, setTransferData] = useState({ toBranchId: '', quantity: '', reference: '' });

  // 5. New Entry Form states
  const [entrySearch, setEntrySearch] = useState('');
  const [entryProducts, setEntryProducts] = useState<Product[]>([]);
  const [entrySelectedProduct, setEntrySelectedProduct] = useState<Product | null>(null);
  const [entryQty, setEntryQty] = useState('');
  const [entryBranchId, setEntryBranchId] = useState('');
  const [entryRef, setEntryRef] = useState('');

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
      setIsAdjustOpen(false);
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
      setIsTransferOpen(false);
      setTransferData({ toBranchId: '', quantity: '', reference: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar traslado');
    } finally {
      setFormLoading(false);
    }
  };

  const searchEntryProducts = async (q: string) => {
    if (q.length < 2) return setEntryProducts([]);
    try {
      const data = await apiRequest<any[]>(`/catalog/products/search?q=${encodeURIComponent(q)}`);
      setEntryProducts(data);
    } catch {
      toast.error('Error al buscar productos');
    }
  };

  const handleNewEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrySelectedProduct || !entryQty) return;

    setFormLoading(true);
    try {
      await apiRequest('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: entrySelectedProduct.id,
          quantity: Number(entryQty),
          type: 'COMPRA',
          reference: entryRef || 'Ingreso manual de mercadería',
        })
      });
      toast.success('Mercadería cargada exitosamente');
      setIsNewEntryOpen(false);
      // Reset
      setEntrySelectedProduct(null);
      setEntrySearch('');
      setEntryQty('');
      setEntryRef('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar mercadería');
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
  const totalValue = inventory.reduce((sum, i) => sum + (Number(i.quantity) * getPublicPrice(i.product)), 0);

  const getStatusBadge = (item: InventoryItem) => {
    const status = getProductStatus(item);
    if (status === 'active') return <Badge variant="default">En Stock</Badge>;
    if (status === 'low') return <Badge variant="warning">Stock Bajo</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-accent animate-pulse">
        <Package size={48} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Inventario</h1>
          <p style={{ color: 'var(--text-sec)' }}>Manejo de existencias físicas por sucursal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            <Store size={16} />
            Ir al Catálogo
          </Button>
          {canAdjust && (
            <Button onClick={() => setIsNewEntryOpen(true)} style={{ backgroundColor: 'var(--color-accent)' }} className="text-white font-bold shadow-lg h-10 px-6">
              <Plus size={16} />
              Nuevo Ingreso
            </Button>
          )}
        </div>
      </div>

      {/* Modal Nuevo Ingreso (Para productos que pueden o no estar en la tabla aún) */}
      <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleNewEntry}>
            <DialogHeader>
              <DialogTitle>Ingreso de Mercadería</DialogTitle>
              <DialogDescription>
                Busca un producto del catálogo para cargar stock en una sucursal.
              </DialogDescription>
            </DialogHeader>

              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-70">Buscar Producto</Label>
                  <div className="relative">
                    <Input
                      placeholder="Nombre o código..."
                      value={entrySearch}
                      onChange={(e) => {
                        setEntrySearch(e.target.value);
                        searchEntryProducts(e.target.value);
                      }}
                    />
                    {entryProducts.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-[var(--card)] border rounded-xl shadow-xl max-h-48 overflow-auto animate-in fade-in zoom-in-95 duration-200">
                        {entryProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left p-3 hover:bg-muted border-b last:border-0 transition-colors"
                            onClick={() => {
                              setEntrySelectedProduct(p);
                              setEntrySearch(p.name);
                              setEntryProducts([]);
                            }}
                          >
                            <p className="font-bold text-sm">{p.name}</p>
                            <p className="text-[10px] opacity-60">{p.internalCode || 'S/C'}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              {entrySelectedProduct && (
                <div className="p-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                   <p className="text-xs font-bold text-[var(--accent)]">Seleccionado: {entrySelectedProduct.name}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-70">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={entryQty}
                    onChange={(e) => setEntryQty(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-muted-foreground">Se cargará en la sucursal actual: <span className="font-bold text-[var(--color-accent)]">{user?.branch || 'Cargando...'}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referencia / Documento</Label>
                <Input
                  value={entryRef}
                  onChange={(e) => setEntryRef(e.target.value)}
                  placeholder="Ej. Factura Compra #..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading || !entrySelectedProduct || !entryQty} 
                style={{ backgroundColor: 'var(--color-accent)' }} 
                className="text-white font-bold shadow-lg h-11"
              >
                {formLoading ? 'Procesando...' : 'Cargar Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Productos', value: totalItemsCount, icon: Package, color: 'var(--accent)', bg: 'var(--accent)' },
          { label: 'Stock Bajo', value: lowStockCount, icon: TrendingDown, color: '#f59e0b', bg: '#f59e0b' },
          { label: 'Críticos', value: criticalStockCount, icon: AlertCircle, color: '#ef4444', bg: '#ef4444' },
          { label: 'Valor Total', value: `$${totalValue.toLocaleString()}`, icon: TrendingUp, color: '#10b981', bg: '#10b981' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${bg}18`, color }}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="p-4 rounded-2xl border mb-6 shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-1 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <Search size={20} className="text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código o categoría..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-9"
            />
          </div>

          <div className="flex items-center gap-3">
             <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
               <SelectTrigger className="w-[200px]" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                 <SelectValue placeholder="Filtrar por estado" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos los estados</SelectItem>
                 <SelectItem value="active">En Stock (Normal)</SelectItem>
                 <SelectItem value="low">Stock Bajo</SelectItem>
                 <SelectItem value="critical">Crítico / Sin Stock</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Producto</TableHead>
                <TableHead className="font-semibold text-foreground">Categoría</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Existencia</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Estado</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Precio Público</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-[var(--bg)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.product.internalCode || item.product.barcode || 'SIN-CODIGO'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.product.category?.name || 'General'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold" style={{ color: Number(item.quantity) <= Number(item.minStock) ? 'var(--error-red)' : 'var(--color-accent)' }}>
                        {Number(item.quantity)}
                      </span>
                      <span className="text-[10px] uppercase opacity-50 font-bold text-muted-foreground">
                        Min: {Number(item.minStock)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(item)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold">
                      ${getPublicPrice(item.product).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {canAdjust && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setIsAdjustOpen(true); }}
                          className="hover:text-[var(--color-accent)] transition-all text-muted-foreground">
                          <ClipboardList size={18} />
                        </Button>
                      )}
                      {canTransfer && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setIsTransferOpen(true); }}
                          className="hover:text-emerald-500 transition-all text-muted-foreground">
                          <ArrowLeftRight size={18} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center" style={{ color: 'var(--text-sec)' }}>
              No se encontraron productos en el inventario.
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajustar Stock */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedItem && (
            <form onSubmit={handleAdjust}>
              <DialogHeader>
                <DialogTitle>Movimiento de Inventario</DialogTitle>
                <DialogDescription>
                  Registra una entrada, salida o ajuste manual para este producto.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-5">
                <div className="p-4 rounded-xl border flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{selectedItem.product.name}</p>
                    <p className="text-xs opacity-60" style={{ color: 'var(--text-sec)' }}>Stock actual: {Number(selectedItem.quantity)} {selectedItem.product.unit}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Movimiento</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: 'COMPRA', l: 'Compra', icon: ArrowDownLeft, color: 'emerald' },
                        { v: 'VENTA', l: 'Venta', icon: ArrowUpRight, color: 'red' },
                        { v: 'AJUSTE', l: 'Ajuste', icon: ClipboardList, color: 'blue' }
                      ].map(t => (
                        <button
                          key={t.v}
                          type="button"
                          onClick={() => setAdjustData({...adjustData, type: t.v})}
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all",
                            adjustData.type === t.v 
                              ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md" 
                              : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:bg-[var(--bg)]"
                          )}
                        >
                          <t.icon size={16} />
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qty">Cantidad</Label>
                    <Input
                      id="qty"
                      type="number"
                      step="0.01"
                      required
                      value={adjustData.quantity}
                      onChange={(e) => setAdjustData({...adjustData, quantity: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase opacity-70">Referencia (Opcional)</Label>
                    <Textarea
                      id="ref"
                      rows={2}
                      value={adjustData.reference}
                      onChange={(e) => setAdjustData({...adjustData, reference: e.target.value})}
                      placeholder="Ej. Factura #123, Ajuste por merma..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading} style={{ backgroundColor: 'var(--color-accent)' }} className="text-white font-bold shadow-lg h-11 px-8">
                  {formLoading ? 'Procesando...' : 'Aplicar Movimiento'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Transferencia */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedItem && (
            <form onSubmit={handleTransfer}>
              <DialogHeader>
                <DialogTitle>Traslado de Mercadería</DialogTitle>
                <DialogDescription>
                  Envía productos de esta sucursal a otra de forma segura.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-5">
                <div className="p-4 rounded-xl border bg-emerald-500/5 flex flex-col items-center gap-3 border-emerald-500/10">
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
                  <div className="space-y-2">
                    <Label>Sucursal Destino</Label>
                    <Select value={transferData.toBranchId} onValueChange={v => setTransferData({...transferData, toBranchId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona sucursal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.filter(b => b.id !== selectedItem.branchId).map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        required
                        max={Number(selectedItem.quantity)}
                        value={transferData.quantity}
                        onChange={(e) => setTransferData({...transferData, quantity: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>UDM</Label>
                      <div className="h-9 flex items-center px-4 rounded-md border bg-[var(--bg)] font-bold text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
                        {selectedItem.product.unit}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Referencia</Label>
                    <Input
                      type="text"
                      value={transferData.reference}
                      onChange={(e) => setTransferData({...transferData, reference: e.target.value})}
                      placeholder="Ej. Reabastecimiento urgente..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading || !transferData.toBranchId} style={{ backgroundColor: 'var(--color-accent)' }} className="text-white font-bold shadow-lg h-11 px-8">
                  {formLoading ? 'Enviando...' : 'Confirmar Envío'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
