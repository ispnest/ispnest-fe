import { Injectable, computed, inject, signal } from '@angular/core';
import {
  PoolApiService,
  PoolDto,
  RouterApiService,
  RouterDto,
  RouterManagementStateDto,
  RouterOnboardingApiService,
} from '@/app/domains/network/data';
import { provisioningAccessFor } from '@/app/domains/network/shared/router-status.util';

/**
 * Route-scoped store for the router detail page — provided on the `:id/onboarding` route (see
 * `routes.ts`) so the layout and every tab share one instance, destroyed automatically when
 * navigating away. Centralizes the router's identity/management-state/pools fetching so tabs don't
 * duplicate it; a future tab (e.g. live discovery) injects this same store rather than coupling to
 * the layout component or a sibling tab.
 */
@Injectable()
export class RouterDetailStore {
  private readonly routerApi = inject(RouterApiService);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly poolApi = inject(PoolApiService);

  private _routerId = '';
  get routerId(): string {
    return this._routerId;
  }

  readonly loading = signal(true);
  readonly router = signal<RouterDto | null>(null);
  readonly managementState = signal<RouterManagementStateDto | null>(null);
  readonly pools = signal<PoolDto[]>([]);

  /**
   * Gates the Services tab: not usable at all until the router has completed onboarding (no REST
   * credential to configure/discover against before then); usable-with-a-warning if onboarded but
   * the platform's last signal says it's unreachable, since live discovery won't work then and
   * entries can't be validated against the router automatically.
   */
  readonly provisioningAccess = computed(() =>
    provisioningAccessFor(this.managementState()?.state ?? null),
  );

  /** Called once by the layout component on activation. */
  init(routerId: string): void {
    this._routerId = routerId;
    this.routerApi.getById(routerId).subscribe((router) => this.router.set(router));
    this.refreshManagementState();
    this.refreshPools();
  }

  refreshManagementState(): void {
    this.loading.set(true);
    this.onboardingApi.getManagementState(this._routerId).subscribe({
      next: (state) => {
        this.managementState.set(state);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  refreshPools(): void {
    this.poolApi.getPools(this._routerId).subscribe((page) => this.pools.set(page.content));
  }
}
