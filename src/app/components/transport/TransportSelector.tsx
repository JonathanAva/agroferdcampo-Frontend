import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { 
  TruckIcon, MapPin, Search, Plus, ExternalLink, Loader2, X, BookmarkCheck, 
  Navigation, Phone, User, AlertTriangle, AlertCircle, Sparkles 
} from "lucide-react";
import { apiRequest } from "../../config/api";
import { departments, zones, districts } from "../../types/catalogs";
import { DeliveryMapPicker } from "./DeliveryMapPicker";
import { parseMapLink, isUrl, geocodeAddress, googleMapsUrl } from "./mapUtils";
import { useVehicles } from "../../hooks/useVehicles";

/** Opciones de acceso para despachos de ferretería / materiales */
export const VEHICLE_ACCESS_OPTIONS = [
  "Acceso para camión pesado (Rastra / Volqueta)",
  "Acceso para camión liviano (3.5 a 5 toneladas)",
  "Acceso para Pick-up / Camioneta",
  "Solo Pick-up 4x4 (Calle difícil / quebrada / pendiente)",
  "Solo Motocicleta / Acceso peatonal",
  "Calle amplia pavimentada",
  "Calle de tierra transitable",
  "Calle angosta (No entra camión)",
];

/** Dirección estructurada que se envía al backend (tabla delivery_addresses) */
export interface DeliveryAddressData {
  id?: number;
  department: string;
  municipality: string;
  district?: string;
  colonia?: string;
  street?: string;
  reference?: string;
  recipientName?: string;
  recipientPhone?: string;
  requiresUrbaneo?: boolean;
  urbaneoNotes?: string;
  isUrgent?: boolean;
  vehicleAccess?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface TransportData {
  requiresTransport: boolean;
  vehicleId?: number;
  driverId?: number;
  isUrgent?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  requiresUrbaneo?: boolean;
  urbaneoNotes?: string;
  /** Texto completo (se arma automáticamente desde los campos estructurados) */
  deliveryAddress?: string;
  deliveryAddressData?: DeliveryAddressData;
  scheduledDeliveryAt?: string;
}

interface SavedDeliveryAddress extends Omit<DeliveryAddressData, "latitude" | "longitude"> {
  id: number;
  fullAddress: string;
  usedCount: number;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

interface TransportSelectorProps {
  customerId?: number;
  value: TransportData | null;
  onChange: (data: TransportData | null) => void;
  disabled?: boolean;
  hideHeaderToggle?: boolean;
  wideLayout?: boolean;
}

const EMPTY: DeliveryAddressData = { department: "", municipality: "" };

/** Texto legible (igual al que arma el backend) */
export function composeDeliveryAddress(d?: Partial<DeliveryAddressData> | null): string {
  if (!d) return "";
  const c = (v?: string | null) => (v ?? "").trim();
  const parts = [c(d.street), c(d.colonia), c(d.district), c(d.municipality), c(d.department)].filter(Boolean);
  let text = parts.join(", ");
  if (c(d.reference)) text += ` — Ref: ${c(d.reference)}`;
  if (c(d.recipientPhone)) text += ` — Recibe: ${c(d.recipientName) ? c(d.recipientName) + " " : ""}(Tel: ${c(d.recipientPhone)})`;
  if (d.requiresUrbaneo) text += ` [REQUIERE URBANEO${c(d.urbaneoNotes) ? ": " + c(d.urbaneoNotes) : ""}]`;
  if (d.isUrgent) text += ` [URGENTE]`;
  if (c(d.vehicleAccess)) text += ` [Acceso: ${c(d.vehicleAccess)}]`;
  return text;
}

/** Convierte la dirección guardada (deliveryAddressRef del backend) al formato del selector */
export function addressRefToData(ref: any): DeliveryAddressData | undefined {
  if (!ref) return undefined;
  const num = (v: any) => (v === null || v === undefined || v === "" ? undefined : Number(v));
  return {
    id: ref.id,
    department: ref.department || "",
    municipality: ref.municipality || "",
    district: ref.district || undefined,
    colonia: ref.colonia || undefined,
    street: ref.street || undefined,
    reference: ref.reference || undefined,
    recipientName: ref.recipientName || undefined,
    recipientPhone: ref.recipientPhone || undefined,
    requiresUrbaneo: ref.requiresUrbaneo ?? false,
    urbaneoNotes: ref.urbaneoNotes || undefined,
    isUrgent: ref.isUrgent ?? false,
    vehicleAccess: ref.vehicleAccess || undefined,
    mapUrl: ref.mapUrl || undefined,
    latitude: num(ref.latitude),
    longitude: num(ref.longitude),
  };
}

/** Devuelve un mensaje de error si la entrega a domicilio está incompleta; null si está bien */
export function validateTransport(data: TransportData | null | undefined): string | null {
  if (!data?.requiresTransport) return null;
  const d = data.deliveryAddressData;
  const phone = (data.recipientPhone?.trim() || d?.recipientPhone?.trim());
  if (!phone) {
    return "El teléfono de la persona que recibe la entrega es OBLIGATORIO";
  }
  if (!d?.department?.trim()) return "Seleccione el departamento de la dirección de entrega";
  if (!d?.municipality?.trim()) return "Seleccione el municipio de la dirección de entrega";
  return null;
}

const selectClass =
  "w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 disabled:opacity-50";

export function TransportSelector({ customerId, value, onChange, disabled, hideHeaderToggle = false, wideLayout }: TransportSelectorProps) {
  const isWide = wideLayout ?? hideHeaderToggle;
  const [saved, setSaved] = useState<SavedDeliveryAddress[]>([]);
  const [colonias, setColonias] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [mapInput, setMapInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState<string | null>(null);
  const autoFilledFor = useRef<number | null | undefined>(undefined);

  // Cargar camiones disponibles de la flota
  const { vehicles, loading: loadingVehicles } = useVehicles({ status: 'ALL' });

  const data: DeliveryAddressData = value?.deliveryAddressData ?? EMPTY;
  const valueRef = useRef(value);
  valueRef.current = value;

  /** Actualiza la dirección estructurada y el texto compuesto */
  const setData = (patch: Partial<DeliveryAddressData>, replace = false) => {
    const current = valueRef.current;
    if (!current) return;
    const next: DeliveryAddressData = replace ? { ...EMPTY, ...patch } : { ...(current.deliveryAddressData ?? EMPTY), ...patch };
    onChange({ 
      ...current, 
      deliveryAddressData: next, 
      deliveryAddress: composeDeliveryAddress(next),
      ...(patch.recipientPhone !== undefined ? { recipientPhone: patch.recipientPhone } : {}),
      ...(patch.recipientName !== undefined ? { recipientName: patch.recipientName } : {}),
      ...(patch.requiresUrbaneo !== undefined ? { requiresUrbaneo: patch.requiresUrbaneo } : {}),
      ...(patch.urbaneoNotes !== undefined ? { urbaneoNotes: patch.urbaneoNotes } : {}),
      ...(patch.isUrgent !== undefined ? { isUrgent: patch.isUrgent } : {}),
    });
  };

  // Compatibilidad: si viene solo texto, extraer a calle
  useEffect(() => {
    if (value?.requiresTransport && !value.deliveryAddressData) {
      const legacy = value.deliveryAddress?.trim();
      const next: DeliveryAddressData = { 
        ...EMPTY, 
        ...(legacy ? { street: legacy } : {}),
        recipientPhone: value.recipientPhone,
        recipientName: value.recipientName,
        requiresUrbaneo: value.requiresUrbaneo,
        urbaneoNotes: value.urbaneoNotes,
        isUrgent: value.isUrgent,
      };
      onChange({ ...value, deliveryAddressData: next, deliveryAddress: composeDeliveryAddress(next) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.requiresTransport, value?.deliveryAddressData]);

  // Sincronizar el campo del link con la dirección cargada
  useEffect(() => {
    setMapInput(data.mapUrl ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  // Cargar colonias / cantones guardados en la BD (ej. "El Portillo")
  useEffect(() => {
    if (!value?.requiresTransport) return;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (data.department) params.set("department", data.department);
        if (data.municipality) params.set("municipality", data.municipality);
        const res = await apiRequest<any[]>(`/delivery-addresses/colonias?${params.toString()}`);
        if (Array.isArray(res)) setColonias(res);
      } catch {
        setColonias([]);
      }
    })();
  }, [value?.requiresTransport, data.department, data.municipality]);

  // Cargar direcciones guardadas (del cliente o búsqueda general)
  useEffect(() => {
    if (!value?.requiresTransport) return;
    const q = search.trim();
    if (!customerId && q.length < 2) {
      setSaved([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoadingSaved(true);
      try {
        const params = new URLSearchParams();
        if (customerId) params.set("customerId", String(customerId));
        if (q) params.set("q", q);
        params.set("limit", "10");
        const list = await apiRequest<SavedDeliveryAddress[]>(`/delivery-addresses?${params.toString()}`);
        setSaved(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Error cargando direcciones guardadas", e);
        setSaved([]);
      } finally {
        setLoadingSaved(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [value?.requiresTransport, customerId, search]);

  // Autocompletar: dirección más usada del cliente, o los datos de su ficha
  useEffect(() => {
    if (!value?.requiresTransport || !customerId || autoFilledFor.current === customerId) return;
    const d = value.deliveryAddressData;
    const isEmpty = !d?.department && !d?.id;
    if (!isEmpty) {
      autoFilledFor.current = customerId;
      return;
    }
    (async () => {
      try {
        const list = await apiRequest<SavedDeliveryAddress[]>(`/delivery-addresses?customerId=${customerId}&limit=1`);
        if (Array.isArray(list) && list.length > 0) {
          autoFilledFor.current = customerId;
          applySaved(list[0]);
          return;
        }
        const cust = await apiRequest<any>(`/customers/${customerId}`);
        autoFilledFor.current = customerId;
        if (!cust) return;
        const dep = departments.find((x) => x.value === cust.department);
        const zone = dep ? zones.find((z) => z.departmentId === dep.value && z.value === cust.municipality) : undefined;
        const dist = dep && cust.district ? districts.find((z) => z.departmentId === dep.value && z.value === cust.district) : undefined;
        const street = valueRef.current?.deliveryAddressData?.street || cust.addressComplement || cust.address || undefined;
        if (dep || street || cust.phone) {
          setData({
            department: dep && dep.value !== "00" ? dep.label : "",
            municipality: zone?.label ?? "",
            district: dist?.label,
            street,
            recipientPhone: cust.phone || undefined,
            recipientName: cust.name || undefined,
          }, true);
        }
      } catch (e) {
        console.error("Error obteniendo la dirección del cliente", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.requiresTransport, customerId]);

  const selectedDep = useMemo(() => departments.find((d) => d.label === data.department), [data.department]);
  const municipalityOptions = useMemo(
    () => (selectedDep ? zones.filter((z) => z.departmentId === selectedDep.value) : []),
    [selectedDep],
  );
  const districtOptions = useMemo(
    () => (selectedDep ? districts.filter((z) => z.departmentId === selectedDep.value) : []),
    [selectedDep],
  );

  const applySaved = (a: SavedDeliveryAddress) => {
    const num = (v: any) => (v === null || v === undefined || v === "" ? undefined : Number(v));
    setData({
      id: a.id,
      department: a.department,
      municipality: a.municipality,
      district: a.district || undefined,
      colonia: a.colonia || undefined,
      street: a.street || undefined,
      reference: a.reference || undefined,
      recipientName: a.recipientName || undefined,
      recipientPhone: a.recipientPhone || undefined,
      requiresUrbaneo: a.requiresUrbaneo ?? false,
      urbaneoNotes: a.urbaneoNotes || undefined,
      isUrgent: a.isUrgent ?? false,
      vehicleAccess: a.vehicleAccess || undefined,
      mapUrl: a.mapUrl || undefined,
      latitude: num(a.latitude),
      longitude: num(a.longitude),
    }, true);
    setMapInput(a.mapUrl || "");
    setLocateMsg(null);
  };

  /** Al hacer clic en una colonia guardada (ej: "El Portillo"), rellena sus datos */
  const applyColoniaItem = (item: any) => {
    const num = (v: any) => (v === null || v === undefined || v === "" ? undefined : Number(v));
    setData({
      colonia: item.colonia || "",
      ...(item.department ? { department: item.department } : {}),
      ...(item.municipality ? { municipality: item.municipality } : {}),
      ...(item.district ? { district: item.district } : {}),
      ...(item.vehicleAccess ? { vehicleAccess: item.vehicleAccess } : {}),
      ...(item.latitude != null ? { latitude: num(item.latitude), longitude: num(item.longitude) } : {}),
      ...(item.mapUrl ? { mapUrl: item.mapUrl } : {}),
    });
    if (item.mapUrl) setMapInput(item.mapUrl);
    setLocateMsg(`Ubicación de "${item.colonia}" aplicada`);
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      autoFilledFor.current = undefined;
      onChange({ requiresTransport: true, deliveryAddress: "", deliveryAddressData: { ...EMPTY } });
    } else {
      onChange(null);
    }
  };

  /** Link o texto pegado en el campo de mapa */
  const handleMapInput = (text: string) => {
    setMapInput(text);
    setLocateMsg(null);
    const coords = parseMapLink(text);
    if (coords) {
      setData({ mapUrl: text.trim() || undefined, latitude: coords.lat, longitude: coords.lng });
      setLocateMsg("Ubicación tomada del link ✔");
    } else if (isUrl(text)) {
      setData({ mapUrl: text.trim() });
      setLocateMsg("Link guardado. Si el pin no aparece, márquelo en el mapa.");
    } else if (!text.trim()) {
      setData({ mapUrl: undefined });
    }
  };

  /** Busca en el mapa el texto pegado o la dirección */
  const handleLocate = async () => {
    const query = mapInput.trim() && !isUrl(mapInput)
      ? mapInput.trim()
      : [data.street, data.colonia, data.district, data.municipality, data.department].filter(Boolean).join(", ");
    if (!query) {
      setLocateMsg("Escriba una dirección o pegue un link para ubicar.");
      return;
    }
    setLocating(true);
    setLocateMsg(null);
    try {
      let coords = await geocodeAddress(query);
      if (!coords && data.colonia) {
        coords = await geocodeAddress([data.colonia, data.municipality, data.department].filter(Boolean).join(", "));
      }
      if (!coords && data.municipality) {
        coords = await geocodeAddress([data.district, data.municipality, data.department].filter(Boolean).join(", "));
      }
      if (coords) {
        setData({ latitude: coords.lat, longitude: coords.lng, ...(!isUrl(mapInput) && mapInput.trim() ? { mapUrl: mapInput.trim() } : {}) });
        setLocateMsg("Ubicación aproximada encontrada. Ajuste el pin si es necesario.");
      } else {
        setLocateMsg("No se encontró la dirección. Marque el punto directamente en el mapa.");
      }
    } catch {
      setLocateMsg("No se pudo buscar en el mapa. Marque el punto a mano.");
    } finally {
      setLocating(false);
    }
  };

  const hasPoint = data.latitude !== undefined && data.longitude !== undefined;
  const missingDep = !data.department;
  const missingMun = !data.municipality;
  const currentRecipientPhone = value?.recipientPhone || data.recipientPhone || "";
  const missingPhone = !currentRecipientPhone.trim();

  return (
    <div className="space-y-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      {/* Cabecera con switch (solo si no está oculto por un selector padre) */}
      {!hideHeaderToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <TruckIcon size={18} />
            </div>
            <div>
              <Label className="text-sm font-bold text-[var(--text-main)]">Entrega a domicilio</Label>
              <p className="text-[10px] text-[var(--text-sec)]">Gestionar logística, camión y dirección de entrega</p>
            </div>
          </div>
          <Switch checked={!!value?.requiresTransport} onCheckedChange={handleToggle} disabled={disabled} />
        </div>
      )}

      {value?.requiresTransport && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          
          {/* 1. SECCIÓN: CONTACTO DE RECEPCIÓN (OBLIGATORIO) */}
          <div className="space-y-2 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/70">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)] flex items-center gap-1.5">
                <Phone size={14} className="text-[var(--primary)]" /> Contacto de Recepción
              </Label>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                * Teléfono Obligatorio
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[var(--text-sec)]">
                  Teléfono de quien recibe *
                </Label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
                  <Input
                    placeholder="Ej: 7788-9900 (Celular para coordinar entrega)"
                    value={currentRecipientPhone}
                    onChange={(e) => {
                      setData({ recipientPhone: e.target.value });
                      if (value) onChange({ ...value, recipientPhone: e.target.value });
                    }}
                    disabled={disabled}
                    className={`pl-8 h-9 font-mono font-medium bg-[var(--card)] ${
                      missingPhone ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20" : ""
                    }`}
                  />
                </div>
                {missingPhone && (
                  <p className="text-[10px] text-rose-500 font-medium">
                    Requerido para que el chofer pueda avisar al llegar.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[var(--text-sec)]">
                  Nombre de la persona que recibe
                </Label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
                  <Input
                    placeholder="Ej: Don Carlos Mendoza / Encargado de obra"
                    value={value?.recipientName || data.recipientName || ""}
                    onChange={(e) => {
                      setData({ recipientName: e.target.value });
                      if (value) onChange({ ...value, recipientName: e.target.value });
                    }}
                    disabled={disabled}
                    className="pl-8 h-9 bg-[var(--card)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN: GESTIÓN DE LOGÍSTICA Y TRANSPORTE */}
          <div className="space-y-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50">
            <Label className="text-xs font-bold uppercase text-[var(--text-sec)] flex items-center gap-1.5">
              <TruckIcon size={14} className="text-[var(--primary)]" /> Gestión de Logística y Transporte
            </Label>

            {/* A & C) CARÁCTER DE URGENCIA + INDICADOR DE MANIOBRA («URBANEARSE») */}
            <div className={isWide ? "grid grid-cols-1 lg:grid-cols-2 gap-3" : "space-y-3"}>
              {/* A) CARÁCTER DE URGENCIA */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase cursor-pointer">
                      ¿Pedido con Carácter de Urgencia?
                    </Label>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                      Máxima prioridad en asignación de rutas y despacho
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!(value?.isUrgent || data.isUrgent)}
                  onCheckedChange={(checked) => {
                    setData({ isUrgent: checked });
                    if (value) onChange({ ...value, isUrgent: checked });
                  }}
                  disabled={disabled}
                />
              </div>

              {/* C) INDICADOR DE MANIOBRA («URBANEARSE» O DESCARGA DIRECTA) */}
              <div className="space-y-2 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <Label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">
                        Indicador de Maniobra («Urbanearse»)
                      </Label>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                        ¿Descarga directo o requiere traslado manual?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setData({ requiresUrbaneo: false });
                        if (value) onChange({ ...value, requiresUrbaneo: false });
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-bold border transition-all ${
                        !(value?.requiresUrbaneo || data.requiresUrbaneo)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-[var(--card)] text-[var(--text-sec)] border-[var(--border)] hover:bg-[var(--bg)]"
                      }`}
                    >
                      Directo al punto
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setData({ requiresUrbaneo: true });
                        if (value) onChange({ ...value, requiresUrbaneo: true });
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-bold border transition-all ${
                        (value?.requiresUrbaneo || data.requiresUrbaneo)
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-[var(--card)] text-[var(--text-sec)] border-[var(--border)] hover:bg-[var(--bg)]"
                      }`}
                    >
                      Requiere «Urbanearse»
                    </button>
                  </div>
                </div>

                {(value?.requiresUrbaneo || data.requiresUrbaneo) && (
                  <div className="pt-1.5 animate-in fade-in space-y-1">
                    <Label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase">
                      Detalle del acarreo manual / tramo difícil
                    </Label>
                    <Input
                      placeholder="Ej: Camión queda en calle principal; acarreo a mano 100m..."
                      value={value?.urbaneoNotes || data.urbaneoNotes || ""}
                      onChange={(e) => {
                        setData({ urbaneoNotes: e.target.value });
                        if (value) onChange({ ...value, urbaneoNotes: e.target.value });
                      }}
                      disabled={disabled}
                      className="h-8 text-xs bg-[var(--card)]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* B & D) CAMIONES DISPONIBLES + ACCESO VEHICULAR */}
            <div className={isWide ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
              {/* B) REGISTRO O SELECCIÓN DE CAMIONES DISPONIBLES */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[var(--text-sec)]">
                  Camión Asignado (Flota de Transporte)
                </Label>
                <select
                  className={selectClass}
                  value={value?.vehicleId ?? ""}
                  disabled={disabled || loadingVehicles}
                  onChange={(e) => {
                    const vId = e.target.value ? Number(e.target.value) : undefined;
                    if (value) onChange({ ...value, vehicleId: vId });
                  }}
                >
                  <option value="">(Opcional) Asignar camión en despacho / Sin asignar...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nickname ? `🚛 ${v.nickname} - ` : "🚛 "} {v.plate} ({v.brand} {v.model})
                      {v.capacityKg ? ` · Cap: ${v.capacityKg} kg` : ""} [{v.status}]
                    </option>
                  ))}
                </select>
                {loadingVehicles && (
                  <span className="text-[10px] text-[var(--text-sec)] flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Cargando camiones disponibles...
                  </span>
                )}
              </div>

              {/* D) ACCESO VEHICULAR */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[var(--text-sec)]">
                  Tipo de Acceso Vehicular de la Zona
                </Label>
                <select
                  className={selectClass}
                  value={VEHICLE_ACCESS_OPTIONS.includes(data.vehicleAccess || "") ? data.vehicleAccess : (data.vehicleAccess ? "OTRO" : "")}
                  disabled={disabled}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "OTRO") {
                      setData({ vehicleAccess: data.vehicleAccess || "Acceso restringido" });
                    } else {
                      setData({ vehicleAccess: v || undefined });
                    }
                  }}
                >
                  <option value="">(Opcional) Seleccione tipo de acceso vehicular...</option>
                  {VEHICLE_ACCESS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="OTRO">Otro tipo de acceso (especificar)...</option>
                </select>
                {data.vehicleAccess && !VEHICLE_ACCESS_OPTIONS.includes(data.vehicleAccess) && (
                  <Input
                    placeholder="Especifique el acceso vehicular (ej: Calle angosta con cables bajos)..."
                    value={data.vehicleAccess}
                    onChange={(e) => setData({ vehicleAccess: e.target.value })}
                    disabled={disabled}
                    className="h-8 mt-1.5 text-xs bg-[var(--card)]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. SECCIÓN: UBICACIÓN Y DETALLE GEOGRÁFICO */}
          <div className="space-y-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)] flex items-center gap-1.5">
                <BookmarkCheck size={14} className="text-[var(--primary)]" /> Base de Datos de Ubicaciones Frecuentes
              </Label>
              {data.id && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={disabled}
                  onClick={() => { setData({}, true); setMapInput(""); setLocateMsg(null); }}
                >
                  <Plus size={12} className="mr-1" /> Nueva dirección
                </Button>
              )}
            </div>

            {/* Buscador de direcciones guardadas */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
              <Input
                placeholder={customerId ? "Buscar dirección guardada del cliente o por colonia/cantón..." : "Buscar por colonia, cantón, calle guardada..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
                className="pl-8 h-9 bg-[var(--card)] text-sm"
              />
              {loadingSaved && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-sec)]" />}
            </div>

            {saved.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-md border border-[var(--border)] p-1 bg-[var(--card)]">
                {saved.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    disabled={disabled}
                    onClick={() => applySaved(a)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded hover:bg-[var(--primary)]/10 flex items-start gap-2 ${data.id === a.id ? "bg-[var(--primary)]/15 font-semibold border border-[var(--primary)]/30" : ""}`}
                  >
                    <MapPin size={13} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[var(--text-main)] block truncate">{a.fullAddress}</span>
                      {a.colonia && <span className="text-[10px] text-[var(--text-sec)]">Colonia/Zona: {a.colonia}</span>}
                    </div>
                    <span className="text-[10px] text-[var(--text-sec)] shrink-0 font-mono">{a.usedCount}×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Departamento / Municipio / Distrito */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Departamento *</Label>
                <select
                  className={`${selectClass} ${missingDep ? "border-amber-500/70" : ""}`}
                  value={selectedDep?.value ?? ""}
                  disabled={disabled}
                  onChange={(e) => {
                    const dep = departments.find((d) => d.value === e.target.value);
                    setData({ department: dep?.label ?? "", municipality: "", district: undefined });
                  }}
                >
                  <option value="">Seleccione departamento...</option>
                  {departments.filter((d) => d.value !== "00").map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Municipio *</Label>
                <select
                  className={`${selectClass} ${missingMun ? "border-amber-500/70" : ""}`}
                  value={data.municipality}
                  disabled={disabled || !selectedDep}
                  onChange={(e) => setData({ municipality: e.target.value })}
                >
                  <option value="">{selectedDep ? "Seleccione municipio..." : "Elija departamento"}</option>
                  {data.municipality && !municipalityOptions.some((m) => m.label === data.municipality) && (
                    <option value={data.municipality}>{data.municipality}</option>
                  )}
                  {municipalityOptions.map((m) => (
                    <option key={`${m.departmentId}-${m.value}`} value={m.label}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Distrito</Label>
                <select
                  className={selectClass}
                  value={data.district ?? ""}
                  disabled={disabled || !selectedDep}
                  onChange={(e) => setData({ district: e.target.value || undefined })}
                >
                  <option value="">(Opcional)</option>
                  {data.district && !districtOptions.some((m) => m.label === data.district) && (
                    <option value={data.district}>{data.district}</option>
                  )}
                  {districtOptions.map((m) => (
                    <option key={`${m.departmentId}-${m.value}`} value={m.label}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colonia + Dirección exacta (en 2 columnas en modales amplios) */}
            <div className={isWide ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
              {/* Colonia / Cantón / Caserío con sugerencias de BD (ej. El Portillo) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">
                    Colonia / Cantón / Caserío / Barrio
                  </Label>
                  <span className="text-[10px] text-[var(--text-sec)]">Ej: El Portillo, Col. Escalón</span>
                </div>
                <Input
                  list="colonias-frecuentes-list"
                  placeholder="Escriba o seleccione colonia o cantón (Ej: El Portillo)..."
                  value={data.colonia ?? ""}
                  onChange={(e) => setData({ colonia: e.target.value })}
                  disabled={disabled}
                  className="h-9 bg-[var(--card)] font-medium"
                />
                <datalist id="colonias-frecuentes-list">
                  {colonias.map((c, i) => (
                    <option key={`${c.colonia}-${i}`} value={c.colonia}>
                      {c.municipality ? `${c.municipality}, ${c.department}` : ""}
                    </option>
                  ))}
                </datalist>

                {/* Botones de selección rápida para colonias guardadas */}
                {colonias.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[var(--text-sec)] flex items-center gap-0.5">
                      <Navigation size={10} /> Zonas guardadas:
                    </span>
                    {colonias.slice(0, 6).map((c, i) => (
                      <button
                        type="button"
                        key={`${c.colonia}-${i}`}
                        onClick={() => applyColoniaItem(c)}
                        disabled={disabled}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--card)] hover:bg-[var(--primary)]/15 border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors font-medium"
                      >
                        {c.colonia}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dirección exacta: Calle / Pasaje / # Casa */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-[var(--text-sec)] block">
                  Dirección Exacta (Calle / Pasaje / # Casa)
                </Label>
                <Input
                  placeholder="Ej: Calle principal, pasaje 2, frente a la ferretería, casa #14"
                  value={data.street ?? ""}
                  onChange={(e) => setData({ street: e.target.value })}
                  disabled={disabled}
                  className="h-9 bg-[var(--card)]"
                />
              </div>
            </div>

            {/* Punto de referencia */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Punto de referencia</Label>
              <Textarea
                rows={2}
                placeholder="Ej: Frente al campo de fútbol, portón verde junto a la tienda de abarrotes..."
                value={data.reference ?? ""}
                onChange={(e) => setData({ reference: e.target.value })}
                disabled={disabled}
                className="bg-[var(--card)] text-sm resize-none"
              />
            </div>
          </div>

          {/* 4. SECCIÓN: ENLACE DE MAPAS Y MAPA INTERACTIVO */}
          <div className="space-y-2 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)] flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--primary)]" /> Enlace de Mapas y Ubicación GPS
              </Label>
              {hasPoint && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Pin fijado: {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
                <Input
                  placeholder="Pegue aquí el link de Google Maps, Waze o WhatsApp..."
                  value={mapInput}
                  onChange={(e) => handleMapInput(e.target.value)}
                  disabled={disabled}
                  className="pl-8 pr-8 h-9 bg-[var(--card)] text-sm"
                />
                {mapInput && !disabled && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-sec)] hover:text-[var(--text-main)]"
                    onClick={() => { setMapInput(""); setData({ mapUrl: undefined }); setLocateMsg(null); }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={handleLocate} disabled={disabled || locating}>
                {locating ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                <span className="ml-1 hidden sm:inline">Ubicar</span>
              </Button>
            </div>
            {locateMsg && <p className="text-[11px] text-[var(--primary)] font-medium">{locateMsg}</p>}

            <DeliveryMapPicker
              lat={data.latitude}
              lng={data.longitude}
              disabled={disabled}
              height={isWide ? 260 : 220}
              onChange={(lat, lng) => setData({ latitude: lat, longitude: lng })}
            />
            <div className="flex items-center justify-between text-[11px] text-[var(--text-sec)]">
              <span>Haga clic en el mapa o arrastre el pin verde para marcar el punto exacto.</span>
              <div className="flex items-center gap-3">
                {hasPoint && (
                  <>
                    <button type="button" className="hover:underline text-rose-500" disabled={disabled} onClick={() => setData({ latitude: undefined, longitude: undefined })}>
                      Quitar pin
                    </button>
                    <a href={googleMapsUrl(data.latitude!, data.longitude!)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--primary)] hover:underline font-semibold">
                      Ver en Google Maps <ExternalLink size={11} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de Entrega */}
          <div className="rounded-lg bg-[var(--bg)] border border-dashed border-[var(--border)] p-3 text-xs space-y-1">
            <span className="font-bold text-[var(--text-sec)] uppercase block text-[10px]">Resumen de Entrega Generado:</span>
            <span className="text-[var(--text-main)] font-medium block">
              {value.deliveryAddress || <em className="text-amber-500 font-normal">Complete departamento, municipio y teléfono</em>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
