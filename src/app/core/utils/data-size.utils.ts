/**
 * Formats a megabyte value into a human-readable data-size string.
 *
 * Conversion uses binary prefixes (1 GB = 1024 MB, 1 MB = 1024 KB).
 *
 * Examples:
 *   null        → '—'
 *   0.3         → '307.2 KB'
 *   512         → '512 MB'
 *   1024        → '1 GB'
 *   1536        → '1.5 GB'
 *   10240       → '10 GB'
 */
export function formatMb(mb: number | null | undefined): string {
  if (mb === null || mb === undefined) return '—';

  if (mb >= 1024) {
    const gb = mb / 1024;
    // Show up to 2 decimal places, strip trailing zeros
    const formatted = parseFloat(gb.toFixed(2)).toString();
    return `${formatted} GB`;
  }

  if (mb < 1) {
    const kb = mb * 1024;
    const formatted = parseFloat(kb.toFixed(1)).toString();
    return `${formatted} KB`;
  }

  const formatted = parseFloat(mb.toFixed(1)).toString();
  return `${formatted} MB`;
}

/**
 * Formats a byte count into a human-readable data-size string using binary prefixes
 * (1 KB = 1024 B). Used for the usage timeseries, whose values are raw octets.
 *
 * Examples:
 *   null          → '—'
 *   512           → '512 B'
 *   1536          → '1.5 KB'
 *   1048576       → '1 MB'
 *   1610612736    → '1.5 GB'
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = Math.abs(bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const formatted = parseFloat(value.toFixed(unit === 0 ? 0 : 2)).toString();
  return `${bytes < 0 ? '-' : ''}${formatted} ${units[unit]}`;
}

/** Formats a bytes-per-second rate, e.g. `2.5 MB/s`. */
export function formatBytesPerSecond(bytesPerSecond: number | null | undefined): string {
  const formatted = formatBytes(bytesPerSecond);
  return formatted === '—' ? formatted : `${formatted}/s`;
}
