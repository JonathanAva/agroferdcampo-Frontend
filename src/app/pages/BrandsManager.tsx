import React, { useState, useEffect } from "react";
import { Award, Plus, Trash2, Edit, Save, X, Search, Link } from "lucide-react";
import { apiRequest } from "../config/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BulkAssignModal } from "../components/ui/BulkAssignModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export interface BrandType {
  id: number;
  name: string;
  _count?: {
    products: number;
  };
}

export function BrandsManager() {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBrandName, setNewBrandName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formLoading, setFormLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ type: 'brand'; id: number; name: string } | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<BrandType[]>("/catalog/brands");
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    setFormLoading(true);
    try {
      await apiRequest("/catalog/brands", {
        method: "POST",
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      toast.success("Marca creada exitosamente");
      setNewBrandName("");
      fetchBrands();
    } catch (err: any) {
      toast.error(err.message || "Error al crear la marca");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBrand = async (brand: BrandType) => {
    if (!confirm(`¿Eliminar marca "${brand.name}"? Los productos asociados quedarán sin marca.`)) return;
    try {
      await apiRequest(`/catalog/brands/${brand.id}`, {
        method: "DELETE",
      });
      toast.success("Marca eliminada");
      fetchBrands();
    } catch (err: any) {
      toast.error(err.message || "No se puede eliminar la marca");
    }
  };

  const startEditing = (brand: BrandType) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEditing = async (id: number) => {
    if (!editingName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    setFormLoading(true);
    try {
      await apiRequest(`/catalog/brands/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editingName.trim() }),
      });
      toast.success("Marca actualizada");
      setEditingId(null);
      fetchBrands();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la marca");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-main)" }}>
          <Award size={20} className="text-amber-500" />
          Crear Nueva Marca
        </h2>
        <form onSubmit={handleCreateBrand} className="flex gap-4 items-end">
          <div className="space-y-2 flex-1 max-w-md">
            <Label>Nombre de la Marca</Label>
            <Input
              value={newBrandName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBrandName(e.target.value)}
              placeholder="Ej: Truper, Bayer, Yara, Sika, Stanley..."
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={formLoading || !newBrandName.trim()} className="h-11 px-6 font-bold">
            <Plus size={18} className="mr-2" />
            Agregar Marca
          </Button>
        </form>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar marca..."
              className="pl-9 h-10 bg-[var(--surface)]"
            />
          </div>
          {filteredBrands.length > 0 && (
            <div className="flex items-center gap-4 text-[var(--text-sec)]">
              <div className="text-sm font-medium">
                Mostrando {paginatedBrands.length} de {filteredBrands.length} (Página {currentPage})
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text-main)]"
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text-main)]"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold text-[var(--text-main)]">Nombre de la Marca</TableHead>
                <TableHead className="font-bold text-[var(--text-main)] text-center w-28">Productos</TableHead>
                <TableHead className="font-bold text-[var(--text-main)] text-center w-36">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-[var(--text-sec)]">
                    Cargando marcas...
                  </TableCell>
                </TableRow>
              ) : filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-[var(--text-sec)]">
                    {searchTerm ? "No se encontraron resultados para tu búsqueda." : "No hay marcas registradas todavía."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBrands.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-[var(--bg)] transition-colors">
                    <TableCell>
                      {editingId === brand.id ? (
                        <Input
                          autoFocus
                          value={editingName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") saveEditing(brand.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="h-9 font-bold bg-[var(--surface)]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-amber-500 shrink-0" />
                          <span className="font-bold text-[var(--text-main)]">{brand.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs text-[var(--text-sec)]">
                      {brand._count?.products ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === brand.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveEditing(brand.id)}
                            disabled={formLoading}
                            className="h-8 w-8 text-green-500 hover:bg-green-50 rounded-lg"
                            title="Guardar"
                          >
                            <Save size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAssignTarget({ type: 'brand', id: brand.id, name: brand.name });
                              setAssignModalOpen(true);
                            }}
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg"
                            title="Asignar Productos en bloque a esta Marca"
                          >
                            <Link size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(brand)}
                            className="h-8 w-8 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg"
                            title="Editar nombre"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBrand(brand)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BulkAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        assignTarget={assignTarget}
        onSuccess={() => {
          fetchBrands();
        }}
      />
    </div>
  );
}
