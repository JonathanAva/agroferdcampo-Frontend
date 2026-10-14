import { apiRequest } from '../config/api';

const BASE = '/general-cash';

export interface GeneralCashEntry {
  id: number;
  type: 'INGRESO' | 'EGRESO';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  date: string;
  createdAt: string;
  previousBalance?: number;
  newBalance?: number;
  cashRegisterId?: number | null;
  paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO' | 'CONTRAENTREGA';
  saleId?: number | null;
  creditPaymentId?: number | null;
  purchaseId?: number | null;
  user?: { id: number; fullName: string };
  /** ANULADO: se conserva en el historial pero no suma en saldos ni totales */
  status?: 'ACTIVO' | 'ANULADO';
  voidedAt?: string | null;
  voidReason?: string | null;
  voidedBy?: { id: number; fullName: string } | null;
}

/** Categorías generadas por otros módulos: se anulan desde su origen, no desde Finanzas */
const NON_VOIDABLE_CATEGORIES = ['AJUSTE_APERTURA', 'AJUSTE_CIERRE', 'REPOSICION_CAJA_CHICA', 'DEVOLUCION_EFECTIVO'];

/** null si se puede anular desde Finanzas; si no, el motivo para mostrar al usuario */
export function cashEntryVoidBlocker(entry: GeneralCashEntry): string | null {
  if (entry.status === 'ANULADO') return 'Ya está anulado';
  if (entry.saleId) return `Pertenece a la Venta #${entry.saleId}: anúlala desde Historial de Ventas`;
  if (entry.creditPaymentId) return 'Pertenece a un abono: anúlalo desde Cuentas por Cobrar → Historial de Pagos';
  if (NON_VOIDABLE_CATEGORIES.includes(entry.category)) return 'Movimiento automático: no se anula desde aquí';
  return null;
}

export interface GeneralCashSummary {
  /** Totales del periodo filtrado, solo efectivo */
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  /** Saldo real de efectivo de la caja (sin filtro de fechas); mismo valor que usa el POS */
  currentCashBalance: number | null;
  byPaymentMethod?: { paymentMethod: string; ingresos: number; egresos: number; net: number }[];
}

export const generalCashService = {
  create: async (data: { type: string, category: string, amount: number, description: string, reference?: string, date?: string, cashRegisterId?: number | null }) => {
    return await apiRequest(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  findAll: async (filters: { startDate?: string, endDate?: string, type?: string, category?: string, page?: number, limit?: number, cashRegisterId?: string | number | null }) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.cashRegisterId !== undefined && filters.cashRegisterId !== null) {
      params.append('cashRegisterId', String(filters.cashRegisterId));
    }
    
    return await apiRequest<{ data: GeneralCashEntry[], total: number, page: number, totalPages: number }>(`${BASE}?${params.toString()}`);
  },
  getSummary: async (startDate?: string, endDate?: string, cashRegisterId?: string | number | null): Promise<GeneralCashSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (cashRegisterId !== undefined && cashRegisterId !== null) {
      params.append('cashRegisterId', String(cashRegisterId));
    }
    
    return await apiRequest<GeneralCashSummary>(`${BASE}/summary?${params.toString()}`);
  },
  /** Anula un movimiento: queda en el historial como ANULADO y deja de contar en el saldo */
  voidEntry: async (id: number, reason: string): Promise<GeneralCashEntry> => {
    return await apiRequest<GeneralCashEntry>(`${BASE}/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  getDailyClose: async (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return await apiRequest(`${BASE}/daily-close?${params.toString()}`);
  }
};
