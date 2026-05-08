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
  Package
} from 'lucide-react';
import { apiRequest } from '../config/api';
import { toast } from 'sonner';

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

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'EFECTIVO' | 'TARJETA' | 'CREDITO'>('EFECTIVO');

  // Debounce search
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

  const searchProducts = async (query: string) => {
    setLoading(true);
    try {
      // Usamos el endpoint de búsqueda optimizado para POS
      const data = await apiRequest<any[]>(`/catalog/products/search?q=${encodeURIComponent(query)}`);
      
      // Transformar datos para la UI del POS
      const mapped = data.map(p => ({
        id: p.id,
        internalCode: p.internalCode || p.barcode || 'S/C',
        name: p.name,
        // Buscamos el precio público en la sucursal actual o el global
        price: Number(p.prices?.find((pr: any) => pr.priceType === 'PUBLICO')?.price || p.price || 0),
        // El stock viene del objeto inventory que devuelve el backend filtrado por sucursal
        stock: Number(p.inventory?.[0]?.quantity || 0),
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
  const subtotal = total / 1.13; // Asumiendo IVA del 13%
  const iva = total - subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Aquí iría el POST a /sales con los items del carrito
      // Por ahora simulamos el éxito y limpiamos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Venta procesada exitosamente');
      setCart([]);
      setSearchTerm('');
      setProducts([]);
    } catch (error) {
      toast.error('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
          Punto de Venta
        </h1>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border bg-[var(--card)]" style={{ borderColor: 'var(--border)', color: 'var(--text-sec)' }}>
           <Package size={14} />
           <span>Sucursal Central</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Product List */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search */}
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 shadow-sm transition-all focus-within:border-[var(--accent)]"
            style={{ 
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <Search size={20} style={{ color: 'var(--text-sec)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código o escanea código de barras..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--text-main)' }}
            />
            {loading && <div className="animate-spin h-4 w-4 border-2 border-[var(--accent)] border-t-transparent rounded-full" />}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {products.length === 0 && searchTerm.length < 2 && (
              <div className="flex flex-col items-center justify-center h-64 opacity-30">
                <Search size={64} className="mb-4" />
                <p className="text-xl font-medium">Escribe para buscar productos</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-1 group"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    opacity: product.stock <= 0 ? 0.6 : 1
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-lg leading-tight" style={{ color: 'var(--text-main)' }}>
                        {product.name}
                      </p>
                      <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-sec)' }}>
                        {product.internalCode} • {product.category.name}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                      <Plus size={18} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge 
                      className="rounded-full px-3 py-1 font-bold text-[10px] uppercase border-none"
                      style={{ 
                        backgroundColor: product.stock > 10 ? 'var(--success-bg)' : product.stock > 0 ? '#fef3c7' : 'var(--error-bg)',
                        color: product.stock > 10 ? 'var(--success-text)' : product.stock > 0 ? '#92400e' : 'var(--error-red)'
                      }}
                    >
                      {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Agotado'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div 
          className="flex flex-col rounded-2xl border p-6 shadow-xl"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[var(--accent)] text-white">
              <ShoppingCart size={20} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Carrito ({cart.length})
            </h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto mb-4 space-y-3 pr-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-sec)' }}>
                <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center mb-4">
                  <ShoppingCart size={32} className="opacity-20" />
                </div>
                <p className="font-medium">El carrito está vacío</p>
                <p className="text-xs opacity-60">Agrega productos para comenzar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-main)' }}>
                        {item.name}
                      </p>
                      <p className="text-[10px] font-medium opacity-60" style={{ color: 'var(--text-sec)' }}>
                        P.U. ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-[var(--bg)] transition-colors"
                      >
                        <Minus size={14} style={{ color: 'var(--text-sec)' }} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-[var(--bg)] transition-colors"
                      >
                        <Plus size={14} style={{ color: 'var(--accent)' }} />
                      </button>
                    </div>
                    <span className="font-black text-[var(--accent)]">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-sec)' }}>Subtotal:</span>
                  <span style={{ color: 'var(--text-main)' }} className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-sec)' }}>IVA (13%):</span>
                  <span style={{ color: 'var(--text-main)' }} className="font-medium">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-1">
                  <span style={{ color: 'var(--text-main)' }}>Total</span>
                  <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--text-sec)' }}>
                  Método de Pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'EFECTIVO', label: 'Efectivo', icon: DollarSign },
                    { id: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
                    { id: 'CREDITO', label: 'Crédito', icon: User }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPayment(id as any)}
                      className="p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all"
                      style={{
                        backgroundColor: selectedPayment === id ? 'var(--accent)' : 'var(--bg)',
                        borderColor: selectedPayment === id ? 'var(--accent)' : 'var(--border)',
                        color: selectedPayment === id ? '#ffffff' : 'var(--text-main)'
                      }}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff'
                }}
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Printer size={20} />
                    PROCESAR VENTA
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
