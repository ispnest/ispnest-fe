import { Pipe, PipeTransform } from '@angular/core';
import { formatBytes } from '@/app/core/utils/data-size.utils';

/**
 * Formats a raw byte count into a human-readable size (`1.5 GB`, `512 B`).
 * For megabyte-denominated values (recharge quotas) use {@link DataSizePipe} instead.
 */
@Pipe({ name: 'bytes' })
export class BytesPipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    return formatBytes(bytes);
  }
}
