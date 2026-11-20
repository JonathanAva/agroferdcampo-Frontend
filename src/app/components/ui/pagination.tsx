import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        "rounded-xl transition-all cursor-pointer",
        isActive && "border-primary text-primary bg-primary/5 hover:bg-primary/10 font-bold ring-2 ring-primary/20",
        !isActive && "hover:bg-primary/10 hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1.5 px-3 rounded-xl font-medium", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">Anterior</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1.5 px-3 rounded-xl font-medium", className)}
      {...props}
    >
      <span className="hidden sm:block">Siguiente</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-10 items-center justify-center text-muted-foreground/50", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-5" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Cerca del inicio: 1, 2, 3, 4, 5, '...', totalPages
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Cerca del final: 1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // En medio: 1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export interface PaginationBarProps {
  page: number;
  totalPages: number;
  total?: number;
  itemName?: string;
  onPageChange: (newPage: number) => void;
  className?: string;
  showItemCount?: boolean;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  itemName = "registros",
  onPageChange,
  className,
  showItemCount = true,
}: PaginationBarProps) {
  if (totalPages <= 0) return null;

  const range = getPaginationRange(page, totalPages);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[var(--border)]", className)}>
      {showItemCount && (
        <p className="text-xs sm:text-sm text-[var(--text-sec)]">
          Página <strong className="text-[var(--text-main)] font-bold">{page}</strong> de{" "}
          <strong className="text-[var(--text-main)] font-bold">{totalPages}</strong>
          {total !== undefined && (
            <span> ({total} {itemName})</span>
          )}
        </p>
      )}

      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="size-3.5" />
          <span>Anterior</span>
        </Button>

        {range.map((p, idx) => {
          if (p === "...") {
            const isLeftEllipsis = idx === 1;
            const targetPage = isLeftEllipsis ? Math.max(1, page - 5) : Math.min(totalPages, page + 5);
            return (
              <button
                key={`ellipsis-${idx}`}
                type="button"
                title={`Saltar 5 páginas ${isLeftEllipsis ? "hacia atrás" : "hacia adelante"}`}
                onClick={() => onPageChange(targetPage)}
                className="h-8 min-w-8 px-1.5 flex items-center justify-center text-xs text-[var(--text-sec)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors cursor-pointer"
              >
                <MoreHorizontalIcon className="size-4" />
              </button>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-8 min-w-8 px-2.5 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm ring-2 ring-[var(--primary)]/20"
                  : "bg-[var(--card)] text-[var(--text-main)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10"
              )}
            >
              {p}
            </button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Siguiente</span>
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
