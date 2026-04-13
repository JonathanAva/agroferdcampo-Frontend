import { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Filter
} from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  status: 'active' | 'low' | 'critical';
}

const MOCK_INVENTORY: Product[] = [
  { id: '1', code: 'FRT-001', name: 'Fertilizante 20-20-20 (50kg)', category: 'Fertilizantes', stock: 120, minStock: 50, price: 45.00, cost: 35.00, status: 'active' },
  { id: '2', code: 'SEM-001', name: 'Semilla de Maíz Premium', category: 'Semillas', stock: 85, minStock: 100, price: 25.50, cost: 18.00, status: 'low' },
  { id: '3', code: 'HRB-001', name: 'Herbicida Glifosato (1L)', category: 'Agroquímicos', stock: 12, minStock: 30, price: 18.75, cost: 14.00, status: 'critical' },
  { id: '4', code: 'HER-001', name: 'Pala Cuadrada Reforzada', category: 'Herramientas', stock: 30, minStock: 20, price: 12.00, cost: 8.00, status: 'active' },
  { id: '5', code: 'FRT-002', name: 'Abono Orgánico (25kg)', category: 'Fertilizantes', stock: 200, minStock: 80, price: 15.00, cost: 11.00, status: 'active' },
  { id: '6', code: 'SEM-002', name: 'Semilla de Frijol Negro', category: 'Semillas', stock: 18, minStock: 40, price: 22.00, cost: 16.00, status: 'critical' },
  { id: '7', code: 'INS-001', name: 'Insecticida Cipermetrina', category: 'Agroquímicos', stock: 65, minStock: 30, price: 28.50, cost: 21.00, status: 'active' },
  { id: '8', code: 'HER-002', name: 'Machete 18 pulgadas', category: 'Herramientas', stock: 42, minStock: 25, price: 15.75, cost: 11.50, status: 'active' },
];

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'low' | 'critical'>('all');

  const filteredInventory = MOCK_INVENTORY.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalProducts = MOCK_INVENTORY.length;
  const lowStock = MOCK_INVENTORY.filter(p => p.status === 'low').length;
  const criticalStock = MOCK_INVENTORY.filter(p => p.status === 'critical').length;
  const totalValue = MOCK_INVENTORY.reduce((sum, p) => sum + (p.stock * p.cost), 0);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { bg: '#d1fae5', color: '#065f46', text: 'En Stock' },
      low: { bg: '#fef3c7', color: '#92400e', text: 'Stock Bajo' },
      critical: { bg: '#fee2e2', color: '#991b1b', text: 'Crítico' }
    };
    const style = styles[status as keyof typeof styles];
    
    return (
      <span 
        className="px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
          Inventario
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: '#ffffff'
          }}
        >
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <Package size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Total Productos</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{totalProducts}</p>
            </div>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <TrendingDown size={24} style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Stock Bajo</p>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{lowStock}</p>
            </div>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Stock Crítico</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{criticalStock}</p>
            </div>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Valor Total</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                ${totalValue.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div 
        className="p-4 rounded-xl border mb-4"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div 
            className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)'
            }}
          >
            <Search size={20} style={{ color: 'var(--text-sec)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--text-main)' }}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: 'var(--text-sec)' }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 rounded-lg border outline-none"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)'
              }}
            >
              <option value="all">Todos</option>
              <option value="active">En Stock</option>
              <option value="low">Stock Bajo</option>
              <option value="critical">Crítico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="border-b"
                style={{ 
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)'
                }}
              >
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Código</th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Producto</th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Categoría</th>
                <th className="text-center p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Stock</th>
                <th className="text-center p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Estado</th>
                <th className="text-right p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Precio</th>
                <th className="text-center p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((product) => (
                <tr 
                  key={product.id}
                  className="border-b transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="p-4">
                    <span className="font-mono text-sm" style={{ color: 'var(--text-sec)' }}>
                      {product.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>
                      {product.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span style={{ color: 'var(--text-sec)' }}>{product.category}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: product.status === 'critical' ? '#ef4444' :
                               product.status === 'low' ? '#f59e0b' :
                               'var(--accent)'
                      }}
                    >
                      {product.stock}
                    </span>
                    <span style={{ color: 'var(--text-sec)' }} className="text-sm">
                      {' '}/ {product.minStock}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-sec)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-sec)';
                        }}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
