import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User,
  CreditCard,
  DollarSign,
  Printer,
  Package,
  UserPlus,
  X
} from 'lucide-react';
import { apiRequest } from '../config/api';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CustomerQuickCreate } from '../components/customers/CustomerQuickCreate';
import { cn } from '../components/ui/utils';
import { useAuth } from '../context/AuthContext';

// --- Types ---
interface Product {
  id: number;
  internalCode: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface Customer {
  id: number;
  name: string;
  customerType: string;
  nit?: string;
  documentNumber?: string;
  creditBalance: string | number;
}

export function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'EFECTIVO' | 'TARJETA' | 'CREDITO'>('EFECTIVO');

  // Customer State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Debounce product search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchProducts(searchTerm);
      } else if (searchTerm.trim().length === 0) {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Debounce customer search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (customerSearch.trim().length >= 2) {
        searchCustomers(customerSearch);
      } else {
        setCustomerResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  const searchProducts = async (query: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>(`/catalog/products/search?q=${encodeURIComponent(query)}`);
      const mapped = data.map(p => ({
        id: p.id,
        internalCode: p.internalCode || p.barcode || 'S/C',
        name: p.name,
        price: Number(p.prices?.find((pr: any) => pr.priceType === 'PUBLICO')?.price || p.price || 0),
        stock: Number(p.stock || 0),
        category: p.category || { name: 'General' },
        unit: p.unit
      }));
      setProducts(mapped);
    } catch (error) {
      toast.error('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    setSearchingCustomer(true);
    try {
      // Usamos el endpoint específico de búsqueda rápida para POS
      // apiRequest ya desempaqueta el { success: true, data: [...] }
      const data = await apiRequest<Customer[]>(`/customers/search?q=${encodeURIComponent(query)}`);
      setCustomerResults(data || []);
    } catch (error) {
      // Silencioso para no molestar mientras escribe
    } finally {
      setSearchingCustomer(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay más stock disponible');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    if (newQuantity > item.stock) {
      toast.error('Excede el stock disponible');
      return;
    }
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const subtotal = total / 1.13;
  const iva = total - subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomer?.id,
          paymentMethod: selectedPayment,
          totalAmount: total,
          taxAmount: iva,
          items: cart.map(i => ({ 
            productId: i.id, 
            quantity: i.quantity, 
            unitPrice: i.price 
          }))
        })
      });
      
      toast.success('Venta procesada exitosamente');
      setCart([]);
      setSearchTerm('');
      setProducts([]);
      setSelectedCustomer(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
            Punto de Venta
          </h1>
          <p className="text-sm text-[var(--text-sec)]">Genera facturas y créditos fiscales al instante.</p>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border bg-[var(--card)]" style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
          <Package size={16} />
          <span className="font-bold">{user?.branch || 'Sucursal'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Product List Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 shadow-sm bg-[var(--card)]" style={{ borderColor: 'var(--border)' }}>
            <Search size={20} style={{ color: 'var(--text-sec)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="F1: Buscar productos o escanear código..."
              className="flex-1 bg-transparent outline-none text-lg"
              style={{ color: 'var(--text-main)' }}
            />
            {loading && <div className="animate-spin h-5 w-5 border-2 border-[var(--accent)] border-t-transparent rounded-full" />}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-[0.98] group bg-[var(--card)]"
                  style={{ 
                    borderColor: 'var(--border)',
                    opacity: product.stock <= 0 ? 0.6 : 1
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-lg leading-tight" style={{ color: 'var(--text-main)' }}>{product.name}</p>
                      <p className="text-xs font-mono mt-1 opacity-60" style={{ color: 'var(--text-sec)' }}>{product.internalCode} • {product.category.name}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                      <Plus size={18} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-black text-[var(--accent)]">${product.price.toFixed(2)}</span>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase">{product.stock} {product.unit}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Customer Section */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Customer Selector */}
          <div className="p-4 rounded-2xl border bg-[var(--card)] shadow-md" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <User size={16} /> Cliente
              </h3>
              {!selectedCustomer && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] gap-1 text-[var(--accent)] hover:bg-[var(--accent)]/10"
                  onClick={() => setIsQuickCreateOpen(true)}
                >
                  <UserPlus size={14} /> Registro Rápido
                </Button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-main)' }}>{selectedCustomer.name}</p>
                    <p className="text-[10px] opacity-60" style={{ color: 'var(--text-sec)' }}>{selectedCustomer.customerType} • {selectedCustomer.nit || selectedCustomer.documentNumber || 'Sin Doc'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedCustomer(null)}>
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                <Input 
                  placeholder="Buscar por Nombre o NIT..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9 h-10 text-sm bg-[var(--bg)]"
                />
                {searchingCustomer && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-3 w-3 border border-[var(--accent)] border-t-transparent rounded-full" />}
                
                {customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-xl max-h-48 overflow-y-auto divide-y">
                    {customerResults.map(c => (
                      <button 
                        key={c.id} 
                        className="w-full text-left p-2.5 hover:bg-[var(--bg)] transition-colors flex flex-col"
                        onClick={() => { setSelectedCustomer(c); setCustomerResults([]); setCustomerSearch(''); }}
                      >
                        <span className="text-sm font-bold">{c.name}</span>
                        <span className="text-[10px] opacity-60">{c.customerType} • {c.nit || c.documentNumber || 'Final'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="flex-1 flex flex-col rounded-2xl border bg-[var(--card)] shadow-xl min-h-0 overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[var(--accent)]" />
                <h2 className="font-bold">Resumen de Venta</h2>
              </div>
              <Badge variant="secondary" className="font-bold">{cart.length} items</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <ShoppingCart size={48} className="mb-2" />
                  <p className="text-sm">Carrito vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] group">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm leading-tight">{item.name}</p>
                      <button onClick={() => removeFromCart(item.id)} className="p-1 opacity-0 group-hover:opacity-100 text-red-400 transition-all"><X size={14}/></button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12}/></Button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={12}/></Button>
                      </div>
                      <span className="text-sm font-black text-[var(--accent)]">${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[var(--bg)]/30 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs opacity-60"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs opacity-60"><span>IVA (13%)</span><span>${iva.toFixed(2)}</span></div>
                <div className="flex justify-between text-2xl font-black text-[var(--accent)] pt-1 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['EFECTIVO', 'TARJETA', 'CREDITO'].map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method as any)}
                    className={cn(
                      "py-2 rounded-xl border text-[10px] font-bold transition-all",
                      selectedPayment === method ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md" : "bg-white text-[var(--text-sec)]"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleCheckout} 
                disabled={loading || cart.length === 0}
                className="w-full py-6 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-black text-lg gap-3 shadow-lg shadow-[var(--accent)]/20"
              >
                {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <><Printer size={22} /> PROCESAR VENTA</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CustomerQuickCreate 
        open={isQuickCreateOpen} 
        onOpenChange={setIsQuickCreateOpen} 
        onSuccess={(c) => { setSelectedCustomer(c); setCustomerSearch(''); }}
      />
    </div>
  );
}
