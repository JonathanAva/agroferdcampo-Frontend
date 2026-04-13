import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User,
  CreditCard,
  DollarSign,
  Printer
} from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'FRT-001', name: 'Fertilizante 20-20-20 (50kg)', price: 45.00, stock: 120, category: 'Fertilizantes' },
  { id: '2', code: 'SEM-001', name: 'Semilla de Maíz Premium', price: 25.50, stock: 85, category: 'Semillas' },
  { id: '3', code: 'HRB-001', name: 'Herbicida Glifosato (1L)', price: 18.75, stock: 45, category: 'Agroquímicos' },
  { id: '4', code: 'HER-001', name: 'Pala Cuadrada Reforzada', price: 12.00, stock: 30, category: 'Herramientas' },
  { id: '5', code: 'FRT-002', name: 'Abono Orgánico (25kg)', price: 15.00, stock: 200, category: 'Fertilizantes' },
];

export function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'credit'>('cash');

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const subtotal = total / 1.13; // Asumiendo IVA del 13%
  const iva = total - subtotal;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    alert(`Venta procesada!\nTotal: $${total.toFixed(2)}\nMétodo: ${
      selectedPayment === 'cash' ? 'Efectivo' : 
      selectedPayment === 'card' ? 'Tarjeta' : 'Crédito'
    }`);
    setCart([]);
  };

  return (
    <div className="h-full">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
        Punto de Venta
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Product List */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search */}
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg border mb-4"
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
              placeholder="Buscar por nombre o código..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--text-main)' }}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 rounded-xl border text-left transition-all hover:-translate-y-1"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                        {product.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
                        {product.code}
                      </p>
                    </div>
                    <Plus size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <span 
                      className="text-sm px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: product.stock > 20 ? '#d1fae5' : '#fef3c7',
                        color: product.stock > 20 ? '#065f46' : '#92400e'
                      }}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div 
          className="flex flex-col rounded-2xl border p-6"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart size={24} style={{ color: 'var(--accent)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
              Carrito ({cart.length})
            </h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto mb-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--text-sec)' }}>
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm flex-1" style={{ color: 'var(--text-main)' }}>
                      {item.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded"
                        style={{ backgroundColor: 'var(--card)' }}
                      >
                        <Minus size={14} style={{ color: 'var(--text-sec)' }} />
                      </button>
                      <span className="w-8 text-center font-semibold" style={{ color: 'var(--text-main)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded"
                        style={{ backgroundColor: 'var(--card)' }}
                      >
                        <Plus size={14} style={{ color: 'var(--accent)' }} />
                      </button>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <>
              <div 
                className="py-4 mb-4 space-y-2 border-t border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-sec)' }}>Subtotal:</span>
                  <span style={{ color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-sec)' }}>IVA (13%):</span>
                  <span style={{ color: 'var(--text-main)' }}>${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span style={{ color: 'var(--text-main)' }}>Total:</span>
                  <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Método de Pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: DollarSign },
                    { id: 'card', label: 'Tarjeta', icon: CreditCard },
                    { id: 'credit', label: 'Crédito', icon: User }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPayment(id as any)}
                      className="p-3 rounded-lg border flex flex-col items-center gap-1 transition-all"
                      style={{
                        backgroundColor: selectedPayment === id ? 'var(--accent)' : 'var(--bg)',
                        borderColor: selectedPayment === id ? 'var(--accent)' : 'var(--border)',
                        color: selectedPayment === id ? '#ffffff' : 'var(--text-main)'
                      }}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff'
                }}
              >
                <Printer size={20} />
                Procesar Venta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
