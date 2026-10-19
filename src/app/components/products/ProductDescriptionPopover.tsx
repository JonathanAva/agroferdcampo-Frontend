import React, { useState } from "react";
import { FileText, Maximize2, Tag, Layers } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

export interface ProductDescriptionItem {
  id?: number;
  name: string;
  internalCode?: string | null;
  barcode?: string | null;
  category?: { name: string } | string | null;
  subcategory?: { name: string } | string | null;
  brand?: { name: string } | string | null;
  description?: string | null;
  unit?: string | null;
  imageUrl?: string | null;
}

interface ProductDescriptionPopoverProps {
  product: ProductDescriptionItem;
  trigger?: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function ProductDescriptionPopover({
  product,
  trigger,
  className,
  side = "bottom",
  align = "end",
}: ProductDescriptionPopoverProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  const brandName =
    typeof product.brand === "string" ? product.brand : product.brand?.name;

  const hasDescription = !!product.description?.trim();
  const descriptionText = product.description?.trim() || "";

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex"
            >
              {trigger}
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={cn(
                "size-5 rounded flex items-center justify-center transition-all border",
                hasDescription
                  ? "text-[var(--text-sec)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 border-[var(--border)] bg-[var(--card)]"
                  : "text-[var(--text-sec)]/40 hover:text-[var(--text-sec)] border-transparent hover:border-[var(--border)] bg-transparent",
                className
              )}
              title={
                hasDescription
                  ? "Ver descripción del producto"
                  : "Sin descripción registrada"
              }
              aria-label="Ver descripción del producto"
            >
              <FileText size={11} />
            </button>
          )}
        </PopoverTrigger>

        <PopoverContent
          className="w-80 sm:w-96 p-3 bg-[var(--card)] border-[var(--border)] shadow-xl z-50 rounded-xl"
          onClick={(e) => e.stopPropagation()}
          side={side}
          align={align}
        >
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-[var(--text-main)] leading-snug line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--text-sec)] flex-wrap">
                  {product.internalCode && (
                    <span className="font-mono bg-[var(--bg)] px-1 py-0.5 rounded border border-[var(--border)] font-semibold">
                      {product.internalCode}
                    </span>
                  )}
                  {categoryName && (
                    <span className="truncate max-w-[120px]">
                      • {categoryName}
                    </span>
                  )}
                  {brandName && (
                    <span className="truncate max-w-[100px]">
                      • {brandName}
                    </span>
                  )}
                </div>
              </div>

              {hasDescription && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    setDialogOpen(true);
                  }}
                  className="size-6 rounded flex items-center justify-center text-[var(--text-sec)] hover:text-[var(--primary)] hover:bg-[var(--bg)] border border-[var(--border)] transition-colors shrink-0"
                  title="Ampliar descripción"
                >
                  <Maximize2 size={11} />
                </button>
              )}
            </div>

            {/* Content */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sec)] mb-1 flex items-center gap-1">
                <FileText size={10} className="text-[var(--primary)]" />
                Descripción del producto
              </p>

              {hasDescription ? (
                <div className="max-h-48 overflow-y-auto custom-scrollbar p-2.5 rounded-lg bg-[var(--bg)]/80 border border-[var(--border)] text-xs text-[var(--text-main)] whitespace-pre-wrap leading-relaxed select-text font-normal">
                  {descriptionText}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[var(--bg)]/40 border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-sec)] italic">
                  Este producto no tiene una descripción registrada en catálogo.
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Modal ampliado para descripciones extensas */}
      {hasDescription && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="sm:max-w-lg bg-[var(--card)] border-[var(--border)] text-[var(--text-main)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-sec)]">
                {product.internalCode && (
                  <Badge variant="outline" className="font-mono text-[10px]">
                    #{product.internalCode}
                  </Badge>
                )}
                {categoryName && <span>• {categoryName}</span>}
                {brandName && <span>• {brandName}</span>}
              </div>
              <DialogTitle className="text-base font-black text-[var(--text-main)] leading-snug">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <div className="py-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] max-h-96 overflow-y-auto custom-scrollbar text-xs text-[var(--text-main)] whitespace-pre-wrap leading-relaxed select-text">
                {descriptionText}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
