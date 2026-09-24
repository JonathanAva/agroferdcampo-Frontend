import { SaleResponse, getSaleDetail } from '../services/sales.service';
import type { SystemConfigData } from '../pages/SystemConfig';
import logoUrl from '../../assets/logo.png';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  CREDITO: 'Crédito',
  CONTRAENTREGA: 'Contraentrega',
};

function enteroALetras(n: number): string {
  if (n === 0) return 'Cero';
  const w29 = ['','Uno','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve',
    'Diez','Once','Doce','Trece','Catorce','Quince','Dieciséis','Diecisiete','Dieciocho','Diecinueve',
    'Veinte','Veintiuno','Veintidós','Veintitrés','Veinticuatro','Veinticinco',
    'Veintiséis','Veintisiete','Veintiocho','Veintinueve'];
  const dec = ['','','Veinte','Treinta','Cuarenta','Cincuenta','Sesenta','Setenta','Ochenta','Noventa'];
  const cen = ['','Ciento','Doscientos','Trescientos','Cuatrocientos','Quinientos',
    'Seiscientos','Setecientos','Ochocientos','Novecientos'];
  const w1  = ['','Uno','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve'];
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

/**
 * Genera e imprime el ticket térmico de una venta (mismo formato usado en Punto de Venta
 * al momento de la venta). Se reutiliza para reimpresiones desde Historial de Ventas y
 * para el ticket de venta de cotizaciones ya confirmadas.
 */
export async function printSaleTicket(saleOrPartial: SaleResponse, sysConfig: SystemConfigData | null): Promise<void> {
  const sale = saleOrPartial.items ? saleOrPartial : await getSaleDetail(saleOrPartial.id);

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

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Venta ${saleNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:12px;font-weight:bold;width:80mm;padding:8px;color:#000}
  h1{font-size:15px;text-align:center;font-weight:bold;margin-bottom:2px}
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
  @media print{@page{margin:0;size:80mm auto}body{margin:0;padding:4px}}
</style></head><body>

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
<div class="row"><span>Fecha y hora de generación:</span><span>${dateStr} ${timeStr}</span></div>
<div class="row"><span>Emisor:</span><span>${sale.user?.fullName || '-'}</span></div>
<div class="row"><span>Cajero/a:</span><span>${sale.user?.fullName || '-'}</span></div>

<hr>

<div class="stitle">Datos del receptor</div>
<div class="row"><span>Nombre:</span><span>${customerName}</span></div>
<div class="row"><span>Dirección:</span><span>${customerAddress}</span></div>
<div class="row"><span>Correo:</span><span>${customerEmail}</span></div>
<div class="row"><span>Teléfono:</span><span>${customerPhone}</span></div>
<div class="row"><span>Actividad económica:</span><span>${customerActivity}</span></div>
<div class="row"><span>No. de Venta:</span><span>${saleNumber}</span></div>

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
<div class="row"><span>Descuentos:</span><span>${fmt(0)}</span></div>
<div class="row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
<div class="row sm"><span>Monto global Desc., Rebajas y otros a ventas no sujetas:</span><span>${fmt(0)}</span></div>
<div class="row sm"><span>Monto global Desc., Rebajas y otros a ventas exentas:</span><span>${fmt(0)}</span></div>
<div class="row sm"><span>Monto global Desc., Rebajas y otros a ventas gravadas:</span><span>${fmt(0)}</span></div>
<div class="row"><span>Sub-Total:</span><span>${fmt(subtotal)}</span></div>
<div class="row"><span>IVA retenido:</span><span>${fmt(0)}</span></div>
<div class="row"><span>IVA percibido:</span><span>${fmt(0)}</span></div>
<div class="row"><span>Retención renta:</span><span>${fmt(0)}</span></div>
<div class="row bold"><span>Monto total de la operación:</span><span>${fmt(totalNum)}</span></div>
<div class="row"><span>Total otros montos no afectos:</span><span>${fmt(0)}</span></div>
<div class="row bold" style="font-size:13px"><span>Total a pagar:</span><span>${fmt(totalNum)}</span></div>

<hr>

<div class="row"><span class="bold">Total en letras:</span><span>${totalInWords}</span></div>
<div class="row"><span class="bold">Condición de la operación:</span><span>${paymentLabel}</span></div>

<hr class="d">
<div class="center bold" style="margin-top:6px">Gracias por su compra</div>
<script>window.onload=function(){window.print();setTimeout(function(){window.close()},1500)}</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=520,height=820');
  if (!win) {
    throw new Error('El navegador bloqueó la ventana emergente de impresión.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
