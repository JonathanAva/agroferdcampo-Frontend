export type VehicleType = 'CAMION' | 'FURGON' | 'PICKUP' | 'MOTOCICLETA' | 'OTRO';
export type VehicleStatus = 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO' | 'INACTIVO';
export type RouteStatus = 'PLANIFICADA' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
export type DeliveryNoteStatus = 'EMITIDO' | 'ENTREGADO' | 'CON_DIFERENCIAS' | 'CANCELADO';
export type DeliveryNoteType = 'CLIENTE' | 'TRASLADO_SUCURSAL';
export type DispatchType = 'TOTAL' | 'PARCIAL';

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  type: VehicleType;
  capacityKg?: number;
  capacityM3?: number;
  status: VehicleStatus;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  driverId?: number;
  driver?: { id: number; fullName: string; phone?: string; email?: string };
  branchId?: number;
  branch?: { id: number; name: string };
  photoUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { routes: number; deliveryNotes: number };
}

export interface DeliveryRoute {
  id: number;
  name: string;
  branchId: number;
  vehicleId: number;
  userId: number;
  status: RouteStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  zones?: string;
  notes?: string;
  vehicle?: Vehicle;
  user?: { id: number; fullName: string; phone?: string };
  deliveryNotes?: DeliveryNote[];
  _count?: { deliveryNotes: number };
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNote {
  id: number;
  number: string;
  type: DeliveryNoteType;
  status: DeliveryNoteStatus;
  saleId?: number;
  fromBranchId: number;
  toBranchId?: number;
  customerId?: number;
  userId: number;
  vehicleId?: number;
  routeId?: number;
  driverId?: number;
  dispatchType: DispatchType;
  requiresTransport: boolean;
  scheduledAt?: string;
  deliveryAddress?: string;
  clientSignedBy?: string;
  clientSignedAt?: string;
  notes?: string;
  issuedAt: string;
  deliveredAt?: string;
  vehicle?: Vehicle;
  route?: DeliveryRoute;
  driver?: { id: number; fullName: string; phone?: string; email?: string };
  customer?: { id: number; name: string; phone?: string; address?: string };
  toBranch?: { id: number; name: string };
  items?: DeliveryNoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNoteItem {
  id: number;
  deliveryNoteId: number;
  productId: number;
  quantity: number;
  receivedQty?: number;
  product?: { id: number; name: string; unit: string };
}

export interface RouteSheet {
  route: DeliveryRoute;
  vehicle: Vehicle;
  driver: { id: number; fullName: string; phone?: string };
  deliveryNotes: DeliveryNote[];
  summary: {
    total_stops: number;
    total_items: number;
    pending: number;
    delivered: number;
    withDifferences: number;
  };
}
