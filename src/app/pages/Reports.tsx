import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

const REPORT_TYPES = [
  { id: '1', title: 'Reporte de Ventas Diarias', description: 'Detalle de todas las ventas del día por sucursal', icon: FileText },
  { id: '2', title: 'Reporte de Inventario', description: 'Estado actual del inventario y movimientos', icon: FileText },
  { id: '3', title: 'Reporte de Cartera', description: 'Cuentas por cobrar y antigüedad de saldos', icon: FileText },
  { id: '4', title: 'Reporte de Rentabilidad', description: 'Análisis de rentabilidad por producto', icon: TrendingUp },
  { id: '5', title: 'Reporte de Cierres de Caja', description: 'Histórico de cierres por cajero', icon: FileText },
  { id: '6', title: 'Reporte Consolidado Mensual', description: 'Resumen general de operaciones del mes', icon: Calendar },
];

export function Reports() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report) => (
          <div 
            key={report.id}
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
                <report.icon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
                  {report.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
                  {report.description}
                </p>
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <Download size={18} />
              Generar Reporte
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
