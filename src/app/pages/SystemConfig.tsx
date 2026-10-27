import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { apiRequest } from "../config/api";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, ArrowLeft, Package, CreditCard } from "lucide-react";
import { useNavigate } from "react-router";

export interface SystemConfigData {
  id: number;
  companyName?: string;
  companyNit?: string;
  companyNrc?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyActivity?: string;
  currency: string;
  vatRate: number;
  vatIncluded: boolean;
  defaultCreditLimit: string | number;
  allowCreditSales: boolean;
  blockOnOverdueDays: number;
  blockOnOverLimit: boolean;
  allowNegativeStock?: boolean;
  enableCardFeeCalculation?: boolean;
  cardFeePercentage?: number | null;
  cardFeeRoundingTargets?: string;
  updatedAt: string;
}

export function SystemConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfigData | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiRequest<SystemConfigData>("/system-config");
      setConfig(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar configuración global");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      currency: formData.get("currency") as string,
      vatRate: parseFloat(formData.get("vatRate") as string),
      vatIncluded: formData.get("vatIncluded") === "true",
      defaultCreditLimit: parseFloat(formData.get("defaultCreditLimit") as string),
      allowCreditSales: formData.get("allowCreditSales") === "true",
      blockOnOverdueDays: parseInt(formData.get("blockOnOverdueDays") as string, 10),
      allowNegativeStock: formData.get("allowNegativeStock") === "true",
      enableCardFeeCalculation: formData.get("enableCardFeeCalculation") === "true",
      cardFeePercentage: formData.get("cardFeePercentage") !== "" && formData.get("cardFeePercentage") != null
        ? parseFloat(formData.get("cardFeePercentage") as string) / 100
        : null,
      cardFeeRoundingTargets: (formData.get("cardFeeRoundingTargets") as string)?.trim() || "0.00,0.50,0.75,0.80,0.95,0.99",
    };

    try {
      const data = await apiRequest<SystemConfigData>("/system-config", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setConfig(data);
      toast.success("Configuración guardada exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/settings')}
          className="rounded-full bg-[var(--card)] border-[var(--border)] shadow-sm"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--text-main)] flex items-center gap-3">
            <SettingsIcon className="text-[var(--primary)]" size={32} />
            Configuración Global
          </h1>
          <p className="text-sm font-bold opacity-60 text-[var(--text-sec)] tracking-widest uppercase">
            Parámetros maestros del sistema para todas las sucursales
          </p>
        </div>
      </div>

      <Card className="p-8 border-[var(--border)] bg-[var(--card)] shadow-xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                Moneda
              </Label>
              <Input
                name="currency"
                defaultValue={config?.currency}
                required
                className="bg-[var(--bg)] border-[var(--border)] font-bold font-mono"
              />
              <p className="text-[10px] opacity-50 font-bold">Ejemplo: USD, MXN, EUR</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                Tasa de IVA (vatRate)
              </Label>
              <Input
                name="vatRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                defaultValue={config?.vatRate}
                required
                className="bg-[var(--bg)] border-[var(--border)] font-bold font-mono"
              />
              <p className="text-[10px] opacity-50 font-bold">En formato decimal (Ej. 0.13 = 13%)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                ¿El precio ya incluye IVA?
              </Label>
              <Select name="vatIncluded" defaultValue={config?.vatIncluded ? "true" : "false"}>
                <SelectTrigger className="bg-[var(--bg)] border-[var(--border)] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                  <SelectItem value="true" className="font-bold">Sí, precios con IVA</SelectItem>
                  <SelectItem value="false" className="font-bold">No, IVA se suma al final</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                Límite de Crédito por Defecto ($)
              </Label>
              <Input
                name="defaultCreditLimit"
                type="number"
                step="0.01"
                defaultValue={config?.defaultCreditLimit}
                required
                className="bg-[var(--bg)] border-[var(--border)] font-bold font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                Permitir Ventas a Crédito
              </Label>
              <Select name="allowCreditSales" defaultValue={config?.allowCreditSales ? "true" : "false"}>
                <SelectTrigger className="bg-[var(--bg)] border-[var(--border)] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                  <SelectItem value="true" className="font-bold">Habilitado Globalmente</SelectItem>
                  <SelectItem value="false" className="font-bold text-red-500">Deshabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                Días para Bloqueo por Mora
              </Label>
              <Input
                name="blockOnOverdueDays"
                type="number"
                min="0"
                defaultValue={config?.blockOnOverdueDays}
                required
                className="bg-[var(--bg)] border-[var(--border)] font-bold font-mono"
              />
              <p className="text-[10px] opacity-50 font-bold">Días después del vencimiento para bloquear créditos</p>
            </div>

            <div className="space-y-2 md:col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50">
              <Label className="text-[11px] uppercase font-black tracking-widest text-[var(--text-main)] flex items-center gap-2">
                <Package size={16} className="text-[var(--primary)]" />
                Comportamiento al vender sin existencia (Punto de Venta)
              </Label>
              <Select name="allowNegativeStock" defaultValue={config?.allowNegativeStock ? "true" : "false"}>
                <SelectTrigger className="bg-[var(--card)] border-[var(--border)] font-bold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                  <SelectItem value="false" className="font-bold">
                    La existencia permanece en 0 después de la venta
                  </SelectItem>
                  <SelectItem value="true" className="font-bold text-emerald-600">
                    Permitir existencias negativas (Recomendado para cuadre automático con compras)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[var(--text-sec)]">
                Define si al vender un producto sin stock disponible en el Punto de Venta el saldo de inventario baja a números negativos (ej. -2) para compensarse automáticamente al recibir compras del proveedor, o si se mantiene en 0.
              </p>
            </div>

            {/* Tarjeta y Ajuste de Precios */}
            <div className="space-y-4 md:col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <CreditCard size={18} className="text-[var(--primary)]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                    Comisión y Precios Automáticos por Pago con Tarjeta
                  </h3>
                  <p className="text-[11px] text-[var(--text-sec)]">
                    Recalcula automáticamente los precios en el POS para compensar la comisión bancaria y aplicar redondeo comercial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                    Estado de la Función
                  </Label>
                  <Select
                    name="enableCardFeeCalculation"
                    defaultValue={config?.enableCardFeeCalculation !== false ? "true" : "false"}
                  >
                    <SelectTrigger className="bg-[var(--card)] border-[var(--border)] font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                      <SelectItem value="true" className="font-bold text-emerald-600">
                        Habilitado en POS
                      </SelectItem>
                      <SelectItem value="false" className="font-bold text-amber-500">
                        Deshabilitado (Precio idéntico a efectivo)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                    Comisión del Banco / Terminal (%)
                  </Label>
                  <Input
                    name="cardFeePercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={
                      config?.cardFeePercentage != null && Number(config.cardFeePercentage) > 0
                        ? (Number(config.cardFeePercentage) * 100).toFixed(2).replace(/\.?0+$/, "")
                        : ""
                    }
                    placeholder="Ej. 5.0 (Vacío = Sin recálculo)"
                    className="bg-[var(--card)] border-[var(--border)] font-bold font-mono"
                  />
                  <p className="text-[10px] text-[var(--text-sec)]">
                    Si está vacío o en 0, no se alterará ningún precio.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black opacity-60 tracking-widest">
                    Terminaciones Comerciales
                  </Label>
                  <Input
                    name="cardFeeRoundingTargets"
                    type="text"
                    defaultValue={config?.cardFeeRoundingTargets || "0.00,0.50,0.75,0.80,0.95,0.99"}
                    placeholder="0.00,0.50,0.75,0.80,0.95,0.99"
                    className="bg-[var(--card)] border-[var(--border)] font-bold font-mono text-xs"
                  />
                  <p className="text-[10px] text-[var(--text-sec)]">
                    Separadas por coma. Redondea hacia arriba para centavos comerciales.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs space-y-1">
                <p className="font-bold text-[var(--text-main)]">
                  💡 Fórmula de ingreso neto garantizado:
                </p>
                <p className="text-[var(--text-sec)] text-[11px]">
                  <code className="bg-[var(--bg)] px-1 py-0.5 rounded text-[var(--primary)] font-mono font-bold">
                    Precio Tarjeta = Precio Efectivo / (1 - comisión)
                  </code>
                  {" "}seguido de aproximación a la siguiente terminación comercial autorizada.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[var(--border)]">
            <Button
              type="submit"
              disabled={saving}
              className="px-8 font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
              {!saving && <Save size={18} className="ml-2" />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
