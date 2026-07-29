// Utility functions for formatting dates cleanly across the app

export function getCurrentDateTimeISO(): string {
  return new Date().toISOString();
}

export function getCurrentDateOnly(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns clean YYYY-MM-DD date string
 */
export function formatDateOnly(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDateStr.trim())) {
    return isoOrDateStr.trim();
  }
  const d = new Date(isoOrDateStr);
  if (isNaN(d.getTime())) return isoOrDateStr;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats date string with optional time if needed
 */
export function formatDateTime(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return '-';
  const d = new Date(isoOrDateStr);
  if (isNaN(d.getTime())) return isoOrDateStr;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  // If time part is 00:00:00 or not set, return date only
  if (isoOrDateStr.length <= 10) {
    return `${yyyy}-${mm}-${dd}`;
  }

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Returns formatted creation date
 */
export function formatCreationDateTime(createdAt?: string, fallbackDate?: string): string {
  if (createdAt) return formatDateOnly(createdAt);
  if (fallbackDate) return formatDateOnly(fallbackDate);
  return '-';
}

/**
 * Returns formatted completion/received date
 */
export function formatCompletionDateTime(completedAt?: string, fallbackDate?: string): string {
  if (completedAt) return formatDateOnly(completedAt);
  if (fallbackDate) return formatDateOnly(fallbackDate);
  return '-';
}

/**
 * Formats YYYY-MM into human-readable Arabic month name and year (e.g., "شهر يوليو 2026")
 */
export function formatArabicMonthYear(monthStr?: string): string {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr.trim())) {
    return monthStr || '-';
  }
  const [year, month] = monthStr.trim().split('-');
  const monthNames: Record<string, string> = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'أبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمبر',
    '12': 'ديسمبر'
  };
  const mName = monthNames[month] || month;
  return `شهر ${mName} ${year}`;
}

