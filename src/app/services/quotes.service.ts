// src/app/services/quotes.service.ts
import { apiRequest } from '../config/api';

const BASE = '/quotes';

export interface QuoteItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  unitType?: string;
  unitFactor?: number;
  /** Nombre libre de la línea (obligatorio para el Producto Universal) */
  customName?: string;
}

export interface CostAccessPayload {
  password: string;
  /** Correo de un administrador que autoriza en lugar del usuario actual */
  authorizerEmail?: string;
}

export interface CostAccessResponse {
  authorizedBy: string;
  /** Costos por línea de la cotización (vacío si se autorizó para una cotización nueva) */
  items: { id: number; costPrice: number | null; catalogCostPrice: number | null }[];
}

export interface CreateQuoteDto {
  customerId?: number;
  validDays: number;
  notes?: string;
  items: QuoteItemDto[];
  requiresTransport?: boolean;
  vehicleId?: number;
  driverId?: number;
  deliveryAddress?: string;
  scheduledAt?: string;
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
  requiresTransport?: boolean;
  notes?: string;
  vehicleId?: number;
  driverId?: number;
  deliveryAddress?: string;
  customer?: {
    id: number;
    name: string;
    customerType: string;
    nit?: string;
    documentNumber?: string;
    email?: string;
    phone?: string;
  };
  sale?: {
    id: number;
    status?: string;
    totalAmount?: string | number;
    paymentMethod?: string;
    creditSale?: {
      id: number;
      status: string;
      remainingAmount: string | number;
      paidAmount: string | number;
    } | null;
    dteResponse?: {
      id: number;
      estado: string;
      codigoGeneracion?: string;
      selloRecibido?: string;
      numeroControl?: string;
    } | null;
    deliveryNotes?: Array<{
      id: number;
      status: string;
    }>;
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
    costPrice?: string | number;
    unitType?: string | null;
    unitFactor?: string | number | null;
    customName?: string | null;
    product?: {
      id: number;
      name: string;
      internalCode?: string;
      costPrice?: string | number;
      unit?: string;
      isUniversal?: boolean;
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
  excludeCancelled?: boolean;
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
    if (filters.excludeCancelled) params.set('excludeCancelled', 'true');

    return await apiRequest<PaginatedQuotes>(`${BASE}?${params.toString()}`);
  },

  getQuoteDetail: async (id: number): Promise<QuoteResponse> => {
    return await apiRequest<QuoteResponse>(`${BASE}/${id}`);
  },

  /**
   * Autoriza la vista de costos y márgenes (contraseña propia o de un administrador). El acceso
   * queda registrado en auditoría. Con quoteId devuelve los costos de esa cotización.
   */
  grantCostAccess: async (quoteId: number | null, payload: CostAccessPayload): Promise<CostAccessResponse> => {
    const url = quoteId ? `${BASE}/${quoteId}/cost-access` : `${BASE}/cost-access`;
    return await apiRequest<CostAccessResponse>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateQuote: async (id: number, data: any): Promise<QuoteResponse> => {
    return await apiRequest<QuoteResponse>(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  confirmQuote: async (id: number, payload: {
    paymentMethod?: string;
    cashRegisterId?: number;
    requiresTransport?: boolean;
    vehicleId?: number;
    driverId?: number;
    deliveryAddress?: string;
    scheduledAt?: string;
    allowNegativeStock?: boolean;
  }): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  cancelQuote: async (id: number, payload?: any): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/cancel`, {
      method: 'POST',
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
  },

  resendEmail: async (id: number, email?: string): Promise<any> => {
    return await apiRequest(`${BASE}/${id}/resend-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};
