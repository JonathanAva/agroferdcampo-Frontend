import { apiRequest } from '../config/api';

const BASE = '/safe';

export type SafePackageStatus = 'CERRADO' | 'ABIERTO' | 'AGOTADO' | 'ANULADO';
export type SafePackageSource = 'CAJA' | 'CIERRE_TURNO' | 'CAJA_GENERAL' | 'SALDO_INICIAL';
export type SafeWithdrawalPurpose = 'DEPOSITO_BANCARIO' | 'PAGO_PROVEEDOR' | 'GASTO' | 'OTRO';
export type SafePackageFilter = 'EN_CAJA' | 'CERRADO' | 'ABIERTO' | 'AGOTADO' | 'ANULADO' | 'TODOS';

interface UserRef { id: number; fullName: string }

export interface SafePackage {
  id: number;
  code: string;
  source: SafePackageSource;
  originalAmount: number | string;
  balance: number | string;
  status: SafePackageStatus;
  receivedByName?: string | null;
  notes?: string | null;
  createdAt: string;
  openedAt?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  cashRegister?: { id: number; name: string } | null;
  createdBy?: UserRef | null;
  openedBy?: UserRef | null;
  voidedBy?: UserRef | null;
  withdrawalItems?: Array<{
    id: number;
    amount: number | string;
    balanceBefore: number | string;
    balanceAfter: number | string;
    withdrawal: {
      id: number; code: string; purpose: SafeWithdrawalPurpose; description: string; reference?: string | null;
      status: 'ACTIVO' | 'ANULADO'; createdAt: string; voidedAt?: string | null; voidReason?: string | null;
      createdBy?: { fullName: string }; voidedBy?: { fullName: string } | null;
    };
  }>;
}

export interface SafeWithdrawal {
  id: number;
  code: string;
  purpose: SafeWithdrawalPurpose;
  description: string;
  reference?: string | null;
  totalAmount: number | string;
  status: 'ACTIVO' | 'ANULADO';
  createdAt: string;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdBy?: UserRef;
  voidedBy?: UserRef | null;
  items: Array<{
    id: number;
    amount: number | string;
    balanceBefore: number | string;
    balanceAfter: number | string;
    package: { id: number; code: string; originalAmount: number | string };
  }>;
}

export interface SafeCount {
  id: number;
  expectedAmount: number | string;
  countedAmount: number | string;
  difference: number | string;
  notes?: string | null;
  createdAt: string;
  countedBy?: UserRef;
}

type StatusTotals = { count: number; balance: number; originalAmount: number };

export interface SafeSummary {
  balance: number;
  packagesBalance: number;
  /** Debe ser 0; si no, hay efectivo fuera del control por paquetes */
  unreconciled: number;
  byStatus: Record<SafePackageStatus, StatusTotals>;
  lastCount: (SafeCount & { countedBy?: { fullName: string } }) | null;
}

export const PURPOSE_LABEL: Record<SafeWithdrawalPurpose, string> = {
  DEPOSITO_BANCARIO: 'Depósito bancario',
  PAGO_PROVEEDOR: 'Pago a proveedor',
  GASTO: 'Gasto autorizado',
  OTRO: 'Otro',
};

export const SOURCE_LABEL: Record<SafePackageSource, string> = {
  CAJA: 'Traslado de caja',
  CIERRE_TURNO: 'Cierre de turno',
  CAJA_GENERAL: 'Reposición Caja General',
  SALDO_INICIAL: 'Saldo inicial',
};

/** Identificador único por operación: evita registrar dos veces si se hace doble clic o se reintenta */
export const newRequestId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const safeService = {
  getSummary: () => apiRequest<SafeSummary>(`${BASE}/summary`),

  transfer: (data: { cashRegisterId?: number; amount: number; receivedByName?: string; notes?: string; requestId: string }) =>
    apiRequest<SafePackage>(`${BASE}/transfers`, { method: 'POST', body: JSON.stringify(data) }),

  getPackages: (status: SafePackageFilter = 'EN_CAJA') =>
    apiRequest<{ data: SafePackage[]; total: number }>(`${BASE}/packages?status=${status}&limit=200`),

  getPackage: (id: number) => apiRequest<SafePackage>(`${BASE}/packages/${id}`),

  openPackage: (id: number, notes?: string) =>
    apiRequest<SafePackage>(`${BASE}/packages/${id}/open`, { method: 'POST', body: JSON.stringify({ notes }) }),

  voidPackage: (id: number, reason: string) =>
    apiRequest<SafePackage>(`${BASE}/packages/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getWithdrawals: () => apiRequest<SafeWithdrawal[]>(`${BASE}/withdrawals`),

  withdraw: (data: {
    purpose: SafeWithdrawalPurpose; description: string; reference?: string;
    items: { packageId: number; amount: number }[]; requestId: string;
  }) => apiRequest<SafeWithdrawal>(`${BASE}/withdrawals`, { method: 'POST', body: JSON.stringify(data) }),

  voidWithdrawal: (id: number, reason: string) =>
    apiRequest<SafeWithdrawal>(`${BASE}/withdrawals/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getCounts: () => apiRequest<SafeCount[]>(`${BASE}/counts`),

  createCount: (data: { countedAmount: number; notes?: string }) =>
    apiRequest<SafeCount>(`${BASE}/counts`, { method: 'POST', body: JSON.stringify(data) }),
};
