import type { SafePackage, SafeWithdrawal } from '../services/safe.service';
import { PURPOSE_LABEL, SOURCE_LABEL } from '../services/safe.service';
import type { SystemConfigData } from '../pages/SystemConfig';
import logoUrl from '../../assets/logo.png';
import { numerosALetras } from './printSaleTicket';

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (v: number | string) => `$${Number(v).toFixed(2)}`;
const dateTime = (d: string | Date) => {
  const date = new Date(d);
  return `${date.toLocaleDateString('es-SV')} ${date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
};

const STYLE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:12px;font-weight:bold;width:80mm;padding:8px;color:#000}
  h1{font-size:14px;text-align:center}
  h2{font-size:15px;text-align:center;letter-spacing:1px;margin:4px 0}
  .center{text-align:center}
  hr{border:none;border-top:1px dashed #000;margin:6px 0}
  .row{display:flex;justify-content:space-between;gap:6px;margin:2px 0}
  .code{font-size:22px;text-align:center;letter-spacing:2px;border:2px solid #000;padding:4px;margin:6px 0}
  .amount{font-size:20px;text-align:center;margin:4px 0}
  .sign{margin-top:34px;border-top:1px solid #000;text-align:center;font-size:11px;padding-top:2px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  td{padding:1px 0}
  .tr{text-align:right}
  @media print{@page{margin:0;size:80mm auto}body{margin:0;padding:4px}}
`;

function printHtml(title: string, body: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>${body}
<script>window.onload=function(){window.print();setTimeout(function(){window.close()},1500)}</script></body></html>`;
  const win = window.open('', '_blank', 'width=420,height=760');
  if (!win) throw new Error('El navegador bloqueó la ventana de impresión');
  win.document.open();
  win.document.write(html);
  win.document.close();
}

const header = (sysConfig: SystemConfigData | null, title: string) => `
  <div class="center"><img src="${window.location.origin}${logoUrl}" style="width:60px;height:auto" alt=""></div>
  <h1>${esc(sysConfig?.companyName || "AGROFERRETERÍA D'CAMPO")}</h1>
  <hr><h2>${esc(title)}</h2><hr>`;

/** Ticket del traslado de efectivo a caja fuerte (paquete), con espacios para firmas. */
export function printSafePackageTicket(pkg: SafePackage, sysConfig: SystemConfigData | null, reprint = false) {
  const origin = pkg.cashRegister?.name || SOURCE_LABEL[pkg.source];
  printHtml(`Paquete ${pkg.code}`, `
    ${header(sysConfig, 'TRASLADO A CAJA FUERTE')}
    ${reprint ? '<div class="center">*** REIMPRESIÓN ***</div>' : ''}
    <div class="code">${esc(pkg.code)}</div>
    <div class="row"><span>Fecha y hora:</span><span>${dateTime(pkg.createdAt)}</span></div>
    <div class="row"><span>Cajero:</span><span>${esc(pkg.createdBy?.fullName || '-')}</span></div>
    <div class="row"><span>Caja de origen:</span><span>${esc(origin)}</span></div>
    <div class="row"><span>Tipo:</span><span>${esc(SOURCE_LABEL[pkg.source])}</span></div>
    <div class="row"><span>Destino:</span><span>Caja Fuerte</span></div>
    <hr>
    <div class="center">Efectivo entregado</div>
    <div class="amount">${money(pkg.originalAmount)}</div>
    <div class="center" style="font-size:10px">${esc(numerosALetras(Number(pkg.originalAmount)))}</div>
    ${pkg.notes ? `<hr><div style="font-size:10px">Obs.: ${esc(pkg.notes)}</div>` : ''}
    ${pkg.status === 'ANULADO' ? `<hr><div class="center">PAQUETE ANULADO</div>` : ''}
    <div class="sign">Firma cajero: ${esc(pkg.createdBy?.fullName || '')}</div>
    <div class="sign">Recibe: ${esc(pkg.receivedByName || '')}</div>
    <hr>
    <div class="center" style="font-size:10px">Conserve este comprobante junto al paquete.</div>
  `);
}

/** Comprobante de retiro de efectivo de caja fuerte, con los paquetes utilizados. */
export function printSafeWithdrawalTicket(w: SafeWithdrawal, sysConfig: SystemConfigData | null, reprint = false) {
  printHtml(`Retiro ${w.code}`, `
    ${header(sysConfig, 'RETIRO DE CAJA FUERTE')}
    ${reprint ? '<div class="center">*** REIMPRESIÓN ***</div>' : ''}
    <div class="code">${esc(w.code)}</div>
    <div class="row"><span>Fecha y hora:</span><span>${dateTime(w.createdAt)}</span></div>
    <div class="row"><span>Responsable:</span><span>${esc(w.createdBy?.fullName || '-')}</span></div>
    <div class="row"><span>Motivo:</span><span>${esc(PURPOSE_LABEL[w.purpose])}</span></div>
    <div style="margin:2px 0">Destino: ${esc(w.description)}</div>
    ${w.reference ? `<div class="row"><span>Referencia:</span><span>${esc(w.reference)}</span></div>` : ''}
    <hr>
    <table>
      <tr><td>Paquete</td><td class="tr">Retirado</td><td class="tr">Queda</td></tr>
      ${w.items.map((i) => `<tr><td>${esc(i.package.code)}</td><td class="tr">${money(i.amount)}</td><td class="tr">${money(i.balanceAfter)}</td></tr>`).join('')}
    </table>
    <hr>
    <div class="center">Total retirado</div>
    <div class="amount">${money(w.totalAmount)}</div>
    ${w.status === 'ANULADO' ? `<hr><div class="center">RETIRO ANULADO</div>` : ''}
    <div class="sign">Entrega (caja fuerte)</div>
    <div class="sign">Recibe: ${esc(w.createdBy?.fullName || '')}</div>
  `);
}
