import { TruckIcon, Phone, Mail } from 'lucide-react';

const MOCK_SUPPLIERS = [
  { id: '1', name: 'Agroquímicos del Pacífico', contact: 'Ing. Roberto López', phone: '2222-5555', email: 'ventas@agropac.com', products: 'Fertilizantes, Herbicidas' },
  { id: '2', name: 'Semillas Centroamericanas S.A.', contact: 'Lic. María Gómez', phone: '2222-6666', email: 'info@semillas-ca.com', products: 'Semillas Certificadas' },
  { id: '3', name: 'Herramientas Agrícolas', contact: 'Sr. Juan Pérez', phone: '2222-7777', email: 'contacto@herramientas.com', products: 'Herramientas, Equipos' },
];

export function Suppliers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Proveedores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SUPPLIERS.map((supplier) => (
          <div 
            key={supplier.id}
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
                <TruckIcon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-main)' }}>{supplier.name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-sec)' }}>{supplier.contact}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-sec)' }}>
                <Phone size={16} />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-sec)' }}>
                <Mail size={16} />
                <span>{supplier.email}</span>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Productos:</p>
              <p className="text-sm" style={{ color: 'var(--text-sec)' }}>{supplier.products}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
