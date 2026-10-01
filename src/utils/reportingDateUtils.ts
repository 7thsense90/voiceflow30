import { UserResponse } from '../types';

export type TimezoneMode = 'local' | 'utc';

/**
 * Returns standard date key string (YYYY-MM-DD) based on selected timezone mode.
 */
export function getStandardDateKey(dateInput: Date | string | number, mode: TimezoneMode = 'local'): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    if (mode === 'utc') {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Checks if a given date string corresponds to "today" under the specified timezone mode.
 */
export function isDateTodayWithMode(dateString: string, mode: TimezoneMode = 'local'): boolean {
  if (!dateString) return false;
  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return false;
    const now = new Date();
    return getStandardDateKey(target, mode) === getStandardDateKey(now, mode);
  } catch {
    return false;
  }
}

/**
 * Safely extracts coins awarded from a survey response, supporting both
 * coinsAwarded and any legacy earnedCoins property.
 */
export function getResponseCoins(response: Partial<UserResponse> | any): number {
  if (!response) return 0;
  if (typeof response.coinsAwarded === 'number' && !isNaN(response.coinsAwarded)) {
    return response.coinsAwarded;
  }
  if (typeof response.earnedCoins === 'number' && !isNaN(response.earnedCoins)) {
    return response.earnedCoins;
  }
  return 0;
}

/**
 * Returns human-readable device timezone string (e.g., "Asia/Karachi (GMT+5)")
 */
export function getDeviceTimezoneLabel(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMinutes);
    const hours = Math.floor(absMin / 60);
    const mins = absMin % 60;
    const offsetStr = `GMT${sign}${hours}${mins > 0 ? `:${String(mins).padStart(2, '0')}` : ''}`;
    return `${tz} (${offsetStr})`;
  } catch {
    return 'Local Time';
  }
}
