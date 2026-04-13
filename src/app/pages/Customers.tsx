import { useState } from 'react';
import { Users, Search, Plus, Phone, Mail, CreditCard, AlertCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  nit: string;
  phone: string;
  email: string;
  creditLimit: number;
  currentDebt: number;
  status: 'active' | 'blocked';
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Hacienda El Progreso', nit: '0614-123456-001-2', phone: '2222-1111', email: 'contacto@elprogreso.com', creditLimit: 5000, currentDebt: 1250, status: 'active' },
  { id: '2', name: 'Agropecuaria San José', nit: '0614-234567-001-3', phone: '2222-2222', email: 'ventas@sanjose.com', creditLimit: 3000, currentDebt: 2800, status: 'active' },
  { id: '3', name: 'Finca La Esperanza', nit: '0614-345678-001-4', phone: '2222-3333', email: 'info@laesperanza.com', creditLimit: 4000, currentDebt: 4200, status: 'blocked' },
  { id: '4', name: 'Don Carlos Martínez', nit: '0614-456789-001-5', phone: '7777-1234', email: 'carlos.m@email.com', creditLimit: 2000, currentDebt: 500, status: 'active' },
];

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nit.includes(searchTerm)
  );

  const totalCustomers = MOCK_CUSTOMERS.length;
  const activeCustomers = MOCK_CUSTOMERS.filter(c => c.status === 'active').length;
  const totalCredit = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.currentDebt, 0);
  const blockedCustomers = MOCK_CUSTOMERS.filter(c => c.status === 'blocked').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
          Clientes
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Users size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Total Clientes</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Users size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Clientes Activos</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <CreditCard size={24} style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Crédito Total</p>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>${totalCredit.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>Bloqueados</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{blockedCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
          <Search size={20} style={{ color: 'var(--text-sec)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar clientes por nombre o NIT..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Cliente</th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Contacto</th>
                <th className="text-right p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Límite Crédito</th>
                <th className="text-right p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Deuda Actual</th>
                <th className="text-center p-4 font-semibold" style={{ color: 'var(--text-main)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-main)' }}>{customer.name}</p>
                      <p className="text-sm font-mono" style={{ color: 'var(--text-sec)' }}>{customer.nit}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-sec)' }}>
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-sec)' }}>
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                      ${customer.creditLimit.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span 
                      className="font-semibold"
                      style={{ color: customer.currentDebt > customer.creditLimit ? '#ef4444' : 'var(--accent)' }}
                    >
                      ${customer.currentDebt.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: customer.status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: customer.status === 'active' ? '#065f46' : '#991b1b'
                      }}
                    >
                      {customer.status === 'active' ? 'Activo' : 'Bloqueado'}
                    </span>
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
