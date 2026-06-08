export function sqlNumber(value: unknown, field = 'id'): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${field} must be a positive integer`);
  return n;
}
export function sqlLimit(value: unknown, fallback = 50): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('limit must be an integer from 1 to 100');
  return n;
}
export function sqlOrder(value: unknown): 'ASC' | 'DESC' {
  const v = String(value || 'DESC').toUpperCase();
  if (v !== 'ASC' && v !== 'DESC') throw new Error('order must be ASC or DESC');
  return v as 'ASC' | 'DESC';
}
export function pickSort(value: unknown, allowed: string[], fallback = 'id'): string {
  const v = String(value || fallback);
  if (!allowed.includes(v)) throw new Error(`sort must be one of: ${allowed.join(', ')}`);
  return v;
}
