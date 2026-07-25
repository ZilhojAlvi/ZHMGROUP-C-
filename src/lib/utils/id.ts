export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}-${time}${rand}`;
}

export function generateTxnRef(): string {
  return `TXN-${Math.floor(1000000 + Math.random() * 8999999)}`;
}
