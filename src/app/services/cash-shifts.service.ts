// src/app/services/cash-shifts.service.ts
import { apiRequest } from '../config/api';

const BASE = '/cash-shifts';

export interface CashShift {
  id: number;
  userId: number;
  branchId: number;
  cashRegisterId?: number;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  expectedAmount: number | null;
  countedCash: number | null;
  difference: number | null;
  openingNotes: string | null;
  notes: string | null;
  status: 'ABIERTO' | 'CERRADO';
  closeRequested?: boolean;
  closeRequestedAt?: string | null;
  cashRegister?: CashRegister;
}

export interface CashRegister {
  id: number;
  branchId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CloseShiftResponse {
  shift: CashShift;
  summary: {
    expectedAmount: number;
    countedCash: number;
    difference: number;
  };
}

export interface BillsBreakdown {
  d100: number; d50: number; d20: number;
  d10: number; d5: number; d1: number;
}

export interface CoinsBreakdown {
  c25: number; c10: number;
  c5: number; c1: number;
}

export interface DenominationBreakdown {
  bills: BillsBreakdown;
  coins: CoinsBreakdown;
}

export interface OpenShiftPayload {
  cashRegisterId?: number;
  breakdown: DenominationBreakdown;
  notes?: string;
}

export interface CloseShiftPayload {
  breakdown?: DenominationBreakdown;
  countedCash?: number;
  countedTarjeta?: number;
  countedTransferencia?: number;
  notes?: string;
}

export interface ExpectedTotals {
  expectedAmount: number;
  expectedTarjeta: number;
  expectedTransferencia: number;
}

export const cashShiftsService = {
  getAvailableRegisters: async (branchId?: number): Promise<CashRegister[]> => {
    const url = branchId ? `${BASE}/available-registers?branchId=${branchId}` : `${BASE}/available-registers`;
    return await apiRequest<CashRegister[]>(url);
  },

  openShift: async (payload: OpenShiftPayload): Promise<CashShift> => {
    return await apiRequest<CashShift>(`${BASE}/open`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getActiveShift: async (): Promise<CashShift | null> => {
    try {
      return await apiRequest<CashShift>(`${BASE}/active`);
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes('404')) {
        return null; // No active shift
      }
      throw error;
    }
  },

  getActiveShiftExpectedTotals: async (): Promise<ExpectedTotals | null> => {
    try {
      return await apiRequest<ExpectedTotals>(`${BASE}/active/totals`);
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes('404') || error.message?.includes('No hay un turno activo')) {
        return null; // No active shift
      }
      throw error;
    }
  },

  closeShift: async (payload: CloseShiftPayload): Promise<CloseShiftResponse> => {
    return await apiRequest<CloseShiftResponse>(`${BASE}/close`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  requestClose: async (payload: CloseShiftPayload): Promise<CashShift> => {
    return await apiRequest<CashShift>(`${BASE}/close-request`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  closeShiftById: async (id: number, payload: CloseShiftPayload): Promise<{ summary: any }> => {
    return await apiRequest<{ summary: any }>(`${BASE}/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getExpectedTotalsById: async (id: number): Promise<{ expectedAmount: number; expectedTarjeta: number; expectedTransferencia: number }> => {
    return await apiRequest<{ expectedAmount: number; expectedTarjeta: number; expectedTransferencia: number }>(`${BASE}/${id}/expected-totals`);
  },

  getPendingCloseRequests: async (): Promise<CashShift[]> => {
    const res = await apiRequest<{ data: CashShift[] } | CashShift[]>(`${BASE}/pending-requests`);
    return Array.isArray(res) ? res : res.data;
  }
};
