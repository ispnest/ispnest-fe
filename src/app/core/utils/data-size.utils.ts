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
