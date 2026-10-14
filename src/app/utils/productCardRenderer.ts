/**
 * Dibuja una ficha comercial de producto (o familia de productos) en un canvas, lista para
 * exportar a PNG y compartir por WhatsApp/Facebook/Messenger. Se dibuja a mano con Canvas 2D
 * en lugar de capturar HTML para que el resultado sea idéntico en cualquier navegador.
 */

export interface CardRow {
  id: string;
  /** Nombre de la variante/producto (ej. "Polín C 2x4 chapa 16") */
  label: string;
  /** Presentación, medida o acabado (ej. "Galvanizado · 6 m") */
  detail: string;
  /** Precio como texto: si es numérico se formatea como $0.00, si no se muestra tal cual ("Consultar") */
  price: string;
  visible: boolean;
  productId?: number;
}

export interface CardData {
  /** single: un producto con precio destacado. family: una foto y varias presentaciones con precio. */
  layout: "single" | "family";
  title: string;
  description: string;
  rows: CardRow[];
  showPrices: boolean;
  companyName: string;
  contact: string;
  note: string;
  accent: string;
}

export const CARD_WIDTH = 1080;
const TARGET_HEIGHT = 1350; // 4:5, el formato vertical que mejor se ve en redes y WhatsApp
const PAD = 64;
const FONT = '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const TITLE_LINE = 72;
const DESC_LINE = 46;
const ROW_H = 84;
const ROW_H_DETAIL = 108;
const ROW_GAP = 12;

export function formatCardPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  const n = Number(trimmed.replace(",", "."));
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : trimmed;
}

export function visibleRows(data: CardData): CardRow[] {
  return data.rows.filter((r) => r.visible && (r.label.trim() || r.detail.trim() || r.price.trim()));
}

/** Parte un texto en líneas que caben en maxWidth; si excede maxLines, corta con "…". */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = truncate(ctx, kept[maxLines - 1] + "…", maxWidth);
    return kept;
  }
  return lines.map((l) => truncate(ctx, l, maxWidth));
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

type DrawableImage = HTMLImageElement | ImageBitmap;

export function drawProductCard(canvas: HTMLCanvasElement, data: CardData, image: DrawableImage | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = CARD_WIDTH;
  const inner = W - PAD * 2;
  const rows = visibleRows(data);
  const single = data.layout === "single";
  const mainRow = rows[0];

  // ── 1. Medir ──
  ctx.font = `800 60px ${FONT}`;
  const titleLines = data.title.trim() ? wrapText(ctx, data.title.trim(), inner, 3) : [];
  ctx.font = `400 34px ${FONT}`;
  const descLines = data.description.trim() ? wrapText(ctx, data.description.trim(), inner, 4) : [];

  const titleH = titleLines.length * TITLE_LINE;
  const descH = descLines.length ? 12 + descLines.length * DESC_LINE : 0;

  let blockH = 0;
  if (single && mainRow) {
    if (mainRow.detail.trim()) blockH += 70;
    if (data.showPrices && formatCardPrice(mainRow.price)) blockH += 150;
    if (blockH) blockH += 28;
  } else if (!single && rows.length) {
    blockH = 36 + rows.reduce((sum, r) => sum + (r.detail.trim() ? ROW_H_DETAIL : ROW_H) + ROW_GAP, 0);
  }

  const hasFooter = !!(data.companyName.trim() || data.contact.trim() || data.note.trim());
  const footerLines = [data.companyName, data.contact, data.note].filter((s) => s.trim()).length;
  const footerH = hasFooter ? 56 + footerLines * 44 : 0;

  const textH = titleH + descH + blockH + 56;
  const imageH = image ? Math.max(380, Math.min(760, TARGET_HEIGHT - PAD - 40 - textH - footerH)) : 0;
  const H = Math.max(PAD + (image ? imageH + 40 : 0) + textH + footerH, image ? 0 : 640);

  // ── 2. Dibujar ──
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = data.accent;
  ctx.fillRect(0, 0, W, 14);

  let y = PAD;

  if (image) {
    ctx.save();
    roundRect(ctx, PAD, y, inner, imageH, 28);
    ctx.fillStyle = "#f3f4f6";
    ctx.fill();
    ctx.clip();
    const iw = image.width;
    const ih = image.height;
    const scale = Math.min(inner / iw, imageH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(image, PAD + (inner - dw) / 2, y + (imageH - dh) / 2, dw, dh);
    ctx.restore();
    y += imageH + 40;
  }

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.fillStyle = "#111827";
  ctx.font = `800 60px ${FONT}`;
  for (const line of titleLines) {
    ctx.fillText(line, PAD, y);
    y += TITLE_LINE;
  }

  if (descLines.length) {
    y += 12;
    ctx.fillStyle = "#4b5563";
    ctx.font = `400 34px ${FONT}`;
    for (const line of descLines) {
      ctx.fillText(line, PAD, y);
      y += DESC_LINE;
    }
  }

  if (single && mainRow) {
    y += 28;
    if (mainRow.detail.trim()) {
      ctx.font = `700 32px ${FONT}`;
      const text = truncate(ctx, mainRow.detail.trim(), inner - 48);
      const w = ctx.measureText(text).width + 48;
      roundRect(ctx, PAD, y, w, 56, 28);
      ctx.fillStyle = "#f3f4f6";
      ctx.fill();
      ctx.fillStyle = "#374151";
      ctx.fillText(text, PAD + 24, y + 11);
      y += 70;
    }
    const price = data.showPrices ? formatCardPrice(mainRow.price) : "";
    if (price) {
      ctx.fillStyle = data.accent;
      ctx.font = `900 120px ${FONT}`;
      ctx.fillText(truncate(ctx, price, inner), PAD, y + 8);
      y += 150;
    }
  } else if (!single && rows.length) {
    y += 36;
    rows.forEach((row, i) => {
      const h = row.detail.trim() ? ROW_H_DETAIL : ROW_H;
      roundRect(ctx, PAD, y, inner, h, 18);
      ctx.fillStyle = i % 2 === 0 ? "#f3f4f6" : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.stroke();

      const price = data.showPrices ? formatCardPrice(row.price) : "";
      ctx.font = `800 40px ${FONT}`;
      const priceW = price ? ctx.measureText(price).width + 24 : 0;
      if (price) {
        ctx.fillStyle = data.accent;
        ctx.textAlign = "right";
        ctx.fillText(price, W - PAD - 28, y + (h - 40) / 2);
        ctx.textAlign = "left";
      }

      const textW = inner - 56 - priceW;
      ctx.fillStyle = "#111827";
      ctx.font = `700 34px ${FONT}`;
      const labelY = row.detail.trim() ? y + 16 : y + (h - 34) / 2;
      ctx.fillText(truncate(ctx, row.label.trim() || row.detail.trim(), textW), PAD + 28, labelY);
      if (row.detail.trim() && row.label.trim()) {
        ctx.fillStyle = "#6b7280";
        ctx.font = `400 28px ${FONT}`;
        ctx.fillText(truncate(ctx, row.detail.trim(), textW), PAD + 28, y + 62);
      }
      y += h + ROW_GAP;
    });
  }

  if (hasFooter) {
    const fy = H - footerH;
    ctx.fillStyle = data.accent;
    ctx.fillRect(0, fy, W, footerH);
    let ty = fy + 28;
    ctx.fillStyle = "#ffffff";
    if (data.companyName.trim()) {
      ctx.font = `800 38px ${FONT}`;
      ctx.fillText(truncate(ctx, data.companyName.trim(), inner), PAD, ty);
      ty += 44;
    }
    if (data.contact.trim()) {
      ctx.font = `600 30px ${FONT}`;
      ctx.fillText(truncate(ctx, data.contact.trim(), inner), PAD, ty + 4);
      ty += 44;
    }
    if (data.note.trim()) {
      ctx.globalAlpha = 0.85;
      ctx.font = `400 26px ${FONT}`;
      ctx.fillText(truncate(ctx, data.note.trim(), inner), PAD, ty + 6);
      ctx.globalAlpha = 1;
    }
  }
}

/** Versión en texto de la ficha, para pegar en un chat junto a la imagen. */
export function buildCardText(data: CardData): string {
  const lines: string[] = [];
  if (data.title.trim()) lines.push(`*${data.title.trim()}*`);
  if (data.description.trim()) lines.push(data.description.trim());
  const rows = visibleRows(data);
  if (rows.length) {
    lines.push("");
    for (const r of rows) {
      const name = [r.label.trim(), r.detail.trim()].filter(Boolean).join(" — ");
      const price = data.showPrices ? formatCardPrice(r.price) : "";
      lines.push(`• ${name}${price ? `: ${price}` : ""}`);
    }
  }
  const footer = [data.companyName.trim(), data.contact.trim()].filter(Boolean).join(" · ");
  if (footer) lines.push("", footer);
  if (data.note.trim()) lines.push(`_${data.note.trim()}_`);
  return lines.join("\n");
}
