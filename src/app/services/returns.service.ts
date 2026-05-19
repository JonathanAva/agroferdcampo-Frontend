import { apiRequest } from '../config/api';

const BASE = '/returns';

// ─── DTOs & Interfaces ────────────────────────────────────────────────────────

export interface CreateReturnItemDto {
  saleItemId: number;
  quantity: number;
}

export interface CreateReturnDto {
  saleId: number;
  reason: 'PRODUCTO_DEFECTUOSO' | 'ERROR_EN_VENTA' | 'CAMBIO_DE_PRODUCTO' | 'INSATISFACCION_CLIENTE' | 'OTRO';
  notes?: string;
  items: CreateReturnItemDto[];
  emitCreditNote?: boolean;
}

export interface UpdateReturnStatusDto {
  status: 'PENDIENTE' | 'APROBADA' | 'COMPLETADA' | 'RECHAZADA';
  notes?: string;
  emitCreditNote?: boolean;
}

export interface ReturnFilters {
  page?: number;
  limit?: number;
  status?: string;
  saleId?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ReturnItemResponse {
  id: number;
  returnId: number;
  saleItemId: number;
  productId: number;
  quantity: string | number;
  unitPrice: string | number;
  subtotal: string | number;
  product?: {
    id: number;
    name: string;
    internalCode?: string;
  };
}

export interface ReturnResponse {
  id: number;
  saleId: number;
  branchId: number;
  userId: number;
  reason: string;
  notes: string | null;
  status: 'PENDIENTE' | 'APROBADA' | 'COMPLETADA' | 'RECHAZADA';
  totalRefund: string | number;
  dteCreditNoteCode?: string | null;
  dteCreditNoteEstado?: string | null;
  dteCreditNoteSello?: string | null;
  dteCreditNoteJson?: any | null;
  createdAt: string;
  updatedAt: string;
  sale: {
    id: number;
    totalAmount: string | number;
    paymentMethod?: string;
    customer?: {
      id: number;
      name: string;
      customerType: string;
      email?: string;
      nit?: string;
      documentNumber?: string;
    } | null;
    dteResponse?: {
      id: number;
      codigoGeneracion?: string;
      numeroControl?: string;
      selloRecibido?: string;
      estado?: string | null;
    } | null;
  };
  items: ReturnItemResponse[];
  user?: {
    id: number;
    fullName: string;
  };
}

export interface PaginatedReturns {
  data: ReturnResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/** Listar devoluciones de la sucursal actual con paginación y filtros */
export function getReturns(filters: ReturnFilters = {}): Promise<PaginatedReturns> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.saleId) params.set('saleId', String(filters.saleId));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  
  return apiRequest<PaginatedReturns>(`${BASE}?${params.toString()}`);
}

/** Obtener el detalle completo de una devolución */
export function getReturnDetail(id: number): Promise<ReturnResponse> {
  return apiRequest<ReturnResponse>(`${BASE}/${id}`);
}

/** Crear una nueva solicitud de devolución */
export function createReturn(payload: CreateReturnDto): Promise<ReturnResponse> {
  return apiRequest<ReturnResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Aprobar o rechazar devolución (solo supervisores/admins) */
export function updateReturnStatus(id: number, payload: UpdateReturnStatusDto): Promise<ReturnResponse> {
  return apiRequest<ReturnResponse>(`${BASE}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Obtener devoluciones por venta */
export function getReturnsBySale(saleId: number): Promise<ReturnResponse[]> {
  return apiRequest<ReturnResponse[]>(`${BASE}/by-sale/${saleId}`);
}
