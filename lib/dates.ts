// SQLite's datetime() returns 'YYYY-MM-DD HH:MM:SS' in UTC with no timezone
// marker. `new Date()` would parse that as local time, skewing every
// comparison and display by the viewer's UTC offset — enough to make short
// expiries (10 minutes, 1 hour) report as already expired.
export function parseDbDate(value: string): Date {
  // Already ISO with timezone info (contains 'T' or ends with 'Z'/offset)
  if (/[tT]/.test(value) || /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(value);
  }
  return new Date(value.replace(' ', 'T') + 'Z');
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return parseDbDate(expiresAt) < new Date();
}
