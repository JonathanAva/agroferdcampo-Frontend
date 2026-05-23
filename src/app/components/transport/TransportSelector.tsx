import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { TruckIcon, MapPin } from "lucide-react";
import { apiRequest } from "../../config/api";

export interface TransportData {
  requiresTransport: boolean;
  vehicleId?: number;
  driverId?: number;
  deliveryAddress?: string;
  scheduledDeliveryAt?: string;
}

interface TransportSelectorProps {
  customerId?: number;
  value: TransportData | null;
  onChange: (data: TransportData | null) => void;
  disabled?: boolean;
}

export function TransportSelector({ customerId, value, onChange, disabled }: TransportSelectorProps) {
  const [customerAddress, setCustomerAddress] = useState<string>("");

  useEffect(() => {
    if (value?.requiresTransport && customerId && !value.deliveryAddress && !customerAddress) {
      // Intentar obtener la dirección del cliente si se activó el transporte y no hay dirección
      const fetchCustomer = async () => {
        try {
          const cust = await apiRequest<any>(`/customers/${customerId}`);
          if (cust && cust.address) {
            setCustomerAddress(cust.address);
            onChange({ ...value, deliveryAddress: cust.address });
          }
        } catch (e) {
          console.error("Error fetching customer address", e);
        }
      };
      fetchCustomer();
    }
  }, [value?.requiresTransport, customerId, value?.deliveryAddress, onChange]);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      onChange({ requiresTransport: true, deliveryAddress: customerAddress || "" });
    } else {
      onChange(null);
    }
  };

  const updateField = (field: keyof TransportData, val: any) => {
    if (value) {
      onChange({ ...value, [field]: val });
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <TruckIcon size={18} />
          </div>
          <div>
            <Label className="text-sm font-bold text-[var(--text-main)]">Entrega a domicilio</Label>
            <p className="text-[10px] text-[var(--text-sec)]">Asignar transporte para esta orden</p>
          </div>
        </div>
        <Switch 
          checked={!!value?.requiresTransport} 
          onCheckedChange={handleToggle} 
          disabled={disabled}
        />
      </div>

      {value?.requiresTransport && (
        <div className="pt-4 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Dirección de Entrega</Label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
              <Input 
                placeholder="Dirección completa..."
                value={value.deliveryAddress || ""}
                onChange={(e) => updateField('deliveryAddress', e.target.value)}
                disabled={disabled}
                className="pl-9 bg-[var(--bg)]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
