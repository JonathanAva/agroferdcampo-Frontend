import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Search, Loader2, CheckSquare, Square, PlusCircle, Check } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { UnsavedChangesDialog } from './unsaved-changes-dialog';

interface Product {
  id: number;
  name: string;
  internalCode?: string;
  category?: { id: number; name: string } | null;
  subcategory?: { id: number; name: string } | null;
  tags?: { id: number; name: string }[];
}

interface CommonEntity {
  id: number;
  name: string;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignTarget: {
    type: 'category' | 'subcategory' | 'tag';
    id: number;
    name: string;
  } | null;
  onSuccess: () => void;
}

export function BulkAssignModal({ isOpen, onClose, assignTarget, onSuccess }: BulkAssignModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CommonEntity[]>([]);
  const [subcategories, setSubcategories] = useState<CommonEntity[]>([]);
  const [tags, setTags] = useState<CommonEntity[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<number>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  const isDirty = selectedIds.size > 0;
  const { confirmExit, isOpen: exitDialogOpen, handleConfirm: confirmDiscard, handleCancel: cancelDiscard } =
    useUnsavedChangesGuard(isDirty);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchFilters();
      setSelectedIds(new Set());
      setSelectedCategoryIds(new Set());
      setSelectedSubcategoryIds(new Set());
      setSelectedTagIds(new Set());
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchFilters = async () => {
    try {
      const [cats, subcats, tg] = await Promise.all([
        apiRequest<CommonEntity[]>('/catalog/categories'),
        apiRequest<CommonEntity[]>('/catalog/subcategories'),
        apiRequest<CommonEntity[]>('/catalog/tags')
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setSubcategories(Array.isArray(subcats) ? subcats : []);
      setTags(Array.isArray(tg) ? tg : []);
    } catch (error) {
      console.error('Error fetching filters', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/catalog/products?limit=2000', 'GET');
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSave = async () => {
    if (selectedIds.size === 0 || !assignTarget) return;

    setSaving(true);
    try {
      const payload: any = {
        productIds: Array.from(selectedIds),
      };

      if (assignTarget.type === 'category') payload.categoryId = assignTarget.id;
      if (assignTarget.type === 'subcategory') payload.subcategoryId = assignTarget.id;
      if (assignTarget.type === 'tag') payload.tagId = assignTarget.id;

      await apiRequest('/catalog/products/bulk/assign', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      toast.success(`${selectedIds.size} productos asignados a ${assignTarget.name} correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error in bulk assign', error);
      toast.error('Ocurrió un error al asignar los productos');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.internalCode && p.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = selectedCategoryIds.size === 0 || 
      (p.category && selectedCategoryIds.has(p.category.id));
      
    const matchesSubcategory = selectedSubcategoryIds.size === 0 || 
      (p.subcategory && selectedSubcategoryIds.has(p.subcategory.id));
      
    const matchesTag = selectedTagIds.size === 0 || 
      (p.tags && p.tags.some(t => selectedTagIds.has(t.id)));
      
    return matchesSearch && matchesCategory && matchesSubcategory && matchesTag;
  });

  if (!assignTarget) return null;

  const targetLabel = assignTarget.type === 'category' ? 'Categoría' 
                    : assignTarget.type === 'subcategory' ? 'Subcategoría' 
                    : 'Etiqueta';

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) confirmExit(onClose); }}>
      <DialogContent className="sm:max-w-3xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Asignar Productos a {targetLabel}: {assignTarget.name}</DialogTitle>
          <DialogDescription>
            Selecciona los productos que deseas añadir masivamente a esta {targetLabel.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--text-sec)]" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-[var(--surface)]"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed h-10 border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--hover)] shrink-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Categoría
                  {selectedCategoryIds.size > 0 && (
                    <>
                      <div className="mx-2 h-4 w-[1px] bg-[var(--border)]" />
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-[var(--primary)]/10 text-[var(--primary)]">
                        {selectedCategoryIds.size} sel.
                      </Badge>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '150px', maxWidth: '350px' }} align="start">
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      variant="ghost"
                      className="w-full justify-start font-normal h-8 px-2 text-[var(--text-main)] hover:bg-[var(--hover)]"
                      onClick={() => {
                        const newSet = new Set(selectedCategoryIds);
                        if (newSet.has(cat.id)) newSet.delete(cat.id);
                        else newSet.add(cat.id);
                        setSelectedCategoryIds(newSet);
                      }}
                    >
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${selectedCategoryIds.has(cat.id) ? 'bg-[var(--primary)] text-primary-foreground border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                        {selectedCategoryIds.has(cat.id) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{cat.name}</span>
                    </Button>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-sm text-[var(--text-sec)] px-2 py-1">No hay categorías disponibles</div>
                  )}
                </div>
                {selectedCategoryIds.size > 0 && (
                  <>
                    <div className="h-[1px] bg-[var(--border)] w-full" />
                    <div className="p-1">
                      <Button variant="ghost" className="w-full h-8 text-xs justify-center hover:bg-[var(--hover)] text-[var(--text-main)]" onClick={() => setSelectedCategoryIds(new Set())}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed h-10 border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--hover)] shrink-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Subcategoría
                  {selectedSubcategoryIds.size > 0 && (
                    <>
                      <div className="mx-2 h-4 w-[1px] bg-[var(--border)]" />
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-[var(--primary)]/10 text-[var(--primary)]">
                        {selectedSubcategoryIds.size} sel.
                      </Badge>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '150px', maxWidth: '350px' }} align="start">
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {subcategories.map(subcat => (
                    <Button
                      key={subcat.id}
                      variant="ghost"
                      className="w-full justify-start font-normal h-8 px-2 text-[var(--text-main)] hover:bg-[var(--hover)]"
                      onClick={() => {
                        const newSet = new Set(selectedSubcategoryIds);
                        if (newSet.has(subcat.id)) newSet.delete(subcat.id);
                        else newSet.add(subcat.id);
                        setSelectedSubcategoryIds(newSet);
                      }}
                    >
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${selectedSubcategoryIds.has(subcat.id) ? 'bg-[var(--primary)] text-primary-foreground border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                        {selectedSubcategoryIds.has(subcat.id) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{subcat.name}</span>
                    </Button>
                  ))}
                  {subcategories.length === 0 && (
                    <div className="text-sm text-[var(--text-sec)] px-2 py-1">No hay subcategorías</div>
                  )}
                </div>
                {selectedSubcategoryIds.size > 0 && (
                  <>
                    <div className="h-[1px] bg-[var(--border)] w-full" />
                    <div className="p-1">
                      <Button variant="ghost" className="w-full h-8 text-xs justify-center hover:bg-[var(--hover)] text-[var(--text-main)]" onClick={() => setSelectedSubcategoryIds(new Set())}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed h-10 border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--hover)] shrink-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Etiqueta
                  {selectedTagIds.size > 0 && (
                    <>
                      <div className="mx-2 h-4 w-[1px] bg-[var(--border)]" />
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-[var(--primary)]/10 text-[var(--primary)]">
                        {selectedTagIds.size} sel.
                      </Badge>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-[var(--card)] border-[var(--border)]" style={{ width: 'max-content', minWidth: '150px', maxWidth: '350px' }} align="start">
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {tags.map(tag => (
                    <Button
                      key={tag.id}
                      variant="ghost"
                      className="w-full justify-start font-normal h-8 px-2 text-[var(--text-main)] hover:bg-[var(--hover)]"
                      onClick={() => {
                        const newSet = new Set(selectedTagIds);
                        if (newSet.has(tag.id)) newSet.delete(tag.id);
                        else newSet.add(tag.id);
                        setSelectedTagIds(newSet);
                      }}
                    >
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${selectedTagIds.has(tag.id) ? 'bg-[var(--primary)] text-primary-foreground border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                        {selectedTagIds.has(tag.id) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{tag.name}</span>
                    </Button>
                  ))}
                  {tags.length === 0 && (
                    <div className="text-sm text-[var(--text-sec)] px-2 py-1">No hay etiquetas</div>
                  )}
                </div>
                {selectedTagIds.size > 0 && (
                  <>
                    <div className="h-[1px] bg-[var(--border)] w-full" />
                    <div className="p-1">
                      <Button variant="ghost" className="w-full h-8 text-xs justify-center hover:bg-[var(--hover)] text-[var(--text-main)]" onClick={() => setSelectedTagIds(new Set())}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-[var(--border)] rounded-md bg-[var(--card)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              <div className="flex items-center p-3 bg-[var(--card)] sticky top-0 z-10 font-medium cursor-pointer border-b border-[var(--border)]" onClick={handleSelectAll}>
                <div className="mr-3">
                  {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? 
                    <CheckSquare className="h-5 w-5 text-[var(--primary)]" /> : 
                    <Square className="h-5 w-5 text-muted-foreground" />
                  }
                </div>
                <div className="text-[var(--text-main)]">Seleccionar todos los {filteredProducts.length} productos filtrados</div>
              </div>
              
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="flex items-center p-3 hover:bg-[var(--hover)] transition-colors cursor-pointer border-b border-[var(--border)] last:border-0"
                  onClick={() => handleToggle(product.id)}
                >
                  <div className="mr-3">
                    {selectedIds.has(product.id) ? 
                      <CheckSquare className="h-5 w-5 text-[var(--primary)]" /> : 
                      <Square className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[var(--text-main)] truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {product.internalCode && <div className="text-xs text-[var(--text-sec)] shrink-0">Cód: {product.internalCode}</div>}
                      {product.category && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-[var(--primary)]/30 text-[var(--primary)] font-medium shrink-0 bg-[var(--primary)]/5">
                          {product.category.name}
                        </Badge>
                      )}
                      {product.subcategory && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-500/30 text-blue-500 font-medium shrink-0 bg-blue-500/5">
                          {product.subcategory.name}
                        </Badge>
                      )}
                      {product.tags && product.tags.map(tag => (
                        <Badge key={tag.id} variant="outline" className="text-[10px] py-0 h-4 border-[var(--border)] text-[var(--text-main)] font-normal shrink-0">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-[var(--text-sec)]">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={() => confirmExit(onClose)} disabled={saving} className="text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--hover)]">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedIds.size === 0} className="bg-[var(--primary)] text-primary-foreground hover:bg-[var(--primary)]/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Asignar {selectedIds.size} productos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <UnsavedChangesDialog open={exitDialogOpen} onConfirm={confirmDiscard} onCancel={cancelDiscard} />
    </>
  );
}
