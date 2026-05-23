import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { apiRequest } from '../../config/api';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

interface CreditLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
  onSuccess: () => void;
}

export function CreditLimitDialog({ open, onOpenChange, customer, onSuccess }: CreditLimitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [creditLimit, setCreditLimit] = useState<number | string>('');

  useEffect(() => {
    if (customer) {
      setCreditLimit(Number(customer.creditLimit) || 0);
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setLoading(true);

    try {
      await apiRequest(`/customers/${customer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ creditLimit: Number(creditLimit) }),
      });

      toast.success('Límite de crédito actualizado exitosamente');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar límite de crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md w-full"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text-main)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <CreditCard className="text-[var(--primary)]" />
            Asignar Límite de Crédito
          </DialogTitle>
          <DialogDescription>
            Establece el monto máximo de crédito autorizado para <strong>{customer?.name}</strong>.
            Si el límite es $0.00, las ventas al crédito serán bloqueadas para este cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold">Límite Autorizado ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--text-sec)]">
                $
              </span>
              <Input 
                type="number"
                min="0"
                step="0.01"
                required
                value={creditLimit} 
                onChange={(e) => setCreditLimit(e.target.value)}
                className="pl-8 text-lg font-black"
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant="default"
              className="font-bold shadow-xl px-8 rounded-xl h-11"
            >
              {loading ? 'Guardando...' : 'Asignar Crédito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
