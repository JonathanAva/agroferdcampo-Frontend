import React, { useState, useEffect } from "react";
import {
  Wrench,
  Package,
  Sprout,
  Stethoscope,
  Plus,
  X,
  Check,
  FlaskConical,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "../ui/utils";
import { apiRequest } from "../../config/api";

export type ProductClassification = "SERVICIO" | "ESTANDAR" | "AGROQUIMICO" | "VETERINARIO";

interface TechnicalOptions {
  agrochemicalTypes: string[];
  chemicalFamilies: string[];
  veterinaryTypes: string[];
  activeIngredients: string[];
  targetSpecies: string[];
}

const DEFAULT_OPTIONS: TechnicalOptions = {
  agrochemicalTypes: [
    "Insecticida",
    "Fungicida",
    "Herbicida",
    "Foliar",
    "Acaricida",
    "Nematicida",
    "Bactericida",
    "Coadyuvante / Adherente",
    "Fertilizante / Nutrición",
  ],
  chemicalFamilies: [
    "Piretroides",
    "Triazoles",
    "Organofosforados",
    "Carbamatos",
    "Neonicotinoides",
    "Estrobirulinas",
    "Ditiocarbamatos",
    "Bipiridilos",
    "Derivados de Glicina",
  ],
  veterinaryTypes: [
    "Antibiótico",
    "Antiparasitario Interno",
    "Antiparasitario Externo",
    "Vitamínico / Mineral",
    "Vacuna / Biológico",
    "Analgésico / Antiinflamatorio",
    "Hormonal",
    "Suplemento Nutricional",
  ],
  activeIngredients: [
    "Permetrina",
    "Lambda-cialotrina",
    "Cipermetrina",
    "Glifosato",
    "Paraquat",
    "Clorpirifos",
    "Mancozeb",
    "Difenoconazol",
    "Azoxistrobina",
    "Imidacloprid",
    "Abamectina",
    "Ivermectina",
    "Oxitetraciclina",
    "Penicilina",
  ],
  targetSpecies: [
    "Bovinos",
    "Equinos",
    "Porcinos",
    "Aves",
    "Caninos",
    "Felinos",
    "Ovinos / Caprinos",
  ],
};

interface ProductTechnicalFieldsProps {
  classification: ProductClassification;
  onChangeClassification: (c: ProductClassification) => void;
  // Valores técnicos
  chemicalFamily?: string;
  agrochemicalType?: string;
  formulation?: string;
  dosage?: string;
  veterinaryType?: string;
  targetSpecies?: string;
  activeIngredients?: string;
  technicalNotes?: string;
  onChangeTechnical: (field: string, value: string) => void;
  // Valores de servicio
  serviceType?: string;
  fixedCommission?: string;
  servicePrice?: string;
  onChangeService?: (field: string, value: string) => void;
  readOnly?: boolean;
}

export function ProductTechnicalFields({
  classification,
  onChangeClassification,
  chemicalFamily = "",
  agrochemicalType = "",
  formulation = "",
  dosage = "",
  veterinaryType = "",
  targetSpecies = "",
  activeIngredients = "",
  technicalNotes = "",
  onChangeTechnical,
  serviceType = "INGRESO",
  fixedCommission = "",
  servicePrice = "",
  onChangeService,
  readOnly = false,
}: ProductTechnicalFieldsProps) {
  const [options, setOptions] = useState<TechnicalOptions>(DEFAULT_OPTIONS);

  // Cargar opciones dinámicas del backend
  useEffect(() => {
    let isMounted = true;
    apiRequest<TechnicalOptions>("/catalog/products/technical-options")
      .then((data) => {
        if (isMounted && data) {
          setOptions({
            agrochemicalTypes: data.agrochemicalTypes?.length ? data.agrochemicalTypes : DEFAULT_OPTIONS.agrochemicalTypes,
            chemicalFamilies: data.chemicalFamilies?.length ? data.chemicalFamilies : DEFAULT_OPTIONS.chemicalFamilies,
            veterinaryTypes: data.veterinaryTypes?.length ? data.veterinaryTypes : DEFAULT_OPTIONS.veterinaryTypes,
            activeIngredients: data.activeIngredients?.length ? data.activeIngredients : DEFAULT_OPTIONS.activeIngredients,
            targetSpecies: data.targetSpecies?.length ? data.targetSpecies : DEFAULT_OPTIONS.targetSpecies,
          });
        }
      })
      .catch(() => {
        // Fallback a DEFAULT_OPTIONS
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper para parsear listas separadas por comas
  const parseList = (str: string): string[] => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
    } catch {}
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const currentIngredients = parseList(activeIngredients);
  const currentSpecies = parseList(targetSpecies);

  const handleToggleIngredient = (item: string) => {
    const list = [...currentIngredients];
    const idx = list.findIndex((x) => x.toLowerCase() === item.toLowerCase());
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    onChangeTechnical("activeIngredients", list.join(", "));
  };

  const handleToggleSpecies = (item: string) => {
    const list = [...currentSpecies];
    const idx = list.findIndex((x) => x.toLowerCase() === item.toLowerCase());
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    onChangeTechnical("targetSpecies", list.join(", "));
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. SELECTOR PRINCIPAL DE TIPO DE ÍTEM (Directamente bajo el nombre) */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-black uppercase tracking-wider text-[var(--text-sec)] flex items-center gap-2">
            <Layers size={14} className="text-[var(--primary)]" />
            Tipo de Ítem / Clasificación <span className="text-red-500">*</span>
          </Label>
          <span className="text-[11px] text-[var(--text-sec)]">
            Adapta los campos del formulario según la naturaleza del producto
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Opción 1: Servicio */}
          <div
            onClick={() => !readOnly && onChangeClassification("SERVICIO")}
            className={cn(
              "p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer text-left relative",
              classification === "SERVICIO"
                ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-sm ring-1 ring-amber-500"
                : "border-[var(--border)] bg-[var(--card)] hover:border-amber-500/50 hover:bg-[var(--bg)]/50 text-[var(--text-sec)]"
            )}
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  classification === "SERVICIO"
                    ? "bg-amber-500 text-white"
                    : "bg-[var(--bg)] text-[var(--text-sec)] border border-[var(--border)]"
                )}
              >
                <Wrench size={16} />
              </div>
              {classification === "SERVICIO" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  <Check size={10} className="stroke-[3]" /> Seleccionado
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-main)]">Servicio</p>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Mano de obra, flete, alquileres o asesorías sin inventario físico ni stock.
              </p>
            </div>
          </div>

          {/* Opción 2: Producto almacenable */}
          <div
            onClick={() => !readOnly && onChangeClassification("ESTANDAR")}
            className={cn(
              "p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer text-left relative",
              classification === "ESTANDAR"
                ? "border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200 shadow-sm ring-1 ring-blue-500"
                : "border-[var(--border)] bg-[var(--card)] hover:border-blue-500/50 hover:bg-[var(--bg)]/50 text-[var(--text-sec)]"
            )}
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  classification === "ESTANDAR"
                    ? "bg-blue-500 text-white"
                    : "bg-[var(--bg)] text-[var(--text-sec)] border border-[var(--border)]"
                )}
              >
                <Package size={16} />
              </div>
              {classification === "ESTANDAR" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  <Check size={10} className="stroke-[3]" /> Seleccionado
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-main)]">Producto almacenable</p>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Ferretería, herramientas, materiales y productos físicos con control de inventario.
              </p>
            </div>
          </div>

          {/* Opción 3: Producto agroquímico almacenable */}
          <div
            onClick={() => !readOnly && onChangeClassification("AGROQUIMICO")}
            className={cn(
              "p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer text-left relative",
              classification === "AGROQUIMICO"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500"
                : "border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/50 hover:bg-[var(--bg)]/50 text-[var(--text-sec)]"
            )}
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  classification === "AGROQUIMICO"
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--bg)] text-[var(--text-sec)] border border-[var(--border)]"
                )}
              >
                <Sprout size={16} />
              </div>
              {classification === "AGROQUIMICO" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  <Check size={10} className="stroke-[3]" /> Seleccionado
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-main)]">Agroquímico almacenable</p>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Foliar, insecticida, herbicida, fungicida con ingrediente activo y grupo químico.
              </p>
            </div>
          </div>

          {/* Opción 4: Producto veterinario almacenable */}
          <div
            onClick={() => !readOnly && onChangeClassification("VETERINARIO")}
            className={cn(
              "p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 cursor-pointer text-left relative",
              classification === "VETERINARIO"
                ? "border-purple-500 bg-purple-500/10 text-purple-950 dark:text-purple-200 shadow-sm ring-1 ring-purple-500"
                : "border-[var(--border)] bg-[var(--card)] hover:border-purple-500/50 hover:bg-[var(--bg)]/50 text-[var(--text-sec)]"
            )}
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0",
                  classification === "VETERINARIO"
                    ? "bg-purple-600 text-white"
                    : "bg-[var(--bg)] text-[var(--text-sec)] border border-[var(--border)]"
                )}
              >
                <Stethoscope size={16} />
              </div>
              {classification === "VETERINARIO" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  <Check size={10} className="stroke-[3]" /> Seleccionado
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-main)]">Veterinario almacenable</p>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                Medicamentos, antibióticos, antiparasitarios y vacunas por especie animal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. CAMPOS ESPECÍFICOS SEGÚN CLASIFICACIÓN SELECCIONADA            */}
      {/* ───────────────────────────────────────────────────────────────── */}

      {/* 2.A: SECCIÓN EXCLUSIVA DE SERVICIO */}
      {classification === "SERVICIO" && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Briefcase size={18} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide text-amber-900 dark:text-amber-200">
                Detalles del Servicio
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80">
                Los servicios no descuentan inventario físico y se registran directamente con su tarifa o comisión.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">Tipo de Servicio</Label>
              <Select
                value={serviceType || "INGRESO"}
                onValueChange={(v) => onChangeService && onChangeService("serviceType", v)}
                disabled={readOnly}
              >
                <SelectTrigger className="h-10 rounded-xl bg-[var(--card)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INGRESO">Servicio de Ingreso (Venta / Cobro)</SelectItem>
                  <SelectItem value="SALIDA">Servicio de Salida (Costo / Pago)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[var(--text-sec)]">Determina el impacto en caja.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Precio del Servicio ($)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-sec)]">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={servicePrice}
                  onChange={(e) => onChangeService && onChangeService("servicePrice", e.target.value)}
                  placeholder="0.00"
                  className="h-10 pl-7 rounded-xl bg-[var(--card)]"
                  disabled={readOnly}
                />
              </div>
              <p className="text-[10px] text-[var(--text-sec)]">
                Tarifa base. Opcional (puede ingresarse libremente al vender).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Comisión o Ganancia Fija ($)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-sec)]">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={fixedCommission}
                  onChange={(e) => onChangeService && onChangeService("fixedCommission", e.target.value)}
                  placeholder="0.00"
                  className="h-10 pl-7 rounded-xl bg-[var(--card)]"
                  disabled={readOnly}
                />
              </div>
              <p className="text-[10px] text-[var(--text-sec)]">
                Ganancia fija por ejecución del servicio.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2.B: FICHA TÉCNICA AGROQUÍMICA */}
      {classification === "AGROQUIMICO" && (
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FlaskConical size={18} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                Ficha Técnica de Agroquímico
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80">
                Información técnica para clasificación por ingredientes, formulación y dosificación.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* Tipo de Agroquímico (Combobox / Select con opción de nuevo) */}
            <DynamicCombobox
              label="Tipo de Producto Agroquímico"
              placeholder="Ej. Insecticida, Fungicida..."
              value={agrochemicalType}
              onChange={(val) => onChangeTechnical("agrochemicalType", val)}
              options={options.agrochemicalTypes}
              disabled={readOnly}
              helper="Clasificación por acción o función principal"
            />

            {/* Familia o Grupo Químico */}
            <DynamicCombobox
              label="Familia o Grupo Químico"
              placeholder="Ej. Piretroides, Triazoles..."
              value={chemicalFamily}
              onChange={(val) => onChangeTechnical("chemicalFamily", val)}
              options={options.chemicalFamilies}
              disabled={readOnly}
              helper="Grupo químico para rotación agronómica"
            />

            {/* Formulación o Concentración */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Formulación / Concentración
              </Label>
              <Input
                value={formulation}
                onChange={(e) => onChangeTechnical("formulation", e.target.value)}
                placeholder="Ej. CE 25%, SC 500 g/L, WG"
                className="h-10 rounded-xl bg-[var(--card)]"
                disabled={readOnly}
              />
              <p className="text-[10px] text-[var(--text-sec)]">
                Presentación física y porcentaje del activo
              </p>
            </div>
          </div>

          {/* Ingredientes Activos (Tag selector múltiple) */}
          <MultiBadgeSelector
            label="Ingrediente(s) Activo(s)"
            placeholder="Escribe o selecciona un ingrediente y presiona Enter..."
            selected={currentIngredients}
            onToggle={handleToggleIngredient}
            suggestions={options.activeIngredients}
            disabled={readOnly}
            color="emerald"
            helper="Puedes agregar uno o varios ingredientes activos"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dosificación */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Dosificación Recomendada
              </Label>
              <Input
                value={dosage}
                onChange={(e) => onChangeTechnical("dosage", e.target.value)}
                placeholder="Ej. 1.0 a 1.5 L/ha ó 25-30 ml/bomba 16L"
                className="h-10 rounded-xl bg-[var(--card)]"
                disabled={readOnly}
              />
              <p className="text-[10px] text-[var(--text-sec)]">
                Dosis de aplicación sugerida en campo
              </p>
            </div>

            {/* Información Técnica / Notas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Período de Carencia / Notas Técnicas
              </Label>
              <Input
                value={technicalNotes}
                onChange={(e) => onChangeTechnical("technicalNotes", e.target.value)}
                placeholder="Ej. Intervalo a cosecha: 7 días. Reingreso: 24h"
                className="h-10 rounded-xl bg-[var(--card)]"
                disabled={readOnly}
              />
              <p className="text-[10px] text-[var(--text-sec)]">
                Datos de seguridad o compatibilidad de mezcla
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2.C: FICHA TÉCNICA VETERINARIA */}
      {classification === "VETERINARIO" && (
        <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Stethoscope size={18} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide text-purple-900 dark:text-purple-200">
                Ficha Técnica Veterinaria
              </h4>
              <p className="text-xs text-purple-800 dark:text-purple-300/80">
                Información para medicamentos, vitaminas y salud animal por especie y administración.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Tipo de Medicamento / Producto Veterinario */}
            <DynamicCombobox
              label="Tipo de Medicamento / Producto"
              placeholder="Ej. Antibiótico, Antiparasitario, Vitamina..."
              value={veterinaryType}
              onChange={(val) => onChangeTechnical("veterinaryType", val)}
              options={options.veterinaryTypes}
              disabled={readOnly}
              helper="Acción terapéutica o categoría médica"
            />

            {/* Dosificación y Vía */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[var(--text-main)]">
                Dosificación y Vía de Administración
              </Label>
              <Input
                value={dosage}
                onChange={(e) => onChangeTechnical("dosage", e.target.value)}
                placeholder="Ej. 1 ml / 50 kg P.V. vía intramuscular profunda"
                className="h-10 rounded-xl bg-[var(--card)]"
                disabled={readOnly}
              />
              <p className="text-[10px] text-[var(--text-sec)]">
                Vía de aplicación (IM, SC, oral) y dosificación
              </p>
            </div>
          </div>

          {/* Ingredientes Activos */}
          <MultiBadgeSelector
            label="Ingrediente(s) Activo(s) o Fórmula"
            placeholder="Escribe o selecciona un principio activo..."
            selected={currentIngredients}
            onToggle={handleToggleIngredient}
            suggestions={options.activeIngredients}
            disabled={readOnly}
            color="purple"
            helper="Principios activos de la formulación veterinaria"
          />

          {/* Especies de Destino */}
          <MultiBadgeSelector
            label="Especie(s) Animales de Destino"
            placeholder="Escribe o selecciona una especie (Bovinos, Equinos...)..."
            selected={currentSpecies}
            onToggle={handleToggleSpecies}
            suggestions={options.targetSpecies}
            disabled={readOnly}
            color="purple"
            helper="Animales para los cuales está indicado el producto"
          />

          {/* Período de Retiro / Notas */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[var(--text-main)]">
              Período de Retiro / Advertencias Veterinarias
            </Label>
            <Input
              value={technicalNotes}
              onChange={(e) => onChangeTechnical("technicalNotes", e.target.value)}
              placeholder="Ej. Carne: 28 días. Leche: No administrar en hembras en ordeño."
              className="h-10 rounded-xl bg-[var(--card)]"
              disabled={readOnly}
            />
            <p className="text-[10px] text-[var(--text-sec)]">
              Tiempos de espera para consumo humano de carne y leche
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES PARA AUTOCOMPLETADO Y AGREGADO RÁPIDO
// ─────────────────────────────────────────────────────────────────────────────

interface DynamicComboboxProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  helper?: string;
}

function DynamicCombobox({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  helper,
}: DynamicComboboxProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const isPredefined = options.some((o) => o.toLowerCase() === (value || "").toLowerCase());

  const handleSelect = (v: string) => {
    if (v === "__ADD_NEW__") {
      setCustomMode(true);
      setCustomText("");
    } else {
      onChange(v);
    }
  };

  const handleApplyCustom = () => {
    if (customText.trim()) {
      onChange(customText.trim());
      setCustomMode(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-[var(--text-main)]">{label}</Label>
        {!customMode && (
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              setCustomText(value || "");
            }}
            className="text-[11px] text-[var(--primary)] hover:underline font-medium"
            disabled={disabled}
          >
            + Escribir otro
          </button>
        )}
      </div>

      {customMode ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustom();
              }
            }}
            placeholder={placeholder}
            className="h-10 rounded-xl bg-[var(--card)] text-xs flex-1"
            disabled={disabled}
            autoFocus
          />
          <button
            type="button"
            onClick={handleApplyCustom}
            className="h-10 px-3 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shrink-0 hover:opacity-90"
            disabled={disabled || !customText.trim()}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setCustomMode(false)}
            className="h-10 px-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-sec)] hover:bg-[var(--bg)] shrink-0"
            disabled={disabled}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <Select
          value={value || undefined}
          onValueChange={handleSelect}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 rounded-xl bg-[var(--card)]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {value && !isPredefined && (
              <SelectItem value={value} className="font-bold text-[var(--primary)]">
                {value} (Personalizado)
              </SelectItem>
            )}
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
            <SelectItem value="__ADD_NEW__" className="text-[var(--primary)] font-bold">
              + Escribir nuevo valor...
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {helper && <p className="text-[10px] text-[var(--text-sec)]">{helper}</p>}
    </div>
  );
}

interface MultiBadgeSelectorProps {
  label: string;
  placeholder: string;
  selected: string[];
  onToggle: (item: string) => void;
  suggestions: string[];
  disabled?: boolean;
  color?: "emerald" | "purple";
  helper?: string;
}

function MultiBadgeSelector({
  label,
  placeholder,
  selected,
  onToggle,
  suggestions,
  disabled,
  color = "emerald",
  helper,
}: MultiBadgeSelectorProps) {
  const [typed, setTyped] = useState("");
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const handleAddTyped = () => {
    if (typed.trim()) {
      onToggle(typed.trim());
      setTyped("");
    }
  };

  const badgeColorClass =
    color === "emerald"
      ? "bg-emerald-600 text-white border-emerald-600"
      : "bg-purple-600 text-white border-purple-600";

  const chipHoverClass =
    color === "emerald"
      ? "hover:border-emerald-500 hover:text-emerald-600"
      : "hover:border-purple-500 hover:text-purple-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-[var(--text-main)]">{label}</Label>
        <span className="text-[11px] text-[var(--text-sec)]">
          {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Badges seleccionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] min-h-[38px] items-center">
          {selected.map((item) => (
            <span
              key={item}
              className={cn(
                "inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-bold border shadow-xs animate-in zoom-in-95",
                badgeColorClass
              )}
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  className="size-4 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <X size={10} className="stroke-[3]" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input para agregar o buscar */}
      {!disabled && (
        <div className="flex items-center gap-2">
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTyped();
              }
            }}
            placeholder={placeholder}
            className="h-9 text-xs rounded-xl bg-[var(--card)] flex-1"
          />
          <button
            type="button"
            onClick={handleAddTyped}
            disabled={!typed.trim()}
            className="h-9 px-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-colors"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      )}

      {/* Sugerencias en chips para clic rápido */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)]">
            Valores frecuentes (clic para seleccionar):
          </span>
          {suggestions.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="text-[10px] text-[var(--primary)] hover:underline"
            >
              {showAllSuggestions ? "Ver menos" : `Ver todos (${suggestions.length})`}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {(showAllSuggestions ? suggestions : suggestions.slice(0, 10)).map((sug) => {
            const isSelected = selected.some((x) => x.toLowerCase() === sug.toLowerCase());
            return (
              <button
                type="button"
                key={sug}
                onClick={() => onToggle(sug)}
                disabled={disabled}
                className={cn(
                  "px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1",
                  isSelected
                    ? badgeColorClass
                    : cn("bg-[var(--bg)]/70 border-[var(--border)] text-[var(--text-sec)]", chipHoverClass)
                )}
              >
                {isSelected && <Check size={10} className="stroke-[3]" />}
                {sug}
              </button>
            );
          })}
        </div>
      </div>

      {helper && <p className="text-[10px] text-[var(--text-sec)]">{helper}</p>}
    </div>
  );
}
