import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { filter, switchMap, throttleTime } from 'rxjs/operators';
import { CustomerApiService, NetworkUsageEvent, TopConsumer } from '@/app/domains/customers/data';
import { BytesPipe } from '@/app/ui/pipes';

/**
 * Dashboard widget: top customers by usage since the start of today. Refetches when live
 * network-usage events arrive, throttled to at most one request per 30 s.
 */
@Component({
  selector: 'app-top-consumers',
  standalone: true,
  imports: [MatCard, MatIcon, RouterLink, BytesPipe],
  template: `
    <mat-card class="flex h-full flex-col">
      <div class="flex items-center gap-x-2 border-b border-neutral-a4 px-4 py-3">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3">
          <mat-icon class="size-4 text-violet-a11" svgIcon="gauge" />
        </div>
        <div class="text-xl font-semibold tracking-tight">Top Consumers Today</div>
      </div>
      <div class="flex flex-col gap-y-3 p-4">
        @for (consumer of consumers(); track consumer.customerId) {
          <a
            class="group flex flex-col gap-y-1 rounded-lg p-2 -m-2 hover:bg-neutral-a2"
            [routerLink]="['/admin/customers', consumer.customerId]"
          >
            <div class="flex items-baseline justify-between gap-x-2">
              <span class="truncate font-medium group-hover:text-primary-a11">
                {{ consumer.fullName || consumer.accountCode }}
              </span>
              <span class="shrink-0 text-sm tabular-nums text-neutral-a11">
                {{ consumer.inputOctets + consumer.outputOctets | bytes }}
              </span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-neutral-a3">
              <div
                class="h-full rounded-full bg-primary-9"
                [style.width.%]="barPercent(consumer)"
              ></div>
            </div>
          </a>
        } @empty {
          <div class="py-6 text-center text-sm text-neutral-a11">No usage recorded today</div>
        }
      </div>
    </mat-card>
  `,
})
export class TopConsumersComponent implements OnInit {
  /** Latest network-usage SSE event — a change signals fresh data worth refetching. */
  readonly liveEvent = input<NetworkUsageEvent | null>(null);

  private readonly customerApi = inject(CustomerApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly consumers = signal<TopConsumer[]>([]);

  private readonly maxTotal = computed(() =>
    Math.max(1, ...this.consumers().map((c) => c.inputOctets + c.outputOctets)),
  );

  private readonly refetchOnLiveEvents = toObservable(this.liveEvent).pipe(
    filter((event): event is NetworkUsageEvent => event !== null),
    throttleTime(30_000, undefined, { leading: true, trailing: true }),
    switchMap(() => this.customerApi.getTopConsumers(8)),
  );

  ngOnInit(): void {
    this.customerApi.getTopConsumers(8).subscribe({
      next: (top) => this.consumers.set(top),
      error: () => undefined,
    });

    this.refetchOnLiveEvents
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((top) => this.consumers.set(top));
  }

  barPercent(consumer: TopConsumer): number {
    return Math.round(((consumer.inputOctets + consumer.outputOctets) / this.maxTotal()) * 100);
  }
}
