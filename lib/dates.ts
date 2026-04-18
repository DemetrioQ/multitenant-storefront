/**
 * All timestamps from the backend are UTC. Some serialize with an explicit Z
 * (or ±HH:MM offset), some don't — if the string has no timezone suffix JS
 * would silently parse it as local time and shift the clock by the viewer's
 * offset. This helper ensures UTC interpretation either way.
 */
export function parseUtcDate(value: string): Date {
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(value)) return new Date(value);
  return new Date(`${value}Z`);
}

/** Format a total number of seconds as `HH:mm:ss`. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
