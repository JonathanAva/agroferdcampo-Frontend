import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { apiRequest } from '../../config/api';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

interface CustomerQuickCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: any) => void;
}

export function CustomerQuickCreate({ open, onOpenChange, onSuccess }: CustomerQuickCreateProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const customer = await apiRequest('/customers/quick', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast.success('Cliente registrado (Consumidor Final)');
      onSuccess(customer);
      setFormData({ name: '', phone: '', email: '' });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear cliente rápido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
            <UserPlus size={20} />
            <DialogTitle>Registro Rápido (POS)</DialogTitle>
          </div>
          <DialogDescription>
            Crea un cliente tipo <b>Consumidor Final</b> rápidamente para esta venta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Nombre del Cliente</Label>
            <Input 
              id="quick-name"
              required 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej. Juan Pérez"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-phone">Teléfono (Opcional)</Label>
            <Input 
              id="quick-phone"
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="7777-7777"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-email">Correo (Opcional)</Label>
            <Input 
              id="quick-email"
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
            >
              {loading ? 'Registrando...' : 'Registrar y Usar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
