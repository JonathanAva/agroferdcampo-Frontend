import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { TruckIcon, MapPin, Search, Plus, ExternalLink, Loader2, X, BookmarkCheck } from "lucide-react";
import { apiRequest } from "../../config/api";
import { departments, zones, districts } from "../../types/catalogs";
import { DeliveryMapPicker } from "./DeliveryMapPicker";
import { parseMapLink, isUrl, geocodeAddress, googleMapsUrl } from "./mapUtils";

/** Dirección estructurada que se envía al backend (se guarda en la tabla delivery_addresses) */
export interface DeliveryAddressData {
  id?: number;
  department: string;
  municipality: string;
  district?: string;
  colonia?: string;
  street?: string;
  reference?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface TransportData {
  requiresTransport: boolean;
  vehicleId?: number;
  driverId?: number;
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
}

const EMPTY: DeliveryAddressData = { department: "", municipality: "" };

/** Texto legible (igual al que arma el backend) */
export function composeDeliveryAddress(d?: Partial<DeliveryAddressData> | null): string {
  if (!d) return "";
  const c = (v?: string) => (v ?? "").trim();
  const text = [c(d.street), c(d.colonia), c(d.district), c(d.municipality), c(d.department)].filter(Boolean).join(", ");
  return c(d.reference) ? `${text} — Ref: ${c(d.reference)}` : text;
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
    mapUrl: ref.mapUrl || undefined,
    latitude: num(ref.latitude),
    longitude: num(ref.longitude),
  };
}

/** Devuelve un mensaje de error si la entrega a domicilio está incompleta; null si está bien */
export function validateTransport(data: TransportData | null | undefined): string | null {
  if (!data?.requiresTransport) return null;
  const d = data.deliveryAddressData;
  if (!d?.department?.trim()) return "Seleccione el departamento de la dirección de entrega";
  if (!d?.municipality?.trim()) return "Seleccione el municipio de la dirección de entrega";
  return null;
}

const selectClass =
  "w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 disabled:opacity-50";

export function TransportSelector({ customerId, value, onChange, disabled }: TransportSelectorProps) {
  const [saved, setSaved] = useState<SavedDeliveryAddress[]>([]);
  const [search, setSearch] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [mapInput, setMapInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState<string | null>(null);
  const autoFilledFor = useRef<number | null | undefined>(undefined);

  const data: DeliveryAddressData = value?.deliveryAddressData ?? EMPTY;
  const valueRef = useRef(value);
  valueRef.current = value;

  /** Actualiza la dirección estructurada y el texto compuesto */
  const setData = (patch: Partial<DeliveryAddressData>, replace = false) => {
    const current = valueRef.current;
    if (!current) return;
    const next: DeliveryAddressData = replace ? { ...EMPTY, ...patch } : { ...(current.deliveryAddressData ?? EMPTY), ...patch };
    onChange({ ...current, deliveryAddressData: next, deliveryAddress: composeDeliveryAddress(next) });
  };

  // Compatibilidad: si viene solo texto (cotizaciones antiguas / dirección del cliente), pasarlo a "calle"
  useEffect(() => {
    if (value?.requiresTransport && !value.deliveryAddressData) {
      const legacy = value.deliveryAddress?.trim();
      const next: DeliveryAddressData = { ...EMPTY, ...(legacy ? { street: legacy } : {}) };
      onChange({ ...value, deliveryAddressData: next, deliveryAddress: composeDeliveryAddress(next) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.requiresTransport, value?.deliveryAddressData]);

  // Sincronizar el campo del link con la dirección cargada
  useEffect(() => {
    setMapInput(data.mapUrl ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  // Cargar direcciones guardadas (del cliente, o búsqueda general para clientes no registrados)
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
        if (dep || street) {
          setData({
            department: dep && dep.value !== "00" ? dep.label : "",
            municipality: zone?.label ?? "",
            district: dist?.label,
            street,
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
      mapUrl: a.mapUrl || undefined,
      latitude: num(a.latitude),
      longitude: num(a.longitude),
    }, true);
    setMapInput(a.mapUrl || "");
    setLocateMsg(null);
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

  /** Busca en el mapa el texto pegado (si no es link) o la dirección escrita */
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
      // Si no encuentra la dirección exacta, intentar con municipio/departamento
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
      setLocateMsg("No se pudo buscar en el mapa (sin conexión). Marque el punto a mano.");
    } finally {
      setLocating(false);
    }
  };

  const hasPoint = data.latitude !== undefined && data.longitude !== undefined;
  const missingDep = !data.department;
  const missingMun = !data.municipality;

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
        <Switch checked={!!value?.requiresTransport} onCheckedChange={handleToggle} disabled={disabled} />
      </div>

      {value?.requiresTransport && (
        <div className="pt-4 border-t border-[var(--border)] space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Direcciones guardadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)] flex items-center gap-1">
                <BookmarkCheck size={14} /> Direcciones guardadas
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
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
              <Input
                placeholder={customerId ? "Filtrar direcciones del cliente..." : "Buscar dirección usada antes (colonia, calle...)"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
                className="pl-8 h-9 bg-[var(--bg)] text-sm"
              />
              {loadingSaved && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-sec)]" />}
            </div>
            {saved.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-[var(--border)] p-1 bg-[var(--bg)]">
                {saved.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    disabled={disabled}
                    onClick={() => applySaved(a)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-[var(--primary)]/10 flex items-start gap-2 ${data.id === a.id ? "bg-[var(--primary)]/15 font-semibold" : ""}`}
                  >
                    <MapPin size={12} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                    <span className="flex-1 text-[var(--text-main)]">{a.fullAddress}</span>
                    <span className="text-[10px] text-[var(--text-sec)] shrink-0">{a.usedCount}×</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Departamento / Municipio / Distrito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <option value="">Seleccione...</option>
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
                <option value="">{selectedDep ? "Seleccione..." : "Elija departamento"}</option>
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

          {/* Colonia / Calle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Colonia / Barrio / Cantón</Label>
              <Input
                placeholder="Ej: Col. Escalón"
                value={data.colonia ?? ""}
                onChange={(e) => setData({ colonia: e.target.value })}
                disabled={disabled}
                className="h-9 bg-[var(--bg)]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Calle / Pasaje / # Casa</Label>
              <Input
                placeholder="Ej: Calle El Mirador, casa #12"
                value={data.street ?? ""}
                onChange={(e) => setData({ street: e.target.value })}
                disabled={disabled}
                className="h-9 bg-[var(--bg)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Punto de referencia</Label>
            <Textarea
              rows={2}
              placeholder="Ej: Frente a la iglesia, portón verde"
              value={data.reference ?? ""}
              onChange={(e) => setData({ reference: e.target.value })}
              disabled={disabled}
              className="bg-[var(--bg)] text-sm resize-none"
            />
          </div>

          {/* Mapa */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-[var(--text-sec)]">Ubicación en mapa</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-sec)]" />
                <Input
                  placeholder="Pegue el link de Google Maps / WhatsApp o escriba una dirección"
                  value={mapInput}
                  onChange={(e) => handleMapInput(e.target.value)}
                  disabled={disabled}
                  className="pl-8 pr-8 h-9 bg-[var(--bg)] text-sm"
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
            {locateMsg && <p className="text-[11px] text-[var(--text-sec)]">{locateMsg}</p>}

            <DeliveryMapPicker
              lat={data.latitude}
              lng={data.longitude}
              disabled={disabled}
              onChange={(lat, lng) => setData({ latitude: lat, longitude: lng })}
            />
            <div className="flex items-center justify-between text-[11px] text-[var(--text-sec)]">
              <span>Haga clic en el mapa o arrastre el pin para marcar el punto exacto.</span>
              <div className="flex items-center gap-3">
                {hasPoint && (
                  <>
                    <button type="button" className="hover:underline" disabled={disabled} onClick={() => setData({ latitude: undefined, longitude: undefined })}>
                      Quitar pin
                    </button>
                    <a href={googleMapsUrl(data.latitude!, data.longitude!)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--primary)] hover:underline">
                      Ver en Google Maps <ExternalLink size={11} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Vista previa */}
          <div className="rounded-md bg-[var(--bg)] border border-dashed border-[var(--border)] p-2 text-xs">
            <span className="font-bold text-[var(--text-sec)]">Dirección de entrega: </span>
            <span className="text-[var(--text-main)]">
              {value.deliveryAddress || <em className="text-amber-500">Complete departamento y municipio</em>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
