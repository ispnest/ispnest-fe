import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import {
  CustomerApiService,
  DailyUsagePoint,
  UsageSamplePoint,
} from '@/app/domains/customers/data';
import { UsageChartComponent, UsageChartSeries, bucketSamples } from '@/app/ui/charts';
import { BytesPipe } from '@/app/ui/pipes';

const INTRADAY_BIN_MS = 5 * 60 * 1000;

/**
 * "Usage" tab on the admin customer detail page. Daily view: 30 days of rollup bars plus today's
 * live-growing bar. Intraday view: the last 24 h of raw per-packet samples in 5-minute bins.
 * Both views update in real time from the customer's `usage-delta` SSE stream (auto-reconnecting).
 * Rendered inside `&lt;ng-template matTabContent>`, so data and the chart library only load when the
 * tab is opened, and leaving the tab closes the stream.
 */
@Component({
  selector: 'app-customer-usage-tab',
  standalone: true,
  imports: [MatButtonToggleGroup, MatButtonToggle, UsageChartComponent, BytesPipe],
  template: `
    <div class="flex flex-col gap-4 p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm text-neutral-a11">
          Total this period:
          <span class="font-medium text-neutral-12 tabular-nums">{{ periodTotal() | bytes }}</span>
          <span class="mx-1">·</span>
          Today: <span class="font-medium tabular-nums">{{ todayTotal() | bytes }}</span>
        </div>
        <mat-button-toggle-group
          hideSingleSelectionIndicator
          [value]="view()"
          (change)="switchView($event.value)"
        >
          <mat-button-toggle value="daily">30 days</mat-button-toggle>
          <mat-button-toggle value="intraday">Last 24 h</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (loaded()) {
        @if (view() === 'daily') {
          <app-usage-chart [series]="dailySeries()" type="bar" [stacked]="true" [height]="300" />
        } @else {
          <app-usage-chart [series]="intradaySeries()" type="area" [height]="300" />
        }
      } @else {
        <div class="flex h-75 items-center justify-center text-sm text-neutral-a11">
          Loading usage…
        </div>
      }
    </div>
  `,
})
export class CustomerUsageTabComponent implements OnInit {
  readonly customerId = input.required<string>();

  private readonly customerApi = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loaded = signal(false);
  readonly view = signal<'daily' | 'intraday'>('daily');

  private readonly daily = signal<DailyUsagePoint[]>([]);
  private readonly todayIn = signal(0);
  private readonly todayOut = signal(0);
  private readonly intradaySamples = signal<UsageSamplePoint[]>([]);
  private intradayLoaded = false;

  readonly todayTotal = computed(() => this.todayIn() + this.todayOut());
  readonly periodTotal = computed(
    () =>
      this.daily().reduce((sum, d) => sum + d.inputOctets + d.outputOctets, 0) + this.todayTotal(),
  );

  readonly dailySeries = computed<UsageChartSeries[]>(() => {
    const todayX = Date.parse(new Date().toISOString().slice(0, 10));
    const download = this.daily().map((d) => ({ x: Date.parse(d.date), y: d.inputOctets }));
    const upload = this.daily().map((d) => ({ x: Date.parse(d.date), y: d.outputOctets }));
    download.push({ x: todayX, y: this.todayIn() });
    upload.push({ x: todayX, y: this.todayOut() });
    return [
      { name: 'Download', data: download },
      { name: 'Upload', data: upload },
    ];
  });

  readonly intradaySeries = computed<UsageChartSeries[]>(() => {
    const buckets = bucketSamples(this.intradaySamples(), INTRADAY_BIN_MS);
    return [
      { name: 'Download', data: buckets.map((b) => ({ x: b.time, y: b.inputOctets })) },
      { name: 'Upload', data: buckets.map((b) => ({ x: b.time, y: b.outputOctets })) },
    ];
  });

  ngOnInit(): void {
    const id = this.customerId();

    this.customerApi.getUsage(id).subscribe({
      next: (usage) => {
        this.daily.set(usage.daily);
        this.todayIn.set(usage.samples.reduce((sum, s) => sum + s.inputOctets, 0));
        this.todayOut.set(usage.samples.reduce((sum, s) => sum + s.outputOctets, 0));
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });

    // Live per-packet deltas keep today's bar and the intraday view current
    this.customerApi
      .streamUsage(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((delta) => {
        this.todayIn.update((v) => v + delta.inputOctets);
        this.todayOut.update((v) => v + delta.outputOctets);
        if (this.intradayLoaded) {
          this.intradaySamples.update((samples) => [...samples, delta]);
        }
      });
  }

  switchView(view: 'daily' | 'intraday'): void {
    this.view.set(view);
    if (view === 'intraday' && !this.intradayLoaded) {
      this.customerApi
        .getRawUsage(this.customerId())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((samples) => {
          this.intradaySamples.set(samples);
          this.intradayLoaded = true;
        });
    }
  }
}
