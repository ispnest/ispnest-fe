import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Theming } from '@/app/core/theming/theming';
import { formatBytes, formatBytesPerSecond } from '@/app/core/utils/data-size.utils';
import { CustomerApiService } from '@/app/domains/customers/data';
import { UsageChartComponent, UsageChartSeries, resolveCssColor } from '@/app/ui/charts';

const ROLLING_WINDOW_MS = 10 * 60 * 1000;

/**
 * Per-customer counterpart to the admin dashboard's `ThroughputTickerComponent`. The customer
 * usage-delta stream pushes one event per RADIUS Interim-Update/Stop packet rather than on a fixed
 * schedule, so — unlike the network-wide stream's clean 5-second windows — each point's rate is
 * derived from the actual elapsed time since the previous event. A customer on an infrequent
 * accounting interval will show sparser, spikier points than the network-wide chart; that's a
 * faithful reflection of the real data, not a bug.
 */
@Component({
  selector: 'app-customer-live-throughput',
  standalone: true,
  imports: [UsageChartComponent],
  template: `
    <div class="text-3xl font-semibold tabular-nums tracking-tight">
      {{ throughput() ?? '…' }}
    </div>
    <div class="mt-1 text-sm text-neutral-a11">
      @if (split(); as s) {
        ↓ {{ s.down }} · ↑ {{ s.up }}
      } @else {
        Waiting for activity…
      }
    </div>
    <div class="mt-3 h-36">
      <app-usage-chart
        [series]="series()"
        type="area"
        [height]="140"
        [colors]="chartColors()"
        [fillOpacity]="[0.35, 0.15]"
        [yFormatter]="formatRate"
      />
    </div>
  `,
})
export class CustomerLiveThroughputComponent implements OnInit {
  readonly customerId = input.required<string>();

  private readonly customerApi = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly theming = inject(Theming);

  private readonly downloadPoints = signal<{ x: number; y: number }[]>([]);
  private readonly uploadPoints = signal<{ x: number; y: number }[]>([]);
  private readonly latestRates = signal<{ down: number; up: number } | null>(null);
  private lastEventMs: number | null = null;

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
    const r = this.latestRates();
    return r ? formatBytesPerSecond(r.down + r.up) : null;
  });

  readonly split = computed(() => {
    const r = this.latestRates();
    if (!r) return null;
    return { down: `${formatBytes(r.down)}/s`, up: `${formatBytes(r.up)}/s` };
  });

  ngOnInit(): void {
    this.customerApi
      .streamUsage(this.customerId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((delta) => {
        const eventMs = Date.parse(delta.timestamp);

        // The first event only establishes a baseline — a rate needs two points to divide by.
        // RADIUS's Acct-Input-Octets is what the NAS received FROM the customer (their upload);
        // Acct-Output-Octets is what the NAS sent TO the customer (their download).
        if (this.lastEventMs !== null) {
          const elapsedSeconds = Math.max(1, (eventMs - this.lastEventMs) / 1000);
          const downRate = delta.outputOctets / elapsedSeconds;
          const upRate = delta.inputOctets / elapsedSeconds;
          const cutoff = eventMs - ROLLING_WINDOW_MS;

          this.downloadPoints.update((points) =>
            [...points, { x: eventMs, y: downRate }].filter((p) => p.x >= cutoff),
          );
          this.uploadPoints.update((points) =>
            [...points, { x: eventMs, y: upRate }].filter((p) => p.x >= cutoff),
          );
          this.latestRates.set({ down: downRate, up: upRate });
        }

        this.lastEventMs = eventMs;
      });
  }
}
