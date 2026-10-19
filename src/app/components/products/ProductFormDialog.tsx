import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Award,
  Truck,
  Tag,
} from "lucide-react";
import { apiRequest } from "../../config/api";
import { uploadsService } from "../../services/uploads.service";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "../ui/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { UnsavedChangesDialog } from "../ui/unsaved-changes-dialog";

export interface CreatedProductResult {
  id: number;
  name: string;
  internalCode?: string;
  barcode?: string;
  unit: string;
  costPrice?: number | null;
  units?: {
    id: number;
    unit: string;
    factor: number;
    priceDetalle?: number | null;
    priceMayorista?: number | null;
    barcode?: string | null;
  }[];
  [key: string]: any;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: (product: CreatedProductResult) => void;
  defaultSupplierId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface ProductBrand {
  id: number;
  name: string;
}

interface SupplierOption {
  id: number;
  name: string;
  isActive?: boolean;
}

interface ProductTag {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

const UNITS = [
  "UNIDAD",
  "KG",
  "LB",
  "QUINTAL",
  "CAJA",
  "LITRO",
  "ARROBA",
  "KINTALE",
  "METRO",
  "YARDA",
  "PIE",
  "GALON",
  "CUBETA",
  "CUARTO_GALON",
  "GRAMO",
  "CENTIMETRO",
  "PULGADA",
  "ONZA",
  "SACO",
  "MEDIA_ARROBA",
  "PAQUETE",
  "TONELADA",
];
const PRICE_TYPES = ["PUBLICO", "MAYOREO", "ESPECIAL"];

const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  internalCode: z.string(),
  barcode: z.string(),
  description: z.string(),
  unit: z.string().min(1, "La unidad es obligatoria"),
  categoryId: z.string(),
  subcategoryId: z.string(),
  brandId: z.string().optional(),
  tagIds: z.array(z.string()),
  supplierIds: z.array(z.string()),
  expirationDate: z.string(),
  costPrice: z.string(),
  trackStock: z.boolean(),
  isUniversal: z.boolean(),
  isService: z.boolean().optional(),
  serviceType: z.string().optional(),
  fixedCommission: z.string().optional(),
  prices: z
    .array(
      z.object({
        priceType: z.string(),
        branchId: z.string(),
        price: z.string(),
      }),
    )
    .min(1, "Al menos un precio es requerido"),
  units: z
    .array(
      z.object({
        unit: z.string().min(1, "Unidad requerida"),
        factor: z.string().min(1, "Factor requerido"),
        priceDetalle: z.string().optional(),
        priceMayorista: z.string().optional(),
        barcode: z.string().optional(),
      }),
    )
    .optional(),
  stockRows: z.array(
    z.object({
      branchId: z.string(),
      quantity: z.string(),
      minStock: z.string(),
    }),
  ),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductFormDialog({
  open,
  onOpenChange,
  onProductCreated,
  defaultSupplierId,
}: ProductFormDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [brandFilterQuery, setBrandFilterQuery] = useState("");
  const [quickBrandName, setQuickBrandName] = useState("");
  const [tagFilterQuery, setTagFilterQuery] = useState("");
  const [quickTagName, setQuickTagName] = useState("");
  const [supplierFilterQuery, setSupplierFilterQuery] = useState("");
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty: formIsDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      internalCode: "",
      barcode: "",
      description: "",
      unit: "UNIDAD",
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      tagIds: [],
      supplierIds: defaultSupplierId ? [String(defaultSupplierId)] : [],
      expirationDate: "",
      costPrice: "",
      trackStock: true,
      isUniversal: false,
      isService: false,
      serviceType: "",
      fixedCommission: "",
      prices: [{ priceType: "PUBLICO", branchId: "global", price: "" }],
      stockRows: [],
    },
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control,
    name: "prices",
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "units",
  });

  const {
    fields: stockFields,
    append: appendStock,
    remove: removeStock,
  } = useFieldArray({
    control,
    name: "stockRows",
  });

  const watchTrackStock = watch("trackStock");
  const watchIsUniversal = watch("isUniversal");
  const watchIsService = watch("isService");
  const watchCategoryId = watch("categoryId");
  const watchBrandId = watch("brandId");
  const watchTagIds = watch("tagIds") || [];
  const watchSupplierIds = watch("supplierIds") || [];

  const isDirty = open && formIsDirty;
  const {
    confirmExit,
    isOpen: exitDialogOpen,
    handleConfirm: confirmDiscard,
    handleCancel: cancelDiscard,
  } = useUnsavedChangesGuard(isDirty);

  // Cargar catálogos auxiliares cuando se abre el modal
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingData(true);

    Promise.all([
      apiRequest<Category[]>("/catalog/categories").catch(() => []),
      apiRequest<Subcategory[]>("/catalog/subcategories").catch(() => []),
      apiRequest<ProductBrand[]>("/catalog/brands").catch(() => []),
      apiRequest<ProductTag[]>("/catalog/tags").catch(() => []),
      apiRequest<Branch[]>("/branches").catch(() => []),
      apiRequest<any>("/purchases/suppliers?limit=300&activeOnly=true").catch(() => ({ data: [] })),
    ])
      .then(([cats, subcats, brs, tgs, brns, supsRes]) => {
        if (!isMounted) return;
        setCategories(cats || []);
        setSubcategories(subcats || []);
        setBrands(brs || []);
        setTags(tgs || []);
        setBranches(brns || []);
        const supList = Array.isArray(supsRes) ? supsRes : (supsRes?.data || []);
        setSuppliers(supList);
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    // Resetear formulario para creación limpia
    reset({
      name: "",
      internalCode: "",
      barcode: "",
      description: "",
      unit: "UNIDAD",
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      tagIds: [],
      supplierIds: defaultSupplierId ? [String(defaultSupplierId)] : [],
      expirationDate: "",
      costPrice: "",
      trackStock: true,
      isUniversal: false,
      isService: false,
      serviceType: "",
      fixedCommission: "",
      prices: [{ priceType: "PUBLICO", branchId: "global", price: "" }],
      stockRows: [],
    });
    setProductImageUrl(null);
    setBrandFilterQuery("");
    setQuickBrandName("");
    setTagFilterQuery("");
    setQuickTagName("");
    setSupplierFilterQuery("");

    return () => {
      isMounted = false;
    };
  }, [open, defaultSupplierId, reset]);

  const handleProductImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const { url } = await uploadsService.uploadProductImage(file);
      setProductImageUrl(url);
      toast.success("Foto subida correctamente");
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuickAddBrand = async () => {
    const trimmed = quickBrandName.trim();
    if (!trimmed) {
      toast.error("Ingresa el nombre de la marca");
      return;
    }
    try {
      const created = await apiRequest<ProductBrand>("/catalog/brands", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setValue("brandId", String(created.id), { shouldDirty: true });
      setQuickBrandName("");
      toast.success(`Marca "${created.name}" creada y seleccionada`);
    } catch (err: any) {
      toast.error(err.message || "Error al crear la marca");
    }
  };

  const handleQuickAddTag = async () => {
    const trimmed = quickTagName.trim();
    if (!trimmed) {
      toast.error("Ingresa el nombre de la etiqueta");
      return;
    }
    try {
      const created = await apiRequest<ProductTag>("/catalog/tags", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      const current = watch("tagIds") || [];
      setValue("tagIds", [...current, String(created.id)], { shouldDirty: true });
      setQuickTagName("");
      toast.success(`Etiqueta "${created.name}" creada y seleccionada`);
    } catch (err: any) {
      toast.error(err.message || "Error al crear etiqueta");
    }
  };

  const toggleTag = (tagId: string) => {
    const current = watch("tagIds") || [];
    setValue(
      "tagIds",
      current.includes(tagId) ? current.filter((t) => t !== tagId) : [...current, tagId],
      { shouldDirty: true },
    );
  };

  const toggleSupplier = (supplierId: string) => {
    const current = watch("supplierIds") || [];
    setValue(
      "supplierIds",
      current.includes(supplierId) ? current.filter((s) => s !== supplierId) : [...current, supplierId],
      { shouldDirty: true },
    );
  };

  const availableSubcategories = useMemo(
    () => subcategories.filter((s) => String(s.categoryId) === watchCategoryId),
    [subcategories, watchCategoryId],
  );

  const filteredFormBrands = useMemo(() => {
    if (!brandFilterQuery.trim()) return brands;
    const query = brandFilterQuery.toLowerCase().trim();
    return brands.filter((b) => b.name.toLowerCase().includes(query));
  }, [brands, brandFilterQuery]);

  const filteredFormTags = useMemo(() => {
    if (!tagFilterQuery.trim()) return tags;
    const query = tagFilterQuery.toLowerCase().trim();
    return tags.filter((t) => t.name.toLowerCase().includes(query));
  }, [tags, tagFilterQuery]);

  const filteredFormSuppliers = useMemo(() => {
    const visible = suppliers.filter((s) => s.isActive !== false || watchSupplierIds.includes(String(s.id)));
    const query = supplierFilterQuery.toLowerCase().trim();
    return query ? visible.filter((s) => s.name.toLowerCase().includes(query)) : visible;
  }, [suppliers, supplierFilterQuery, watchSupplierIds]);

  const onSubmitProduct = async (data: ProductFormData) => {
    const body: Record<string, unknown> = {
      name: data.name.trim(),
      unit: data.unit,
      trackStock: data.trackStock,
      isUniversal: data.isUniversal,
      isService: data.isService,
      serviceType: data.isService ? data.serviceType : null,
      fixedCommission:
        data.isService && data.fixedCommission
          ? Number(data.fixedCommission)
          : null,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      subcategoryId: data.subcategoryId ? Number(data.subcategoryId) : null,
      brandId: data.brandId ? Number(data.brandId) : null,
      tagIds: data.tagIds.map(Number),
      supplierIds: (data.supplierIds || []).map(Number),
      costPrice: data.costPrice ? Number(data.costPrice) : null,
      internalCode: data.internalCode?.trim() || undefined,
      barcode: data.barcode?.trim() || undefined,
      description: data.description?.trim() || undefined,
      imageUrl: productImageUrl || undefined,
      expirationDate: data.expirationDate || null,
      units:
        data.units?.map((u) => ({
          unit: u.unit,
          factor: Number(u.factor),
          priceDetalle: u.priceDetalle ? Number(u.priceDetalle) : null,
          priceMayorista: u.priceMayorista ? Number(u.priceMayorista) : null,
          barcode: u.barcode?.trim() || undefined,
        })) || [],
    };

    if (!data.isUniversal) {
      body.prices = data.prices.map((p) => ({
        priceType: p.priceType,
        branchId: p.branchId === "global" ? null : Number(p.branchId),
        price: Number(p.price),
      }));
    }

    const validStock =
      data.stockRows?.filter((s) => s.branchId && Number(s.quantity) > 0) || [];
    if (validStock.length > 0) {
      body.initialStock = validStock.map((s) => ({
        branchId: Number(s.branchId),
        quantity: Number(s.quantity),
        minStock: s.minStock ? Number(s.minStock) : 0,
      }));
    }

    setFormLoading(true);
    try {
      const created = await apiRequest<CreatedProductResult>("/catalog/products", {
        method: "POST",
        body: JSON.stringify(body),
      });

      toast.success(`Producto "${created.name}" creado exitosamente`);
      onOpenChange(false);
      if (onProductCreated) {
        onProductCreated(created);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) =>
          o ? onOpenChange(true) : confirmExit(() => onOpenChange(false))
        }
      >
        <DialogContent
          className="sm:max-w-7xl w-full max-h-[95vh] overflow-y-auto custom-scrollbar"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        >
          <DialogHeader className="px-2">
            <DialogTitle
              style={{ color: "var(--text-main)" }}
              className="text-2xl font-black"
            >
              Nuevo Producto
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmitProduct)}
            className="space-y-6 mt-4 px-2"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Columna Izquierda: Información Básica */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-[var(--border)] space-y-6 bg-transparent">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 text-[var(--text-sec)]">
                    Información General
                  </p>

                  <div className="flex gap-4 items-start">
                    {/* Photo upload */}
                    <div className="space-y-2 shrink-0">
                      <Label className="text-sm font-bold">Foto</Label>
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpg,image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleProductImageUpload(f);
                            e.target.value = "";
                          }}
                        />
                        <div className="relative w-28 h-28 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] flex items-center justify-center overflow-hidden hover:border-[var(--primary)] transition-colors group">
                          {productImageUrl ? (
                            <>
                              <img
                                src={productImageUrl}
                                alt="Vista previa"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                <Upload size={16} className="text-white" />
                                <span className="text-white text-[10px] font-bold">
                                  Cambiar
                                </span>
                              </div>
                            </>
                          ) : uploadingImage ? (
                            <div className="flex flex-col items-center gap-2 opacity-60">
                              <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-70 transition-opacity px-2 text-center">
                              <Upload size={18} />
                              <span className="text-[9px] font-bold">
                                Subir foto
                              </span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-bold">
                        Nombre del Producto{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register("name")}
                        placeholder="Ej. Fertilizante 18-46-0"
                        className="h-11 rounded-xl bg-[var(--card)]"
                      />
                      <p className="text-[10px] opacity-60 ml-1">
                        JPG, PNG o WEBP · máx 5 MB (opcional)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 [&>div]:min-w-0">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">
                        Código Interno
                      </Label>
                      <Input
                        {...register("internalCode")}
                        placeholder="FERT-001"
                        className="h-11 rounded-xl bg-[var(--card)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">
                        Código de Barras
                      </Label>
                      <Input
                        {...register("barcode")}
                        placeholder="7501234567890"
                        className="h-11 rounded-xl bg-[var(--card)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">
                        Unidad <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={watch("unit")}
                        onValueChange={(v) => setValue("unit", v, { shouldDirty: true })}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--card)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u?.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 [&>div]:min-w-0">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Categoría</Label>
                      <Select
                        value={watch("categoryId")}
                        onValueChange={(v) => setValue("categoryId", v, { shouldDirty: true })}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--card)]">
                          <SelectValue placeholder="Sin categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Subcategoría</Label>
                      <Select
                        value={watch("subcategoryId")}
                        onValueChange={(v) => setValue("subcategoryId", v, { shouldDirty: true })}
                        disabled={!watchCategoryId}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--card)]">
                          <SelectValue
                            placeholder={
                              watchCategoryId
                                ? "Sin subcategoría"
                                : "Elige categoría"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold whitespace-nowrap">
                        Fecha de Vencimiento
                      </Label>
                      <Input
                        type="date"
                        {...register("expirationDate")}
                        className="h-11 rounded-xl bg-[var(--card)]"
                      />
                      <p className="text-[10px] opacity-60 ml-1">
                        Opcional. Aplica al lote inicial.
                      </p>
                    </div>
                  </div>

                  {/* Marca */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-1.5">
                        <Award size={15} className="text-amber-600" />
                        Marca
                      </Label>
                      {watchBrandId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {brands.find((b) => String(b.id) === watchBrandId)?.name || "Marca seleccionada"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue("brandId", "", { shouldDirty: true })}
                            className="text-muted-foreground hover:text-red-500 p-0.5 rounded text-xs"
                            title="Quitar marca"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                      {brands.length > 0 && (
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            value={brandFilterQuery}
                            onChange={(e) => setBrandFilterQuery(e.target.value)}
                            placeholder="Buscar marcas por nombre..."
                            className="h-8 pl-8 pr-8 text-xs rounded-lg bg-[var(--bg)] border-[var(--border)]"
                          />
                          {brandFilterQuery && (
                            <button
                              type="button"
                              onClick={() => setBrandFilterQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                              title="Limpiar búsqueda"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {brands.length === 0 ? (
                          <p className="text-[10px] opacity-50 py-1">
                            Sin marcas registradas todavía. Puedes agregar una abajo.
                          </p>
                        ) : filteredFormBrands.length === 0 ? (
                          <div className="py-2 text-center w-full">
                            <p className="text-xs text-[var(--text-sec)]">
                              No se encontraron marcas con "{brandFilterQuery}".
                            </p>
                            <button
                              type="button"
                              onClick={() => setBrandFilterQuery("")}
                              className="text-xs text-[var(--primary)] hover:underline mt-1 font-medium"
                            >
                              Ver todas las marcas
                            </button>
                          </div>
                        ) : (
                          filteredFormBrands.map((b) => {
                            const selected = watchBrandId === String(b.id);
                            return (
                              <button
                                type="button"
                                key={b.id}
                                onClick={() => setValue("brandId", selected ? "" : String(b.id), { shouldDirty: true })}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
                                  selected
                                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                    : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-amber-500 hover:text-foreground",
                                )}
                              >
                                {selected && <Check size={11} className="stroke-[3]" />}
                                {b.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                        <Input
                          value={quickBrandName}
                          onChange={(e) => setQuickBrandName(e.target.value)}
                          placeholder="Nueva marca rápida..."
                          className="h-8 text-xs rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleQuickAddBrand();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0"
                          onClick={handleQuickAddBrand}
                          title="Crear y asignar marca rápida"
                        >
                          <Plus size={14} className="mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Proveedores */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-1.5">
                        <Truck size={15} className="text-sky-600" />
                        Proveedores Asociados
                      </Label>
                      {watchSupplierIds.length > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                          {watchSupplierIds.length} seleccionado{watchSupplierIds.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                      {watchSupplierIds.length > 0 && (
                        <div className="space-y-1.5">
                          {watchSupplierIds.map((sid) => {
                            const sup = suppliers.find((s) => String(s.id) === sid);
                            const name = sup?.name || `Proveedor #${sid}`;
                            return (
                              <div key={sid} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500/5 border border-sky-500/20">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{name}</p>
                                  <p className="text-[10px] text-[var(--text-sec)]">
                                    Se asociará al guardar el producto
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSupplier(sid)}
                                  className="text-muted-foreground hover:text-red-500 p-0.5 rounded shrink-0"
                                  title="Quitar proveedor"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {suppliers.length > 0 && (
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            value={supplierFilterQuery}
                            onChange={(e) => setSupplierFilterQuery(e.target.value)}
                            placeholder="Buscar proveedores por nombre..."
                            className="h-8 pl-8 pr-8 text-xs rounded-lg bg-[var(--bg)] border-[var(--border)]"
                          />
                          {supplierFilterQuery && (
                            <button
                              type="button"
                              onClick={() => setSupplierFilterQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                              title="Limpiar búsqueda"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {suppliers.length === 0 ? (
                          <p className="text-[10px] opacity-50 py-1">
                            Sin proveedores registrados todavía.
                          </p>
                        ) : filteredFormSuppliers.length === 0 ? (
                          <p className="text-xs text-[var(--text-sec)] py-2 w-full text-center">
                            No se encontraron proveedores con "{supplierFilterQuery}".
                          </p>
                        ) : (
                          filteredFormSuppliers.map((s) => {
                            const selected = watchSupplierIds.includes(String(s.id));
                            return (
                              <button
                                type="button"
                                key={s.id}
                                onClick={() => toggleSupplier(String(s.id))}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
                                  selected
                                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                    : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-sky-500 hover:text-foreground",
                                )}
                              >
                                {selected && <Check size={11} className="stroke-[3]" />}
                                {s.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Etiquetas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-1.5">
                        <Tag size={15} className="text-[var(--primary)]" />
                        Etiquetas
                      </Label>
                      {watchTagIds.length > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                          {watchTagIds.length} seleccionada{watchTagIds.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                      {tags.length > 0 && (
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            value={tagFilterQuery}
                            onChange={(e) => setTagFilterQuery(e.target.value)}
                            placeholder="Buscar etiquetas por nombre..."
                            className="h-8 pl-8 pr-8 text-xs rounded-lg bg-[var(--bg)] border-[var(--border)]"
                          />
                          {tagFilterQuery && (
                            <button
                              type="button"
                              onClick={() => setTagFilterQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                              title="Limpiar búsqueda"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {tags.length === 0 ? (
                          <p className="text-[10px] opacity-50 py-1">
                            Sin etiquetas registradas todavía.
                          </p>
                        ) : filteredFormTags.length === 0 ? (
                          <div className="py-2 text-center w-full">
                            <p className="text-xs text-[var(--text-sec)]">
                              No se encontraron etiquetas con "{tagFilterQuery}".
                            </p>
                            <button
                              type="button"
                              onClick={() => setTagFilterQuery("")}
                              className="text-xs text-[var(--primary)] hover:underline mt-1 font-medium"
                            >
                              Ver todas las etiquetas
                            </button>
                          </div>
                        ) : (
                          filteredFormTags.map((t) => {
                            const selected = watchTagIds.includes(String(t.id));
                            return (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => toggleTag(String(t.id))}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
                                  selected
                                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                                    : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--primary)] hover:text-foreground",
                                )}
                              >
                                {selected && <Check size={11} className="stroke-[3]" />}
                                {t.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                        <Input
                          value={quickTagName}
                          onChange={(e) => setQuickTagName(e.target.value)}
                          placeholder="Nueva etiqueta rápida..."
                          className="h-8 text-xs rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleQuickAddTag();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0"
                          onClick={handleQuickAddTag}
                          title="Crear y asignar etiqueta rápida"
                        >
                          <Plus size={14} className="mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      Costo de Adquisición
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.0001"
                        {...register("costPrice")}
                        placeholder="0.0000"
                        className="h-11 pl-7 rounded-xl bg-[var(--card)]"
                      />
                    </div>
                    <p className="text-[10px] opacity-60 ml-1">
                      Lo que cuesta comprarlo (Opcional, se usará en la orden de compra)
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm font-bold">Rastrear Inventario</p>
                        <p className="text-[10px] opacity-60">
                          {watchIsUniversal
                            ? "Desactivado automáticamente por ser Producto Universal"
                            : "Controlar entradas y salidas automáticamente"}
                        </p>
                      </div>
                      <Switch
                        checked={watchIsUniversal ? false : watchTrackStock}
                        disabled={watchIsUniversal}
                        onCheckedChange={(v) => setValue("trackStock", v, { shouldDirty: true })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Precios y Unidades */}
              <div className="space-y-6">
                {watchIsUniversal || watchIsService ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--border)] bg-transparent">
                    <p className="text-xs font-bold text-[var(--text-sec)]">
                      Este producto no lleva precio fijo — se ingresa cada vez que se vende.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-[var(--border)] space-y-6 bg-transparent">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 text-[var(--text-sec)]">
                        Precios de Venta
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendPrice({
                            priceType: "MAYOREO",
                            branchId: "global",
                            price: "",
                          })
                        }
                        className="h-8"
                      >
                        <Plus size={14} className="mr-1" /> Agregar Precio
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {priceFields.map((field, i) => (
                        <div
                          key={field.id}
                          className="p-3 rounded-xl border bg-[var(--card)] border-[var(--border)] relative group"
                        >
                          <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end">
                            <div className="col-span-5 sm:col-span-4 space-y-1">
                              <Label className="text-[10px] font-bold uppercase opacity-50">
                                Tipo
                              </Label>
                              <Select
                                value={watch(`prices.${i}.priceType`)}
                                onValueChange={(v) =>
                                  setValue(`prices.${i}.priceType`, v, { shouldDirty: true })
                                }
                              >
                                <SelectTrigger className="h-9 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRICE_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t?.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4 sm:col-span-4 space-y-1">
                              <Label className="text-[10px] font-bold uppercase opacity-50">
                                Sucursal
                              </Label>
                              <Select
                                value={watch(`prices.${i}.branchId`)}
                                onValueChange={(v) =>
                                  setValue(`prices.${i}.branchId`, v, { shouldDirty: true })
                                }
                              >
                                <SelectTrigger className="h-9 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="global">Global</SelectItem>
                                  {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                      {b.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3 sm:col-span-4 space-y-1">
                              <Label className="text-[10px] font-bold uppercase opacity-50">
                                Precio
                              </Label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`prices.${i}.price`)}
                                  className="h-9 pl-6 rounded-lg font-bold"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          {priceFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrice(i)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:scale-110"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sección Unidades Secundarias */}
                <div className="p-6 rounded-xl border border-[var(--border)] space-y-6 bg-[var(--surface)]">
                  <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 text-[var(--text-sec)]">
                        Unidades de Venta Adicionales
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Si vendes este producto en otras presentaciones (Ej. por Caja, Saco, Quintal), agrégalas aquí.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendUnit({
                          unit: "",
                          factor: "",
                          priceDetalle: "",
                          priceMayorista: "",
                          barcode: "",
                        })
                      }
                      className="rounded-full gap-2 border-[var(--border)] bg-transparent hover:bg-[var(--border)]"
                    >
                      <Plus size={16} />
                      Agregar Presentación
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {unitFields.map((field, i) => (
                      <div
                        key={field.id}
                        className="p-4 rounded-xl border bg-[var(--card)] border-[var(--border)] space-y-4 relative group"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase opacity-50 block">
                              Nombre de la Presentación
                            </Label>
                            <Input
                              type="text"
                              {...register(`units.${i}.unit`)}
                              className="h-9 rounded-lg font-bold"
                              placeholder="Ej. CAJA, SACO, DOCENA..."
                            />
                          </div>

                          <div className="flex flex-col gap-2 p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] border-dashed relative">
                            <Label className="text-[9px] font-bold uppercase opacity-60 absolute -top-2 left-3 bg-[var(--card)] px-1.5">
                              ¿Equivalencia?
                            </Label>
                            <p className="text-[10px] font-bold opacity-60 mt-1">
                              1 {watch(`units.${i}.unit`) || "Nueva"} =
                            </p>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                {...register(`units.${i}.factor`)}
                                className="h-9 flex-1 min-w-0 text-center font-bold text-sm bg-[var(--card)] border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--border)] focus-visible:ring-offset-0"
                                placeholder="0"
                              />
                              <span className="text-xs font-bold text-[var(--primary)] whitespace-nowrap shrink-0">
                                {watch("unit") || "Base"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase opacity-50 block">
                              Precio (Detalle)
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                {...register(`units.${i}.priceDetalle`)}
                                className="h-9 pl-6 rounded-lg font-bold"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase opacity-50 block">
                              Precio (Mayorista)
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                {...register(`units.${i}.priceMayorista`)}
                                className="h-9 pl-6 rounded-lg font-bold"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase opacity-50 block">
                              Cód. Barras
                            </Label>
                            <Input
                              type="text"
                              {...register(`units.${i}.barcode`)}
                              className="h-9 rounded-lg"
                              placeholder="Opcional..."
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeUnit(i)}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-md z-10 hover:scale-110 hover:bg-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Inicial */}
                {watchTrackStock && !watchIsService && (
                  <div className="p-6 rounded-xl border border-[var(--border)] space-y-6 bg-transparent">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 text-[var(--text-sec)]">
                        Stock Inicial
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendStock({
                            branchId: "",
                            quantity: "",
                            minStock: "",
                          })
                        }
                        className="h-8"
                      >
                        <Plus size={14} className="mr-1" /> Sucursal
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {stockFields.map((field, i) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl border bg-[var(--card)] border-[var(--border)] relative group"
                        >
                          <div className="col-span-12 space-y-1">
                            <Label className="text-[10px] font-bold opacity-50">
                              Sucursal
                            </Label>
                            <Select
                              value={watch(`stockRows.${i}.branchId`)}
                              onValueChange={(v) =>
                                setValue(`stockRows.${i}.branchId`, v, { shouldDirty: true })
                              }
                            >
                              <SelectTrigger className="h-9 rounded-lg">
                                <SelectValue placeholder="Seleccionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((b) => (
                                  <SelectItem key={b.id} value={String(b.id)}>
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-6 space-y-1">
                            <Label className="text-[10px] font-bold opacity-50">
                              Cant.
                            </Label>
                            <Input
                              type="number"
                              {...register(`stockRows.${i}.quantity`)}
                              className="h-9 rounded-lg"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-6 space-y-1">
                            <Label className="text-[10px] font-bold opacity-50">
                              Mín.
                            </Label>
                            <Input
                              type="number"
                              {...register(`stockRows.${i}.minStock`)}
                              className="h-9 rounded-lg"
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStock(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {stockFields.length === 0 && (
                        <p className="text-[10px] text-center opacity-40 py-2">
                          Sin stock inicial (opcional - la compra ingresará el stock al recibirse)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-[var(--border)] gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => confirmExit(() => onOpenChange(false))}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading || loadingData}
                variant="default"
                className="font-bold shadow-xl px-12 rounded-xl h-12"
              >
                {formLoading ? "Guardando..." : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={exitDialogOpen}
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
