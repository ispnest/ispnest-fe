import { Component, computed, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { formatBytes, formatBytesPerSecond } from '@/app/core/utils/data-size.utils';
import { NetworkUsageEvent } from '@/app/domains/customers/data';

/**
 * Dashboard widget: current network throughput derived from the ~5-second aggregate windows of
 * the shared `network-usage` SSE stream. Shows "0 B/s" when the network is idle — a fresh
 * zero-window event still arrives every flush, so a stale value means the stream is down
 * (indicated by the connecting state until the first event).
 */
@Component({
  selector: 'app-throughput-ticker',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatIcon],
  template: `
    <mat-card appearance="filled" class="h-full">
      <mat-card-header>
        <div class="flex items-center gap-x-2">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3">
            <mat-icon class="size-4 text-green-a11" svgIcon="activity" />
          </div>
          <div class="text-sm font-medium text-neutral-a11">Live Throughput</div>
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
          {{ throughput() ?? '…' }}
        </div>
        <div class="mt-1 text-sm text-neutral-a11">
          @if (split(); as s) {
            ↓ {{ s.down }} · ↑ {{ s.up }}
          } @else {
            Connecting to live stream
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class ThroughputTickerComponent {
  /** Latest network-usage SSE event, provided by the dashboard's single shared stream. */
  readonly liveEvent = input<NetworkUsageEvent | null>(null);

  readonly throughput = computed(() => {
    const event = this.liveEvent();
    if (!event) return null;
    return formatBytesPerSecond(
      (event.inputOctets + event.outputOctets) / this.windowSeconds(event),
    );
  });

  readonly split = computed(() => {
    const event = this.liveEvent();
    if (!event) return null;
    const seconds = this.windowSeconds(event);
    return {
      down: `${formatBytes(event.inputOctets / seconds)}/s`,
      up: `${formatBytes(event.outputOctets / seconds)}/s`,
    };
  });

  private windowSeconds(event: NetworkUsageEvent): number {
    return Math.max(1, (Date.parse(event.windowEnd) - Date.parse(event.windowStart)) / 1000);
  }
}
