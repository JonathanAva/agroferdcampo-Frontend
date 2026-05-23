import { VehicleType, VehicleStatus, RouteStatus, DeliveryNoteStatus } from '../types/transport';

// Textos en español para los enums
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  CAMION: 'Camión',
  FURGON: 'Furgón',
  PICKUP: 'Pickup',
  MOTOCICLETA: 'Motocicleta',
  OTRO: 'Otro',
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  DISPONIBLE: 'Disponible',
  EN_RUTA: 'En ruta',
  MANTENIMIENTO: 'Mantenimiento',
  INACTIVO: 'Inactivo',
};

export const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  PLANIFICADA: 'Planificada',
  EN_PROCESO: 'En proceso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export const DELIVERY_NOTE_STATUS_LABELS: Record<DeliveryNoteStatus, string> = {
  EMITIDO: 'Emitido',
  ENTREGADO: 'Entregado',
  CON_DIFERENCIAS: 'Con diferencias',
  CANCELADO: 'Cancelado',
};

// Colores para badges
export const vehicleStatusColor = (status: VehicleStatus): string => ({
  DISPONIBLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200',
  EN_RUTA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
  MANTENIMIENTO: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
  INACTIVO: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
}[status]);

export const routeStatusColor = (status: RouteStatus): string => ({
  PLANIFICADA: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200',
  EN_PROCESO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
  COMPLETADA: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200',
  CANCELADA: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
}[status]);

export const deliveryNoteStatusColor = (status: DeliveryNoteStatus): string => ({
  EMITIDO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200',
  ENTREGADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200',
  CON_DIFERENCIAS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
  CANCELADO: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
}[status]);
