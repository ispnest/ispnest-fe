import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NotificationDto, PortalApiService } from '@/app/domains/portal/data';
import { LoadingComponent } from '@/app/ui/loading';

@Component({
  selector: 'app-portal-notifications',
  standalone: true,
  imports: [RouterLink, DatePipe, MatCard, MatButton, MatIconButton, MatIcon, LoadingComponent],
  template: `
    <div class="min-h-screen bg-neutral-a2">
      <!-- Header -->
      <div class="bg-primary px-4 py-4 text-primary-contrast">
        <div class="mx-auto flex max-w-lg items-center gap-3">
          <a matIconButton routerLink="/portal/dashboard" class="text-inherit">
            <mat-icon svgIcon="arrow-left" />
          </a>
          <h1 class="flex-1 font-bold">Notifications</h1>
          @if (notifications().length > 0) {
            <button
              matButton
              class="text-xs text-white/80 hover:text-white"
              (click)="markAllRead()"
              [disabled]="markingAll()"
            >
              {{ markingAll() ? 'Marking…' : 'Mark all read' }}
            </button>
          }
        </div>
      </div>

      <div class="mx-auto max-w-lg space-y-0 px-4 py-4">
        <app-loading [loading]="loading()" />

        @if (!loading()) {
          <mat-card class="overflow-hidden p-0">
            @if (notifications().length === 0) {
              <div class="flex flex-col items-center gap-2 py-12 text-center">
                <mat-icon svgIcon="bell-off" class="size-10 text-neutral-a6" />
                <p class="text-neutral-a11">No notifications yet</p>
              </div>
            }

            @for (n of notifications(); track n.id; let last = $last) {
              <div
                class="flex cursor-pointer items-start gap-3 p-4 transition hover:bg-neutral-a2"
                [class.bg-primary-a2]="n.status !== 'read'"
                [class.border-b]="!last"
                role="button"
                tabindex="0"
                (click)="markRead(n)"
                (keydown.enter)="markRead(n)"
              >
                <!-- Unread dot -->
                <div class="mt-1 shrink-0">
                  @if (n.status !== 'read') {
                    <span class="block size-2 rounded-full bg-primary-a9"></span>
                  } @else {
                    <span class="block size-2 rounded-full bg-transparent"></span>
                  }
                </div>

                <!-- Body -->
                <div class="min-w-0 flex-1">
                  @if (n.accountCode) {
                    <span
                      class="mb-1 inline-block rounded bg-neutral-a3 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-neutral-a9"
                      >{{ n.accountCode }}</span
                    >
                  }
                  <div
                    class="text-sm font-medium leading-snug"
                    [class.text-neutral-a9]="n.status === 'read'"
                  >
                    {{ n.subject }}
                  </div>
                  @if (n.body) {
                    <div class="mt-0.5 truncate text-xs text-neutral-a9">{{ n.body }}</div>
                  }
                  <div class="mt-1 text-xs text-neutral-a8">
                    {{ n.createdAt | date: 'short' }}
                  </div>
                </div>
              </div>
            }
          </mat-card>

          @if (hasMore()) {
            <div class="pt-3 text-center">
              <button matButton class="w-full" (click)="loadMore()" [disabled]="loadingMore()">
                {{ loadingMore() ? 'Loading…' : 'Load more' }}
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PortalNotificationsComponent implements OnInit {
  private readonly portalApi = inject(PortalApiService);

  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly markingAll = signal(false);
  readonly notifications = signal<NotificationDto[]>([]);
  readonly hasMore = signal(false);

  private page = 0;
  private readonly pageSize = 20;

  ngOnInit(): void {
    this.loadPage(0);
  }

  private loadPage(page: number): void {
    if (page === 0) this.loading.set(true);
    else this.loadingMore.set(true);

    this.portalApi.getMyNotifications(page, this.pageSize).subscribe({
      next: (result) => {
        if (page === 0) {
          this.notifications.set(result.content);
        } else {
          this.notifications.update((prev) => [...prev, ...result.content]);
        }
        this.page = page;
        this.hasMore.set(page + 1 < result.page.totalPages);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  loadMore(): void {
    this.loadPage(this.page + 1);
  }

  markRead(n: NotificationDto): void {
    if (n.status === 'read') return;
    this.portalApi.markNotificationRead(n.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((item) => (item.id === n.id ? { ...item, status: 'read' } : item)),
      );
    });
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.portalApi.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, status: 'read' })));
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false),
    });
  }
}
