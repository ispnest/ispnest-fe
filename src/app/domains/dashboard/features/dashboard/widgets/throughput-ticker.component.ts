import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Theming } from '@/app/core/theming/theming';
import { formatBytes, formatBytesPerSecond } from '@/app/core/utils/data-size.utils';
import { NetworkUsageEvent } from '@/app/domains/customers/data';
import { UsageChartComponent, UsageChartSeries, resolveCssColor } from '@/app/ui/charts';

const ROLLING_WINDOW_MS = 10 * 60 * 1000;

/**
 * Dashboard widget: current network throughput derived from the ~5-second aggregate windows of
 * the shared `network-usage` SSE stream. Shows "0 B/s" when the network is idle — a fresh
 * zero-window event still arrives every flush, so a stale value means the stream is down
 * (indicated by the connecting state until the first event).
 *
 * Renders a rolling 10-minute dual-area chart (download/upload) below the numeric readout so the
 * live values read as a trend rather than a number that keeps replacing itself.
 */
@Component({
  selector: 'app-throughput-ticker',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatIcon, UsageChartComponent],
  template: `
    <mat-card appearance="filled" class="flex h-full flex-col">
      <mat-card-header>
        <div class="flex items-center gap-x-2">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-a3">
            <mat-icon class="size-4 text-green-a11" svgIcon="activity" />
          </div>
          <div class="text-sm font-medium text-neutral-a11">Live Throughput</div>
        </div>
      </mat-card-header>
      <mat-card-content class="flex flex-auto flex-col">
        <div class="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {{ throughput() ?? '…' }}
        </div>
        <div class="mt-1 text-sm text-neutral-a11">
          @if (split(); as s) {
            ↓ {{ s.down }} · ↑ {{ s.up }}
          } @else {
            Connecting to live stream
          }
        </div>
        <div class="mt-3 flex-auto">
          <app-usage-chart
            [series]="series()"
            type="area"
            [height]="140"
            [colors]="chartColors()"
            [fillOpacity]="[0.35, 0.15]"
            [yFormatter]="formatRate"
          />
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class ThroughputTickerComponent {
  /** Latest network-usage SSE event, provided by the dashboard's single shared stream. */
  readonly liveEvent = input<NetworkUsageEvent | null>(null);

  private readonly theming = inject(Theming);

  private readonly downloadPoints = signal<{ x: number; y: number }[]>([]);
  private readonly uploadPoints = signal<{ x: number; y: number }[]>([]);

  readonly formatRate = (value: number): string => formatBytesPerSecond(value);

  readonly series = computed<UsageChartSeries[]>(() => [
    { name: 'Download', data: this.downloadPoints() },
    { name: 'Upload', data: this.uploadPoints() },
  ]);

  /** Resolved once per theme flip so the fixed teal/upload-violet pairing tracks light/dark mode. */
  readonly chartColors = computed<string[]>(() => {
    this.theming.isDark();
    return [resolveCssColor('--color-teal-9'), resolveCssColor('--color-violet-9')];
  });

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

  constructor() {
    // Each SSE event is a new object, so this effect runs exactly once per event, appending one
    // point per series and dropping anything older than the rolling window.
    effect(() => {
      const event = this.liveEvent();
      if (!event) return;

      const seconds = this.windowSeconds(event);
      const x = Date.now();
      const cutoff = x - ROLLING_WINDOW_MS;
      const downRate = event.inputOctets / seconds;
      const upRate = event.outputOctets / seconds;

      this.downloadPoints.update((points) =>
        [...points, { x, y: downRate }].filter((p) => p.x >= cutoff),
      );
      this.uploadPoints.update((points) =>
        [...points, { x, y: upRate }].filter((p) => p.x >= cutoff),
      );
    });
  }

  private windowSeconds(event: NetworkUsageEvent): number {
    return Math.max(1, (Date.parse(event.windowEnd) - Date.parse(event.windowStart)) / 1000);
  }
}
