import { apiRequest } from '../config/api';

const BASE = '/api/v1/general-cash';

export interface GeneralCashEntry {
  id: number;
  type: 'INGRESO' | 'EGRESO';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  date: string;
  createdAt: string;
}

export interface GeneralCashSummary {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}

export const generalCashService = {
  create: async (data: { type: string, category: string, amount: number, description: string, reference?: string, date?: string }) => {
    return await apiRequest(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  findAll: async (filters: { startDate?: string, endDate?: string, type?: string, category?: string, page?: number, limit?: number }) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return await apiRequest<{ data: GeneralCashEntry[], total: number, page: number, totalPages: number }>(`${BASE}?${params.toString()}`);
  },
  getSummary: async (startDate?: string, endDate?: string): Promise<GeneralCashSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest<GeneralCashSummary>(`${BASE}/summary?${params.toString()}`);
  },
  getDailyClose: async (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return await apiRequest(`${BASE}/daily-close?${params.toString()}`);
  }
};
