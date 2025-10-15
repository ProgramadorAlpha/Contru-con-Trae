export function formatFileSize(size: number | string): string {
  if (typeof size === 'string') {
    // Si ya viene formateado (e.g., "3.2 MB"), devolver tal cual
    if (/\d+\s?(KB|MB|GB)/i.test(size)) return size;
    const parsed = parseFloat(size);
    if (isNaN(parsed)) return String(size);
    size = parsed;
  }
  const bytes = Number(size);
  if (isNaN(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num.toFixed(num >= 1024 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}