import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../config/api';
import { Vehicle, VehicleStatus } from '../types/transport';
import { toast } from 'sonner';

interface UseVehiclesProps {
  status?: VehicleStatus | 'ALL';
  branchId?: number;
  autoLoad?: boolean;
}

export function useVehicles({ status = 'ALL', branchId, autoLoad = true }: UseVehiclesProps = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/vehicles?limit=100'; // Traer todos (limit=100 para selectores)
      if (status && status !== 'ALL') {
        endpoint += `&status=${status}`;
      }
      if (branchId) {
        endpoint += `&branchId=${branchId}`;
      }

      // La API puede devolver { data: [...] } o simplemente [...]
      const response = await apiRequest<any>(endpoint);
      let data = response.data ?? response;
      if (data && data.items) {
        data = data.items;
      }
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err);
      toast.error(err.message || 'Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, [status, branchId]);

  useEffect(() => {
    if (autoLoad) {
      fetchVehicles();
    }
  }, [fetchVehicles, autoLoad]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
