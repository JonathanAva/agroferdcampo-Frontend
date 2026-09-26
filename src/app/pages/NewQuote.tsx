import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, CheckCircle2,
  X, ArrowLeft, Percent, Package, Loader2, Award, Tag, PlusCircle,
  Calendar as CalendarIcon, Check
} from "lucide-react";
import { apiRequest } from "../config/api";
import { quotesService } from "../services/quotes.service";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { NumberInput } from "../components/ui/number-input";
import { CustomerQuickCreate } from "../components/customers/CustomerQuickCreate";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { cn } from "../components/ui/utils";
import { ScrollArea } from "../components/ui/scroll-area";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { TransportSelector, TransportData } from "../components/transport/TransportSelector";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { UnsavedChangesDialog } from "../components/ui/unsaved-changes-dialog";

interface POSBrand {
  id: number;
  name: string;
}

interface POSTag {
  id: number;
  name: string;
}

interface POSSubcategory {
  id: number;
  name: string;
}

interface POSCategory {
  id: number;
  name: string;
  subcategories?: POSSubcategory[];
}

interface ProductUnitOption {
  unit: string;
  factor: number;
  priceDetalle?: number | null;
  priceMayorista?: number | null;
}

interface Product {
  id: number;
  internalCode: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: { id?: number; name: string };
  subcategory?: { id: number; name: string } | null;
  brand?: { id: number; name: string } | null;
  brandId?: number | null;
  tags?: POSTag[];
  expirationDate?: string | null;
  unit: string;
  units?: ProductUnitOption[];
  imageUrl?: string | null;
}

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  subtotal: number;
  unitPrice: number;
  marginPercent: number;
  costTotal: number;
  unitType: string;
  unitFactor: number;
}

function formatExpirationDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-SV", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function isNearExpiration(dateStr: string): boolean {
  const expDate = new Date(dateStr);
  const daysLeft = (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysLeft <= 30;
}

/** Formatea un UnitType del backend (ej. "MEDIA_ARROBA") a una etiqueta legible ("Media Arroba"). */
function formatUnitLabel(unitType: string): string {
  return unitType
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

interface Customer {
  id: number;
  name: string;
  customerType: string;
  nit?: string;
  documentNumber?: string;
  creditLimit: string | number;
  creditBalance: string | number;
  isSupplierCredit?: boolean;
}

export function NewQuote() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('clone');
  const isEditMode = !!id;

  useEffect(() => {
    const fetchQuote = async () => {
      const targetId = id || cloneId;
      if (!targetId) return;
      try {
        const quote = await quotesService.getQuoteDetail(Number(targetId));
        if (quote.customer) setSelectedCustomer(quote.customer as any);
        if (quote.validDays) setValidDays(quote.validDays);
        if (quote.notes) setNotes(quote.notes);
        if (quote.requiresTransport) {
          setTransportData({
            requiresTransport: true,
            vehicleId: quote.vehicleId || undefined,
            driverId: quote.driverId || undefined,
            deliveryAddress: quote.deliveryAddress || "",
            scheduledDeliveryAt: undefined // o extraer si existe
          });
        }
        
        // Cargar productos
        if (quote.items) {
          const newCart = quote.items.map((item: any) => {
            const qty = Number(item.quantity);
            const price = Number(item.unitPrice);
            const costPerUnit = (Number(item.product?.costPrice) || 0) * (item.unitFactor || 1);
            const subtotal = qty * price;
            let margin = 0;
            if (costPerUnit > 0 && price > costPerUnit) {
              margin = ((price - costPerUnit) / costPerUnit) * 100;
            }
            return {
              ...item.product,
              cartId: Math.random().toString(36).substr(2, 9),
              id: item.productId,
              imageUrl: item.product?.imageUrl || null,
              internalCode: item.product?.internalCode || "",
              name: item.product?.name || "Producto",
              unitType: item.unitType || item.product?.unit || "UNIDAD",
              unitFactor: item.unitFactor || 1,
              unitPrice: price,
              costTotal: qty * costPerUnit,
              quantity: qty,
              subtotal,
              marginPercent: margin,
            };
          });
          setCart(newCart as any);
        }
      } catch (e: any) {
        toast.error("Error al cargar la cotización: " + e.message);
      }
    };
    fetchQuote();
  }, [id, cloneId]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number | null>(null);

  // Catalog Filters State (Identical to POS)
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [brands, setBrands] = useState<POSBrand[]>([]);
  const [tags, setTags] = useState<POSTag[]>([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showExpiringSoonOnly, setShowExpiringSoonOnly] = useState(false);

  // Quote State
  const [validDays, setValidDays] = useState<number | "">(15);
  const [notes, setNotes] = useState("");

  // Customer State
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Transport State
  const [transportData, setTransportData] = useState<TransportData | null>(null);

  // Add Product Modal (Margin Calculator)
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [marginForm, setMarginForm] = useState({
    quantity: 1,
    unitPrice: 0,
    marginPercent: 0,
    unitType: "",
    unitFactor: 1,
  });

  const [savingQuote, setSavingQuote] = useState(false);

  const isDirty = cart.length > 0 || selectedCustomer !== null || notes.trim().length > 0;
  const { confirmExit, isOpen: exitDialogOpen, handleConfirm: confirmDiscard, handleCancel: cancelDiscard } = useUnsavedChangesGuard(isDirty);

  // Tras guardar se limpia el estado (isDirty pasa a false) y solo entonces navegamos:
  // si navegáramos en el mismo tick que los setState del guardado, el blocker aún vería
  // el isDirty anterior (true) y bloquearía la salida que sí queremos permitir.
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (justSaved) {
      navigate('/quotes');
    }
  }, [justSaved, navigate]);

  const loadCategories = async () => {
    try {
      const data = await apiRequest<POSCategory[]>("/catalog/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // Silencioso
    }
  };

  const loadBrands = async () => {
    try {
      const data = await apiRequest<POSBrand[]>("/catalog/brands");
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      // Silencioso
    }
  };

  const loadTags = async () => {
    try {
      const data = await apiRequest<POSTag[]>("/catalog/tags");
      setTags(Array.isArray(data) ? data : []);
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadTags();
  }, []);

  const PAGE_SIZE = 40;

  const mapProduct = (p: any): Product => {
    const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
    const stockValue = inv?.quantity ?? p.stock ?? 0;

    let publicPrice = p.prices?.find(
      (pr: any) => pr.priceType === "PUBLICO"
    )?.price;

    if (publicPrice === undefined || publicPrice === null) {
      publicPrice = p.prices?.[0]?.price || p.price || 0;
    }
    return {
      id: p.id,
      internalCode: p.internalCode || p.barcode || "S/C",
      name: p.name,
      price: Number(publicPrice),
      costPrice: Number(p.costPrice) || 0,
      stock: Number(stockValue),
      category: p.category || { name: "General" },
      subcategory: p.subcategory || null,
      brand: p.brand || null,
      brandId: p.brandId || null,
      tags: p.tags || [],
      expirationDate: p.nearestExpirationDate || null,
      imageUrl: p.imageUrl || null,
      unit: p.unit,
      units: Array.isArray(p.units) ? p.units.map((u: any) => ({
        unit: u.unit,
        factor: Number(u.factor),
        priceDetalle: u.priceDetalle !== null && u.priceDetalle !== undefined ? Number(u.priceDetalle) : null,
        priceMayorista: u.priceMayorista !== null && u.priceMayorista !== undefined ? Number(u.priceMayorista) : null,
      })) : [],
    };
  };

  const searchProducts = async (query: string) => {
    setLoading(true);
    try {
      const isSearch = query.trim().length >= 2;
      const params = new URLSearchParams();
      if (isSearch) {
        params.set("q", query.trim());
        params.set("limit", "100");
      } else {
        params.set("isActive", "true");
        params.set("limit", String(PAGE_SIZE));
        params.set("page", "1");
      }

      if (selectedCategoryIds.length > 0) {
        selectedCategoryIds.forEach(id => params.append("categoryIds", String(id)));
      }
      if (selectedSubcategoryIds.length > 0) {
        selectedSubcategoryIds.forEach(id => params.append("subcategoryIds", String(id)));
      }
      if (selectedBrandIds.length > 0) {
        selectedBrandIds.forEach(id => params.append("brandIds", String(id)));
      }
      if (selectedTagIds.length > 0) {
        selectedTagIds.forEach(id => params.append("tagIds", String(id)));
      }

      const endpoint = isSearch
        ? `/catalog/products/search?${params.toString()}`
        : `/catalog/products?${params.toString()}`;

      const response = await apiRequest<any>(endpoint);
      const items = isSearch
        ? (Array.isArray(response) ? response : (response.data || []))
        : (response.data || []);

      setProducts(items.map(mapProduct));
      setPage(1);
      if (!isSearch) {
        setTotalCatalogCount(response.total ?? null);
        setHasMore(1 < (response.totalPages || 1));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Error al obtener productos");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMore || loading || !hasMore || searchTerm.trim().length > 0) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const params = new URLSearchParams();
      params.set("isActive", "true");
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(nextPage));
      if (selectedCategoryIds.length > 0) {
        selectedCategoryIds.forEach(id => params.append("categoryIds", String(id)));
      }
      if (selectedSubcategoryIds.length > 0) {
        selectedSubcategoryIds.forEach(id => params.append("subcategoryIds", String(id)));
      }
      if (selectedBrandIds.length > 0) {
        selectedBrandIds.forEach(id => params.append("brandIds", String(id)));
      }
      if (selectedTagIds.length > 0) {
        selectedTagIds.forEach(id => params.append("tagIds", String(id)));
      }

      const response = await apiRequest<any>(`/catalog/products?${params.toString()}`);
      const items = response.data || [];
      if (items.length > 0) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = items.map(mapProduct).filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
        setHasMore(nextPage < (response.totalPages || 1));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error al cargar más productos:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMoreProducts();
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategoryIds, selectedSubcategoryIds, selectedBrandIds, selectedTagIds]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchProducts(searchTerm);
      } else {
        searchProducts("");
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategoryIds, selectedSubcategoryIds, selectedBrandIds, selectedTagIds]);

  const searchCustomers = async (query: string) => {
    if (!query || query.length < 2) {
      setCustomerResults([]);
      return;
    }
    setSearchingCustomer(true);
    try {
      const res = await apiRequest<Customer[]>(`/customers/search?q=${encodeURIComponent(query)}`);
      setCustomerResults(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchingCustomer(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchCustomers(customerSearch);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  /** Factor de la unidad seleccionada respecto a la unidad base del producto (1 si es la unidad base). */
  const resolveUnitFactor = (product: Product, unitType: string) => {
    if (unitType === product.unit) return 1;
    return product.units?.find(u => u.unit === unitType)?.factor ?? 1;
  };

  /** Precio sugerido para la unidad seleccionada: precio detalle configurado, o precio base × factor. */
  const resolveUnitDefaultPrice = (product: Product, unitType: string) => {
    if (unitType === product.unit) return Number(product.price) || 0;
    const u = product.units?.find(x => x.unit === unitType);
    if (!u) return Number(product.price) || 0;
    return u.priceDetalle ? Number(u.priceDetalle) : (Number(product.price) || 0) * u.factor;
  };

  /** Stock (en unidad base) ya reservado en el carrito para este producto, sumando todas sus líneas de unidad. */
  const usedStockForProduct = (productId: number) =>
    cart.filter(i => i.id === productId).reduce((sum, i) => sum + i.quantity * i.unitFactor, 0);

  const openAddProductModal = (product: Product) => {
    setSelectedProduct(product);
    const cost = Number(product.costPrice) || 0;
    const initialPrice = Number(product.price) || 0;
    let initialMargin = 0;
    if (cost > 0 && initialPrice > cost) {
      initialMargin = ((initialPrice - cost) / cost) * 100;
    }
    setMarginForm({
      quantity: 1,
      unitPrice: initialPrice,
      marginPercent: initialMargin,
      unitType: product.unit,
      unitFactor: 1,
    });
    setShowAddModal(true);
  };

  const handleUnitTypeChange = (newUnitType: string) => {
    if (!selectedProduct) return;
    const factor = resolveUnitFactor(selectedProduct, newUnitType);
    const price = resolveUnitDefaultPrice(selectedProduct, newUnitType);
    const costPerUnit = (Number(selectedProduct.costPrice) || 0) * factor;
    let margin = 0;
    if (costPerUnit > 0 && price > costPerUnit) {
      margin = ((price - costPerUnit) / costPerUnit) * 100;
    }
    setMarginForm({ quantity: 1, unitPrice: price, marginPercent: margin, unitType: newUnitType, unitFactor: factor });
  };

  const handleApplyQuickMargin = (percent: number) => {
    if (!selectedProduct) return;
    const costPerUnit = (Number(selectedProduct.costPrice) || 0) * marginForm.unitFactor;
    if (costPerUnit <= 0) {
      toast.warning("El producto no tiene costo configurado.");
      return;
    }
    const newPrice = costPerUnit * (1 + percent / 100);
    setMarginForm({ ...marginForm, marginPercent: percent, unitPrice: newPrice });
  };

  const handleCustomPriceChange = (val: number | undefined) => {
    if (!selectedProduct || val === undefined) return;
    const costPerUnit = (Number(selectedProduct.costPrice) || 0) * marginForm.unitFactor;
    let newMargin = 0;
    if (costPerUnit > 0 && val > costPerUnit) {
      newMargin = ((val - costPerUnit) / costPerUnit) * 100;
    } else if (costPerUnit > 0 && val <= costPerUnit) {
      newMargin = val === costPerUnit ? 0 : -1;
    } else if (costPerUnit === 0 && val > 0) {
      newMargin = 100;
    }
    setMarginForm({ ...marginForm, unitPrice: val, marginPercent: newMargin });
  };

  const addProductToCart = () => {
    if (!selectedProduct) return;
    if (marginForm.unitPrice <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }
    if (marginForm.quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    // Stock validation removed for quotes

    const costPerUnit = (Number(selectedProduct.costPrice) || 0) * marginForm.unitFactor;
    const cartId = `${selectedProduct.id}-${marginForm.unitType}`;

    const existing = cart.find(i => i.cartId === cartId);
    if (existing) {
      const newQty = existing.quantity + marginForm.quantity;
      setCart(cart.map(i => i.cartId === cartId ? {
        ...i,
        quantity: newQty,
        subtotal: newQty * marginForm.unitPrice,
        unitPrice: marginForm.unitPrice,
        marginPercent: marginForm.marginPercent,
        costTotal: newQty * costPerUnit
      } : i));
    } else {
      setCart([{
        ...selectedProduct,
        cartId,
        quantity: marginForm.quantity,
        unitPrice: marginForm.unitPrice,
        subtotal: marginForm.quantity * marginForm.unitPrice,
        marginPercent: marginForm.marginPercent,
        costTotal: marginForm.quantity * costPerUnit,
        unitType: marginForm.unitType,
        unitFactor: marginForm.unitFactor,
      }, ...cart]);
    }
    setShowAddModal(false);
    setSelectedProduct(null);
  };

  const updateCartQuantity = (cartId: string, qty: number) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    if (qty <= 0) {
      setCart(cart.filter(i => i.cartId !== cartId));
      return;
    }

    // Stock validation removed for quotes

    const costPerUnit = (Number(item.costPrice) || 0) * item.unitFactor;
    setCart(cart.map(i => i.cartId === cartId ? {
      ...i,
      quantity: qty,
      subtotal: qty * i.unitPrice,
      costTotal: qty * costPerUnit
    } : i));
  };

  const updateCartPrice = (cartId: string, newPrice: number) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    
    const costPerUnit = (Number(item.costPrice) || 0) * item.unitFactor;
    const marginPercent = newPrice > 0 ? ((newPrice - costPerUnit) / newPrice) * 100 : 0;
    
    setCart(cart.map(i => i.cartId === cartId ? {
      ...i,
      unitPrice: newPrice,
      subtotal: i.quantity * newPrice,
      marginPercent: marginPercent
    } : i));
  };


  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartCost = cart.reduce((sum, item) => sum + item.costTotal, 0);
  const estimatedProfit = cartTotal - cartCost;
  
  const handleSaveQuote = async () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    if (!validDays) {
      toast.error("Días de validez requeridos");
      return;
    }

    setSavingQuote(true);
    try {
      const payload = {
        customerId: selectedCustomer?.id,
        validDays: Number(validDays),
        notes: notes || undefined,
        requiresTransport: transportData?.requiresTransport,
        vehicleId: transportData?.requiresTransport ? (transportData as any).vehicleId : undefined,
        driverId: transportData?.requiresTransport ? (transportData as any).driverId : undefined,
        deliveryAddress: transportData?.requiresTransport ? (transportData as any).deliveryAddress : undefined,
        scheduledAt: transportData?.requiresTransport ? (transportData as any).scheduledDeliveryAt : undefined,
        items: cart.map(i => ({
          productId: i.id,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          unitType: i.unitType,
          unitFactor: Number(i.unitFactor) || 1,
        }))
      };

      if (isEditMode) {
        await quotesService.updateQuote(Number(id), payload);
      } else {
        await quotesService.createQuote(payload);
      }
      
      toast.success("Cotización guardada exitosamente");
      setCart([]);
      setSelectedCustomer(null);
      setNotes("");
      setJustSaved(true);
    } catch (e: any) {
      toast.error(e.message || "Error al crear la cotización");
    } finally {
      setSavingQuote(false);
    }
  };

  // Decide margin options based on supplier credit
  const marginOptions = [10, 15, 20, 30, 50]; // Normal margins

  const displayedProducts = products.filter(
    (product) => !showExpiringSoonOnly || (product.expirationDate && isNearExpiration(product.expirationDate))
  );

  return (
    <div className="flex h-full gap-6 max-h-[calc(100vh-80px)] overflow-hidden">
      {/* LEFT PANEL - PRODUCTS */}
      <div className="flex-1 flex flex-col bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[var(--border)] space-y-2.5 bg-[var(--bg)]/50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => confirmExit(() => navigate('/quotes'))} className="w-8 h-8 p-0 rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors text-[var(--text-sec)]">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="text-base font-black text-[var(--text-main)] uppercase tracking-tight leading-none mb-0.5">{isEditMode ? "Editar Cotización" : (cloneId ? "Clonando Cotización" : "Nueva Cotización")}</h2>
              <p className="text-[11px] text-[var(--text-sec)]">Selecciona productos y calcula márgenes</p>
            </div>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              autoFocus
              className="pl-9 h-9 bg-background/50 border-[var(--border)] focus:ring-[var(--primary)] rounded-lg text-sm pr-9" 
              placeholder="Buscar producto por nombre o código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-3.5 w-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />}
          </div>

          {/* Filtro visual por Categoría / Subcategoría / Marcas / Etiquetas / Por Vencer (idéntico a POS) */}
          {(categories.length > 0 || brands.length > 0 || tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Categorías Multi Select */}
              {categories.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed h-8 bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--primary)] text-xs rounded-xl px-2.5">
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Categorías
                      {selectedCategoryIds.length > 0 && (
                        <>
                          <div className="mx-1.5 h-3 w-[1px] bg-[var(--border)]" />
                          <Badge variant="secondary" className="rounded-sm px-1 py-0 font-normal bg-emerald-500 text-white text-[10px]">
                            {selectedCategoryIds.length} sel.
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '200px', maxWidth: '350px' }} align="start">
                    <div className="p-2 space-y-1">
                      {categories.map(cat => (
                        <Button
                          key={cat.id}
                          variant="ghost"
                          className="w-full justify-start font-normal h-8 px-2 gap-3 hover:bg-[var(--bg)]"
                          onClick={() => {
                            setSelectedCategoryIds(prev => 
                              prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                            );
                            if (selectedCategoryIds.includes(cat.id)) {
                              const subIds = cat.subcategories?.map(s => s.id) || [];
                              setSelectedSubcategoryIds(prev => prev.filter(id => !subIds.includes(id)));
                            }
                          }}
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", selectedCategoryIds.includes(cat.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-input")}>
                            {selectedCategoryIds.includes(cat.id) && <Check className="h-3 w-3" />}
                          </div>
                          <span className="truncate text-left text-[var(--text-main)] text-sm">{cat.name}</span>
                        </Button>
                      ))}
                      {selectedCategoryIds.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-[var(--border)]">
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-[var(--text-sec)]" onClick={() => { setSelectedCategoryIds([]); setSelectedSubcategoryIds([]); }}>
                            Limpiar
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Subcategorías Multi Select */}
              {selectedCategoryIds.length > 0 && categories.some(c => selectedCategoryIds.includes(c.id) && c.subcategories && c.subcategories.length > 0) && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed h-8 bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--primary)] text-xs rounded-xl px-2.5">
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Subcategorías
                      {selectedSubcategoryIds.length > 0 && (
                        <>
                          <div className="mx-1.5 h-3 w-[1px] bg-[var(--border)]" />
                          <Badge variant="secondary" className="rounded-sm px-1 py-0 font-normal bg-emerald-500 text-white text-[10px]">
                            {selectedSubcategoryIds.length} sel.
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '200px', maxWidth: '350px' }} align="start">
                    <div className="p-2 space-y-1">
                      {categories
                        .filter(c => selectedCategoryIds.includes(c.id))
                        .flatMap(c => c.subcategories || [])
                        .map(sub => (
                        <Button
                          key={sub.id}
                          variant="ghost"
                          className="w-full justify-start font-normal h-8 px-2 gap-3 hover:bg-[var(--bg)]"
                          onClick={() => {
                            setSelectedSubcategoryIds(prev => 
                              prev.includes(sub.id) ? prev.filter(id => id !== sub.id) : [...prev, sub.id]
                            );
                          }}
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", selectedSubcategoryIds.includes(sub.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-input")}>
                            {selectedSubcategoryIds.includes(sub.id) && <Check className="h-3 w-3" />}
                          </div>
                          <span className="truncate text-left text-[var(--text-main)] text-sm">{sub.name}</span>
                        </Button>
                      ))}
                      {selectedSubcategoryIds.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-[var(--border)]">
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-[var(--text-sec)]" onClick={() => setSelectedSubcategoryIds([])}>
                            Limpiar
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Marcas Multi Select */}
              {brands.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed h-8 bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-amber-500 text-xs rounded-xl px-2.5">
                      <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                      Marcas
                      {selectedBrandIds.length > 0 && (
                        <>
                          <div className="mx-1.5 h-3 w-[1px] bg-[var(--border)]" />
                          <Badge variant="secondary" className="rounded-sm px-1 py-0 font-normal bg-amber-500 text-white text-[10px]">
                            {selectedBrandIds.length} sel.
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '220px', maxWidth: '350px' }} align="start">
                    <div className="p-2 space-y-1">
                      {brands.length > 5 && (
                        <div className="px-1 pb-1">
                          <Input
                            type="text"
                            value={brandSearchTerm}
                            onChange={(e) => setBrandSearchTerm(e.target.value)}
                            placeholder="Buscar marca..."
                            className="h-7 text-xs bg-[var(--bg)] border-[var(--border)] px-2"
                          />
                        </div>
                      )}
                      <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                        {brands
                          .filter(b => !brandSearchTerm || b.name.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                          .map(brand => (
                            <Button
                              key={brand.id}
                              variant="ghost"
                              className="w-full justify-start font-normal h-8 px-2 gap-3 hover:bg-[var(--bg)]"
                              onClick={() => {
                                setSelectedBrandIds(prev => 
                                  prev.includes(brand.id) ? prev.filter(id => id !== brand.id) : [...prev, brand.id]
                                );
                              }}
                            >
                              <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", selectedBrandIds.includes(brand.id) ? "bg-amber-500 border-amber-500 text-white" : "border-input")}>
                                {selectedBrandIds.includes(brand.id) && <Check className="h-3 w-3" />}
                              </div>
                              <span className="truncate text-left text-[var(--text-main)] text-sm">{brand.name}</span>
                            </Button>
                          ))}
                        {brands.filter(b => !brandSearchTerm || b.name.toLowerCase().includes(brandSearchTerm.toLowerCase())).length === 0 && (
                          <p className="text-xs text-[var(--text-sec)] text-center py-2">No hay marcas</p>
                        )}
                      </div>
                      {selectedBrandIds.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-[var(--border)]">
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-[var(--text-sec)]" onClick={() => setSelectedBrandIds([])}>
                            Limpiar
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Etiquetas Multi Select */}
              {tags.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed h-8 bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--primary)] text-xs rounded-xl px-2.5">
                      <Tag className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Etiquetas
                      {selectedTagIds.length > 0 && (
                        <>
                          <div className="mx-1.5 h-3 w-[1px] bg-[var(--border)]" />
                          <Badge variant="secondary" className="rounded-sm px-1 py-0 font-normal bg-emerald-500 text-white text-[10px]">
                            {selectedTagIds.length} sel.
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '220px', maxWidth: '350px' }} align="start">
                    <div className="p-2 space-y-1">
                      {tags.length > 5 && (
                        <div className="px-1 pb-1">
                          <Input
                            type="text"
                            value={tagSearchTerm}
                            onChange={(e) => setTagSearchTerm(e.target.value)}
                            placeholder="Buscar etiqueta..."
                            className="h-7 text-xs bg-[var(--bg)] border-[var(--border)] px-2"
                          />
                        </div>
                      )}
                      <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                        {tags
                          .filter(t => !tagSearchTerm || t.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))
                          .map(tag => (
                            <Button
                              key={tag.id}
                              variant="ghost"
                              className="w-full justify-start font-normal h-8 px-2 gap-3 hover:bg-[var(--bg)]"
                              onClick={() => {
                                setSelectedTagIds(prev => 
                                  prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                                );
                              }}
                            >
                              <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", selectedTagIds.includes(tag.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-input")}>
                                {selectedTagIds.includes(tag.id) && <Check className="h-3 w-3" />}
                              </div>
                              <span className="truncate text-left text-[var(--text-main)] text-sm">#{tag.name}</span>
                            </Button>
                          ))}
                        {tags.filter(t => !tagSearchTerm || t.name.toLowerCase().includes(tagSearchTerm.toLowerCase())).length === 0 && (
                          <p className="text-xs text-[var(--text-sec)] text-center py-2">No hay etiquetas</p>
                        )}
                      </div>
                      {selectedTagIds.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-[var(--border)]">
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-[var(--text-sec)]" onClick={() => setSelectedTagIds([])}>
                            Limpiar
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Por Vencer Toggle */}
              <button
                type="button"
                onClick={() => setShowExpiringSoonOnly((v) => !v)}
                className={cn(
                  "px-2.5 h-8 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5",
                  showExpiringSoonOnly
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:border-amber-500"
                )}
              >
                <CalendarIcon size={13} className={showExpiringSoonOnly ? "text-white" : "text-amber-500"} />
                Por Vencer
              </button>

              {/* Limpiar todos los filtros si alguno está activo */}
              {(selectedCategoryIds.length > 0 || selectedSubcategoryIds.length > 0 || selectedBrandIds.length > 0 || selectedTagIds.length > 0 || showExpiringSoonOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                  onClick={() => {
                    setSelectedCategoryIds([]);
                    setSelectedSubcategoryIds([]);
                    setSelectedBrandIds([]);
                    setSelectedTagIds([]);
                    setShowExpiringSoonOnly(false);
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {(searchTerm.trim() || selectedCategoryIds.length > 0 || selectedSubcategoryIds.length > 0 || selectedBrandIds.length > 0 || selectedTagIds.length > 0 || showExpiringSoonOnly) && (
            <div className="mb-2 text-xs font-semibold text-[var(--text-sec)]">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </div>
          )}
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {displayedProducts.map((product) => {
                const stock = Number(product.stock);
                return (
                  <div 
                    key={product.id} 
                    onClick={() => openAddProductModal(product)}
                    className={cn(
                      "relative p-3 rounded-xl border transition-all flex flex-col cursor-pointer",
                      stock > 0 
                        ? "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md" 
                        : "bg-[var(--bg)] border-[var(--border)] opacity-60 hover:border-[var(--primary)]"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2 gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (product.category?.id) {
                            e.stopPropagation();
                            setSelectedCategoryIds(prev =>
                              prev.includes(product.category.id!)
                                ? prev.filter(id => id !== product.category.id)
                                : [...prev, product.category.id!]
                            );
                          }
                        }}
                        className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border truncate max-w-[100px] transition-colors",
                          product.category?.id && selectedCategoryIds.includes(product.category.id)
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-[var(--bg)] text-[var(--text-sec)] border-[var(--border)] hover:border-emerald-500"
                        )}
                        title={product.category?.name || "General"}
                      >
                        {product.category?.name || "General"}
                      </button>
                      <Badge variant={stock < 10 ? "destructive" : "secondary"} className="text-[9px] px-1.5 py-0 shrink-0">
                        {stock} {product.unit}
                      </Badge>
                    </div>

                    {/* Imagen del producto al igual que en Punto de Venta */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-[var(--bg)] border border-[var(--border)] mb-2 flex-shrink-0 self-center flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-25 text-[var(--text-sec)]">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-sm leading-tight text-[var(--text-main)] line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-mono text-[var(--text-sec)] mb-1">
                      {product.internalCode}
                    </p>

                    {product.expirationDate && (
                      <p className={cn(
                        "w-full text-[9px] font-bold mb-1 flex items-center gap-1",
                        isNearExpiration(product.expirationDate) ? "text-red-500" : "text-[var(--text-sec)]"
                      )}>
                        <CalendarIcon size={10} />
                        Vence: {formatExpirationDate(product.expirationDate)}
                      </p>
                    )}

                    {product.brand && (
                      <div className="w-full mb-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBrandIds((prev) =>
                              prev.includes(product.brand!.id)
                                ? prev.filter((id) => id !== product.brand!.id)
                                : [...prev, product.brand!.id]
                            );
                          }}
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-md border transition-all inline-flex items-center gap-1 font-semibold",
                            selectedBrandIds.includes(product.brand.id)
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:border-amber-500"
                          )}
                          title={selectedBrandIds.includes(product.brand.id) ? `Quitar filtro: ${product.brand.name}` : `Filtrar por marca: ${product.brand.name}`}
                        >
                          <Award size={10} />
                          {product.brand.name}
                        </button>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div className="w-full flex flex-wrap gap-1 mb-2">
                        {product.tags.map((t) => {
                          const isTagSelected = selectedTagIds.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTagIds((prev) =>
                                  prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                                );
                              }}
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-md border transition-all inline-flex items-center gap-0.5 font-medium",
                                isTagSelected
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                                  : "bg-[var(--bg)] text-[var(--text-sec)] border-[var(--border)] hover:border-emerald-500/50 hover:text-emerald-600"
                              )}
                              title={isTagSelected ? `Quitar filtro: #${t.name}` : `Filtrar por: #${t.name}`}
                            >
                              <Tag size={9} />
                              #{t.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--border)] border-dashed">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center">
                        <Percent size={10} className="mr-0.5"/> 
                        ${Number(product.costPrice || 0).toFixed(4)}
                      </span>
                      <span className="text-sm font-black text-[var(--primary)]">
                        ${Number(product.price).toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {loadingMore && (
                <div className="col-span-full py-4 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-sec)]">
                  <Loader2 className="animate-spin size-4 text-[var(--primary)]" />
                  Cargando más productos...
                </div>
              )}
              {!hasMore && !searchTerm.trim() && displayedProducts.length > 0 && totalCatalogCount !== null && (
                <div className="col-span-full py-3 text-center text-xs text-[var(--text-sec)] border-t border-dashed border-[var(--border)] mt-2">
                  Todos los productos mostrados ({displayedProducts.length} de {totalCatalogCount})
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-sec)] space-y-4 opacity-50 py-12">
              <Package size={48} />
              <p className="text-base font-bold">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - CART & DETAILS */}
      <div className="w-[300px] lg:w-[360px] xl:w-[420px] 2xl:w-[480px] flex flex-col bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex-shrink-0">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Cliente */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Cliente
                </Label>
                {!selectedCustomer && (
                  <Button variant="ghost" size="sm" onClick={() => setIsQuickCreateOpen(true)} className="h-7 text-xs font-bold text-[var(--primary)]">
                    <Plus size={12} className="mr-1" /> Nuevo Cliente
                  </Button>
                )}
              </div>

              {selectedCustomer ? (
                <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl relative group">
                  <Button 
                    variant="ghost" size="icon" 
                    className="absolute top-2 right-2 w-6 h-6 text-[var(--text-sec)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <X size={14} />
                  </Button>
                  <p className="font-bold text-sm text-[var(--primary)] pr-6 truncate">{selectedCustomer.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-black/20 border-[var(--border)]">{selectedCustomer.customerType.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nombre o doc..." 
                    className="pl-9 h-10 bg-[var(--bg)] border-[var(--border)] text-sm"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden">
                      {searchingCustomer ? (
                        <div className="p-3 text-sm text-center text-[var(--text-sec)] animate-pulse">Buscando...</div>
                      ) : customerResults.length > 0 ? (
                        customerResults.map(cust => (
                          <div 
                            key={cust.id} 
                            className="p-3 hover:bg-[var(--bg)]/50 cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors"
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setCustomerSearch("");
                            }}
                          >
                            <p className="font-bold text-sm truncate">{cust.name}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-[10px] text-[var(--text-sec)]">{cust.documentNumber || cust.nit || 'Sin doc'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-center text-[var(--text-sec)]">Sin resultados</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ajustes */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Ajustes de Cotización</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[var(--text-sec)]">Días de Validez</Label>
                  <NumberInput value={validDays === "" ? undefined : validDays} onValueChange={(val) => setValidDays(val === undefined ? "" : val)} className="h-9 text-sm bg-[var(--bg)]" />
                </div>
              </div>
              <Input placeholder="Notas adicionales..." value={notes} onChange={e => setNotes(e.target.value)} className="h-9 text-sm bg-[var(--bg)]" />
              
              <div className="pt-2">
                <TransportSelector
                  customerId={selectedCustomer?.id}
                  value={transportData}
                  onChange={setTransportData}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Productos ({cart.length})</span>
                {cart.length > 0 && <Button variant="ghost" size="sm" onClick={() => setCart([])} className="h-6 px-2 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">Vaciar</Button>}
              </Label>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl flex flex-col gap-2 relative group">
                    <Button
                      variant="ghost" size="icon"
                      className="absolute top-1 right-1 w-6 h-6 text-[var(--text-sec)] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all z-10"
                      onClick={() => updateCartQuantity(item.cartId, 0)}
                    >
                      <X size={12} />
                    </Button>
                    <div className="flex items-start gap-2.5 pr-6">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--card)] border border-[var(--border)] shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-25 text-[var(--text-sec)]">
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[var(--text-main)] leading-tight truncate">{item.name}</p>
                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wide">{formatUnitLabel(item.unitType)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] shadow-sm">
                        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-none hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}><Minus size={12} /></Button>
                        <div className="w-10 text-center text-xs font-black bg-[var(--bg)]/50 h-full flex items-center justify-center border-x border-[var(--border)]">{item.quantity}</div>
                        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-none hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}><Plus size={12} /></Button>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1 group/price relative bg-[var(--card)] border border-[var(--border)] rounded-md overflow-hidden focus-within:border-[var(--primary)] transition-colors pr-1 pl-2">
                            <span className="text-[10px] text-[var(--text-sec)] font-bold">$</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateCartPrice(item.cartId, Number(e.target.value))}
                              className="w-16 h-6 px-1 py-0 text-right text-xs font-mono bg-transparent outline-none text-[var(--text-sec)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <p className="text-sm font-black text-[var(--primary)] mt-1">${item.subtotal.toFixed(4)}</p>
                        </div>
                    </div>
                    {item.marginPercent < 5 && item.marginPercent >= 0 && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1">Margen bajo: {item.marginPercent.toFixed(1)}%</p>
                    )}
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="py-8 text-center text-[var(--text-sec)] border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg)]/50">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">Cotización vacía</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border-t border-[var(--border)] p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative z-10 space-y-3">
          <div className="flex justify-between text-xs font-bold text-[var(--text-sec)]">
            <span>Costo Total</span>
            <span>${cartCost.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-emerald-600">
            <span>Ganancia Est.</span>
            <span>${estimatedProfit.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-xl font-black text-[var(--primary)] border-t border-[var(--border)] pt-2">
            <span>TOTAL</span>
            <span>${cartTotal.toFixed(4)}</span>
          </div>
          <Button 
            className="w-full h-14 text-lg font-black bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-lg shadow-[var(--primary)]/20 uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]" 
            onClick={handleSaveQuote}
            disabled={savingQuote || cart.length === 0}
          >
            {savingQuote ? "Guardando..." : "Guardar Cotización"}
          </Button>
        </div>
      </div>

      {/* MODAL MARGEN */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-[var(--card)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
          {selectedProduct && (
            <>
              <div className="p-5 bg-[var(--bg)]/50 border-b border-[var(--border)] flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shrink-0 flex items-center justify-center">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-25 text-[var(--text-sec)]">
                      <Package size={22} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg font-black text-[var(--text-main)] leading-tight mb-1 truncate">{selectedProduct.name}</DialogTitle>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px]">{selectedProduct.internalCode}</Badge>
                    <span className="text-[var(--text-sec)] font-bold text-xs">{selectedProduct.stock} {selectedProduct.unit} disp.</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {selectedProduct.units && selectedProduct.units.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Unidad de Venta</Label>
                    <select
                      value={marginForm.unitType}
                      onChange={(e) => handleUnitTypeChange(e.target.value)}
                      className="w-full h-11 px-3 text-sm font-bold bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                    >
                      <option value={selectedProduct.unit}>{formatUnitLabel(selectedProduct.unit)}</option>
                      {selectedProduct.units.map(u => (
                        <option key={u.unit} value={u.unit}>{formatUnitLabel(u.unit)}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Costo por {formatUnitLabel(marginForm.unitType || selectedProduct.unit)}</span>
                  <span className="text-lg font-black text-emerald-700">${((Number(selectedProduct.costPrice) || 0) * marginForm.unitFactor).toFixed(4)}</span>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Aplicar Margen Rápido</Label>
                  <div className="flex flex-wrap gap-2">
                    {marginOptions.map(pct => (
                      <Button 
                        key={pct} 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "flex-1 font-black",
                          marginForm.marginPercent === pct && "bg-[var(--primary)] text-white border-[var(--primary)]"
                        )}
                        onClick={() => handleApplyQuickMargin(pct)}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Precio Personalizado</Label>
                    <NumberInput 
                      value={marginForm.unitPrice} 
                      onValueChange={handleCustomPriceChange}
                      className="h-12 text-lg font-black bg-[var(--bg)] focus:ring-[var(--primary)] border-[var(--primary)]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider">Cantidad ({formatUnitLabel(marginForm.unitType || selectedProduct.unit)})</Label>
                    <NumberInput
                      value={marginForm.quantity}
                      onValueChange={v => setMarginForm({...marginForm, quantity: v || 1})}
                      className="h-12 text-lg font-black bg-[var(--bg)]"
                      min={1}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider block mb-1">Margen Actual</span>
                    <span className={cn(
                      "text-xl font-black", 
                      marginForm.marginPercent < 5 ? "text-rose-500" : "text-emerald-600"
                    )}>
                      {marginForm.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[var(--text-sec)] uppercase tracking-wider block mb-1">Total Item</span>
                    <span className="text-xl font-black text-[var(--primary)]">
                      ${(marginForm.quantity * marginForm.unitPrice).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/50 flex gap-3">
                <Button variant="outline" className="flex-1 font-bold h-12" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                <Button className="flex-1 font-black h-12 bg-[var(--primary)] text-white" onClick={addProductToCart}>
                  <ShoppingCart size={18} className="mr-2"/> Agregar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CustomerQuickCreate open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen} onSuccess={(c) => setSelectedCustomer(c)} />

      <UnsavedChangesDialog open={exitDialogOpen} onConfirm={confirmDiscard} onCancel={cancelDiscard} />
    </div>
  );
}
