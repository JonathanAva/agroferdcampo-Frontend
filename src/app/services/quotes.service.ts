// src/app/services/quotes.service.ts
import { apiRequest } from '../config/api';

const BASE = '/quotes';

export interface QuoteItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteDto {
  customerId?: number;
  validDays: number;
  notes?: string;
  items: QuoteItemDto[];
}

export interface QuoteResponse {
  id: number;
  branchId: number;
  userId: number;
  customerId?: number;
  totalAmount: string | number;
  taxAmount: string | number;
  validDays: number;
  validUntil: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'EXPIRADA' | 'CANCELADA';
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    customerType: string;
    nit?: string;
    documentNumber?: string;
    email?: string;
    phone?: string;
  };
  user?: {
    id: number;
    fullName: string;
  };
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
    product?: {
      id: number;
      name: string;
      internalCode?: string;
    };
  }>;
}

export interface PaginatedQuotes {
  data: QuoteResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const quotesService = {
  createQuote: async (payload: CreateQuoteDto): Promise<QuoteResponse> => {
    return await apiRequest<QuoteResponse>(BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getQuotes: async (filters: QuoteFilters = {}): Promise<PaginatedQuotes> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status && filters.status !== 'TODOS') params.set('status', filters.status);
    if (filters.customerId) params.set('customerId', String(filters.customerId));
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.search) params.set('search', filters.search);

    return await apiRequest<PaginatedQuotes>(`${BASE}?${params.toString()}`);
  },

  getQuoteDetail: async (id: number): Promise<QuoteResponse> => {
    return await apiRequest<QuoteResponse>(`${BASE}/${id}`);
  },

  updateQuote: async (id: number, customerId: number): Promise<QuoteResponse> => {
    return await apiRequest<QuoteResponse>(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ customerId }),
    });
  },

  confirmQuote: async (id: number, paymentMethod: string): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    });
  },

  cancelQuote: async (id: number): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/cancel`, {
      method: 'POST',
    });
  },

  resendEmail: async (id: number, email?: string): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/resend-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};
