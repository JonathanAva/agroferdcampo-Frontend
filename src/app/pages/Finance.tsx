import { Wallet, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', description: 'Venta - Factura #00123', amount: 245.00, date: '2026-03-30', status: 'paid' },
  { id: '2', type: 'income', description: 'Pago Cliente - Hacienda El Progreso', amount: 1250.00, date: '2026-03-30', status: 'paid' },
  { id: '3', type: 'expense', description: 'Compra Proveedor - Agroquímicos Pacífico', amount: 3500.00, date: '2026-03-29', status: 'pending' },
  { id: '4', type: 'income', description: 'Venta - Factura #00122', amount: 89.50, date: '2026-03-29', status: 'paid' },
  { id: '5', type: 'expense', description: 'Pago Servicios - Electricidad', amount: 125.00, date: '2026-03-28', status: 'paid' },
];

export function Finance() {
  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const pending = MOCK_TRANSACTIONS.filter(t => t.status === 'pending').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Finanzas y Cartera</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Wallet size={24} style={{ color: 'var(--accent)' }} className="mb-3" />
          <p className="text-sm mb-1" style={{ color: 'var(--text-sec)' }}>Balance Total</p>
          <p className="text-2xl font-bold" style={{ color: balance >= 0 ? 'var(--accent)' : '#ef4444' }}>
            ${balance.toFixed(2)}
          </p>
        </div>

        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <TrendingUp size={24} style={{ color: 'var(--accent)' }} className="mb-3" />
          <p className="text-sm mb-1" style={{ color: 'var(--text-sec)' }}>Ingresos</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>${totalIncome.toFixed(2)}</p>
        </div>

        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <DollarSign size={24} style={{ color: '#ef4444' }} className="mb-3" />
          <p className="text-sm mb-1" style={{ color: 'var(--text-sec)' }}>Gastos</p>
          <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>${totalExpense.toFixed(2)}</p>
        </div>

        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Clock size={24} style={{ color: '#f59e0b' }} className="mb-3" />
          <p className="text-sm mb-1" style={{ color: 'var(--text-sec)' }}>Pendientes</p>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{pending}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Movimientos Recientes</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: transaction.type === 'income' ? '#d1fae5' : '#fee2e2'
                    }}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp size={20} style={{ color: '#065f46' }} />
                    ) : (
                      <DollarSign size={20} style={{ color: '#991b1b' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                      {transaction.description}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
                      {transaction.date}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p 
                    className="text-lg font-bold"
                    style={{ color: transaction.type === 'income' ? 'var(--accent)' : '#ef4444' }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: transaction.status === 'paid' ? '#d1fae5' : '#fef3c7',
                      color: transaction.status === 'paid' ? '#065f46' : '#92400e'
                    }}
                  >
                    {transaction.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
