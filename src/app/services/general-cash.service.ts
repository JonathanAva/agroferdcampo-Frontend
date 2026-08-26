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
}

export interface GeneralCashSummary {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
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
  getDailyClose: async (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return await apiRequest(`${BASE}/daily-close?${params.toString()}`);
  }
};
