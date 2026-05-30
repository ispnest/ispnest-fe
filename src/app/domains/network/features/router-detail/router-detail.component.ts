import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { extractErrorMessage } from '@/app/core/http/api-errors';
import {
  PoolApiService,
  PoolDto,
  RouterApiService,
  RouterDto,
  OnboardRouterResponse,
} from '@/app/domains/network/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { OnboardingStatusPanelComponent } from '../onboarding/onboarding-status-panel.component';

/**
 * Router detail page. Combines summary + live onboarding status + post-onboarding actions
 * (test connection, attached pools, delete). Hit when the wizard finishes or from the routers
 * list row click.
 */
@Component({
  selector: 'app-router-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    StatusBadgeComponent,
    LoadingComponent,
    OnboardingStatusPanelComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-6xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/routers" aria-label="Back">
            <mat-icon svgIcon="arrow-left" />
          </a>
          @if (router(); as r) {
            <div>
              <h1 class="text-2xl font-semibold tracking-tight">{{ r.name }}</h1>
              <p class="text-sm text-neutral-a11">
                <span class="font-mono">{{ r.ipAddress }}</span>
                · {{ r.nasType }} · <app-status-badge [status]="r.status" />
              </p>
            </div>
          }
        </div>

        @if (!auth.isViewOnly() && router()) {
          <div class="flex items-center gap-2">
            <button matButton class="tertiary" type="button" (click)="testConnection()">
              <mat-icon svgIcon="wifi" />
              Test connection
            </button>
            <a matButton class="tertiary" [routerLink]="['/admin/routers', router()!.id, 'edit']">
              <mat-icon svgIcon="pencil" />
              Edit
            </a>
            <button matIconButton [matMenuTriggerFor]="moreMenu">
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu #moreMenu="matMenu">
              <a
                mat-menu-item
                [routerLink]="['/admin/pools/new']"
                [queryParams]="{ routerId: router()!.id }"
              >
                <mat-icon svgIcon="plus" />Attach pool
              </a>
              <button mat-menu-item [disabled]="reonboarding()" (click)="reonboard()">
                <mat-icon svgIcon="refresh-cw" />Re-onboard
              </button>
              <button mat-menu-item (click)="deleteRouter()">
                <mat-icon svgIcon="trash" />Decommission
              </button>
            </mat-menu>
          </div>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (router()) {
        @if (reonboardResult(); as fresh) {
          <mat-card class="border-2 border-accent-a6">
            <div class="flex flex-col gap-4 p-6">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold flex items-center gap-2">
                    <mat-icon class="text-green-11" svgIcon="check" />
                    Fresh provisioning materials
                  </h2>
                  <p class="mt-1 text-sm text-neutral-a11">
                    Run this command on the MikroTik to pull and apply the new onboarding script.
                    Script <span class="font-mono">v{{ fresh.script.version }}</span> — sha256
                    {{ fresh.script.checksum.slice(0, 12) }}…
                  </p>
                </div>
                <button
                  matIconButton
                  type="button"
                  (click)="reonboardResult.set(null)"
                  aria-label="Dismiss"
                >
                  <mat-icon svgIcon="x" />
                </button>
              </div>
              <div class="rounded-xl border border-neutral-a6 bg-neutral-a2 p-4">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-xs font-medium uppercase tracking-wide text-neutral-a11">
                    MikroTik fetch command
                  </p>
                  <div class="flex items-center gap-2">
                    <button
                      matButton
                      class="tertiary"
                      type="button"
                      (click)="copy(fresh.script.fetchCommand, 'Fetch command')"
                    >
                      <mat-icon svgIcon="copy" />
                      Copy
                    </button>
                    <a
                      matButton
                      class="tertiary"
                      [href]="fresh.script.downloadUrl"
                      [download]="'onboarding-' + fresh.script.version + '.rsc'"
                      target="_blank"
                      rel="noopener"
                    >
                      <mat-icon svgIcon="download" />
                      Download .rsc
                    </a>
                  </div>
                </div>
                <pre
                  class="mt-2 overflow-x-auto rounded-lg bg-neutral-a3 p-3 text-xs leading-relaxed"
                  >{{ fresh.script.fetchCommand }}</pre
                >
              </div>
              @if (fresh.wireGuard; as wg) {
                <div class="rounded-xl border border-neutral-a6 bg-neutral-a2 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-neutral-a11">
                    WireGuard peer
                  </p>
                  <dl class="mt-2 grid grid-cols-3 gap-y-1 text-sm">
                    <dt class="text-neutral-a11">Client</dt>
                    <dd class="col-span-2 font-mono">{{ wg.clientName }}</dd>
                    <dt class="text-neutral-a11">Address</dt>
                    <dd class="col-span-2 font-mono">{{ wg.address }}</dd>
                    <dt class="text-neutral-a11">Endpoint</dt>
                    <dd class="col-span-2 font-mono">{{ wg.endpoint }}</dd>
                  </dl>
                </div>
              }
            </div>
          </mat-card>
        }

        <div class="grid gap-6 lg:grid-cols-5">
          <!-- Left: summary + pools -->
          <div class="lg:col-span-3 flex flex-col gap-6">
            <mat-card>
              <div class="flex flex-col gap-4 p-6">
                <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-a11">
                  Details
                </h2>
                <dl class="grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-3">
                  <dt class="text-neutral-a11">Description</dt>
                  <dd class="sm:col-span-2">{{ router()!.description || '—' }}</dd>
                  <dt class="text-neutral-a11">Coordinates</dt>
                  <dd class="sm:col-span-2 font-mono">{{ router()!.coordinates || '—' }}</dd>
                  <dt class="text-neutral-a11">Username</dt>
                  <dd class="sm:col-span-2 font-mono">{{ router()!.username }}</dd>
                  <dt class="text-neutral-a11">Last seen</dt>
                  <dd class="sm:col-span-2">{{ router()!.lastSeen | date: 'medium' }}</dd>
                </dl>
              </div>
            </mat-card>

            <mat-card>
              <div class="flex flex-col gap-3 p-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-a11">
                    Attached pools ({{ pools().length }})
                  </h2>
                  @if (!auth.isViewOnly()) {
                    <a
                      matButton
                      class="tertiary"
                      [routerLink]="['/admin/pools/new']"
                      [queryParams]="{ routerId: router()!.id }"
                    >
                      <mat-icon svgIcon="plus" />
                      Add pool
                    </a>
                  }
                </div>

                @if (pools().length === 0) {
                  <p class="text-sm text-neutral-a11">
                    No pools attached. Add a PPPoE or hotspot pool to start handing out addresses.
                  </p>
                } @else {
                  <ul class="flex flex-col divide-y divide-neutral-a6">
                    @for (p of pools(); track p.id) {
                      <li class="flex items-center justify-between py-2 text-sm">
                        <div class="min-w-0">
                          <p class="font-medium truncate">{{ p.name }}</p>
                          <p class="text-xs text-neutral-a11 font-mono">{{ p.rangeIp }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          @if (p.mikrotikId) {
                            <span class="rounded-full bg-green-a3 px-2 py-0.5 text-xs text-green-11"
                              >synced</span
                            >
                          } @else {
                            <span class="rounded-full bg-amber-a3 px-2 py-0.5 text-xs text-amber-11"
                              >pending</span
                            >
                          }
                          <a
                            matIconButton
                            [routerLink]="['/admin/pools', p.id, 'edit']"
                            aria-label="Edit pool"
                          >
                            <mat-icon svgIcon="pencil" />
                          </a>
                        </div>
                      </li>
                    }
                  </ul>
                }
              </div>
            </mat-card>
          </div>

          <!-- Right: live verification panel -->
          <div class="lg:col-span-2">
            <mat-card>
              <div class="p-6">
                <app-onboarding-status-panel [routerId]="router()!.id" />
              </div>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
})
export class RouterDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly routerNav = inject(Router);
  private readonly routerApi = inject(RouterApiService);
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly router = signal<RouterDto | null>(null);
  readonly pools = signal<PoolDto[]>([]);
  readonly reonboarding = signal(false);
  readonly reonboardResult = signal<OnboardRouterResponse | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.routerNav.navigate(['/admin/routers']);
      return;
    }
    this.routerApi.getById(id).subscribe({
      next: (r) => {
        this.router.set(r);
        this.loading.set(false);
        // Auto-trigger when arriving from the routers list "Re-onboard" menu action.
        if (this.route.snapshot.queryParamMap.get('reonboard') === '1') {
          this.reonboard();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(extractErrorMessage(err, 'Router not found'), 'Close', {
          duration: 3000,
        });
        this.routerNav.navigate(['/admin/routers']);
      },
    });
    this.poolApi.getPools(id).subscribe((page) => this.pools.set(page.content));
  }

  testConnection(): void {
    const r = this.router();
    if (!r) return;
    this.routerApi.testConnection(r.id).subscribe({
      next: () => this.snackBar.open('Connection OK', 'OK', { duration: 3000 }),
      error: (err) =>
        this.snackBar.open(extractErrorMessage(err, 'Connection failed'), 'Close', {
          duration: 4000,
        }),
    });
  }

  /**
   * Re-run the onboarding pipeline against this router. Shows a confirmation dialog with the
   * option to rotate the WireGuard key (revoking the previous peer), then renders the fresh
   * fetch-command + WG summary inline at the top of the page.
   */
  reonboard(): void {
    const r = this.router();
    if (!r || this.reonboarding()) return;
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Re-onboard router',
          message: `Generate a fresh onboarding script for "${r.name}"? The existing WireGuard peer is kept (use the API to rotate keys if the device was compromised).`,
          confirmText: 'Re-onboard',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.reonboarding.set(true);
        this.routerApi.reonboard(r.id, { rotateWireGuard: false }).subscribe({
          next: (response) => {
            this.reonboarding.set(false);
            this.reonboardResult.set(response);
            this.router.set(response.router);
            this.snackBar.open('Fresh provisioning script ready', 'OK', { duration: 2500 });
          },
          error: (err) => {
            this.reonboarding.set(false);
            this.snackBar.open(extractErrorMessage(err, 'Re-onboard failed'), 'Close', {
              duration: 4000,
            });
          },
        });
      });
  }

  copy(text: string, label: string): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.snackBar.open('Clipboard unavailable', 'Close', { duration: 2000 });
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => this.snackBar.open(`${label} copied`, 'OK', { duration: 1500 }),
      () => this.snackBar.open(`Could not copy ${label}`, 'Close', { duration: 2000 }),
    );
  }

  deleteRouter(): void {
    const r = this.router();
    if (!r) return;
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Decommission Router',
          message: `Permanently delete "${r.name}"? This removes its WireGuard peer and attached pools.`,
          confirmText: 'Decommission',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.routerApi.delete(r.id).subscribe({
          next: () => {
            this.snackBar.open('Router decommissioned', 'OK', { duration: 3000 });
            this.routerNav.navigate(['/admin/routers']);
          },
          error: (err) =>
            this.snackBar.open(extractErrorMessage(err, 'Failed to delete'), 'Close', {
              duration: 4000,
            }),
        });
      });
  }
}
