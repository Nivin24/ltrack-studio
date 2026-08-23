/**
 * Indian Standard Time (IST - Asia/Kolkata, UTC+5:30) Utilities
 * Provides consistent Mumbai/India time formatting across all components, timers, and logs.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns the current time in IST (e.g. "02:21 AM" or "02:21:45 AM")
 */
export function getISTTimeString(date: Date = new Date(), includeSeconds: boolean = false): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true
  });
}

/**
 * Returns the current date in IST formatted as YYYY-MM-DD
 */
export function getISTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date); // Returns YYYY-MM-DD
}

/**
 * Returns human readable full IST date (e.g. "Monday, August 24, 2026")
 */
export function getISTFullDateString(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format any timestamp or ISO string into IST time
 */
export function formatToISTTime(timestampOrDate: string | number | Date): string {
  const d = typeof timestampOrDate === 'string' || typeof timestampOrDate === 'number'
    ? new Date(timestampOrDate)
    : timestampOrDate;

  if (isNaN(d.getTime())) {
    return String(timestampOrDate);
  }

  return d.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format any timestamp into short IST date + time (e.g. "24 Aug, 02:21 AM")
 */
export function formatToISTDateTime(timestampOrDate: string | number | Date): string {
  const d = typeof timestampOrDate === 'string' || typeof timestampOrDate === 'number'
    ? new Date(timestampOrDate)
    : timestampOrDate;

  if (isNaN(d.getTime())) {
    return String(timestampOrDate);
  }

  return d.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
