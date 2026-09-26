import { SaleResponse, getSaleDetail } from '../services/sales.service';
import { QuoteResponse, quotesService } from '../services/quotes.service';
import { DeliveryNoteResponse, deliveryNotesService } from '../services/delivery-notes.service';
import { PurchaseResponse, purchasesService } from '../services/purchases.service';
import type { SystemConfigData } from '../pages/SystemConfig';
import logoUrl from '../../assets/logo.png';
import { toast } from 'sonner';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Crédito',
  CONTRAENTREGA: 'Contraentrega',
};

function enteroALetras(n: number): string {
  if (n === 0) return 'Cero';
  const w29 = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve',
    'Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve',
    'Veinte', 'Veintiuno', 'Veintidós', 'Veintitrés', 'Veinticuatro', 'Veinticinco',
    'Veintiséis', 'Veintisiete', 'Veintiocho', 'Veintinueve'];
  const dec = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  const cen = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos',
    'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
  const w1 = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  if (n <= 29) return w29[n];
  if (n < 100) return dec[Math.floor(n / 10)] + (n % 10 ? ' Y ' + w1[n % 10] : '');
  if (n === 100) return 'Cien';
  if (n < 1000) return cen[Math.floor(n / 100)] + (n % 100 ? ' ' + enteroALetras(n % 100) : '');
  if (n < 2000) return 'Mil' + (n % 1000 ? ' ' + enteroALetras(n % 1000) : '');
  if (n < 1_000_000) return enteroALetras(Math.floor(n / 1000)) + ' Mil' + (n % 1000 ? ' ' + enteroALetras(n % 1000) : '');
  return n.toString();
}

function numerosALetras(n: number): string {
  const intPart = Math.floor(n);
  const cents = Math.round((n - intPart) * 100);
  return `${enteroALetras(intPart)} dólares${cents > 0 ? ` con ${cents}/100` : ''}`;
}

function formatUnitLabel(unitType?: string | null): string {
  if (!unitType) return '';
  return unitType
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function buildSaleTicketBodyHtml(sale: SaleResponse, sysConfig: SystemConfigData | null): string {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const totalNum = Number(sale.totalAmount);
  const subtotal = totalNum;
  const createdAt = sale.createdAt ? new Date(sale.createdAt) : new Date();

  const companyName     = sysConfig?.companyName     || "AGROFERRETERÍA D'CAMPO";
  const companyAddress  = sysConfig?.companyAddress  || '';
  const companyNit      = sysConfig?.companyNit      || '';
  const companyNrc      = sysConfig?.companyNrc      || '';
  const companyPhone    = sysConfig?.companyPhone    || '';
  const companyActivity = sysConfig?.companyActivity || '';

  const customerName     = sale.customer?.name || 'CONSUMIDOR FINAL';
  const customerAddress  = (sale.customer as any)?.address  || 'Ciudad';
  const customerPhone    = (sale.customer as any)?.phone    || '';
  const customerEmail    = (sale.customer as any)?.email    || '';
  const customerActivity = (sale.customer as any)?.activityDescription || '';

  const saleNumber = String(sale.id).padStart(6, '0');
  const totalInWords = numerosALetras(totalNum);
  const dateStr = createdAt.toLocaleDateString('es-SV');
  const timeStr = createdAt.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  const paymentLabel = sale.isMixedPayment
    ? 'Mixto'
    : PAYMENT_METHOD_LABEL[sale.paymentMethod] || sale.paymentMethod || 'Efectivo';

  return `
    <div class="center"><img src="${window.location.origin}${logoUrl}" style="width:72px;height:auto;margin-bottom:4px" alt="logo"></div>
    <h1>${companyName}</h1>
    <div class="center" style="font-size:9.5px">${companyAddress}</div>
    <div class="center">NIT: ${companyNit}</div>
    <div class="center">NRC: ${companyNrc}</div>
    <div class="center" style="font-size:10px">Actividad económica: ${companyActivity}</div>
    <div class="center" style="font-size:10px">Tipo de establecimiento: Casa matriz</div>
    ${companyPhone ? `<div class="center">Tel: ${companyPhone}</div>` : ''}

    <hr>

    <div class="stitle">Envío</div>
    <div class="row"><span>Fecha y hora:</span><span>${dateStr} ${timeStr}</span></div>
    <div class="row"><span>Emisor:</span><span>${sale.user?.fullName || '-'}</span></div>
    <div class="row"><span>Cajero/a:</span><span>${sale.user?.fullName || '-'}</span></div>

    <hr>

    <div class="stitle">Datos del receptor</div>
    <div class="row"><span>Nombre:</span><span>${customerName}</span></div>
    <div class="row"><span>Dirección:</span><span>${customerAddress}</span></div>
    ${customerEmail ? `<div class="row"><span>Correo:</span><span>${customerEmail}</span></div>` : ''}
    ${customerPhone ? `<div class="row"><span>Teléfono:</span><span>${customerPhone}</span></div>` : ''}
    ${customerActivity ? `<div class="row"><span>Actividad:</span><span>${customerActivity}</span></div>` : ''}
    <div class="row"><span>No. de Venta:</span><span class="bold">#${saleNumber}</span></div>

    <hr>

    <table>
      <thead><tr>
        <th style="width:14px"></th><th>Cant</th><th>Descripción</th><th class="tr">Precio</th><th class="tr">Monto</th>
      </tr></thead>
      <tbody>
        ${(sale.items || []).map((i: any) => `<tr>
          <td><span style="display:inline-block;width:11px;height:11px;border:1.5px solid #000;vertical-align:middle"></span></td>
          <td>${Number(i.quantity)}</td>
          <td>${i.customName || i.product?.name || ''}</td>
          <td class="tr">${fmt(Number(i.unitPrice))}</td>
          <td class="tr">${fmt(Number(i.totalPrice))}</td>
        </tr>`).join('')}
        <tr style="border-top:1px solid #000">
          <td colspan="5" style="padding-top:4px">
            <span style="display:inline-block;width:13px;height:13px;border:2px solid #000;vertical-align:middle;margin-right:5px"></span>
            <span style="font-weight:bold;font-size:10px">Todos los productos fueron entregados en su totalidad</span>
          </td>
        </tr>
      </tbody>
    </table>

    <hr>

    <div class="row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
    <div class="row bold"><span>Monto total de la operación:</span><span>${fmt(totalNum)}</span></div>
    <div class="row bold" style="font-size:13px"><span>Total a pagar:</span><span>${fmt(totalNum)}</span></div>

    <hr>

    <div class="row"><span class="bold">Total en letras:</span><span>${totalInWords}</span></div>
    <div class="row"><span class="bold">Condición de la operación:</span><span>${paymentLabel}</span></div>

    <hr class="d">
    <div class="center bold" style="margin-top:6px">Gracias por su compra</div>
  `;
}

function buildQuoteTicketBodyHtml(fullQuote: QuoteResponse, sysConfig: SystemConfigData | null): string {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const totalNum  = Number(fullQuote.totalAmount);
  const createdAt = new Date(fullQuote.createdAt);
  const validUntil = new Date(fullQuote.validUntil);

  const companyName     = sysConfig?.companyName     || "AGROFERRETERÍA D'CAMPO";
  const companyAddress  = sysConfig?.companyAddress  || '';
  const companyNit      = sysConfig?.companyNit      || '';
  const companyNrc      = sysConfig?.companyNrc      || '';
  const companyPhone    = sysConfig?.companyPhone    || '';
  const companyActivity = sysConfig?.companyActivity || '';

  const customerName  = fullQuote.customer?.name  || 'CONSUMIDOR FINAL';
  const customerPhone = fullQuote.customer?.phone || '';
  const customerEmail = fullQuote.customer?.email || '';
  const customerNit   = fullQuote.customer?.nit   || '';

  const quoteNumber  = String(fullQuote.id).padStart(6, '0');
  const totalInWords = numerosALetras(totalNum);
  const dateStr      = createdAt.toLocaleDateString('es-SV');
  const timeStr      = createdAt.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  const validStr     = validUntil.toLocaleDateString('es-SV');
  const notes        = (fullQuote as any).notes || '';

  const statusLabel: Record<string, string> = {
    PENDIENTE:  'Pendiente',
    CONFIRMADA: 'Confirmada',
    EXPIRADA:   'Expirada',
    CANCELADA:  'Cancelada',
  };

  return `
    <div class="center"><img src="${window.location.origin}${logoUrl}" style="width:72px;height:auto;margin-bottom:4px" alt="logo"></div>
    <h1>${companyName}</h1>
    <div class="center" style="font-size:9.5px">${companyAddress}</div>
    <div class="center">NIT: ${companyNit}</div>
    <div class="center">NRC: ${companyNrc}</div>
    <div class="center" style="font-size:10px">Actividad económica: ${companyActivity}</div>
    <div class="center" style="font-size:10px">Tipo de establecimiento: Casa matriz</div>
    ${companyPhone ? `<div class="center">Tel: ${companyPhone}</div>` : ''}

    <hr>
    <h2>— COTIZACIÓN —</h2>
    <hr>

    <div class="row"><span class="bold">No. Cotización:</span><span class="bold">#${quoteNumber}</span></div>
    <div class="row"><span>Fecha:</span><span>${dateStr} ${timeStr}</span></div>
    <div class="row"><span>Válida hasta:</span><span class="bold">${validStr}</span></div>
    <div class="row"><span>Estado:</span><span>${statusLabel[fullQuote.status] || fullQuote.status}</span></div>
    <div class="row"><span>Elaborada por:</span><span>${fullQuote.user?.fullName || '-'}</span></div>

    <hr>

    <div class="stitle">Datos del cliente</div>
    <div class="row"><span>Nombre:</span><span>${customerName}</span></div>
    ${customerNit   ? `<div class="row"><span>NIT:</span><span>${customerNit}</span></div>` : ''}
    ${customerPhone ? `<div class="row"><span>Teléfono:</span><span>${customerPhone}</span></div>` : ''}
    ${customerEmail ? `<div class="row"><span>Correo:</span><span>${customerEmail}</span></div>` : ''}

    <hr>

    <table>
      <thead><tr>
        <th>Cant</th><th>Descripción</th><th class="tr">P/Unit</th><th class="tr">Total</th>
      </tr></thead>
      <tbody>
        ${(fullQuote.items || []).map(i => `<tr>
          <td>${Number(i.quantity)}${i.unitType ? ` ${formatUnitLabel(i.unitType)}` : ''}</td>
          <td>${i.product?.name || ''}</td>
          <td class="tr">${fmt(Number(i.unitPrice))}</td>
          <td class="tr">${fmt(Number(i.totalPrice))}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <hr>

    <div class="row bold" style="font-size:13px"><span>Total:</span><span>${fmt(totalNum)}</span></div>
    <div class="row" style="margin-top:2px"><span class="bold">Total en letras:</span><span>${totalInWords}</span></div>

    <hr>

    ${notes ? `<div class="stitle">Observaciones</div><div style="font-size:10px;margin-bottom:4px">${notes}</div><hr>` : ''}

    <div class="center" style="font-size:9.5px;margin-top:4px">Esta cotización es válida hasta el <strong>${validStr}</strong>.</div>
    <div class="center" style="font-size:9.5px">Los precios pueden variar sin previo aviso.</div>
  `;
}

export async function printSequentialSaleTickets(
  sales: SaleResponse[],
  sysConfig: SystemConfigData | null
): Promise<void> {
  if (!sales.length) {
    toast.error('No hay ventas seleccionadas para imprimir');
    return;
  }

  const toastId = toast.loading(`Preparando impresión de ${sales.length} tickets...`);

  try {
    const fullSales: SaleResponse[] = [];
    for (const s of sales) {
      if (s.items && s.items.length > 0) {
        fullSales.push(s);
      } else {
        const full = await getSaleDetail(s.id);
        fullSales.push(full);
      }
    }

    const ticketsHtml = fullSales.map((sale, index) => {
      const isLast = index === fullSales.length - 1;
      return `
        <div class="ticket-wrapper ${isLast ? 'last-ticket' : ''}">
          ${buildSaleTicketBodyHtml(sale, sysConfig)}
          <div class="cut-indicator">
            <div class="cut-line">✂ - - - - - - - - - - - - - - - - - - - - - - - - ✂</div>
            <div class="cut-label">[ CORTE DE TICKET #${String(sale.id).padStart(6, '0')} ]</div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Lote de Ventas (${fullSales.length} Tickets)</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:12px;font-weight:bold;width:80mm;padding:0;color:#000;background:#fff}
  h1{font-size:15px;text-align:center;font-weight:bold;margin-bottom:2px}
  h2{font-size:13px;text-align:center;font-weight:bold;letter-spacing:2px;margin:4px 0}
  .center{text-align:center} .bold{font-weight:bold} .right{text-align:right}
  hr{border:none;border-top:1px solid #000;margin:5px 0}
  hr.d{border-top:1px dashed #000}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{font-weight:bold;text-align:left;padding:1px 2px}
  td{padding:1px 2px;vertical-align:top}
  .tr{text-align:right}
  .row{display:flex;justify-content:space-between;gap:4px;margin:1px 0;font-size:11.5px}
  .row.sm{font-size:10.5px}
  .stitle{font-weight:bold;margin:3px 0 1px}

  .ticket-wrapper {
    width: 80mm;
    padding: 8px 8px 18px 8px;
    page-break-after: always;
    break-after: page;
  }
  .ticket-wrapper.last-ticket {
    page-break-after: auto;
    break-after: auto;
  }

  .cut-indicator {
    text-align: center;
    margin-top: 14px;
    padding-top: 6px;
    color: #222;
  }
  .cut-line { font-size: 11px; letter-spacing: 1px; }
  .cut-label { font-size: 9px; margin-top: 2px; letter-spacing: 1.5px; font-weight: bold; }

  @media print {
    @page { margin: 0; size: 80mm auto; }
    body { margin: 0; padding: 0; width: 80mm; }
    .ticket-wrapper {
      padding: 6px 8px 14px 8px;
      page-break-after: always !important;
      break-after: page !important;
    }
    .ticket-wrapper.last-ticket {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  }
</style></head><body>
  ${ticketsHtml}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 2000);
    };
  </script>
</body></html>`;

    toast.dismiss(toastId);
    const win = window.open('', '_blank', 'width=520,height=850');
    if (!win) {
      throw new Error('El navegador bloqueó la ventana emergente de impresión. Por favor habilite las ventanas emergentes.');
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de tickets');
  }
}

export async function printSequentialQuoteTickets(
  quotes: QuoteResponse[],
  sysConfig: SystemConfigData | null
): Promise<void> {
  if (!quotes.length) {
    toast.error('No hay cotizaciones seleccionadas para imprimir');
    return;
  }

  const toastId = toast.loading(`Preparando impresión de ${quotes.length} cotizaciones...`);

  try {
    const fullQuotes: QuoteResponse[] = [];
    for (const q of quotes) {
      if (q.items && q.items.length > 0) {
        fullQuotes.push(q);
      } else {
        const full = await quotesService.getQuoteDetail(q.id);
        fullQuotes.push(full);
      }
    }

    const ticketsHtml = fullQuotes.map((quote, index) => {
      const isLast = index === fullQuotes.length - 1;
      return `
        <div class="ticket-wrapper ${isLast ? 'last-ticket' : ''}">
          ${buildQuoteTicketBodyHtml(quote, sysConfig)}
          <div class="cut-indicator">
            <div class="cut-line">✂ - - - - - - - - - - - - - - - - - - - - - - - - ✂</div>
            <div class="cut-label">[ CORTE DE COTIZACIÓN #${String(quote.id).padStart(6, '0')} ]</div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Lote de Cotizaciones (${fullQuotes.length} Documentos)</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:12px;font-weight:bold;width:80mm;padding:0;color:#000;background:#fff}
  h1{font-size:15px;text-align:center;font-weight:bold;margin-bottom:2px}
  h2{font-size:13px;text-align:center;font-weight:bold;letter-spacing:2px;margin:4px 0}
  .center{text-align:center} .bold{font-weight:bold} .right{text-align:right}
  hr{border:none;border-top:1px solid #000;margin:5px 0}
  hr.d{border-top:1px dashed #000}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{font-weight:bold;text-align:left;padding:1px 2px}
  td{padding:1px 2px;vertical-align:top}
  .tr{text-align:right}
  .row{display:flex;justify-content:space-between;gap:4px;margin:1px 0;font-size:11.5px}
  .stitle{font-weight:bold;margin:3px 0 1px}

  .ticket-wrapper {
    width: 80mm;
    padding: 8px 8px 18px 8px;
    page-break-after: always;
    break-after: page;
  }
  .ticket-wrapper.last-ticket {
    page-break-after: auto;
    break-after: auto;
  }

  .cut-indicator {
    text-align: center;
    margin-top: 14px;
    padding-top: 6px;
    color: #222;
  }
  .cut-line { font-size: 11px; letter-spacing: 1px; }
  .cut-label { font-size: 9px; margin-top: 2px; letter-spacing: 1.5px; font-weight: bold; }

  @media print {
    @page { margin: 0; size: 80mm auto; }
    body { margin: 0; padding: 0; width: 80mm; }
    .ticket-wrapper {
      padding: 6px 8px 14px 8px;
      page-break-after: always !important;
      break-after: page !important;
    }
    .ticket-wrapper.last-ticket {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  }
</style></head><body>
  ${ticketsHtml}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 2000);
    };
  </script>
</body></html>`;

    toast.dismiss(toastId);
    const win = window.open('', '_blank', 'width=520,height=850');
    if (!win) {
      throw new Error('El navegador bloqueó la ventana emergente de impresión. Por favor habilite las ventanas emergentes.');
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de cotizaciones');
  }
}

export async function printSequentialFacturaSheets(sales: SaleResponse[]): Promise<void> {
  if (!sales.length) {
    toast.error('No hay facturas seleccionadas para imprimir');
    return;
  }

  const toastId = toast.loading(`Preparando impresión de ${sales.length} facturas DTE...`);

  try {
    const fullSales: SaleResponse[] = [];
    for (const s of sales) {
      if (s.items && s.items.length > 0) {
        fullSales.push(s);
      } else {
        const full = await getSaleDetail(s.id);
        fullSales.push(full);
      }
    }

    const formatDate = (dateString?: Date | string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("es-SV", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatMoney = (amount?: string | number) => {
      if (amount === undefined || amount === null) return "$0.00";
      return new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
      }).format(Number(amount));
    };

    const pagesHtml = fullSales.map((sale, index) => {
      const isLast = index === fullSales.length - 1;
      const isCreditFiscal = sale.customer?.customerType === "CONTRIBUYENTE";
      const documentType = isCreditFiscal ? "CRÉDITO FISCAL" : "FACTURA ELECTRÓNICA";
      const items = sale.items || [];

      return `
        <div class="sheet-page ${isLast ? 'last-page' : ''}">
          <div class="header">
            <div class="logo-container">
              <img src="${window.location.origin}${logoUrl}" class="header-logo" alt="Logo" />
              <div class="logo-text">
                <h2>Agroferr D'Campo</h2>
                <p>Comprobante de Venta</p>
              </div>
            </div>
            <div class="header-title">
              <h1 class="text-xl font-black uppercase" style="color: var(--accent);">${documentType}</h1>
              <p class="text-sm text-gray mt-1 font-bold">Fecha: ${formatDate(sale.createdAt)}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Código de Generación</span>
              <span class="info-value font-bold">${sale.dteResponse?.codigoGeneracion || `Interno #${sale.id}`}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Número de Control</span>
              <span class="info-value">${sale.dteResponse?.numeroControl || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cliente</span>
              <span class="info-value font-bold">${sale.customer?.name || 'Consumidor Final'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${isCreditFiscal ? 'NIT / NRC' : 'Documento'}</span>
              <span class="info-value">${isCreditFiscal ? `${sale.customer?.nit || ''} / ${sale.customer?.documentNumber || ''}` : (sale.customer?.documentNumber || 'N/A')}</span>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-4 uppercase">Detalle de Productos</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">Cód.</th>
                <th>Descripción</th>
                <th class="center" style="width: 80px;">Cant.</th>
                <th class="right" style="width: 100px;">Precio U.</th>
                <th class="right" style="width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item) => `
                <tr>
                  <td class="text-sm text-gray">${item.product?.id || '-'}</td>
                  <td class="font-bold">${item.product?.name || 'Producto Desconocido'}</td>
                  <td class="center font-black text-lg">${Number(item.quantity)}</td>
                  <td class="right">${formatMoney(item.unitPrice)}</td>
                  <td class="right font-bold">${formatMoney(item.totalPrice)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="clearfix">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${formatMoney(Number(sale.totalAmount) - Number(sale.taxAmount || 0))}</span>
              </div>
              <div class="totals-row">
                <span>Impuestos:</span>
                <span>${formatMoney(sale.taxAmount || 0)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>TOTAL A PAGAR:</span>
                <span>${formatMoney(sale.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lote de Facturas DTE (${fullSales.length} Documentos)</title>
  <style>
    :root {
      --primary: #111827;
      --secondary: #6b7280;
      --accent: #d97706;
      --border: #e5e7eb;
      --bg-light: #fffbeb;
    }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      margin: 0; 
      padding: 0; 
      color: var(--primary);
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { size: letter; margin: 0; }
    
    .sheet-page {
      padding: 15mm 20mm;
      min-height: 270mm;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
    }
    .sheet-page.last-page {
      page-break-after: auto;
      break-after: auto;
    }

    h1, h2, h3, p { margin: 0; }
    .text-sm { font-size: 12px; }
    .text-lg { font-size: 16px; }
    .text-xl { font-size: 24px; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .text-gray { color: var(--secondary); }
    .uppercase { text-transform: uppercase; }
    .mb-4 { margin-bottom: 16px; }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid var(--accent);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header-logo { height: 70px; object-fit: contain; }
    .logo-text h2 { font-size: 18px; font-weight: 900; color: var(--primary); margin: 0; }
    .logo-text p { font-size: 11px; color: var(--secondary); margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
    .header-title { text-align: right; }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
    }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 10px; font-weight: 800; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; font-weight: 700; color: var(--primary); }

    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; font-size: 13px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    th { 
      background: #fef3c7; 
      color: #b45309; 
      font-weight: 900; 
      text-transform: uppercase; 
      font-size: 10px;
      letter-spacing: 1px;
      padding: 12px 14px; 
      text-align: left; 
      border-bottom: 2px solid #fcd34d;
    }
    th.right { text-align: right; }
    th.center { text-align: center; }
    td { 
      padding: 12px 14px; 
      border-bottom: 1px solid var(--border); 
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    td.right { text-align: right; }
    td.center { text-align: center; }
    tr:nth-child(even) td { background: #fafaf9; }
    
    .totals-box {
      width: 300px;
      float: right;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 40px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      font-weight: 600;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.grand-total {
      background: #fef3c7;
      color: #b45309;
      font-size: 16px;
      font-weight: 900;
    }
    .clearfix::after { content: ""; clear: both; display: table; }

    @media print {
      .sheet-page {
        page-break-after: always !important;
        break-after: page !important;
      }
      .sheet-page.last-page {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

    toast.dismiss(toastId);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Error al iniciar la impresión masiva de facturas");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 600);
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de facturas DTE');
  }
}

/**
 * Imprime secuencialmente un lote de albaranes / notas de entrega en hojas completas (Carta / Letter).
 * Cada albarán se imprime en una hoja independiente con page-break-after: always y firmas de recepción.
 */
export async function printSequentialDeliveryNotes(notes: DeliveryNoteResponse[]): Promise<void> {
  if (!notes.length) {
    toast.error('No hay albaranes seleccionados para imprimir');
    return;
  }

  const toastId = toast.loading(`Preparando impresión de ${notes.length} albaranes...`);

  try {
    const fullNotes: DeliveryNoteResponse[] = [];
    for (const n of notes) {
      if ((n as any).items && (n as any).items.length > 0) {
        fullNotes.push(n);
      } else {
        const full = await deliveryNotesService.getDeliveryNoteDetail(n.id);
        fullNotes.push(full);
      }
    }

    const formatDate = (dateString?: Date | string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-SV', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };
    
    const formatMoney = (amount?: string | number) => {
      if (amount === undefined || amount === null) return '$0.00';
      return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    const logoUrl = '/icon.png';

    const pagesHtml = fullNotes.map((note: any, index) => {
      const isLast = index === fullNotes.length - 1;
      const isSale = !!note.sale;
      const items = isSale ? note.sale?.items : note.items;
      const totalAmount = isSale ? note.sale?.totalAmount : null;

      return `
        <div class="sheet-page ${isLast ? 'last-page' : ''}">
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" class="header-logo" alt="Logo" onerror="this.style.display='none'" />
              <div class="logo-text">
                <h2>Agroferr D'Campo</h2>
                <p>Sistema de Facturación y Despacho</p>
              </div>
            </div>
            <div class="header-title">
              <h1 class="text-xl font-black uppercase" style="color: var(--accent);">${isSale ? 'Factura de Venta' : 'Albarán de Despacho'}</h1>
              <p class="text-sm text-gray mt-1 font-bold">Doc: DN-${note.id}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">${isSale ? 'Número de Venta' : 'Número de Documento'}</span>
              <span class="info-value text-lg font-bold">${isSale ? `Venta #${note.sale?.id || note.saleId}` : `DN-${note.id}`}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Emisión</span>
              <span class="info-value">${formatDate(note.issuedAt || note.createdAt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${isSale ? 'Cliente' : 'Destinatario'}</span>
              <span class="info-value font-bold">${note.customer?.name || note.toBranch?.name || 'Consumidor Final'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección de Entrega</span>
              <span class="info-value">${note.deliveryAddress || 'Retiro en tienda'}</span>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-4 uppercase">Detalle de Productos</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">Cód.</th>
                <th>Descripción del Producto</th>
                <th class="center" style="width: 80px;">Cant.</th>
                ${isSale ? '<th class="right" style="width: 100px;">Precio U.</th>' : ''}
                ${isSale ? '<th class="right" style="width: 100px;">Subtotal</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${(items || []).map((item: any) => `
                <tr>
                  <td class="text-sm text-gray">${item.product?.id || '-'}</td>
                  <td class="font-bold">${item.product?.name || 'Producto Desconocido'}</td>
                  <td class="center font-black text-lg">${Number(item.quantity)}</td>
                  ${isSale ? `<td class="right">${formatMoney(item.unitPrice)}</td>` : ''}
                  ${isSale ? `<td class="right font-bold">${formatMoney(item.totalPrice)}</td>` : ''}
                </tr>
              `).join('')}
              ${(!items || items.length === 0) ? `<tr><td colspan="5" class="center">Sin productos detallados</td></tr>` : ''}
            </tbody>
          </table>
          
          <div class="clearfix">
            ${isSale ? `
              <div class="totals-box">
                <div class="totals-row">
                  <span>Subtotal:</span>
                  <span>${formatMoney(Number(totalAmount) - Number(note.sale?.taxAmount || 0))}</span>
                </div>
                <div class="totals-row">
                  <span>Impuestos:</span>
                  <span>${formatMoney(note.sale?.taxAmount || 0)}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>TOTAL:</span>
                  <span>${formatMoney(totalAmount)}</span>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="signatures" style="margin-top: ${isSale ? '20px' : '60px'};">
            <div class="signature-line">Entregado por<br><span style="font-weight:400; font-size:10px; color:#666;">(Firma del Conductor/Despacho)</span></div>
            <div class="signature-line">Recibido por<br><span style="font-weight:400; font-size:10px; color:#666;">(Nombre y Firma del Cliente)</span></div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lote de Albaranes (${fullNotes.length} Documentos)</title>
        <style>
          :root {
            --primary: #111827;
            --secondary: #6b7280;
            --accent: #d97706; /* Amber 600 */
            --border: #e5e7eb;
            --bg-light: #fffbeb; /* Amber 50 */
          }
          body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: var(--primary);
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { 
            size: letter; 
            margin: 0; 
          }
          
          .sheet-page {
            padding: 15mm 20mm;
            min-height: 270mm;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
          }
          .sheet-page.last-page {
            page-break-after: auto;
            break-after: auto;
          }

          /* Typography & Utilities */
          h1, h2, h3, p { margin: 0; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-xl { font-size: 24px; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .text-gray { color: var(--secondary); }
          .text-right { text-align: right; }
          .uppercase { text-transform: uppercase; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-1 { margin-top: 4px; }

          /* Layout Components */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid var(--accent);
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .header-logo {
            height: 60px;
            object-fit: contain;
          }
          .logo-text h2 {
            font-size: 20px;
            font-weight: 900;
            color: var(--primary);
            margin: 0;
            line-height: 1.2;
          }
          .logo-text p {
            font-size: 11px;
            color: var(--secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .header-title {
            text-align: right;
          }
          
          /* Info Grid */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
            padding: 16px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent);
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .info-label {
            font-size: 10px;
            font-weight: 800;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 700;
            color: var(--primary);
          }

          /* Tables */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            font-size: 13px;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: #fef3c7;
            color: #b45309;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 2px solid #fcd34d;
          }
          th.right { text-align: right; }
          th.center { text-align: center; }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }
          tr:last-child td { border-bottom: none; }
          td.right { text-align: right; }
          td.center { text-align: center; }
          tr:nth-child(even) td { background: #fafaf9; }
          
          /* Totals */
          .totals-box {
            width: 300px;
            float: right;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 40px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 16px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
            font-weight: 600;
          }
          .totals-row:last-child { border-bottom: none; }
          .totals-row.grand-total {
            background: #fef3c7;
            color: #b45309;
            font-size: 16px;
            font-weight: 900;
          }
          .clearfix::after { content: ""; clear: both; display: table; }

          /* Signatures */
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
            page-break-inside: avoid;
          }
          .signature-line {
            width: 250px;
            border-top: 2px solid var(--primary);
            text-align: center;
            padding-top: 8px;
            font-weight: 700;
            font-size: 12px;
          }

          @media print {
            .sheet-page {
              page-break-after: always !important;
              break-after: page !important;
            }
            .sheet-page.last-page {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    toast.dismiss(toastId);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Error al iniciar la impresión masiva de albaranes");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 600);
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de albaranes');
  }
}

/**
 * Imprime secuencialmente un lote de Órdenes de Compra / Abastecimiento en formato carta.
 * Cada orden se formatea en su propia página con salto de página obligatorio (`page-break-after: always`).
 */
export async function printSequentialPurchaseOrders(purchases: PurchaseResponse[]): Promise<void> {
  if (!purchases || purchases.length === 0) return;

  const toastId = toast.loading(`Cargando detalle de ${purchases.length} órdenes de compra...`);

  try {
    const fullPurchases: PurchaseResponse[] = await Promise.all(
      purchases.map(async (p) => {
        if (p.items && p.items.length > 0 && p.supplier) {
          return p;
        }
        try {
          return await purchasesService.getPurchaseDetail(p.id);
        } catch {
          return p;
        }
      })
    );

    const formatDate = (dateString?: Date | string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-SV', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    const formatMoney = (amount?: string | number) => {
      if (amount === undefined || amount === null) return '$0.00';
      return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    const fullLogoUrl = `${window.location.origin}${logoUrl}`;

    const pagesHtml = fullPurchases.map((purchase, index) => {
      const isLast = index === fullPurchases.length - 1;
      const orderNumber = `OC-${purchase.id.toString().padStart(6, '0')}`;
      const items = purchase.items || [];
      const totalAmount = Number(purchase.totalAmount || 0);

      return `
        <div class="sheet-page ${isLast ? 'last-page' : ''}">
          <div class="header">
            <div class="logo-container">
              <img src="${fullLogoUrl}" class="header-logo" alt="Logo" onerror="this.style.display='none'" />
              <div class="logo-text">
                <h2>Agroferr D'Campo</h2>
                <p>Orden de Abastecimiento</p>
              </div>
            </div>
            <div class="header-title">
              <h1 class="text-xl font-black uppercase" style="color: var(--accent);">Orden de Compra</h1>
              <p class="text-sm font-bold text-gray mt-1">${orderNumber}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Proveedor</span>
              <span class="info-value text-lg">${purchase.supplier?.name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Emisión</span>
              <span class="info-value">${formatDate(purchase.createdAt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-value">${purchase.status || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Notas / Referencia</span>
              <span class="info-value" style="font-weight: normal; font-size: 12px;">${purchase.notes || purchase.referenceDoc || 'N/A'}</span>
            </div>
          </div>

          <h2 class="text-lg font-bold mb-4 uppercase">Detalle de Productos (${items.length})</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">Cód.</th>
                <th>Descripción del Producto</th>
                <th class="center" style="width: 80px;">Cant.</th>
                <th class="right" style="width: 100px;">Costo U.</th>
                <th class="right" style="width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td class="text-sm text-gray">${item.product?.id || item.productId || '-'}</td>
                  <td class="font-bold">${item.product?.name || 'Producto Desconocido'}</td>
                  <td class="center font-black text-lg">${Number(item.quantity)}</td>
                  <td class="right">${formatMoney(item.unitCost)}</td>
                  <td class="right font-bold">${formatMoney(item.totalCost)}</td>
                </tr>
              `).join('')}
              ${items.length === 0 ? `<tr><td colspan="5" class="center">Sin productos detallados</td></tr>` : ''}
            </tbody>
          </table>
          
          <div class="clearfix">
            <div class="totals-box">
              <div class="totals-row grand-total">
                <span>TOTAL:</span>
                <span>${formatMoney(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-line">Solicitado por<br><span style="font-weight:400; font-size:10px; color:#666;">(Agroferr D'Campo)</span></div>
            <div class="signature-line">Recibido por<br><span style="font-weight:400; font-size:10px; color:#666;">(Nombre y Firma del Proveedor)</span></div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lote de Órdenes de Compra (${fullPurchases.length} Documentos)</title>
        <style>
          :root {
            --primary: #111827;
            --secondary: #6b7280;
            --accent: #d97706; /* Amber 600 */
            --border: #e5e7eb;
            --bg-light: #fffbeb;
          }
          body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: var(--primary);
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { 
            size: letter; 
            margin: 0; 
          }
          
          .sheet-page {
            padding: 15mm 20mm;
            min-height: 270mm;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
          }
          .sheet-page.last-page {
            page-break-after: auto;
            break-after: auto;
          }

          /* Typography & Utilities */
          h1, h2, h3, p { margin: 0; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-xl { font-size: 24px; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .text-gray { color: var(--secondary); }
          .text-right { text-align: right; }
          .uppercase { text-transform: uppercase; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-1 { margin-top: 4px; }

          /* Layout Components */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid var(--accent);
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .header-logo {
            height: 60px;
            object-fit: contain;
          }
          .logo-text h2 {
            font-size: 20px;
            font-weight: 900;
            color: var(--primary);
            margin: 0;
            line-height: 1.2;
          }
          .logo-text p {
            font-size: 11px;
            color: var(--secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .header-title {
            text-align: right;
          }
          
          /* Info Grid */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
            padding: 16px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent);
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .info-label {
            font-size: 10px;
            font-weight: 800;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 700;
            color: var(--primary);
          }

          /* Tables */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            font-size: 13px;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: #fef3c7;
            color: #b45309;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 2px solid #fcd34d;
          }
          th.right { text-align: right; }
          th.center { text-align: center; }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }
          tr:last-child td { border-bottom: none; }
          td.right { text-align: right; }
          td.center { text-align: center; }
          tr:nth-child(even) td { background: #fafaf9; }
          
          /* Totals */
          .totals-box {
            width: 300px;
            float: right;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 40px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 16px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
            font-weight: 600;
          }
          .totals-row:last-child { border-bottom: none; }
          .totals-row.grand-total {
            background: #fef3c7;
            color: #b45309;
            font-size: 16px;
            font-weight: 900;
          }
          .clearfix::after { content: ""; clear: both; display: table; }

          /* Signatures */
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
            page-break-inside: avoid;
          }
          .signature-line {
            width: 250px;
            border-top: 2px solid var(--primary);
            text-align: center;
            padding-top: 8px;
            font-weight: 700;
            font-size: 12px;
          }

          @media print {
            .sheet-page {
              page-break-after: always !important;
              break-after: page !important;
            }
            .sheet-page.last-page {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    toast.dismiss(toastId);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Error al iniciar la impresión masiva de órdenes de compra");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 600);
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de órdenes');
  }
}

/**
 * Imprime secuencialmente un lote de Recibos de Pago a Proveedor en formato carta.
 * Cada recibo se formatea en su propia página con salto de página obligatorio (`page-break-after: always`).
 */
export async function printSequentialPurchasePaymentReceipts(purchases: PurchaseResponse[]): Promise<void> {
  const paidPurchases = purchases.filter(p => p.isPaid);
  if (paidPurchases.length === 0) {
    toast.error('Ninguna de las órdenes seleccionadas está pagada');
    return;
  }

  const toastId = toast.loading(`Cargando detalle de ${paidPurchases.length} recibos de pago...`);

  try {
    const fullPurchases: PurchaseResponse[] = await Promise.all(
      paidPurchases.map(async (p) => {
        if (p.supplier) {
          return p;
        }
        try {
          return await purchasesService.getPurchaseDetail(p.id);
        } catch {
          return p;
        }
      })
    );

    const formatDate = (dateString?: Date | string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-SV', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    const formatMoney = (amount?: string | number) => {
      if (amount === undefined || amount === null) return '$0.00';
      return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    const fullLogoUrl = `${window.location.origin}${logoUrl}`;

    const pagesHtml = fullPurchases.map((fullPurchase, index) => {
      const isLast = index === fullPurchases.length - 1;
      const orderNumber = `OC-${fullPurchase.id.toString().padStart(6, '0')}`;

      return `
        <div class="sheet-page ${isLast ? 'last-page' : ''}">
          <div class="header">
            <div class="logo-container">
              <img src="${fullLogoUrl}" class="header-logo" alt="Logo" onerror="this.style.display='none'" />
              <div class="logo-text">
                <h2>Agroferr D'Campo</h2>
                <p>Comprobante de Egreso / Pago</p>
              </div>
            </div>
            <div class="header-title">
              <h1 class="text-xl font-black uppercase" style="color: var(--accent);">Recibo de Pago Proveedor</h1>
              <p class="text-sm font-bold text-gray mt-1">${orderNumber}</p>
            </div>
          </div>

          <div class="receipt-amount">
            <p>Monto Pagado</p>
            <h2>${formatMoney(fullPurchase.totalAmount)}</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Proveedor</span>
              <span class="info-value">${fullPurchase.supplier?.name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Orden</span>
              <span class="info-value">${formatDate(fullPurchase.createdAt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Orden Relacionada</span>
              <span class="info-value">${orderNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Documento Referencia</span>
              <span class="info-value">${fullPurchase.referenceDoc || 'N/A'}</span>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-line">Entregado por<br><span style="font-weight:400; font-size:11px; color:#666;">(Agroferr D'Campo)</span></div>
            <div class="signature-line">Recibido por<br><span style="font-weight:400; font-size:11px; color:#666;">(Nombre y Firma del Proveedor)</span></div>
          </div>
        </div>
      `;
    }).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lote de Recibos de Pago (${fullPurchases.length} Documentos)</title>
        <style>
          :root {
            --primary: #111827;
            --secondary: #6b7280;
            --accent: #059669; /* Emerald 600 */
            --border: #e5e7eb;
          }
          body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: var(--primary);
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { 
            size: letter; 
            margin: 0; 
          }
          
          .sheet-page {
            padding: 20mm 25mm;
            min-height: 270mm;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
          }
          .sheet-page.last-page {
            page-break-after: auto;
            break-after: auto;
          }

          h1, h2, h3, p { margin: 0; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-xl { font-size: 22px; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .text-gray { color: var(--secondary); }
          .uppercase { text-transform: uppercase; }
          .mt-1 { margin-top: 4px; }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid var(--accent);
            padding-bottom: 16px;
            margin-bottom: 30px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .header-logo {
            height: 60px;
            object-fit: contain;
          }
          .logo-text h2 {
            font-size: 20px;
            font-weight: 900;
            color: var(--primary);
            margin: 0;
          }
          .logo-text p {
            font-size: 11px;
            color: var(--secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
          }
          .header-title {
            text-align: right;
          }
          .receipt-amount {
            text-align: center;
            padding: 26px;
            background: #ecfdf5;
            border: 2px dashed #34d399;
            border-radius: 16px;
            margin-bottom: 36px;
          }
          .receipt-amount p {
            font-size: 13px;
            color: #065f46;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .receipt-amount h2 {
            font-size: 42px;
            font-weight: 900;
            color: #047857;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 60px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
          }
          .info-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--secondary);
            text-transform: uppercase;
          }
          .info-value {
            font-size: 15px;
            font-weight: 700;
            color: var(--primary);
          }
          
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 80px;
            page-break-inside: avoid;
          }
          .signature-line {
            width: 250px;
            border-top: 2px solid var(--primary);
            text-align: center;
            padding-top: 8px;
            font-weight: 700;
            font-size: 13px;
          }

          @media print {
            .sheet-page {
              page-break-after: always !important;
              break-after: page !important;
            }
            .sheet-page.last-page {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    toast.dismiss(toastId);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Error al iniciar la impresión masiva de recibos");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 600);
  } catch (error: any) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Error al preparar la impresión de recibos de pago');
  }
}

