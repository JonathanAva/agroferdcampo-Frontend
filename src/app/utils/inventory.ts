export interface ProductUnit {
  unit: string;
  factor: number;
}

export interface InventoryFormatterOptions {
  baseUnit: string;
  quantity: number;
  units?: ProductUnit[];
}

export function formatSmartInventory(options: InventoryFormatterOptions): string {
  const { baseUnit, quantity, units = [] } = options;

  if (quantity === 0) return `0 ${baseUnit}`;

  // Sort units descending by factor so we check the largest unit first
  const sortedUnits = [...units].sort((a, b) => b.factor - a.factor);

  // If no units, just return base unit
  if (sortedUnits.length === 0) {
    return `${quantity} ${baseUnit}`;
  }

  // Find the largest unit that fits perfectly (or gives a logical decimal)
  // According to the user:
  // "tienes 130 libras podrias poner 1.30 quintales que sigue siendo lo mismo no? pero ejemplo tienes 10 libras muestras en libras sitienes 25 libras mejormuestras 1 arroba, ya si tienes 50 libras son 2 arrobas y si tienes 75 son 3 arrobas al llegar a 100 libras mostraras 1 quintal pero dado el ejemplo que tienes 85 libras son 3 arrobas con 10 libras se podria mostrar 3.10 arrobas o como seria por que noquiero tener grantextoque diga 1quintal 1 arroba 5 libras para desglozar todoloque tengo soloquiero una unidadd e medida alllegar a ella"
  // User wants to see "1.30 quintales" instead of "1 quintal 30 libras".
  // User wants to see "3.10 arrobas" if there are 85 libras (1 arroba = 25 libras, so 3 arrobas = 75 libras, plus 10 libras -> 3.40 arrobas as decimal, or "3 arrobas y 10 libras"). Wait, 85 / 25 = 3.4 arrobas. The user literally said: "3.10 arrobas". This means integer part = number of arrobas, decimal part = remaining base units!
  // This is a custom format: "X.YY Unit". Let's do exactly what they asked.

  for (const u of sortedUnits) {
    if (quantity >= u.factor) {
      const integerPart = Math.floor(quantity / u.factor);
      const remainder = quantity % u.factor;

      if (remainder === 0) {
        return `${integerPart} ${u.unit}`;
      } else {
        // Return integer part + remainder as decimals if remainder < 100
        // (to match user's example "3.10 arrobas" for 85 libras where factor=25)
        const formattedRemainder = remainder < 10 ? `0${remainder}` : remainder.toString();
        return `${integerPart}.${formattedRemainder} ${u.unit}`;
      }
    }
  }

  // If quantity is less than the smallest factor, use base unit
  return `${quantity} ${baseUnit}`;
}
