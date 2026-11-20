import { apiRequest } from '../config/api';

export type CashCycleType = 'GLOBAL' | 'CAJA_GENERAL' | 'CAJA_REGISTRADORA' | 'CAJA_FUERTE';

export interface CashCycle {
  id: number;
  branchId: number;
  code: string;
  type: CashCycleType;
  cashRegisterId?: number | null;
  name?: string | null;
  reason: string;
  startDate: string;
  closedAt: string;
  closedById: number;
  finalBalances: any;
  initialBalances?: any;
  status: 'ACTIVO' | 'CERRADO';
  notes?: string | null;
  createdAt: string;
  closedBy?: {
    id: number;
    fullName: string;
    email?: string;
  };
  cashRegister?: {
    id: number;
    name: string;
  } | null;
}

export interface ActiveCycleInfo {
  latestCycle: CashCycle | null;
  activeSince: string | null;
  balances: {
    general: number;
    safe: {
      balance: number;
      packagesBalance: number;
      packagesCount: number;
      unreconciled: number;
    };
    registers: Array<{
      id: number;
      name: string;
      balance: number;
      openShift: any | null;
    }>;
  };
}

export interface CloseCashCycleDto {
  type: CashCycleType;
  cashRegisterId?: number;
  reason: string;
  name?: string;
  newInitialBalance?: number;
  closeOpenShifts?: boolean;
  notes?: string;
}

export const cashCyclesService = {
  getCycles: async (query?: { type?: CashCycleType; cashRegisterId?: number; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.type) params.set('type', query.type);
    if (query?.cashRegisterId) params.set('cashRegisterId', String(query.cashRegisterId));
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return apiRequest<{
      data: CashCycle[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/cash-cycles${qs ? `?${qs}` : ''}`);
  },

  getActiveInfo: async () => {
    return apiRequest<ActiveCycleInfo>('/cash-cycles/active-info');
  },

  closeCycle: async (dto: CloseCashCycleDto) => {
    return apiRequest<{ success: boolean; message: string; cycle: CashCycle }>('/cash-cycles/close', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
