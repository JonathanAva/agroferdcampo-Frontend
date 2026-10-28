/**
 * Utilidades para cálculo de precio por pago con tarjeta y redondeo comercial automático.
 * 
 * Reglas de negocio:
 * 1. Para conservar el mismo ingreso neto que en efectivo:
 *    Precio Tarjeta = Precio Efectivo / (1 - tasa de comisión)
 * 2. Redondeo comercial automático:
 *    Se aproxima hacia arriba a las terminaciones autorizadas (.00, .50, .75, .80, .95, .99).
 * 3. Si la comisión no está configurada (null, 0 o vacía), se conserva el precio de efectivo intacto.
 */

export const DEFAULT_ROUNDING_TARGETS = [0.00, 0.50, 0.75, 0.80, 0.95, 0.99];

/**
 * Parsea una cadena de terminaciones separadas por coma a un arreglo ordenado de números.
 * Ej: "0.00,0.50,0.75,0.80,0.95,0.99" -> [0, 0.5, 0.75, 0.8, 0.95, 0.99]
 */
export function parseRoundingTargets(targetsStr?: string | null): number[] {
  if (!targetsStr || typeof targetsStr !== 'string') {
    return DEFAULT_ROUNDING_TARGETS;
  }
  const parsed = targetsStr
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 1)
    .sort((a, b) => a - b);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : DEFAULT_ROUNDING_TARGETS;
}

/**
 * Redondea un monto hacia arriba a la terminación comercial autorizada más cercana.
 * Ejemplos:
 *  - 5.43 con [.00, .50, .75, .80, .95, .99] -> 5.50
 *  - 9.97 con [.00, .50, .75, .80, .95, .99] -> 9.99
 *  - 10.00 con [.00, .50, .75, .80, .95, .99] -> 10.00
 *  - 5.12 con [.00, .50, .75, .80, .95, .99] -> 5.50
 *  - 5.76 con [.00, .50, .75, .80, .95, .99] -> 5.80
 *  - 9.995 con [.00, .50, .75, .80, .95, .99] -> 10.00
 */
export function roundToCommercialTarget(rawAmount: number, targets: number[] = DEFAULT_ROUNDING_TARGETS): number {
  if (isNaN(rawAmount) || rawAmount <= 0) return 0;

  const intPart = Math.floor(rawAmount);

  // Buscar el primer precio candidato (intPart + target) que sea mayor o igual al monto calculado
  for (const target of targets) {
    const candidate = intPart + target;
    if (candidate >= rawAmount - 0.0001) {
      return Number(candidate.toFixed(2));
    }
  }

  // Si supera todas las terminaciones en este dólar (ej. cents > 0.99), avanza al siguiente entero
  const baseTarget = targets[0] ?? 0;
  return Number((intPart + 1.00 + baseTarget).toFixed(2));
}

/**
 * Calcula el precio final para tarjeta a partir del precio de contado (efectivo),
 * aplicando la compensación de comisión neta y el redondeo comercial.
 * 
 * @param cashPrice Precio normal en efectivo / de contado
 * @param feePercentage Porcentaje de comisión (puede venir como 0.05 o 5)
 * @param targetsStr Cadena opcional de terminaciones autorizadas
 */
export function calculateCardPrice(
  cashPrice: number,
  feePercentage?: number | null,
  targetsStr?: string | null,
): number {
  const numericCashPrice = Number(cashPrice);
  if (isNaN(numericCashPrice) || numericCashPrice <= 0) return 0;

  // Si no hay porcentaje configurado o es 0, no se modifica el precio
  if (feePercentage == null || isNaN(Number(feePercentage)) || Number(feePercentage) <= 0) {
    return numericCashPrice;
  }

  // Normalizar: si viene como 5 o 4.75, convertir a 0.05 o 0.0475
  const rawFee = Number(feePercentage);
  const feeRate = rawFee > 1 ? rawFee / 100 : rawFee;

  if (feeRate >= 1) return numericCashPrice; // Evitar división por cero o negativo

  // Fórmula sugerida: Precio Tarjeta = Precio Efectivo / (1 - comisión)
  const rawCardPrice = numericCashPrice / (1 - feeRate);

  const targets = parseRoundingTargets(targetsStr);
  return roundToCommercialTarget(rawCardPrice, targets);
}

/**
 * Calcula el ingreso neto real recibido por el comercio después de la deducción bancaria.
 */
export function calculateNetMerchantIncome(cardPrice: number, feePercentage?: number | null): number {
  const numericCardPrice = Number(cardPrice);
  if (isNaN(numericCardPrice) || numericCardPrice <= 0) return 0;
  if (feePercentage == null || isNaN(Number(feePercentage)) || Number(feePercentage) <= 0) {
    return numericCardPrice;
  }
  const rawFee = Number(feePercentage);
  const feeRate = rawFee > 1 ? rawFee / 100 : rawFee;
  return Number((numericCardPrice * (1 - feeRate)).toFixed(2));
}
