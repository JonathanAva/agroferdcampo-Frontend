import { getSaleDetail, SaleResponse } from '../services/sales.service';
import type { QuoteResponse } from '../services/quotes.service';
import type { SystemConfigData } from '../pages/SystemConfig';
import logoUrl from '../../assets/logo.png';
import { numerosALetras, PAYMENT_METHOD_LABEL } from './printSaleTicket';

/**
 * Documentos imprimibles en tamaño carta (factura/comprobante de venta y cotización) con el
 * mismo diseño. No incluyen datos del DTE (código de generación, número de control, sello):
 * para eso está la factura electrónica que emite Hacienda.
 */

interface LetterLine {
  quantity: number;
  unit?: string | null;
  description: string;
  code?: string | null;
  unitPrice: number;
  total: number;
}

interface LetterDoc {
  title: string;
  number: string;
  date: Date;
  infoCards: { label: string; value: string; highlight?: boolean }[];
  customer: { name: string; doc?: string; phone?: string; email?: string; address?: string };
  lines: LetterLine[];
  total: number;
  taxAmount?: number;
  notes?: string;
  footerNote: string;
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (n: number) => `$${n.toFixed(2)}`;

function unitLabel(unit?: string | null) {
  if (!unit) return '';
  return unit.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function buildHtml(doc: LetterDoc, sysConfig: SystemConfigData | null): string {
  const companyName = sysConfig?.companyName || "AGROFERRETERÍA D'CAMPO";
  const companyLines = [
    sysConfig?.companyAddress,
    [sysConfig?.companyNit && `NIT: ${sysConfig.companyNit}`, sysConfig?.companyNrc && `NRC: ${sysConfig.companyNrc}`].filter(Boolean).join(' · '),
    [sysConfig?.companyPhone && `Tel: ${sysConfig.companyPhone}`, sysConfig?.companyEmail].filter(Boolean).join(' · '),
  ].filter(Boolean);

  const c = doc.customer;
  const customerDetails = [
    c.doc && `<div><span class="lbl">Documento:</span> ${esc(c.doc)}</div>`,
    c.phone && `<div><span class="lbl">Teléfono:</span> ${esc(c.phone)}</div>`,
    c.email && `<div><span class="lbl">Correo:</span> ${esc(c.email)}</div>`,
    c.address && `<div><span class="lbl">Dirección:</span> ${esc(c.address)}</div>`,
  ].filter(Boolean).join('');

  const subtotal = doc.taxAmount !== undefined ? doc.total - doc.taxAmount : undefined;

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(doc.title)} ${esc(doc.number)}</title>
<style>
  @page { size: letter; margin: 14mm 14mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; font-size: 12px;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
            padding-bottom: 14px; border-bottom: 3px solid #2D6A4F; margin-bottom: 18px; }
  .brand { display: flex; gap: 14px; align-items: center; }
  .brand img { height: 64px; width: auto; }
  .brand h1 { margin: 0 0 3px; font-size: 18px; font-weight: 800; }
  .brand p { margin: 0; font-size: 10.5px; color: #4b5563; line-height: 1.45; }
  .doc-title { text-align: right; }
  .doc-title .t { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #6b7280; font-weight: 700; }
  .doc-title .n { font-size: 26px; font-weight: 800; color: #2D6A4F; line-height: 1.1; }
  .doc-title .d { font-size: 11px; color: #4b5563; margin-top: 2px; }
  .cards { display: grid; grid-template-columns: repeat(${Math.min(doc.infoCards.length, 4)}, 1fr); gap: 10px; margin-bottom: 14px; }
  .card { border: 1px solid #e5e7eb; background: #f8fafc; border-radius: 8px; padding: 9px 11px; }
  .card .l { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 3px; }
  .card .v { font-size: 12.5px; font-weight: 700; }
  .card .v.hl { color: #b91c1c; }
  .customer { border: 1px solid #e5e7eb; border-left: 4px solid #2D6A4F; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; }
  .customer .name { font-size: 14px; font-weight: 800; margin-bottom: 4px; }
  .customer .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px; font-size: 11px; color: #374151; }
  .lbl { color: #6b7280; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  thead th { background: #2D6A4F; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: .8px;
             padding: 8px 10px; text-align: left; }
  thead th.r, td.r { text-align: right; } thead th.c, td.c { text-align: center; }
  tbody td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f9fafb; }
  tr { page-break-inside: avoid; }
  .code { display: block; font-size: 9.5px; color: #9ca3af; font-family: ui-monospace, monospace; }
  .bottom { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; page-break-inside: avoid; }
  .words { flex: 1; font-size: 11px; color: #374151; }
  .words .notes { margin-top: 10px; padding: 8px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb; }
  .totals { width: 260px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .totals .row { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  .totals .row:last-child { border-bottom: none; }
  .totals .grand { background: #2D6A4F; color: #fff; font-size: 15px; font-weight: 800; }
  .footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center; line-height: 1.5; }
</style></head><body>
  <div class="header">
    <div class="brand">
      <img src="${window.location.origin}${logoUrl}" alt="logo">
      <div>
        <h1>${esc(companyName)}</h1>
        ${companyLines.map((l) => `<p>${esc(l)}</p>`).join('')}
      </div>
    </div>
    <div class="doc-title">
      <div class="t">${esc(doc.title)}</div>
      <div class="n">#${esc(doc.number)}</div>
      <div class="d">${doc.date.toLocaleDateString('es-SV', { day: '2-digit', month: 'long', year: 'numeric' })}
        · ${doc.date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  </div>

  <div class="cards">
    ${doc.infoCards.map((card) => `<div class="card"><div class="l">${esc(card.label)}</div><div class="v${card.highlight ? ' hl' : ''}">${esc(card.value)}</div></div>`).join('')}
  </div>

  <div class="customer">
    <div class="name">${esc(c.name)}</div>
    ${customerDetails ? `<div class="grid">${customerDetails}</div>` : ''}
  </div>

  <table>
    <thead><tr>
      <th class="c" style="width:90px">Cant.</th>
      <th>Descripción</th>
      <th class="r" style="width:100px">P. Unit.</th>
      <th class="r" style="width:110px">Total</th>
    </tr></thead>
    <tbody>
      ${doc.lines.map((l) => `<tr>
        <td class="c"><b>${l.quantity}</b>${l.unit ? ` ${esc(unitLabel(l.unit))}` : ''}</td>
        <td>${esc(l.description)}${l.code ? `<span class="code">${esc(l.code)}</span>` : ''}</td>
        <td class="r">${money(l.unitPrice)}</td>
        <td class="r"><b>${money(l.total)}</b></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="bottom">
    <div class="words">
      <div><span class="lbl">Total en letras:</span> <b>${esc(numerosALetras(doc.total))}</b></div>
      ${doc.notes ? `<div class="notes"><span class="lbl">Observaciones:</span> ${esc(doc.notes)}</div>` : ''}
    </div>
    <div class="totals">
      ${subtotal !== undefined ? `
        <div class="row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="row"><span>IVA (incluido)</span><span>${money(doc.taxAmount!)}</span></div>` : ''}
      <div class="row grand"><span>TOTAL</span><span>${money(doc.total)}</span></div>
    </div>
  </div>

  <div class="footer">${esc(doc.footerNote)}</div>
</body></html>`;
}

/** Imprime el HTML en un iframe oculto (evita el bloqueo de ventanas emergentes). */
function printHtml(html: string) {
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('No se pudo iniciar la impresión');
  }
  doc.open();
  doc.write(html);
  doc.close();

  const run = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1500);
  };
  // Esperar a que cargue el logo para que salga en la impresión
  const img = doc.querySelector('img');
  if (img && !img.complete) {
    img.addEventListener('load', run, { once: true });
    img.addEventListener('error', run, { once: true });
  } else {
    setTimeout(run, 150);
  }
}

/** Factura / comprobante de venta en tamaño carta, sin datos del DTE. */
export async function printSaleInvoiceLetter(saleOrPartial: SaleResponse, sysConfig: SystemConfigData | null) {
  const sale: any = saleOrPartial.items ? saleOrPartial : await getSaleDetail(saleOrPartial.id);
  const customer = sale.customer || {};
  const isContribuyente = customer.customerType === 'CONTRIBUYENTE';
  const payment = sale.isMixedPayment
    ? 'Pago mixto'
    : PAYMENT_METHOD_LABEL[sale.paymentMethod] || sale.paymentMethod || 'Efectivo';

  printHtml(buildHtml({
    title: isContribuyente ? 'Comprobante de venta · Crédito fiscal' : 'Comprobante de venta',
    number: String(sale.id).padStart(6, '0'),
    date: new Date(sale.createdAt || Date.now()),
    infoCards: [
      { label: 'Condición de pago', value: payment },
      { label: 'Atendido por', value: sale.user?.fullName || '-' },
      { label: 'Estado', value: sale.status === 'CANCELADA' ? 'Anulada' : 'Completada', highlight: sale.status === 'CANCELADA' },
    ],
    customer: {
      name: customer.name || 'Consumidor Final',
      doc: isContribuyente
        ? [customer.nit && `NIT ${customer.nit}`, customer.documentNumber && `NRC ${customer.documentNumber}`].filter(Boolean).join(' · ')
        : customer.documentNumber || customer.dui || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    },
    lines: (sale.items || []).map((i: any) => ({
      quantity: Number(i.quantity),
      unit: i.unitType,
      description: i.customName || i.product?.name || 'Producto',
      code: i.product?.internalCode,
      unitPrice: Number(i.unitPrice),
      total: Number(i.totalPrice),
    })),
    total: Number(sale.totalAmount),
    taxAmount: sale.taxAmount != null ? Number(sale.taxAmount) : undefined,
    footerNote: 'Gracias por su compra. Este comprobante es de uso interno y no sustituye al documento tributario electrónico (DTE).',
  }, sysConfig));
}

/** Cotización en tamaño carta (mismo diseño que el comprobante de venta). */
export function printQuoteLetter(quote: QuoteResponse, sysConfig: SystemConfigData | null) {
  const customer: any = quote.customer || {};
  const validUntil = quote.validUntil ? new Date(quote.validUntil) : null;
  const statusLabel: Record<string, string> = {
    PENDIENTE: 'Vigente', CONFIRMADA: 'Confirmada', EXPIRADA: 'Expirada', CANCELADA: 'Cancelada',
  };

  printHtml(buildHtml({
    title: 'Cotización',
    number: String(quote.id).padStart(6, '0'),
    date: new Date(quote.createdAt),
    infoCards: [
      { label: 'Válida hasta', value: validUntil ? validUntil.toLocaleDateString('es-SV') : 'Sin fecha', highlight: true },
      { label: 'Atendido por', value: quote.user?.fullName || '-' },
      { label: 'Estado', value: statusLabel[quote.status] || quote.status },
    ],
    customer: {
      name: customer.name || 'Consumidor Final',
      doc: customer.nit || customer.documentNumber || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    },
    lines: (quote.items || []).map((i) => ({
      quantity: Number(i.quantity),
      unit: i.unitType,
      description: i.customName || i.product?.name || 'Producto',
      code: i.product?.internalCode,
      unitPrice: Number(i.unitPrice),
      total: Number(i.totalPrice),
    })),
    total: Number(quote.totalAmount),
    notes: (quote as any).notes || '',
    footerNote: `Esta cotización es válida hasta el ${validUntil ? validUntil.toLocaleDateString('es-SV') : '—'}. Los precios están sujetos a disponibilidad de inventario y pueden variar sin previo aviso.`,
  }, sysConfig));
}
