import { Pipe, PipeTransform } from '@angular/core';
import { formatMb } from '@/app/core/utils/data-size.utils';

/**
 * Transforms a megabyte value into a human-readable data-size string.
 *
 * Usage in template:
 *   {{ someValueInMb | dataSize }}
 *
 * Examples:
 *   null  → '—'
 *   512   → '512 MB'
 *   1536  → '1.5 GB'
 *   0.5   → '512 KB'
 */
@Pipe({
  name: 'dataSize',
  standalone: true,
})
export class DataSizePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatMb(value);
  }
}
