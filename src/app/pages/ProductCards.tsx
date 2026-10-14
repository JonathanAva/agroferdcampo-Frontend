import { useEffect, useRef, useState } from "react";
import {
  Search, Plus, Trash2, ArrowUp, ArrowDown, ImagePlus, ImageOff, Share2, Download,
  Copy, MessageCircle, Package, Loader2, Layers, Square, RotateCcw, ClipboardCopy,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest, API_BASE_URL } from "../config/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import {
  CardData, CardRow, drawProductCard, buildCardText, formatCardPrice, visibleRows,
} from "../utils/productCardRenderer";

interface SearchProduct {
  id: number;
  name: string;
  internalCode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit: string;
  price: number | string | null;
  units?: { unit: string; factor: number | string; priceDetalle?: number | string | null }[];
}

interface ImageOption {
  key: string;
  label: string;
  /** URL original (catálogo) o data: URL de una foto subida desde el equipo */
  src: string;
}

const ACCENT_PRESETS = ["#2D6A4F", "#1D4ED8", "#B91C1C", "#C2410C", "#7C3AED", "#111827"];

const newId = () => Math.random().toString(36).slice(2, 10);

function formatUnitLabel(unit?: string | null) {
  if (!unit) return "";
  return unit.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

/** URL para mostrar una miniatura en pantalla (las rutas locales viven en el origen de la API). */
function displayUrl(src: string) {
  if (src.startsWith("/public/")) {
    try { return new URL(API_BASE_URL).origin + src; } catch { return src; }
  }
  return src;
}

function loadImageElement(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

/**
 * Carga una imagen de forma que el canvas pueda exportarse: las del catálogo pasan por el
 * proxy de la API (mismo origen → canvas sin "contaminar"); si falla, se intenta directo con CORS.
 */
async function loadImageForCanvas(src: string): Promise<{ img: HTMLImageElement; objectUrl?: string }> {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return { img: await loadImageElement(src) };
  }
  try {
    const token = localStorage.getItem("agro-token");
    const resp = await fetch(`${API_BASE_URL}/uploads/image-proxy?url=${encodeURIComponent(src)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) throw new Error("proxy");
    const objectUrl = URL.createObjectURL(await resp.blob());
    return { img: await loadImageElement(objectUrl), objectUrl };
  } catch {
    return { img: await loadImageElement(displayUrl(src), true) };
  }
}

function emptyCard(): CardData {
  return {
    layout: "single",
    title: "",
    description: "",
    rows: [],
    showPrices: true,
    companyName: "",
    contact: "",
    note: "Precios sujetos a cambio sin previo aviso.",
    accent: ACCENT_PRESETS[0],
  };
}

export function ProductCards() {
  const [data, setData] = useState<CardData>(emptyCard);
  const [layoutTouched, setLayoutTouched] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const [imageOptions, setImageOptions] = useState<ImageOption[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const objectUrlRef = useRef<string | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Datos de la empresa para el pie de la ficha
  const [companyDefaults, setCompanyDefaults] = useState({ companyName: "", contact: "" });
  useEffect(() => {
    apiRequest<any>("/system-config")
      .then((cfg) => {
        const defaults = {
          companyName: cfg?.companyName || "",
          contact: cfg?.companyPhone ? `Tel. / WhatsApp: ${cfg.companyPhone}` : "",
        };
        setCompanyDefaults(defaults);
        setData((prev) => ({
          ...prev,
          companyName: prev.companyName || defaults.companyName,
          contact: prev.contact || defaults.contact,
        }));
      })
      .catch(() => {});
  }, []);

  // Búsqueda de productos del catálogo
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiRequest<any>(`/catalog/products/search?q=${encodeURIComponent(q)}&limit=30`);
        setResults(Array.isArray(res) ? res : res?.data || []);
      } catch {
        toast.error("Error al buscar productos");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Cargar la foto elegida
  useEffect(() => {
    let cancelled = false;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = undefined;
    }
    if (!imageSrc) {
      setImage(null);
      return;
    }
    setImageLoading(true);
    loadImageForCanvas(imageSrc)
      .then(({ img, objectUrl }) => {
        if (cancelled) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          return;
        }
        objectUrlRef.current = objectUrl;
        setImage(img);
      })
      .catch(() => {
        if (!cancelled) {
          setImage(null);
          toast.error("No se pudo cargar la foto para la ficha. Puedes subir otra desde tu equipo.");
        }
      })
      .finally(() => !cancelled && setImageLoading(false));
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  // Vista previa: se redibuja con cada cambio
  useEffect(() => {
    if (canvasRef.current) drawProductCard(canvasRef.current, data, image);
  }, [data, image]);

  const update = (patch: Partial<CardData>) => setData((prev) => ({ ...prev, ...patch }));

  const setLayout = (layout: CardData["layout"]) => {
    setLayoutTouched(true);
    update({ layout });
  };

  const addProduct = (p: SearchProduct, withPresentations: boolean) => {
    const basePrice = Number(p.price) || 0;
    const newRows: CardRow[] = [{
      id: newId(),
      productId: p.id,
      label: p.name,
      detail: formatUnitLabel(p.unit),
      price: basePrice ? basePrice.toFixed(2) : "",
      visible: true,
    }];
    if (withPresentations) {
      for (const u of p.units || []) {
        if (u.unit === p.unit) continue;
        const unitPrice = u.priceDetalle != null ? Number(u.priceDetalle) : basePrice * Number(u.factor || 1);
        newRows.push({
          id: newId(),
          productId: p.id,
          label: p.name,
          detail: formatUnitLabel(u.unit),
          price: unitPrice ? unitPrice.toFixed(2) : "",
          visible: true,
        });
      }
    }

    setData((prev) => {
      const rows = [...prev.rows, ...newRows];
      return {
        ...prev,
        rows,
        title: prev.title || p.name,
        description: prev.description || p.description || "",
        layout: !layoutTouched && visibleRows({ ...prev, rows }).length > 1 ? "family" : prev.layout,
      };
    });

    if (p.imageUrl) {
      setImageOptions((prev) =>
        prev.some((o) => o.src === p.imageUrl) ? prev : [...prev, { key: `p${p.id}`, label: p.name, src: p.imageUrl! }],
      );
      if (!imageSrc) setImageSrc(p.imageUrl);
    }
    toast.success(`${p.name} agregado a la ficha`);
  };

  const updateRow = (id: string, patch: Partial<CardRow>) =>
    setData((prev) => ({ ...prev, rows: prev.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  const moveRow = (index: number, delta: number) =>
    setData((prev) => {
      const rows = [...prev.rows];
      const target = index + delta;
      if (target < 0 || target >= rows.length) return prev;
      [rows[index], rows[target]] = [rows[target], rows[index]];
      return { ...prev, rows };
    });

  const removeRow = (id: string) => setData((prev) => ({ ...prev, rows: prev.rows.filter((r) => r.id !== id) }));

  const addManualRow = () =>
    setData((prev) => ({ ...prev, rows: [...prev.rows, { id: newId(), label: "", detail: "", price: "", visible: true }] }));

  const handleUploadImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      setImageOptions((prev) => [...prev, { key: newId(), label: file.name, src }]);
      setImageSrc(src);
    };
    reader.readAsDataURL(file);
  };

  const resetCard = () => {
    setData({ ...emptyCard(), ...companyDefaults });
    setLayoutTouched(false);
    setImageOptions([]);
    setImageSrc(null);
  };

  // ── Exportar / compartir ──
  const fileName = () =>
    (data.title.trim() || "ficha-producto")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() + ".png";

  const getBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error("Sin vista previa"));
      try {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/png");
      } catch {
        // SecurityError: la foto vino de un dominio sin CORS y "contaminó" el canvas
        reject(new Error("La foto no permite exportarse. Sube la imagen desde tu equipo."));
      }
    });

  const validate = () => {
    if (!data.title.trim() && visibleRows(data).length === 0) {
      toast.error("Agrega al menos un producto o un título a la ficha");
      return false;
    }
    return true;
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownload = async () => {
    if (!validate()) return;
    try {
      downloadBlob(await getBlob());
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleShare = async () => {
    if (!validate()) return;
    try {
      const blob = await getBlob();
      const file = new File([blob], fileName(), { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title, text: buildCardText(data) });
      } else {
        downloadBlob(blob);
        toast.info("Este navegador no permite compartir directo: se descargó la imagen para que la adjuntes.");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(e.message || "No se pudo compartir");
    }
  };

  const handleCopyImage = async () => {
    if (!validate()) return;
    try {
      const blob = await getBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Imagen copiada: pégala en WhatsApp Web, Messenger o Facebook");
    } catch (e: any) {
      toast.error(e?.message?.includes("exportarse") ? e.message : "Tu navegador no permite copiar imágenes; usa Descargar.");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildCardText(data));
      toast.success("Texto de la ficha copiado");
    } catch {
      toast.error("No se pudo copiar el texto");
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildCardText(data))}`, "_blank", "noopener");
  };

  const rowsShown = visibleRows(data);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Fichas de Productos</h1>
          <p className="text-[var(--text-sec)]">
            Crea fichas comerciales con foto, presentaciones y precios para compartir con clientes.
          </p>
        </div>
        <Button variant="outline" onClick={resetCard}>
          <RotateCcw size={16} className="mr-2" /> Nueva ficha
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">
        {/* ─── EDITOR ─── */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Tipo de ficha */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">Tipo de ficha</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { value: "single", icon: Square, title: "Producto individual", hint: "Una foto, una presentación y el precio destacado" },
                { value: "family", icon: Layers, title: "Familia de productos", hint: "Una foto y debajo varias medidas/acabados con su precio" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLayout(opt.value)}
                  className={cn(
                    "text-left p-3 rounded-xl border-2 transition-colors flex gap-3 items-start",
                    data.layout === opt.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50",
                  )}
                >
                  <opt.icon size={20} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  <span>
                    <span className="block font-bold text-sm text-[var(--text-main)]">{opt.title}</span>
                    <span className="block text-xs text-[var(--text-sec)]">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Buscar productos */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">Agregar productos del catálogo</Label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nombre, código o marca (mín. 2 letras)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searching && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--primary)]" />}
            </div>
            {results.length > 0 && (
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl">
                {results.map((p) => {
                  const extraUnits = (p.units || []).filter((u) => u.unit !== p.unit).length;
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2.5">
                      <div className="size-11 rounded-lg overflow-hidden bg-[var(--bg)] border border-[var(--border)] shrink-0 flex items-center justify-center">
                        {p.imageUrl
                          ? <img src={displayUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                          : <Package size={18} className="opacity-30" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-[var(--text-main)]">{p.name}</p>
                        <p className="text-xs text-[var(--text-sec)]">
                          {p.internalCode || "S/C"} · {formatUnitLabel(p.unit)} · {formatCardPrice(String(p.price ?? "")) || "Sin precio"}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {extraUnits > 0 && (
                          <Button size="sm" variant="outline" onClick={() => addProduct(p, true)} title="Agregar con todas sus presentaciones">
                            +{extraUnits + 1} pres.
                          </Button>
                        )}
                        <Button size="sm" onClick={() => addProduct(p, false)}>
                          <Plus size={14} className="mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {searchTerm.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="text-xs text-[var(--text-sec)]">Sin resultados.</p>
            )}
          </Card>

          {/* Contenido */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">Contenido de la ficha</Label>
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder={data.layout === "family" ? "Ej. Polín C" : "Nombre del producto"}
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción corta</Label>
              <Textarea
                value={data.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Ej. Ideal para estructuras de techo. Disponible en galvanizado y negro."
                maxLength={300}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex flex-wrap gap-2">
                {imageOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={() => setImageSrc(opt.src)}
                    className={cn(
                      "size-20 rounded-xl overflow-hidden border-2 bg-[var(--bg)]",
                      imageSrc === opt.src ? "border-[var(--primary)]" : "border-[var(--border)] opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={displayUrl(opt.src)} alt={opt.label} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-20 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-[var(--text-sec)]"
                >
                  <ImagePlus size={20} /> Subir foto
                </button>
                {imageSrc && (
                  <button
                    type="button"
                    onClick={() => setImageSrc(null)}
                    className="size-20 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-rose-400 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-[var(--text-sec)]"
                  >
                    <ImageOff size={20} /> Sin foto
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleUploadImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <p className="text-xs text-[var(--text-sec)]">
                Se usan las fotos de los productos agregados; también puedes subir una solo para esta ficha (no se guarda en el catálogo).
              </p>
            </div>
          </Card>

          {/* Presentaciones y precios */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">
                {data.layout === "family" ? "Presentaciones y precios" : "Presentación y precio"}
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-prices" className="text-xs">Mostrar precios</Label>
                <Switch id="show-prices" checked={data.showPrices} onCheckedChange={(v) => update({ showPrices: v })} />
              </div>
            </div>
            {data.layout === "single" && rowsShown.length > 1 && (
              <p className="text-xs text-amber-600 font-semibold">
                En ficha individual solo se muestra la primera fila visible. Cambia a "Familia de productos" para mostrarlas todas.
              </p>
            )}

            {data.rows.length === 0 && (
              <p className="text-sm text-[var(--text-sec)] py-4 text-center border-2 border-dashed border-[var(--border)] rounded-xl">
                Agrega productos del catálogo o una fila manual.
              </p>
            )}

            <div className="space-y-2">
              {data.rows.map((row, i) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_110px_auto] gap-2 items-center p-2 rounded-xl border border-[var(--border)]",
                    !row.visible && "opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={row.visible}
                    onChange={(e) => updateRow(row.id, { visible: e.target.checked })}
                    className="size-4 accent-[var(--primary)]"
                    title="Mostrar en la ficha"
                  />
                  <Input
                    value={row.label}
                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                    placeholder="Producto / variante"
                    className="h-9"
                  />
                  <Input
                    value={row.detail}
                    onChange={(e) => updateRow(row.id, { detail: e.target.value })}
                    placeholder="Medida, espesor, acabado"
                    className="h-9 col-start-2 sm:col-start-auto"
                  />
                  <Input
                    value={row.price}
                    onChange={(e) => updateRow(row.id, { price: e.target.value })}
                    placeholder="Precio"
                    className="h-9 col-start-2 sm:col-start-auto"
                    inputMode="decimal"
                  />
                  <div className="flex gap-0.5 col-start-2 sm:col-start-auto justify-end">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => moveRow(i, -1)} disabled={i === 0} title="Subir">
                      <ArrowUp size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => moveRow(i, 1)} disabled={i === data.rows.length - 1} title="Bajar">
                      <ArrowDown size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 hover:text-rose-500" onClick={() => removeRow(row.id)} title="Quitar">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addManualRow}>
              <Plus size={14} className="mr-1" /> Agregar fila manual
            </Button>
            <p className="text-xs text-[var(--text-sec)]">
              Los cambios de nombre, medida o precio aplican solo a la ficha; no modifican el catálogo. El precio puede ser texto, como "Consultar".
            </p>
          </Card>

          {/* Pie y estilo */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">Pie de ficha y color</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Empresa</Label>
                <Input value={data.companyName} onChange={(e) => update({ companyName: e.target.value })} maxLength={80} />
              </div>
              <div className="space-y-1.5">
                <Label>Contacto</Label>
                <Input value={data.contact} onChange={(e) => update({ contact: e.target.value })} placeholder="Tel. / WhatsApp: 0000-0000" maxLength={80} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nota</Label>
              <Input value={data.note} onChange={(e) => update({ note: e.target.value })} maxLength={120} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update({ accent: c })}
                  className={cn("size-8 rounded-full border-2", data.accent === c ? "border-[var(--text-main)]" : "border-transparent")}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={data.accent}
                onChange={(e) => update({ accent: e.target.value })}
                className="size-8 rounded-full cursor-pointer bg-transparent"
                title="Otro color"
              />
            </div>
          </Card>
        </div>

        {/* ─── VISTA PREVIA Y ACCIONES ─── */}
        <div className="xl:sticky xl:top-4 flex flex-col gap-3">
          <Card className="p-3 bg-[var(--card)] border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sec)]">Vista previa</span>
              <div className="flex items-center gap-2">
                {imageLoading && <Loader2 size={14} className="animate-spin text-[var(--primary)]" />}
                <Badge variant="secondary" className="text-[10px]">
                  {data.layout === "family" ? `${rowsShown.length} presentaciones` : "Individual"}
                </Badge>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg border border-[var(--border)] bg-white"
              aria-label="Vista previa de la ficha de producto"
            />
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button className="col-span-2 h-11 font-bold" onClick={handleShare}>
              <Share2 size={16} className="mr-2" /> Compartir
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download size={16} className="mr-2" /> Descargar PNG
            </Button>
            <Button variant="outline" onClick={handleCopyImage}>
              <Copy size={16} className="mr-2" /> Copiar imagen
            </Button>
            <Button variant="outline" onClick={handleCopyText}>
              <ClipboardCopy size={16} className="mr-2" /> Copiar texto
            </Button>
            <Button variant="outline" onClick={handleWhatsApp} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
              <MessageCircle size={16} className="mr-2" /> WhatsApp
            </Button>
          </div>
          <p className="text-xs text-[var(--text-sec)]">
            En el celular, "Compartir" abre WhatsApp, Messenger o Facebook con la imagen adjunta. En computadora,
            usa "Copiar imagen" y pégala en WhatsApp Web o Messenger, o descárgala para subirla.
          </p>
        </div>
      </div>
    </div>
  );
}
