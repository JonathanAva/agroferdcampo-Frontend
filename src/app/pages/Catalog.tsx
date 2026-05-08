import React, { useState, useEffect } from 'react';
import {
  Store, Search, Plus, Trash2, PackagePlus, Tag, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Edit } from 'lucide-react';
import { cn } from '../components/ui/utils';
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
  id?: number;
  priceType: string;
  branchId: number | null;
  price: string | number;
}

interface CatalogProduct {
  id: number;
  name: string;
  internalCode?: string;
  barcode?: string;
  description?: string;
  unit: string;
  trackStock: boolean;
  isActive: boolean;
  category?: { id: number; name: string };
  prices: ProductPrice[];
  inventory?: { branchId: number; quantity: string; minStock: string }[];
}

interface Category {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface StockRow {
  branchId: string;
  quantity: string;
  minStock: string;
}

interface PriceRow {
  priceType: string;
  branchId: string; // 'global' = null (precio global), o string del branchId
  price: string;
}

const UNITS = ['UNIDAD', 'KG', 'LB', 'QUINTAL', 'CAJA', 'LITRO'];
const PRICE_TYPES = ['PUBLICO', 'MAYOREO', 'ESPECIAL'];

function getPublicPrice(prices: ProductPrice[]): string {
  const pub = prices.find(p => p.priceType === 'PUBLICO');
  if (pub) return Number(pub.price).toFixed(2);
  if (prices.length > 0) return Number(prices[0].price).toFixed(2);
  return '0.00';
}

// ── Component ──────────────────────────────────────────────────────────────────
export function Catalog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [name, setName] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('UNIDAD');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [trackStock, setTrackStock] = useState(true);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [prices, setPrices] = useState<PriceRow[]>([{ priceType: 'PUBLICO', branchId: 'global', price: '' }]);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);

  const isOwner = user?.roleId === 1;
  const canCreate = user?.roleId === 1 || user?.roleId === 2;

  useEffect(() => { fetchData(); }, [showInactive]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '100');
      if (showInactive) {
        queryParams.append('isActive', 'false');
      }

      const [prodData, catData, brData] = await Promise.all([
        apiRequest<{ data: CatalogProduct[]; total: number }>(`/catalog/products?${queryParams.toString()}`),
        apiRequest<Category[]>('/catalog/categories').catch(() => []),
        apiRequest<Branch[]>('/branches').catch(() => []),
      ]);

      let allProducts = Array.isArray(prodData?.data) ? prodData.data : [];
      
      if (showInactive) {
        const activeRes = await apiRequest<{ data: CatalogProduct[] }>('/catalog/products?isActive=true&limit=100');
        if (activeRes?.data) {
          allProducts = [...allProducts, ...activeRes.data];
        }
      }

      setProducts(allProducts);
      setCategories(Array.isArray(catData) ? catData : []);
      setBranches(Array.isArray(brData) ? brData : []);
    } catch {
      toast.error('Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName(''); setInternalCode(''); setBarcode(''); setDescription('');
    setUnit('UNIDAD'); setCategoryId(''); setTrackStock(true);
    setCostPrice('');
    setPrices([{ priceType: 'PUBLICO', branchId: 'global', price: '' }]);
    setStockRows([]);
  };

  const openDialog = (product?: CatalogProduct) => {
    resetForm();
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setInternalCode(product.internalCode || '');
      setBarcode(product.barcode || '');
      setDescription(product.description || '');
      setUnit(product.unit);
      setCategoryId(product.category?.id ? String(product.category.id) : '');
      setTrackStock(product.trackStock);
      // Map prices
      if (product.prices && product.prices.length > 0) {
        setPrices(product.prices.map(p => ({
          priceType: p.priceType,
          branchId: p.branchId === null ? 'global' : String(p.branchId),
          price: String(p.price)
        })));
      }
    }
    setIsDialogOpen(true);
  };

  // ── Price rows helpers ──
  const addPrice = () => setPrices(p => [...p, { priceType: 'MAYOREO', branchId: 'global', price: '' }]);
  const removePrice = (i: number) => setPrices(p => p.filter((_, idx) => idx !== i));
  const updatePrice = (i: number, field: keyof PriceRow, val: string) =>
    setPrices(p => p.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  // ── Stock rows helpers ──
  const addStockRow = () => setStockRows(s => [...s, { branchId: '', quantity: '', minStock: '' }]);
  const removeStockRow = (i: number) => setStockRows(s => s.filter((_, idx) => idx !== i));
  const updateStock = (i: number, field: keyof StockRow, val: string) =>
    setStockRows(s => s.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const handleToggleActive = async (id: number) => {
    try {
      await apiRequest(`/catalog/products/${id}/toggle`, { method: 'PATCH' });
      toast.success('Estado actualizado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto? (Eliminación lógica)')) return;
    try {
      await apiRequest(`/catalog/products/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar producto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('El nombre es obligatorio');
    if (prices.some(p => !p.price || Number(p.price) <= 0)) return toast.error('Todos los precios deben ser mayores a 0');

    const body: Record<string, unknown> = {
      name: name.trim(),
      unit,
      trackStock,
      categoryId: categoryId ? Number(categoryId) : null,
      costPrice: costPrice ? Number(costPrice) : null,
    };
    if (internalCode.trim()) body.internalCode = internalCode.trim();
    if (barcode.trim()) body.barcode = barcode.trim();
    if (description.trim()) body.description = description.trim();

    // Si es nuevo, incluimos precios y stock inicial en la misma llamada
    if (!editingProduct) {
      body.prices = prices.map(p => ({
        priceType: p.priceType,
        branchId: p.branchId === 'global' || !p.branchId ? null : Number(p.branchId),
        price: Number(p.price),
      }));

      const validStock = stockRows.filter(s => s.branchId && Number(s.quantity) > 0);
      if (validStock.length > 0) {
        body.initialStock = validStock.map(s => ({
          branchId: Number(s.branchId),
          quantity: Number(s.quantity),
          minStock: s.minStock ? Number(s.minStock) : 0,
        }));
      }
    }

    setFormLoading(true);
    try {
      if (editingProduct) {
        // Actualizar datos básicos
        await apiRequest(`/catalog/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });

        // Actualizar precios uno por uno (o podrías optimizar esto en el backend)
        for (const p of prices) {
          await apiRequest(`/catalog/products/${editingProduct.id}/prices`, {
            method: 'POST',
            body: JSON.stringify({
              priceType: p.priceType,
              branchId: p.branchId === 'global' || !p.branchId ? null : Number(p.branchId),
              price: Number(p.price),
            })
          });
        }
        toast.success('Producto actualizado exitosamente');
      } else {
        await apiRequest('/catalog/products', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Producto creado exitosamente');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setFormLoading(true);
    try {
      await apiRequest('/catalog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      toast.success('Categoría creada exitosamente');
      setNewCatName('');
      setIsCatDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la categoría');
    } finally {
      setFormLoading(false);
    }
  };


  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.internalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-accent animate-pulse">
        <Store size={48} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Catálogo</h1>
          <p style={{ color: 'var(--text-sec)' }}>Gestión de productos y precios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            <PackagePlus size={16} />
            Ver Inventario
          </Button>
          {canCreate && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCatDialogOpen(true)} className="gap-2">
                <Tag size={16} />
                Nueva Categoría
              </Button>
              <Button 
                onClick={() => openDialog()} 
                size="lg"
                className="gap-2 font-bold shadow-md"
                style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
              >
                <Plus size={16} />
                Nuevo Producto
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Productos', value: products.length, icon: Store, color: 'var(--accent)' },
          { label: 'Activos', value: products.filter(p => p.isActive).length, icon: ToggleRight, color: '#10b981' },
          { label: 'Categorías', value: new Set(products.map(p => p.category?.name).filter(Boolean)).size, icon: Tag, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border flex items-center gap-4 shadow-sm"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-sec)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl border mb-6 shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-1 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <Search size={20} className="text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código o categoría..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-3 bg-[var(--bg)] px-4 py-2 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
             <Label htmlFor="show-inactive" className="text-sm font-medium cursor-pointer text-muted-foreground">
                Ver inactivos
             </Label>
             <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
             />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
              <TableHead className="p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Producto</TableHead>
              <TableHead className="p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Categoría</TableHead>
              <TableHead className="p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Unidad</TableHead>
              <TableHead className="p-4 font-semibold text-right" style={{ color: 'var(--text-main)' }}>Precio Público</TableHead>
              <TableHead className="p-4 font-semibold text-center" style={{ color: 'var(--text-main)' }}>Estado</TableHead>
              <TableHead className="p-4 font-semibold text-center" style={{ color: 'var(--text-main)' }}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(product => (
              <TableRow key={product.id} className="hover:bg-[var(--bg)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                <TableCell className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>{product.name}</span>
                    <span className="text-xs font-mono opacity-60" style={{ color: 'var(--text-sec)' }}>
                      {product.internalCode || product.barcode || 'SIN-CÓDIGO'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <span className="text-sm px-2 py-0.5 rounded-lg border bg-[var(--bg)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
                    {product.category?.name || 'General'}
                  </span>
                </TableCell>
                <TableCell className="p-4">
                  <span className="text-sm font-mono" style={{ color: 'var(--text-sec)' }}>{product.unit}</span>
                </TableCell>
                <TableCell className="p-4 text-right">
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>
                    ${getPublicPrice(product.prices)}
                  </span>
                </TableCell>
                <TableCell className="p-4 text-center">
                  <div className="flex justify-center">
                    <Badge
                      onClick={() => handleToggleActive(product.id)}
                      variant={product.isActive ? "default" : "destructive"}
                      className={cn(
                        "cursor-pointer hover:opacity-80 transition-all px-3 py-1 font-bold text-[10px] uppercase",
                        product.isActive && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                      )}
                    >
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(product)}
                      className="text-blue-500 hover:bg-blue-50">
                      <Tag size={16} />
                    </Button>
                    {isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-12 text-center" style={{ color: 'var(--text-sec)' }}>
            No se encontraron productos en el catálogo.
          </div>
        )}
      </div>

      {/* Dialog Crear/Editar Producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-main)' }}>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifica los detalles del producto y sus precios.' : 'Ingresa los detalles del nuevo producto, incluyendo precios y stock inicial.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Info básica */}
            <div className="p-4 rounded-xl border space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
              <p className="text-xs font-bold uppercase opacity-60" style={{ color: 'var(--text-sec)' }}>Información del Producto</p>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--text-main)' }}>Nombre <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Fertilizante 18-46-0"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--text-main)' }}>Código Interno</Label>
                  <Input
                    value={internalCode}
                    onChange={e => setInternalCode(e.target.value)}
                    placeholder="FERT-001"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--text-main)' }}>Código de Barras</Label>
                  <Input
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    placeholder="7501234567890"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--text-main)' }}>Unidad <span className="text-red-500">*</span></Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: 'var(--text-main)' }}>Categoría</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}>
                      <SelectValue placeholder="Sin categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: 'var(--text-main)' }}>Descripción</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción del producto..."
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                />
              </div>

              {!editingProduct && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label style={{ color: 'var(--text-main)' }}>Costo de Adquisición</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-[10px] opacity-50" style={{ color: 'var(--text-sec)' }}>Lo que te cuesta comprarlo (Opcional)</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTrackStock(v => !v)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl border",
                    trackStock 
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md" 
                      : "bg-[var(--card)] border-[var(--border)] text-muted-foreground hover:border-[var(--color-accent)]"
                  )}
                >
                  {trackStock ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  {trackStock ? 'Rastrear inventario' : 'Sin rastreo de inventario'}
                </button>
              </div>
            </div>

            {/* Precios */}
            <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase opacity-60" style={{ color: 'var(--text-sec)' }}>Precios</p>
                <Button type="button" variant="outline" size="sm" onClick={addPrice}>
                  <Plus size={14} /> Agregar precio
                </Button>
              </div>
              {prices.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Tipo</Label>
                    <Select value={row.priceType} onValueChange={v => updatePrice(i, 'priceType', v)}>
                      <SelectTrigger style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Sucursal</Label>
                    <Select value={row.branchId} onValueChange={v => updatePrice(i, 'branchId', v)}>
                      <SelectTrigger style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}>
                        <SelectValue placeholder="Global" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global (todas las sucursales)</SelectItem>
                        {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Precio de Venta</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={row.price}
                      onChange={e => updatePrice(i, 'price', e.target.value)}
                      placeholder="0.00"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {prices.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removePrice(i)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stock Inicial (solo nuevo) */}
            {!editingProduct && trackStock && (
              <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase opacity-60" style={{ color: 'var(--text-sec)' }}>Stock Inicial</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-sec)' }}>Opcional — deja vacío para agregar stock después</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addStockRow}>
                    <Plus size={14} /> Agregar sucursal
                  </Button>
                </div>
                {stockRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Sucursal</Label>
                      <Select value={row.branchId} onValueChange={v => updateStock(i, 'branchId', v)}>
                        <SelectTrigger style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.quantity}
                        onChange={e => updateStock(i, 'quantity', e.target.value)}
                        placeholder="0"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs" style={{ color: 'var(--text-sec)' }}>Stock Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.minStock}
                        onChange={e => updateStock(i, 'minStock', e.target.value)}
                        placeholder="0"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStockRow(i)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}
                style={{ backgroundColor: 'var(--color-accent)' }} className="text-white font-bold shadow-lg px-8">
                {formLoading ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Gestionar Categorías */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
            <DialogDescription>
              Crea o elimina categorías para organizar tus productos.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Formulario Crear */}
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Nombre de la Nueva Categoría</Label>
                <div className="flex gap-2">
                  <Input
                    id="catName"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Ej: Fertilizantes..."
                    required
                  />
                  <Button type="submit" disabled={formLoading} style={{ backgroundColor: 'var(--accent)' }} className="text-white">
                    {formLoading ? '...' : <Plus size={18} />}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <Label>Categorías Existentes</Label>
              <div className="max-h-[200px] overflow-y-auto rounded-xl border p-2 space-y-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                {categories.length === 0 && (
                  <p className="text-xs text-center py-4 opacity-50" style={{ color: 'var(--text-sec)' }}>Sin categorías registradas.</p>
                )}
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card)] transition-colors group">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{cat.name}</span>
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Eliminar categoría "${cat.name}"?`)) return;
                        try {
                          await apiRequest(`/catalog/categories/${cat.id}`, { method: 'DELETE' });
                          toast.success('Categoría eliminada');
                          fetchData();
                        } catch (err: any) {
                          toast.error(err.message || 'No se puede eliminar la categoría');
                        }
                      }}
                      className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsCatDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
