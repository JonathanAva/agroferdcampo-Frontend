import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Edit, Save, X, Search, Hash } from "lucide-react";
import { apiRequest } from "../config/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface TagType {
  id: number;
  name: string;
  _count?: {
    products: number;
  };
}

export function TagsManager() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formLoading, setFormLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<TagType[]>("/catalog/tags");
      setTags(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar etiquetas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setFormLoading(true);
    try {
      await apiRequest("/catalog/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      toast.success("Etiqueta creada exitosamente");
      setNewTagName("");
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Error al crear la etiqueta");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTag = async (tag: TagType) => {
    if (!confirm(`¿Eliminar etiqueta "${tag.name}"?`)) return;
    try {
      await apiRequest(`/catalog/tags/${tag.id}`, {
        method: "DELETE",
      });
      toast.success("Etiqueta eliminada");
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "No se puede eliminar la etiqueta");
    }
  };

  const startEditing = (tag: TagType) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
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
      await apiRequest(`/catalog/tags/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editingName.trim() }),
      });
      toast.success("Etiqueta actualizada");
      setEditingId(null);
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la etiqueta");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage) || 1;
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-main)" }}>
          <Hash size={20} />
          Crear Nueva Etiqueta
        </h2>
        <form onSubmit={handleCreateTag} className="flex gap-4 items-end">
          <div className="space-y-2 flex-1 max-w-md">
            <Label>Nombre de la Etiqueta</Label>
            <Input
              value={newTagName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
              placeholder="Ej: Nuevo, Oferta, Orgánico..."
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={formLoading || !newTagName.trim()} className="h-11 px-6 font-bold">
            <Plus size={18} className="mr-2" />
            Agregar
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
              placeholder="Buscar etiqueta..."
              className="pl-9 h-10 bg-[var(--surface)]"
            />
          </div>
          {filteredTags.length > 0 && (
            <div className="flex items-center gap-4 text-[var(--text-sec)]">
              <div className="text-sm font-medium">
                Mostrando {paginatedTags.length} de {filteredTags.length} (Página {currentPage})
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
                <TableHead className="font-bold text-[var(--text-main)]">Nombre</TableHead>
                <TableHead className="font-bold text-[var(--text-main)] text-center w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-[var(--text-sec)]">
                    Cargando etiquetas...
                  </TableCell>
                </TableRow>
              ) : filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-[var(--text-sec)]">
                    {searchTerm ? "No se encontraron resultados para tu búsqueda." : "No hay etiquetas registradas."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-[var(--bg)] transition-colors">
                    <TableCell>
                      {editingId === tag.id ? (
                        <Input
                          autoFocus
                          value={editingName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") saveEditing(tag.id);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="h-9 font-bold bg-[var(--surface)]"
                        />
                      ) : (
                        <span className="font-bold text-[var(--text-main)]">{tag.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === tag.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveEditing(tag.id)}
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
                            onClick={() => startEditing(tag)}
                            className="h-8 w-8 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg"
                            title="Editar nombre"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTag(tag)}
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
    </div>
  );
}
