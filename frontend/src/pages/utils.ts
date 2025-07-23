// Shared utility functions for admin screens

export const STATUS_MAP: Record<number, string> = { 1: 'Pending', 2: 'Approved', 3: 'Denied' };
export function statusToString(status: string | number | null | undefined): string {
  if (status == null) return 'Pending';
  if (typeof status === 'number') return STATUS_MAP[Number(status)] || 'Pending';
  if (['Pending', 'Approved', 'Denied'].includes(status)) return status;
  const num = Number(status);
  return STATUS_MAP[num] || 'Pending';
}

export function joinName(firstName?: string, lastName?: string, fallback?: string) {
  return [firstName, lastName].filter(Boolean).join(' ') || fallback || '';
}

export function notificationMessage(a: any) {
  const status = statusToString(a.status).toLowerCase();
  const name = a.name || joinName(a.firstName, a.lastName);
  if (status === 'approved') return `${name} was approved.`;
  if (status === 'pending') return `New application received from ${name}.`;
  if (status === 'denied') return `${name} was denied.`;
  return `${name} application is in progress.`;
}

export function paginate<T>(arr: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
} 