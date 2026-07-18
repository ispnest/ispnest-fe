import { Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { PortalApiService } from '@/app/domains/portal/data';

type PortalNavItem = {
  label: string;
  icon: string;
  /** Absent for the "Pay" tab, whose destination is resolved dynamically. */
  route?: string;
  exact?: boolean;
};

const NAV_ITEMS: PortalNavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/portal/dashboard', exact: true },
  { label: 'Pay', icon: 'credit-card' },
  { label: 'Notifications', icon: 'bell', route: '/portal/notifications' },
  { label: 'Account', icon: 'user-round', route: '/portal/settings' },
];

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon],
  template: `
    <router-outlet />

    @if (!auth.currentUser()?.forcePasswordChange) {
      <nav
        class="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-neutral-a4 bg-white dark:bg-neutral-2 lg:hidden"
      >
        @for (item of navItems; track item.label) {
          @if (item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="text-primary"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-neutral-a9 transition-colors"
            >
              <mat-icon [svgIcon]="item.icon" class="size-5 shrink-0" />
              @if (item.label === 'Notifications' && unreadCount() > 0) {
                <span
                  class="absolute top-1.5 right-1/2 -mr-3.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                >
                  {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                </span>
              }
              <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
            </a>
          } @else {
            <button
              type="button"
              (click)="onPayTab()"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 text-neutral-a9 transition-colors"
            >
              <mat-icon [svgIcon]="item.icon" class="size-5 shrink-0" />
              <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
            </button>
          }
        }
      </nav>
    }
  `,
})
export class PortalShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly portalApi = inject(PortalApiService);
  private readonly router = inject(Router);

  protected readonly navItems = NAV_ITEMS;
  protected readonly unreadCount = signal(0);

  private routerEvent = toSignal(this.router.events);

  constructor() {
    this.fetchUnreadCount();

    // Refetch after every navigation so the badge stays fresh (e.g. after "mark all read").
    effect(() => {
      const event = this.routerEvent();
      if (!(event instanceof NavigationEnd)) return;
      untracked(() => this.fetchUnreadCount());
    });
  }

  private fetchUnreadCount(): void {
    this.portalApi.getMyNotifications(0, 1).subscribe({
      next: (page) => this.unreadCount.set(page.page.totalElements),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error: () => {},
    });
  }

  protected onPayTab(): void {
    this.portalApi.getMyAccounts().subscribe({
      next: (accounts) => {
        const connected = accounts.filter((a) => a.connected);
        if (connected.length === 0) return;
        if (connected.length === 1) {
          this.router.navigate(['/portal/payment'], {
            queryParams: {
              customerId: connected[0].id,
              ...(connected[0].defaultPlanRouterId
                ? { planRouterId: connected[0].defaultPlanRouterId }
                : {}),
            },
          });
        } else {
          this.router.navigate(['/portal/dashboard'], { queryParams: { openPay: 1 } });
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error: () => {},
    });
  }
}
