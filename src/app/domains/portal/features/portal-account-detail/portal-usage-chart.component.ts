import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DailyUsagePoint } from '@/app/domains/customers/data';
import { PortalApiService } from '@/app/domains/portal/data/portal-api.service';
import { UsageChartComponent, UsageChartSeries } from '@/app/ui/charts';
import { BytesPipe } from '@/app/ui/pipes';

/**
 * Portal account-detail card: the customer's own usage over the last 30 days as daily bars, with
 * today's bar growing in real time from the account's `usage-delta` SSE stream
 * (auto-reconnecting, ownership-checked server-side).
 */
@Component({
  selector: 'app-portal-usage-chart',
  standalone: true,
  host: { class: 'block' },
  imports: [MatCard, MatIcon, UsageChartComponent, BytesPipe],
  template: `
    <mat-card class="p-5">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <mat-icon svgIcon="chart-column" class="size-5 text-primary-a11" />
          <span class="font-semibold">Data Usage</span>
        </div>
        <span class="text-xs text-neutral-a9">Last 30 days · live</span>
      </div>
      @if (loaded()) {
        <div class="mt-2 text-sm text-neutral-a11">
          Today: <span class="font-medium tabular-nums">{{ todayTotal() | bytes }}</span>
        </div>
        <app-usage-chart [series]="series()" type="bar" [stacked]="true" [height]="220" />
      } @else {
        <div class="flex h-40 items-center justify-center text-sm text-neutral-a9">
          Loading usage…
        </div>
      }
    </mat-card>
  `,
})
export class PortalUsageChartComponent implements OnInit {
  readonly customerId = input.required<string>();

  private readonly portalApi = inject(PortalApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loaded = signal(false);
  private readonly daily = signal<DailyUsagePoint[]>([]);
  private readonly todayIn = signal(0);
  private readonly todayOut = signal(0);

  readonly todayTotal = computed(() => this.todayIn() + this.todayOut());

  // RADIUS's Acct-Input-Octets is what the NAS received FROM the customer (their upload);
  // Acct-Output-Octets is what the NAS sent TO the customer (their download) — the opposite of
  // what the field names suggest at a glance.
  readonly series = computed<UsageChartSeries[]>(() => {
    const todayX = Date.parse(new Date().toISOString().slice(0, 10));
    const download = this.daily().map((d) => ({ x: Date.parse(d.date), y: d.outputOctets }));
    const upload = this.daily().map((d) => ({ x: Date.parse(d.date), y: d.inputOctets }));
    download.push({ x: todayX, y: this.todayOut() });
    upload.push({ x: todayX, y: this.todayIn() });
    return [
      { name: 'Download', data: download },
      { name: 'Upload', data: upload },
    ];
  });

  ngOnInit(): void {
    const id = this.customerId();

    this.portalApi.getUsage(id).subscribe({
      next: (usage) => {
        this.daily.set(usage.daily);
        this.todayIn.set(usage.samples.reduce((sum, s) => sum + s.inputOctets, 0));
        this.todayOut.set(usage.samples.reduce((sum, s) => sum + s.outputOctets, 0));
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });

    this.portalApi
      .streamUsage(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((delta) => {
        this.todayIn.update((v) => v + delta.inputOctets);
        this.todayOut.update((v) => v + delta.outputOctets);
      });
  }
}
