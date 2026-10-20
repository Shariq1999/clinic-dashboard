export function formatINR(amount: number, compact = false): string {
  const isNeg = amount < 0;
  const abs = Math.abs(Math.round(amount));
  if (compact) {
    if (abs >= 10000000) return `${isNeg ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${isNeg ? '-' : ''}₹${(abs / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${isNeg ? '-' : ''}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN')}`;
}

export function formatPct(val: number, showPlus = true): string {
  const prefix = showPlus && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

export function formatNumber(val: number): string {
  return Math.round(val).toLocaleString('en-IN');
}
