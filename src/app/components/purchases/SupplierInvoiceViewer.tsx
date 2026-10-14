import { ExternalLink, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { resolveFileUrl, isPdfUrl } from "../../utils/fileUrl";

interface SupplierInvoiceViewerProps {
  url: string | null;
  title?: string;
  subtitle?: string;
  onOpenChange: (open: boolean) => void;
}

/** Muestra la foto (o el PDF) de la factura del proveedor adjunta a una recepción. */
export function SupplierInvoiceViewer({ url, title, subtitle, onOpenChange }: SupplierInvoiceViewerProps) {
  const src = url ? resolveFileUrl(url) : "";
  const pdf = url ? isPdfUrl(url) : false;

  return (
    <Dialog open={!!url} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-[var(--card)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} /> {title || "Factura adjunta"}
          </DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        {url && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden flex items-center justify-center max-h-[70vh]">
            {pdf ? (
              <iframe src={src} title="Factura del proveedor" className="w-full h-[70vh]" />
            ) : (
              <img src={src} alt="Factura del proveedor" className="max-h-[70vh] w-auto object-contain" />
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.open(src, "_blank", "noopener")}>
            <ExternalLink size={14} className="mr-2" /> Abrir en otra pestaña
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
