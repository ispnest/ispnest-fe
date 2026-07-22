import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  CustomerApiService,
  DailyUsagePoint,
  NetworkUsageEvent,
} from '@/app/domains/customers/data';
import { UsageChartComponent, UsageChartSeries } from '@/app/ui/charts';

/**
 * Dashboard widget: network-wide daily usage bars for the last 30 days, with today's bar growing
 * in real time from the shared `network-usage` SSE events passed down by the dashboard.
 */
@Component({
  selector: 'app-network-usage-chart',
  standalone: true,
  imports: [MatCard, MatIcon, UsageChartComponent],
  template: `
    <mat-card class="flex h-full flex-col">
      <div class="flex items-center gap-x-2 border-b border-neutral-a4 px-4 py-3">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3">
          <mat-icon class="size-4 text-primary-a11" svgIcon="chart-column" />
        </div>
        <div class="text-xl font-semibold tracking-tight">Network Usage</div>
        <div class="ml-auto text-sm text-neutral-a11">Last 30 days · live</div>
      </div>
      <div class="p-4">
        @if (loaded()) {
          <app-usage-chart [series]="series()" type="bar" [stacked]="true" [height]="280" />
        } @else {
          <div class="flex h-70 items-center justify-center text-sm text-neutral-a11">
            Loading usage…
          </div>
        }
      </div>
    </mat-card>
  `,
})
export class NetworkUsageChartComponent implements OnInit {
  /** Latest network-usage SSE event, provided by the dashboard's single shared stream. */
  readonly liveEvent = input<NetworkUsageEvent | null>(null);

  private readonly customerApi = inject(CustomerApiService);

  readonly loaded = signal(false);
  private readonly daily = signal<DailyUsagePoint[]>([]);
  private readonly todayIn = signal(0);
  private readonly todayOut = signal(0);

  readonly series = computed<UsageChartSeries[]>(() => {
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

  constructor() {
    // Each SSE event is a new object, so this effect runs exactly once per event.
    effect(() => {
      const event = this.liveEvent();
      if (!event) return;
      this.todayIn.update((v) => v + event.inputOctets);
      this.todayOut.update((v) => v + event.outputOctets);
    });
  }

  ngOnInit(): void {
    this.customerApi.getNetworkDailyUsage().subscribe({
      next: (usage) => {
        this.daily.set(usage.daily);
        this.todayIn.set(usage.todayInputOctets);
        this.todayOut.set(usage.todayOutputOctets);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }
}
