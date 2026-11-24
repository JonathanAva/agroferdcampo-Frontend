// src/app/services/sales.service.ts
import { apiRequest, API_BASE_URL } from '../config/api';

const BASE = '/sales';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SaleItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  unitType?: string;
  unitFactor?: number;
  customName?: string;
}

export interface SalePaymentDto {
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';
  amount: number;
  reference?: string;
  transferReceiptUrl?: string;
}

export interface CreateSaleDto {
  customerId?: number;
  paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO'; // Maintained for backwards compatibility
  payments?: SalePaymentDto[];
  totalAmount: number;
  taxAmount: number;
  dueDate?: string;
  creditNotes?: string;
  items: SaleItemDto[];
  requiresTransport?: boolean;
  vehicleId?: number;
  deliveryAddress?: string;
  scheduledAt?: string;
  cashRegisterId?: number;
  allowBackorder?: boolean;
  allowNegativeStock?: boolean;
}

export interface VoidSaleDto {
  motivoAnulacion: string;
  nombreResponsable: string;
  tipDocResponsable: string;
  numDocResponsable: string;
  nombreSolicita: string;
  tipDocSolicita: string;
  numDocSolicita: string;
}

export interface AdjustSaleDto {
  items: SaleItemDto[];
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface SaleResponse {
  id: number;
  branchId: number;
  userId: number;
  customerId?: number;
  paymentMethod: string;
  isMixedPayment?: boolean;
  totalAmount: string | number;
  taxAmount: string | number;
  status: 'COMPLETADA' | 'CANCELADA' | 'PENDIENTE';
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    customerType: string;
    email?: string;
    nit?: string;
    nrc?: string;
    documentNumber?: string;
  };
  user?: { id: number; fullName: string };
  items?: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
    customName?: string | null;
    soldWithoutStock?: boolean;
    product?: { id: number; name: string; internalCode?: string };
  }>;
  dteResponse?: DteResponse | null;
}

export type DteEstado = 'PROCESADO' | 'RECIBIDO' | 'RECHAZADO' | 'INVALIDO';

export interface DteResponse {
  id: number;
  saleId: number;
  codigoGeneracion?: string;
  numeroControl?: string;
  selloRecibido?: string;
  estado?: DteEstado | null;
  ambiente?: 'PRUEBA' | 'PRODUCCION';
  total?: string | number;
  dteJsonUrl?: string;
  serie?: string;
  sequenceNumber?: string;
}

export interface PaginatedSales {
  data: SaleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  fecha?: string;
  customerId?: number;
  search?: string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/** Paso 1 — Crear venta y descontar inventario */
export function createSale(payload: CreateSaleDto): Promise<SaleResponse> {
  return apiRequest<SaleResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Paso 2a — Emitir Factura Consumidor Final (DTE01) */
export function sendFacturaConsumidor(saleId: number): Promise<DteResponse> {
  return apiRequest<DteResponse>(`${BASE}/${saleId}/send-dte`, { method: 'POST' });
}

/** Paso 2b — Emitir Comprobante de Crédito Fiscal (DTE03) */
export function sendCreditoFiscal(saleId: number): Promise<DteResponse> {
  return apiRequest<DteResponse>(`${BASE}/${saleId}/send-dte-03`, { method: 'POST' });
}

/** Paso 2c — Emitir Factura de Sujeto Excluido (DTE14) */
export function sendSujetoExcluido(saleId: number): Promise<DteResponse> {
  return apiRequest<DteResponse>(`${BASE}/${saleId}/send-dte-14`, { method: 'POST' });
}

export type DteKind = 'CONSUMIDOR_FINAL' | 'CREDITO_FISCAL' | 'SUJETO_EXCLUIDO';

/** Emite el DTE de una venta según el tipo de documento elegido */
export function emitSaleDte(saleId: number, kind: DteKind): Promise<DteResponse> {
  if (kind === 'CREDITO_FISCAL') return sendCreditoFiscal(saleId);
  if (kind === 'SUJETO_EXCLUIDO') return sendSujetoExcluido(saleId);
  return sendFacturaConsumidor(saleId);
}

/** Emitir Nota de Crédito (DTE05) */
export function sendNotaCredito(saleId: number, payload: AdjustSaleDto): Promise<DteResponse> {
  return apiRequest<DteResponse>(`${BASE}/${saleId}/send-dte-05`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Emitir Nota de Débito (DTE06) */
export function sendNotaDebito(saleId: number, payload: AdjustSaleDto): Promise<DteResponse> {
  return apiRequest<DteResponse>(`${BASE}/${saleId}/send-dte-06`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Anular una venta y su DTE */
export function voidSale(saleId: number, payload: VoidSaleDto): Promise<SaleResponse> {
  return apiRequest<SaleResponse>(`${BASE}/${saleId}/void`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ResendDteEmailResult {
  message: string;
  codigoGeneracion?: string;
  emailEnviado?: string;
  correoEnviado?: boolean;
  tipo?: string;
  estado?: string;
}

/** Reenviar el DTE al correo del cliente (sin email se usa el del receptor) */
export function resendDteEmail(saleId: number, email?: string): Promise<ResendDteEmailResult> {
  const trimmed = email?.trim();
  return apiRequest<ResendDteEmailResult>(`${BASE}/${saleId}/resend-email`, {
    method: 'POST',
    body: JSON.stringify(trimmed ? { email: trimmed } : {}),
  });
}

// ─── Sincronización masiva de DTE ─────────────────────────────────────────────

export interface DteSyncDocument {
  saleId: number;
  codigoGeneracion: string;
  encontrado: boolean;
  tipo: string | null;
  estadoAnterior: DteEstado | null;
  estadoActual: DteEstado | null;
  estadoFel: string | null;
  selloRecibido: string | null;
  actualizado: boolean;
}

export interface DteSyncResult {
  totalSolicitados: number;
  totalEncontrados: number;
  totalNoEncontrados: number;
  totalActualizados: number;
  documentos: DteSyncDocument[];
}

/** Límite de ventas por sincronización (igual al backend) */
export const DTE_SYNC_MAX_SALES = 200;

/**
 * Sincroniza estado y sello de recepción con Hacienda/FelSystem.
 * Sin `saleIds` se sincronizan los DTE pendientes de la sucursal.
 */
export function syncDteStatuses(saleIds?: number[]): Promise<DteSyncResult> {
  return apiRequest<DteSyncResult>(`${BASE}/dte/sync`, {
    method: 'POST',
    body: JSON.stringify(saleIds?.length ? { saleIds } : {}),
  });
}

// ─── PDF oficial del DTE ──────────────────────────────────────────────────────

/** Descarga el PDF oficial del DTE como Blob (requiere sesión, por eso no se usa un <a href>) */
export async function fetchDtePdfBlob(saleId: number, format: 'view' | 'download' = 'view'): Promise<Blob> {
  const token = localStorage.getItem('agro-token');
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${BASE}/${saleId}/dte/pdf?format=${format}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  // Igual que apiRequest: sesión expirada -> limpiar y volver al login
  if (response.status === 401) {
    localStorage.removeItem('agro-token');
    localStorage.removeItem('agro-user');
    window.location.href = '/login';
    throw new Error('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
  }

  if (!response.ok) {
    let message = `Error ${response.status} al obtener el PDF`;
    try {
      const data = await response.json();
      if (data?.message) message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(message);
  }

  // Defensa: validar la firma "%PDF" en lugar del Content-Type, que puede decir
  // application/pdf aunque el cuerpo sea otra cosa (p. ej. JSON envuelto por un interceptor).
  const blob = await response.blob();
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (String.fromCharCode(...head) !== '%PDF') {
    throw new Error('El servidor no devolvió un PDF válido');
  }

  return new Blob([blob], { type: 'application/pdf' });
}

/** URL firmada y temporal del PDF (útil para compartir) */
export function getDtePdfUrl(saleId: number): Promise<{
  codigoGeneracion: string;
  url: string;
  expiresIn: number;
  filename: string;
}> {
  return apiRequest(`${BASE}/${saleId}/dte/pdf?format=url`);
}

/** Obtener historial paginado de ventas */
export function getSalesHistory(filters: SaleFilters = {}): Promise<PaginatedSales> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.fecha) params.set('fecha', filters.fecha);
  if (filters.customerId) params.set('customerId', String(filters.customerId));
  if (filters.search) params.set('search', filters.search);
  return apiRequest<PaginatedSales>(`${BASE}?${params.toString()}`);
}

/** Obtener detalle de una venta */
export function getSaleDetail(saleId: number): Promise<SaleResponse> {
  return apiRequest<SaleResponse>(`${BASE}/${saleId}`);
}

/** Solicitar Reporte Mensual (ZIP); el enlace de descarga llega al correo indicado */
export function requestMonthlyReport(
  year: string,
  month: string,
  email: string,
): Promise<{ accepted: boolean; message: string }> {
  const params = new URLSearchParams({ year, month: month.padStart(2, '0'), email: email.trim() });
  return apiRequest(`${BASE}/reports/monthly?${params.toString()}`, { method: 'GET' });
}

/** Buscar Productos en el Catálogo */
export async function searchProducts(query: string, page = 1, limit = 10): Promise<any> {
  const isSearch = !!query;
  const endpoint = isSearch
    ? `/catalog/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    : `/catalog/products?isActive=true&limit=${limit}&page=${page}`;

  const response = await apiRequest<any>(endpoint);
  
  // Normalizar respuesta
  const items = isSearch
    ? Array.isArray(response) ? response : []
    : response.data || [];
    
  return { data: items };
}

// ─── Historial de Ventas por Producto ─────────────────────────────────────────

export interface ProductSalesHistorySummary {
  timesSold: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface ProductSalesHistoryItem {
  saleItemId: number;
  saleId: number;
  date: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  branch: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    fullName: string;
    email: string;
  };
  customer: {
    id: number;
    name: string;
    documentNumber?: string;
  } | null;
}

export interface ProductSalesHistoryResponse {
  product: {
    id: number;
    name: string;
    internalCode?: string;
    barcode?: string;
    unit: string;
    imageUrl?: string;
    category?: { id: number; name: string };
  };
  summary: ProductSalesHistorySummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ProductSalesHistoryItem[];
}

export interface ProductSalesHistoryFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  allBranches?: boolean;
  userId?: number;
  customerId?: number;
}

/** Obtener historial de ventas de un producto específico */
export function getProductSalesHistory(
  productId: number,
  filters: ProductSalesHistoryFilters = {},
): Promise<ProductSalesHistoryResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.allBranches) params.set('allBranches', 'true');
  if (filters.userId) params.set('userId', String(filters.userId));
  if (filters.customerId) params.set('customerId', String(filters.customerId));
  return apiRequest<ProductSalesHistoryResponse>(`/catalog/products/${productId}/sales-history?${params.toString()}`);
}

